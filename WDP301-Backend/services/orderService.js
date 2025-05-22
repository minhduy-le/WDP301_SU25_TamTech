const PayOS = require("@payos/node");
require("dotenv").config();
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const User = require("../models/user"); // Import User model
const sequelize = require("../config/database");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

// Unique identifier to confirm this file is loaded
console.log("Loading orderService.js version 2025-05-21-bw-pdf-invoice");

const payos = new PayOS(
  "1c2c9333-3b87-4c3d-9058-2a47c4731355",
  "f638f7e1-6366-4198-b17b-5c09139f1be3",
  "b4162d82b524a0c54bd674ff0a02ec57983b326fb9a07d0dce4878bbff5f62ce"
);

const YOUR_DOMAIN = "https://wdp-301-0fd32c261026.herokuapp.com";

const createOrder = async (req, res) => {
  // Debug: Log the entire request body
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  // Validate req.body
  if (!req.body || typeof req.body !== "object") {
    console.log("Invalid req.body:", req.body);
    return res.status(400).json({ message: "Request body is missing or invalid" });
  }

  const { orderItems, order_discount_value, order_shipping_fee, payment_method_id, order_address } = req.body;
  const userId = req.userId; // From verifyToken middleware
  const storeId = 1; // Default storeId as specified

  // Debug: Log destructured variables
  console.log("Destructured orderItems:", orderItems);
  console.log("Destructured userId:", userId);

  // Debug: Log before validation
  console.log("Before orderItems validation:", orderItems);

  // Validate orderItems
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

  // Validate orderItems structure
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
    // Debug: Log orderItems before calculations
    console.log("orderItems before calculations:", orderItems);

    // Calculate order_amount (sum of price * quantity for all items, excluding shipping)
    const order_amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log("Calculated order_amount:", order_amount);

    // Calculate order_discount_percent based on order_discount_value and order_amount
    const order_discount_percent =
      order_discount_value && order_amount > 0 ? (order_discount_value / order_amount) * 100 : 0;
    console.log("Calculated order_discount_percent:", order_discount_percent);

    // Calculate order_subtotal (order_amount before discounts + shipping)
    const order_subtotal = order_amount + (order_shipping_fee || 0);
    console.log("Calculated order_subtotal:", order_subtotal);

    // Calculate order_point_earn (1 point per 10000 in order_amount)
    const order_point_earn = Math.floor(order_amount / 10000);
    console.log("Calculated order_point_earn:", order_point_earn);

    // Create order in the database
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
        status_id: 1, // Pending status
        order_create_at: new Date(),
        order_address,
      },
      { transaction }
    );

    // Create order items
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

    // Create PayOS payment link
    const paymentLinkData = {
      amount: Math.round(order_subtotal - (order_discount_value || 0)), // Total after discount
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

    // Commit transaction
    console.log("Committing transaction");
    await transaction.commit();

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
    await transaction.rollback();
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

const handlePaymentSuccess = async (req, res) => {
  const { orderId, code } = req.query; // Lấy code từ query parameters
  console.log("handlePaymentSuccess called with query:", req.query);

  if (!orderId) {
    console.log("Missing orderId in query");
    return res.status(400).json({ message: "Order ID is required" });
  }

  try {
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.log("Order not found for orderId:", orderId);
      return res.status(404).json({ message: "Order not found" });
    }

    // Lấy thông tin người dùng từ bảng User
    const user = await User.findByPk(order.userId, {
      attributes: ["fullName"],
    });
    if (!user) {
      console.log("User not found for userId:", order.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Current order status_id:", order.status_id);

    if (code === "00") {
      console.log("Payment successful, updating status_id to 2 for orderId:", orderId);
      order.status_id = 2;
      order.payment_time = new Date();

      // Lấy danh sách order items
      const orderItems = await OrderItem.findAll({
        where: { orderId },
        attributes: ["productId", "quantity", "price"],
      });

      // Tạo QR code cho đơn hàng
      const qrCodeUrl = await QRCode.toDataURL(`${YOUR_DOMAIN}/order/${orderId}`);

      // Tạo PDF invoice
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", async () => {
        const pdfBuffer = Buffer.concat(buffers);
        const invoiceUrl = await uploadFileToFirebase(pdfBuffer, `invoice_${orderId}.pdf`, "application/pdf");
        order.invoiceUrl = invoiceUrl;
        await order.save();
        console.log("Order updated with status_id=2 and invoiceUrl:", invoiceUrl);
      });

      // Thiết kế PDF invoice bằng tiếng Anh, không màu, dễ nhìn
      doc.font("Helvetica").fontSize(20).text(`Invoice #${order.orderId}`, { align: "center" });
      doc.moveDown(1);

      // Order details
      doc.fontSize(12).text(`Order Date: ${order.order_create_at.toLocaleString()}`, { align: "left" });
      doc.text(`Delivery Method: Takeaway`, { align: "left" });
      doc.text(`Order ID: ${order.orderId}`, { align: "right" });
      doc.moveDown(1);

      // Customer info
      doc.fontSize(14).text("Customer Information", { align: "left" });
      doc.fontSize(12).text(`${user.fullName} (#${order.orderId.toString().padEnd(10, "5")})`, { indent: 20 });
      doc.text(`${order.order_address}`, { indent: 20 });
      doc.moveDown(1);

      // Order items
      doc.fontSize(14).text("Order Details", { align: "left" });
      doc.moveDown(0.5);
      // Header cho bảng
      doc.fontSize(10).text("Item", 50, doc.y, { continued: true, width: 200 });
      doc.text("Quantity", 250, doc.y, { continued: true, width: 100 });
      doc.text("Price", 350, doc.y, { continued: true, width: 100 });
      doc.text("Total", 450, doc.y, { width: 100 });
      doc.moveDown(0.5);
      // Vẽ đường kẻ ngang
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      // Danh sách items
      orderItems.forEach((item) => {
        doc.text(`Product ${item.productId}`, 50, doc.y, { continued: true, width: 200 });
        doc.text(`${item.quantity}`, 250, doc.y, { continued: true, width: 100 });
        doc.text(`${item.price} VND`, 350, doc.y, { continued: true, width: 100 });
        doc.text(`${item.quantity * item.price} VND`, 450, doc.y, { width: 100 });
        doc.moveDown(0.5);
      });
      // Đường kẻ ngang kết thúc bảng
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // Payment details
      doc.fontSize(14).text("Payment Details", { align: "left" });
      doc.fontSize(12).text(`Subtotal: ${order.order_amount} VND`, { indent: 20 });
      doc.text(`Shipping Fee: ${order.order_shipping_fee} VND`, { indent: 20 });
      doc.text(`Discount: ${order.order_discount_value || 0} VND`, { indent: 20 });
      doc.text(`Total: ${order.order_subtotal} VND`, { indent: 20 });
      doc.text(`Points Earned: ${order.order_point_earn} points`, { indent: 20 });
      doc.moveDown(1);

      // Payment status
      doc.fontSize(14).text("Payment Information", { align: "left" });
      doc.fontSize(12).text("Method: Online Payment", { indent: 20 });
      doc.text("Status: Paid", { indent: 20 });
      doc.moveDown(2);

      // Thêm QR code
      const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
      doc.image(qrImage, 250, doc.y, { width: 100 });
      doc.moveDown(0.5);
      doc.fontSize(10).text("Scan to view order", { align: "center" });

      doc.end();

      res.status(200).json({ message: "Payment processed, invoice generated", invoiceUrl: order.invoiceUrl });
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
