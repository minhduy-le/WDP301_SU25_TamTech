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
console.log("Loading orderService.js version 2025-05-24-supermarket-receipt-style");

const payos = new PayOS(
  "1c2c9333-3b87-4c3d-9058-2a47c4731355",
  "f638f7e1-6366-4198-b17b-5c09139f1be3",
  "b4162d82b524a0c54bd674ff0a02ec57983b326fb9a07d0dce4878bbff5f62ce"
);

// const YOUR_DOMAIN = "http://localhost:3000";
const YOUR_DOMAIN = "https://wdp-301-0fd32c261026.herokuapp.com";

const createOrder = async (req, res) => {
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  if (!req.body || typeof req.body !== "object") {
    console.log("Invalid req.body:", req.body);
    return res.status(400).json({ message: "Request body is missing or invalid" });
  }

  const { orderItems, order_discount_value, order_shipping_fee, payment_method_id, order_address, note } = req.body;
  const userId = req.userId;
  const storeId = 1;

  console.log("Destructured orderItems:", orderItems);
  console.log("Destructured userId:", userId);
  console.log("Destructured note:", note);

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
      note: note || null,
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
        note: note || null,
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
  const { orderId, code, id: paymentId } = req.query;
  console.log("handlePaymentSuccess called with query:", req.query);

  if (!orderId) {
    console.log("Missing orderId in query");
    return res.status(400).json({ message: "Order ID is required" });
  }

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.status(400).json({ message: "Order ID must be a valid number" });
  }

  const transaction = await sequelize.transaction();

  try {
    let order = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt} to find order with orderId:`, parsedOrderId);
      order = await Order.findOne({
        where: { orderId: parsedOrderId },
        transaction,
      });
      if (order) break;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!order) {
      console.log("Order not found after retries for orderId:", parsedOrderId);
      await transaction.rollback();
      return res.status(404).json({
        message: "Order not found",
        details:
          "The order may not have been created successfully. Please check your order history or contact support.",
      });
    }

    // Check if order has already been processed
    if (order.status_id === 2) {
      console.log(`Order ${parsedOrderId} already processed with status_id: 2`);
      await transaction.rollback();
      return res.status(200).json({
        message: "Order already processed",
        invoiceUrl: order.invoiceUrl || "Invoice not yet generated",
      });
    }

    const user = await User.findOne({
      where: { id: order.userId },
      attributes: ["id", "fullName", "email", "phone_number", "member_point"],
      transaction,
    });
    if (!user) {
      console.log("User not found for userId:", order.userId);
      await transaction.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Current order status_id:", order.status_id);

    if (code === "00") {
      console.log("Payment successful, updating status_id to 2 for orderId:", parsedOrderId);
      order.status_id = 2;
      order.payment_time = new Date();

      // Update user's member_point by adding order_point_earn
      const currentMemberPoint = user.member_point || 0;
      const orderPointEarn = order.order_point_earn || 0;
      user.member_point = currentMemberPoint + orderPointEarn;
      console.log(
        `Updating user ${user.id} member_point from ${currentMemberPoint} to ${user.member_point} by adding ${orderPointEarn}`
      );

      await user.save({ transaction });

      let invoiceUrl = null;
      try {
        const orderItems = await OrderItem.findAll({
          where: { orderId: parsedOrderId },
          attributes: ["productId", "quantity", "price"],
          transaction,
        });

        const qrCodeUrl = await QRCode.toDataURL(`${YOUR_DOMAIN}/order/${parsedOrderId}`);

        // Set up PDF with receipt dimensions (3 inches wide, variable height)
        const doc = new PDFDocument({
          size: [216, 600], // 3 inches = 216 points, height adjusted to fit content
          margin: 10,
          info: {
            Title: `Receipt #${order.orderId}`,
            Author: "ABC Company Limited",
            Subject: "Sales Receipt",
            Keywords: "receipt, order",
          },
        });

        const buffers = [];
        doc.on("data", buffers.push.bind(buffers));

        // Colors and styling
        const textColor = "#000000";
        const lineColor = "#000000";
        const lineSpacing = 12;

        let currentY = 10;

        // Helper function to draw a dashed line
        const drawDashedLine = (y, dashLength = 5, gapLength = 5) => {
          doc.lineWidth(1).strokeColor(lineColor);
          for (
            let x = doc.page.margins.left;
            x < doc.page.width - doc.page.margins.right;
            x += dashLength + gapLength
          ) {
            doc
              .moveTo(x, y)
              .lineTo(x + dashLength, y)
              .stroke();
          }
        };

        // Header: Store Information
        doc.font("Helvetica-Bold").fontSize(12).fillColor(textColor).text("ABC COMPANY LIMITED", { align: "center" });
        currentY += lineSpacing;
        doc.font("Helvetica").fontSize(8);
        doc.text("123 Business Street, District 1", { align: "center" });
        currentY += lineSpacing;
        doc.text("Ho Chi Minh City", { align: "center" });
        currentY += lineSpacing;
        doc.text("Phone: +84 909 123 456", { align: "center" });
        currentY += lineSpacing;

        drawDashedLine(currentY);
        currentY += lineSpacing;

        // Receipt Info
        doc
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(`RECEIPT #${order.orderId.toString().padStart(6, "0")}`, { align: "center" });
        currentY += lineSpacing;
        doc.font("Helvetica").fontSize(8);
        doc.text(`Date: ${new Date(order.order_create_at).toLocaleDateString("en-GB")}`, { align: "left" });
        currentY += lineSpacing;
        doc.text(`Time: ${new Date(order.payment_time).toLocaleTimeString("en-GB")}`, { align: "left" });
        currentY += lineSpacing;
        doc.text(`Customer: ${user.fullName || "Guest Customer"}`, { align: "left" });
        currentY += lineSpacing;

        drawDashedLine(currentY);
        currentY += lineSpacing;

        // Order Items Header
        doc.font("Helvetica-Bold").fontSize(8).text("Items", { align: "left" });
        currentY += lineSpacing;
        doc.font("Helvetica").fontSize(8);
        doc.text("Qty x Price = Total", { align: "right" });
        currentY += lineSpacing;

        // Order Items List
        orderItems.forEach((item) => {
          const itemTotal = item.quantity * item.price;
          doc.text(`Product ${item.productId}`, { align: "left" });
          currentY += lineSpacing;
          doc.text(
            `${item.quantity} x ${item.price.toLocaleString("en-US")} = ${itemTotal.toLocaleString("en-US")} VND`,
            { align: "right" }
          );
          currentY += lineSpacing;
        });

        drawDashedLine(currentY);
        currentY += lineSpacing;

        // Order Note (if exists)
        if (order.note) {
          doc.font("Helvetica-Bold").fontSize(8).text("Note:", { align: "left" });
          currentY += lineSpacing;
          doc.font("Helvetica").fontSize(8).text(order.note, { align: "left", width: 190 });
          currentY += lineSpacing * 2;
        }

        // Summary Section
        doc.font("Helvetica").fontSize(8);
        doc.text(`Subtotal: ${order.order_amount.toLocaleString("en-US")} VND`, { align: "right" });
        currentY += lineSpacing;
        doc.text(`Shipping Fee: ${order.order_shipping_fee.toLocaleString("en-US")} VND`, { align: "right" });
        currentY += lineSpacing;

        if (order.order_discount_value > 0) {
          doc.text(`Discount: -${order.order_discount_value.toLocaleString("en-US")} VND`, { align: "right" });
          currentY += lineSpacing;
        }

        drawDashedLine(currentY);
        currentY += lineSpacing;

        // Total
        doc.font("Helvetica-Bold").fontSize(10);
        const totalAmount = order.order_subtotal - (order.order_discount_value || 0);
        doc.text(`Total: ${totalAmount.toLocaleString("en-US")} VND`, { align: "right" });
        currentY += lineSpacing;

        // Payment Info
        doc.font("Helvetica").fontSize(8);
        doc.text("Payment: Online Payment", { align: "left" });
        currentY += lineSpacing;
        doc.text("Status: PAID", { align: "left" });
        currentY += lineSpacing;

        drawDashedLine(currentY);
        currentY += lineSpacing;

        // QR Code
        const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
        doc.image(qrImage, 58, currentY, { width: 100, align: "center" }); // Centered QR code
        currentY += 110; // Adjust for QR code height
        doc.fontSize(6).text("Scan to view order details", { align: "center" });
        currentY += lineSpacing;

        drawDashedLine(currentY);
        currentY += lineSpacing;

        // Footer
        doc.font("Helvetica").fontSize(8);
        doc.text("Thank you for shopping with us!", { align: "center" });
        currentY += lineSpacing;
        doc.text(`Generated on ${new Date().toLocaleString("en-GB")}`, { align: "center" });
        currentY += lineSpacing;

        // Adjust document height to fit content
        doc.page.height = currentY + doc.page.margins.bottom;

        doc.end();

        // Wait for PDF generation to complete
        const pdfBuffer = await new Promise((resolve) => {
          const buffers = [];
          doc.on("data", buffers.push.bind(buffers));
          doc.on("end", () => resolve(Buffer.concat(buffers)));
        });

        // Upload PDF to Firebase
        invoiceUrl = await uploadFileToFirebase(pdfBuffer, `receipt_${parsedOrderId}.pdf`, "application/pdf");
        order.invoiceUrl = invoiceUrl;
        await order.save({ transaction });
        console.log("Order updated with invoiceUrl:", invoiceUrl);

        await order.save({ transaction });
      } catch (pdfError) {
        console.log("Error generating receipt:", pdfError.message);
        // Log error but continue to commit transaction
      }

      await transaction.commit();

      res.status(200).json({
        message: "Payment processed, receipt generated, and member points updated",
        invoiceUrl: order.invoiceUrl || "Receipt generation failed",
      });
    } else {
      console.log("Payment failed, code:", code);
      await transaction.rollback();
      res.status(400).json({ message: "Payment failed or invalid code" });
    }
  } catch (error) {
    console.log("Error in handlePaymentSuccess:", error.message);
    await transaction.rollback();
    res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

module.exports = { createOrder, handlePaymentSuccess };
