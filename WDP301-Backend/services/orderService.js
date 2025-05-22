const PayOS = require("@payos/node");
require("dotenv").config();
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const User = require("../models/user");
const sequelize = require("../config/database");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

// Unique identifier to confirm this file is loaded
console.log("Loading orderService.js version 2025-05-22-bw-professional-invoice-english");

const payos = new PayOS(
  "1c2c9333-3b87-4c3d-9058-2a47c4731355",
  "f638f7e1-6366-4198-b17b-5c09139f1be3",
  "b4162d82b524a0c54bd674ff0a02ec57983b326fb9a07d0dce4878bbff5f62ce"
);

const YOUR_DOMAIN = "https://wdp-301-0fd32c261026.herokuapp.com";
// const YOUR_DOMAIN = "httP://localhost:3000";

const createOrder = async (req, res) => {
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  if (!req.body || typeof req.body !== "object") {
    console.log("Invalid req.body:", req.body);
    return res.status(400).json({ message: "Request body is missing or invalid" });
  }

  const { orderItems, order_discount_value, order_shipping_fee, payment_method_id, order_address } = req.body;
  const userId = req.userId;
  const storeId = 1;

  console.log("Destructured orderItems:", orderItems);
  console.log("Destructured userId:", userId);

  console.log("Before orderItems validation:", orderItems);

  if (orderItems === undefined) {
    console.log("orderItems is undefined");
    return res.status(400).json({ message: "Order items are required" });
  }
  if (!Array.isArray(orderItems)) {
    console.log("orderItems is not an array:", orderItems);
    return res.status(400).json({ message: "Order items must be an array" });
  }
  if (orderItems.length === 0) {
    console.log("orderItems is empty");
    return res.status(400).json({ message: "Order items array cannot be empty" });
  }
  console.log("orderItems validation passed:", orderItems);

  if (!order_address) {
    console.log("order_address is missing");
    return res.status(400).json({ message: "Order address is required" });
  }
  if (!payment_method_id || ![1, 2, 3, 4].includes(payment_method_id)) {
    console.log("Invalid payment_method_id:", payment_method_id);
    return res.status(400).json({ message: "Valid payment method ID is required (1-4)" });
  }

  for (const item of orderItems) {
    if (!item.productId || !item.quantity || !item.price) {
      console.log("Invalid order item:", item);
      return res.status(400).json({ message: "Each order item must have productId, quantity, and price" });
    }
    if (typeof item.productId !== "number" || typeof item.quantity !== "number" || typeof item.price !== "number") {
      console.log("Invalid order item types:", item);
      return res.status(400).json({ message: "productId, quantity, and price must be numbers" });
    }
    if (item.quantity < 1) {
      console.log("Invalid quantity:", item.quantity);
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }
    if (item.price < 0) {
      console.log("Invalid price:", item.price);
      return res.status(400).json({ message: "Price cannot be negative" });
    }
  }

  console.log("Starting database transaction");

  const transaction = await sequelize.transaction();

  try {
    console.log("orderItems before calculations:", orderItems);

    const order_amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log("Calculated order_amount:", order_amount);

    const order_discount_percent =
      order_discount_value && order_amount > 0 ? (order_discount_value / order_amount) * 100 : 0;
    console.log("Calculated order_discount_percent:", order_discount_percent);

    const order_subtotal = order_amount + (order_shipping_fee || 0);
    console.log("Calculated order_subtotal:", order_subtotal);

    const order_point_earn = Math.floor(order_amount / 10000);
    console.log("Calculated order_point_earn:", order_point_earn);

    console.log("Creating order with data:", {
      storeId,
      userId,
      order_amount,
      order_discount_percent: order_discount_percent.toFixed(2),
      order_discount_value: order_discount_value || 0,
      order_point_earn,
      order_shipping_fee: order_shipping_fee || 0,
      order_subtotal,
      payment_method_id,
      status_id: 1,
      order_create_at: new Date(),
      order_address,
    });

    const order = await Order.create(
      {
        storeId,
        userId,
        order_amount,
        order_discount_percent: order_discount_percent.toFixed(2),
        order_discount_value: order_discount_value || 0,
        order_point_earn,
        order_shipping_fee: order_shipping_fee || 0,
        order_subtotal,
        payment_method_id,
        status_id: 1,
        order_create_at: new Date(),
        order_address,
      },
      { transaction }
    );

    const orderItemData = orderItems.map((item) => ({
      orderId: order.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));
    console.log("Creating order items:", orderItemData);

    try {
      await OrderItem.bulkCreate(orderItemData, { transaction });
      console.log("Order items created successfully");
    } catch (bulkCreateError) {
      console.log("Error in OrderItem.bulkCreate:", bulkCreateError.message);
      throw bulkCreateError;
    }

    const paymentLinkData = {
      amount: Math.round(order_subtotal - (order_discount_value || 0)),
      description: `Order #${order.orderId}`,
      orderCode: order.orderId,
      returnUrl: `${YOUR_DOMAIN}/api/orders/success?orderId=${order.orderId}`,
      cancelUrl: `${YOUR_DOMAIN}/api/orders/cancel`,
      items: orderItems.map((item) => ({
        name: `Product ${item.productId}`,
        quantity: item.quantity,
        price: item.price,
      })),
    };
    console.log("Creating PayOS payment link with data:", paymentLinkData);

    let paymentLink;
    try {
      paymentLink = await payos.createPaymentLink(paymentLinkData);
      console.log("PayOS payment link created:", paymentLink.checkoutUrl);
    } catch (payosError) {
      console.log("Error in payos.createPaymentLink:", payosError.message);
      throw payosError;
    }

    await transaction.commit();

    const savedOrder = await Order.findOne({
      where: { orderId: order.orderId },
    });
    if (!savedOrder) {
      console.log("Order not found after commit for orderId:", order.orderId);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const recheckOrder = await Order.findOne({
        where: { orderId: order.orderId },
      });
      if (!recheckOrder) {
        return res.status(500).json({ message: "Order was not saved correctly after commit" });
      }
    }

    console.log("Order created successfully, responding with:", {
      message: "Order created successfully",
      orderId: order.orderId,
      checkoutUrl: paymentLink.checkoutUrl,
    });

    res.status(201).json({
      message: "Order created successfully",
      orderId: order.orderId,
      checkoutUrl: paymentLink.checkoutUrl,
    });
  } catch (error) {
    console.log("Error in transaction block:", error.message);
    console.log("Error stack:", error.stack);
    await transaction.rollback();
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

const handlePaymentSuccess = async (req, res) => {
  const { orderId, code } = req.query;
  console.log("handlePaymentSuccess called with query:", req.query);

  if (!orderId) {
    console.log("Missing orderId in query");
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const parsedOrderId = parseInt(orderId, 10);
    if (isNaN(parsedOrderId)) {
      console.log("Invalid orderId format:", orderId);
      return res.status(400).json({ message: "Order ID must be a valid number" });
    }

    let order = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt} to find order with orderId:`, parsedOrderId);
      order = await Order.findOne({
        where: { orderId: parsedOrderId },
      });
      if (order) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!order) {
      console.log("Order not found after retries for orderId:", parsedOrderId);
      return res.status(404).json({
        message: "Order not found",
        details:
          "The order may not have been created successfully. Please check your order history or contact support.",
      });
    }

    const user = await User.findOne({
      where: { id: order.userId },
      attributes: ["fullName"],
    });
    if (!user) {
      console.log("User not found for userId:", order.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Current order status_id:", order.status_id);

    if (code === "00") {
      console.log("Payment successful, updating status_id to 2 for orderId:", parsedOrderId);
      order.status_id = 2;
      order.payment_time = new Date();
      await order.save();

      let invoiceUrl = null;
      try {
        const orderItems = await OrderItem.findAll({
          where: { orderId: parsedOrderId },
          attributes: ["productId", "quantity", "price"],
        });

        const qrCodeUrl = await QRCode.toDataURL(`${YOUR_DOMAIN}/order/${parsedOrderId}`);

        const doc = new PDFDocument({ size: "A4", margin: 40 });
        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));
        doc.on("end", async () => {
          const pdfBuffer = Buffer.concat(buffers);
          invoiceUrl = await uploadFileToFirebase(pdfBuffer, `invoice_${parsedOrderId}.pdf`, "application/pdf");
          order.invoiceUrl = invoiceUrl;
          await order.save();
          console.log("Order updated with invoiceUrl:", invoiceUrl);
        });

        // Sử dụng font mặc định của PDFKit
        doc.font("Helvetica").fontSize(12);

        // Header: Thông tin công ty
        doc.fontSize(20).text("ABC COMPANY LIMITED", 40, 30, { align: "center" });
        doc.fontSize(10).text("Phone: +84 909 123 456 | Email: info@abc.com", 40, 60, { align: "center" });
        doc.moveTo(40, 80).lineTo(560, 80).stroke(); // Đường kẻ ngang

        // Tiêu đề hóa đơn
        doc.fontSize(16).text("INVOICE", 40, 100, { align: "left" });
        doc.fontSize(10).text(`Invoice #: ${order.orderId}`, 400, 100, { align: "right" });
        doc.text(`Date: ${new Date().toLocaleString("en-US")}`, 400, 115, { align: "right" });
        doc.moveDown(1);

        // Thông tin khách hàng (bỏ địa chỉ)
        doc.fontSize(12).text("CUSTOMER INFORMATION", 40, doc.y + 20);
        doc.fontSize(10).text(`Name: ${user.fullName || "Guest"}`, 60, doc.y + 20);
        doc.moveDown(2);

        // Bảng chi tiết sản phẩm
        doc.fontSize(12).text("ORDER DETAILS", 40, doc.y);
        doc
          .fontSize(10)
          .text("Item", 40, doc.y + 20)
          .moveUp();
        doc.text("Quantity", 200, doc.y).moveUp();
        doc.text("Unit Price (VND)", 300, doc.y).moveUp();
        doc.text("Total (VND)", 400, doc.y).moveUp();
        doc
          .moveTo(40, doc.y + 15)
          .lineTo(560, doc.y + 15)
          .stroke();
        let yPosition = doc.y + 20;
        orderItems.forEach((item) => {
          doc.text(`Product ${item.productId}`, 40, yPosition, { width: 160 });
          doc.text(`${item.quantity}`, 200, yPosition, { width: 100, align: "right" });
          doc.text(`${item.price.toLocaleString("en-US")}`, 300, yPosition, { width: 100, align: "right" });
          doc.text(`${(item.quantity * item.price).toLocaleString("en-US")}`, 400, yPosition, {
            width: 100,
            align: "right",
          });
          yPosition += 20;
        });
        doc.moveTo(40, yPosition).lineTo(560, yPosition).stroke();

        // Tổng cộng
        yPosition += 20;
        doc.fontSize(12).text("Subtotal", 300, yPosition, { align: "right" });
        doc.text(`${order.order_amount.toLocaleString("en-US")} VND`, 400, yPosition, { align: "right" });
        doc.text("Shipping Fee", 300, yPosition + 15, { align: "right" });
        doc.text(`${order.order_shipping_fee.toLocaleString("en-US")} VND`, 400, yPosition + 15, { align: "right" });
        doc.text("Discount", 300, yPosition + 30, { align: "right" });
        doc.text(`${(order.order_discount_value || 0).toLocaleString("en-US")} VND`, 400, yPosition + 30, {
          align: "right",
        });
        doc
          .moveTo(300, yPosition + 45)
          .lineTo(560, yPosition + 45)
          .stroke();
        doc.fontSize(14).text("TOTAL", 300, yPosition + 50, { align: "right" });
        doc.text(`${order.order_subtotal.toLocaleString("en-US")} VND`, 400, yPosition + 50, { align: "right" });
        doc.moveDown(2);

        // Thông tin thanh toán
        doc.fontSize(12).text("PAYMENT INFORMATION", 40, doc.y);
        doc.fontSize(10).text("Method: Online Payment", 60, doc.y + 20);
        doc.text("Status: Paid", 60, doc.y + 35);
        doc.text(
          `Time: ${order.payment_time?.toLocaleString("en-US") || new Date().toLocaleString("en-US")}`,
          60,
          doc.y + 50
        );
        doc.moveDown(2);

        // QR Code
        const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
        doc.image(qrImage, 400, doc.y, { width: 100 });
        doc.fontSize(8).text("Scan to view order details", 400, doc.y + 110, { align: "center" });

        doc.end();
      } catch (pdfError) {
        console.log("Error generating invoice:", pdfError.message);
      }

      res.status(200).json({
        message: "Payment processed, invoice generated",
        invoiceUrl: order.invoiceUrl || "Invoice generation failed",
      });
    } else {
      console.log("Payment failed, code:", code);
      res.status(400).json({ message: "Payment failed or invalid code" });
    }
  } catch (error) {
    console.log("Error in handlePaymentSuccess:", error.message);
    res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

module.exports = { createOrder, handlePaymentSuccess };
