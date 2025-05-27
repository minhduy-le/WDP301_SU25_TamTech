const PayOS = require("@payos/node");
require("dotenv").config();
const {
  Order,
  OrderItem,
  User,
  Product,
  OrderStatus,
  PaymentMethod,
  ProductRecipe,
  Material,
} = require("../models/associations");
const sequelize = require("../config/database");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

console.log("Loading orderService.js version 2025-05-27-association-fix-v5");

const payos = new PayOS(
  "1c2c9333-3b87-4c3d-9058-2a47c4731355",
  "f638f7e1-6366-4198-b17b-5c09139f1be3",
  "b4162d82b524a0c54bd674ff0a02ec57983b326fb9a07d0dce4878bbff5f62ce"
);

// FIXED: Use your actual server URL, not MockAPI
const YOUR_DOMAIN = process.env.SERVER_URL || "https://wdp-301-0fd32c261026.herokuapp.com"; // Change this to your actual domain

const createOrder = async (req, res) => {
  console.log("createOrder called at:", new Date().toISOString());
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));

  if (!req.body || typeof req.body !== "object") {
    console.log("Invalid req.body:", req.body);
    return res.status(400).json("Request body is missing or invalid");
  }

  const { orderItems, order_discount_value, order_shipping_fee, payment_method_id, order_address, note } = req.body;
  const userId = req.userId;
  const storeId = 1;

  console.log("Destructured parameters:", { orderItems, userId, note, order_address, payment_method_id });

  if (orderItems === undefined) {
    console.log("orderItems is undefined");
    return res.status(400).json("Order items are required");
  }
  if (!Array.isArray(orderItems)) {
    console.log("orderItems is not an array:", orderItems);
    return res.status(400).json("Order items must be an array");
  }
  if (orderItems.length === 0) {
    console.log("orderItems is empty");
    return res.status(400).json("Order items array cannot be empty");
  }
  console.log("orderItems validation passed:", JSON.stringify(orderItems, null, 2));

  if (!order_address) {
    console.log("order_address is missing");
    return res.status(400).json("Order address is required");
  }
  if (!payment_method_id || ![1, 2, 3, 4].includes(payment_method_id)) {
    console.log("Invalid payment_method_id:", payment_method_id);
    return res.status(400).json("Valid payment method ID is required (1-4)");
  }

  for (const item of orderItems) {
    if (!item.productId || !item.quantity || !item.price) {
      console.log("Invalid order item:", item);
      return res.status(400).json("Each order item must have productId, quantity, and price");
    }
    if (typeof item.productId !== "number" || typeof item.quantity !== "number" || typeof item.price !== "number") {
      console.log("Invalid order item types:", item);
      return res.status(400).json("productId, quantity, and price must be numbers");
    }
    if (item.quantity < 1) {
      console.log("Invalid quantity:", item.quantity);
      return res.status(400).json("Quantity must be at least 1");
    }
    if (item.price < 0) {
      console.log("Invalid price:", item.price);
      return res.status(400).json("Price cannot be negative");
    }
  }

  console.log("Starting database transaction");

  const transaction = await sequelize.transaction();

  try {
    for (const item of orderItems) {
      const product = await Product.findOne({
        where: { productId: item.productId, isActive: true },
        transaction,
      });
      if (!product) {
        console.log(`Product not found or inactive for productId: ${item.productId}`);
        await transaction.rollback();
        return res.status(400).json(`Product with ID ${item.productId} not found or inactive`);
      }
      const productPrice = parseFloat(product.price);
      const itemPrice = parseFloat(item.price);
      console.log(
        `Price check for productId: ${
          item.productId
        }. Expected: ${productPrice} (type: ${typeof productPrice}), Got: ${itemPrice} (type: ${typeof itemPrice})`
      );
      if (productPrice !== itemPrice) {
        console.log(`Price mismatch for productId: ${item.productId}. Expected: ${productPrice}, Got: ${itemPrice}`);
        await transaction.rollback();
        return res.status(400).json(`Price for product ID ${item.productId} does not match`);
      }
    }

    for (const item of orderItems) {
      const recipes = await ProductRecipe.findAll({
        where: { productId: item.productId },
        include: [{ model: Material, as: "Material" }],
        transaction,
      });
      if (!recipes || recipes.length === 0) {
        console.log(`No recipes found for productId: ${item.productId}`);
        await transaction.rollback();
        return res.status(400).json(`No recipes found for product ID ${item.productId}`);
      }

      for (const recipe of recipes) {
        const material = recipe.Material;
        const requiredQuantity = recipe.quantity * item.quantity;
        if (material.quantity < requiredQuantity) {
          console.log(
            `Insufficient material quantity for materialId: ${material.materialId}. Required: ${requiredQuantity}, Available: ${material.quantity}`
          );
          await transaction.rollback();
          return res
            .status(400)
            .json(
              `Insufficient material ${material.name} for product ID ${item.productId}. Required: ${requiredQuantity}, Available: ${material.quantity}`
            );
        }

        material.quantity -= requiredQuantity;
        await material.save({ transaction });
        console.log(
          `Deducted ${requiredQuantity} from materialId: ${material.materialId}. New quantity: ${material.quantity}`
        );
      }
    }

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
    console.log("Creating order items:", JSON.stringify(orderItemData, null, 2));

    try {
      await OrderItem.bulkCreate(orderItemData, { transaction });
      console.log("Order items created successfully");
    } catch (bulkCreateError) {
      console.log("Error in OrderItem.bulkCreate:", bulkCreateError.message);
      await transaction.rollback();
      return res.status(500).json("Failed to create order items");
    }

    // FIXED: Correct the PayOS payment link data structure
    const paymentLinkData = {
      orderCode: order.orderId, // PayOS requires this
      amount: Math.round(order_subtotal - (order_discount_value || 0)),
      description: `Order #${order.orderId}`,
      // FIXED: Use correct URLs pointing to your server
      returnUrl: `${YOUR_DOMAIN}/api/orders/success?orderId=${order.orderId}`,
      cancelUrl: `${YOUR_DOMAIN}/api/orders/cancel?orderId=${order.orderId}`,
      // FIXED: Remove items array if it's causing issues, or fix the structure
      // PayOS might have different requirements for items
    };
    console.log("Creating PayOS payment link with:", JSON.stringify(paymentLinkData, null, 2));

    let paymentLink;
    try {
      paymentLink = await payos.createPaymentLink(paymentLinkData);
      console.log("PayOS payment link created:", paymentLink.checkoutUrl);
    } catch (payosError) {
      console.error("Error in payos.createPaymentLink:", payosError.message);
      console.error("PayOS Error details:", payosError);
      await transaction.rollback();
      return res.status(500).json("Failed to create payment link");
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
        console.error("Order verification failed after retry for orderId:", order.orderId);
        return res.status(500).json("Order was not saved correctly after commit");
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
    console.error("Error in createOrder:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).json("Failed to create order");
  }
};

const handlePaymentSuccess = async (req, res) => {
  console.log("handlePaymentSuccess called at:", new Date().toISOString());
  console.log("Request method:", req.method);
  console.log("Raw URL:", req.originalUrl);
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));
  console.log("Request query:", JSON.stringify(req.query, null, 2));
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const { orderId, code, id: paymentId, status, cancel, orderCode } = req.method === "GET" ? req.query : req.body;
  console.log("Extracted parameters:", { orderId, code, paymentId, status, cancel, orderCode });

  if (!orderId) {
    console.log("Missing orderId in request");
    return res.status(400).json({ message: "Order ID is required" });
  }

  // Additional validation for code and status
  if (!code && !status) {
    console.log("Both code and status are missing", { code, status });
    return res.status(400).json({ message: "Payment code or status is required" });
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
      console.log(`Attempt ${attempt} to find order with orderId: ${parsedOrderId}`);
      order = await Order.findOne({
        where: { orderId: parsedOrderId },
        transaction,
      });
      if (order) break;
      console.log(`Order not found, retrying after 1s for orderId: ${parsedOrderId}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (!order) {
      console.log("Order not found after retries for orderId:", parsedOrderId);
      await transaction.rollback();
      return res.status(404).json({
        message: "Order not found",
        details: "The order may not have been created successfully. Please check your order history.",
      });
    }

    console.log("Current order details:", {
      orderId: order.orderId,
      status_id: order.status_id,
      payment_time: order.payment_time,
      created_at: order.order_create_at,
    });

    if (order.status_id === 2) {
      console.log(`Order ${parsedOrderId} already processed with status_id: 2`);
      let invoiceUrl = order.invoiceUrl;
      if (!invoiceUrl) {
        console.log("No invoiceUrl, generating PDF for orderId:", parsedOrderId);
        invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);
      }
      await transaction.commit();
      console.log("Returning response for already processed order:", {
        message: "Order already processed",
        invoiceUrl: invoiceUrl || "Invoice not yet generated",
      });
      return res.status(200).json({
        message: "Order already processed",
        invoiceUrl: invoiceUrl || "Invoice not yet generated",
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

    // FIXED: Better success condition checking
    const isPaymentSuccessful = code === "00" || status === "PAID" || status === "success";

    if (isPaymentSuccessful) {
      console.log("Payment successful for orderId:", parsedOrderId);
      order.status_id = 2;
      order.payment_time = new Date();

      const currentMemberPoint = user.member_point || 0;
      const orderPointEarn = order.order_point_earn || 0;
      user.member_point = currentMemberPoint + orderPointEarn;
      console.log(
        `Updating user ${user.id} member_point from ${currentMemberPoint} to ${user.member_point} by adding ${orderPointEarn}`
      );
      await user.save({ transaction });

      // Save the order first
      await order.save({ transaction });

      const invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);

      await transaction.commit();
      console.log("Payment processed successfully, responding with:", {
        message: "Payment processed successfully",
        invoiceUrl: invoiceUrl || "Invoice generation failed",
      });
      res.status(200).json({
        message: "Payment processed, receipt generated",
        invoiceUrl: invoiceUrl || "Receipt generation failed",
      });
    } else {
      console.log("Payment failed for orderId:", parsedOrderId, { code, status });
      await transaction.rollback();
      return res.status(400).json({ message: "Payment failed or invalid code/status" });
    }
  } catch (error) {
    console.error("Error in handlePaymentSuccess:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

async function generateAndUploadInvoice(order, orderId, transaction) {
  console.log("generateAndUploadInvoice called for orderId:", orderId);
  try {
    const orderItems = await OrderItem.findAll({
      where: { orderId },
      attributes: ["productId", "quantity", "price"],
      transaction,
    });
    console.log("Fetched order items:", JSON.stringify(orderItems, null, 2));

    const user = await User.findOne({
      where: { id: order.userId },
      attributes: ["id", "fullName"],
      transaction,
    });
    console.log("Fetched user:", user ? user.fullName : "Guest user");

    const qrCodeUrl = await QRCode.toDataURL(`${YOUR_DOMAIN}/order/${order.orderId}`);
    console.log("Generated QR code for URL:", qrCodeUrl.slice(0, 50) + "...");

    console.log("Starting PDF generation for orderId:", orderId);
    const doc = new PDFDocument({
      size: [216, 600],
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

    const textColor = "#000000";
    const lineColor = "#000000";
    const lineSpacing = 12;

    let currentY = 10;

    const drawDashedLine = (y, dashLength = 5, gapLength = 5) => {
      doc.lineWidth(1).strokeColor(lineColor);
      for (let x = doc.page.margins.left; x < doc.page.width - doc.page.margins.right; x += dashLength + gapLength) {
        doc
          .moveTo(x, y)
          .lineTo(x + dashLength, y)
          .stroke();
      }
    };

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

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`RECEIPT #${order.orderId.toString().padStart(6, "0")}`, { align: "center" });
    currentY += lineSpacing;
    doc.font("Helvetica").fontSize(8);
    doc.text(`Date: ${new Date(order.order_create_at).toLocaleDateString("en-GB")}`, { align: "left" });
    currentY += lineSpacing;
    doc.text(`Time: ${new Date(order.payment_time || new Date()).toLocaleTimeString("en-GB")}`, { align: "left" });
    currentY += lineSpacing;
    doc.text(`Customer: ${user ? user.fullName || "Guest Customer" : "Guest Customer"}`, { align: "left" });
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    doc.font("Helvetica-Bold").fontSize(8).text("Items", { align: "left" });
    currentY += lineSpacing;
    doc.font("Helvetica").fontSize(8);
    doc.text("Qty x Price = Total", { align: "right" });
    currentY += lineSpacing;

    orderItems.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      doc.text(`Product ${item.productId}`, { align: "left" });
      currentY += lineSpacing;
      doc.text(`${item.quantity} x ${item.price.toLocaleString("en-US")} = ${itemTotal.toLocaleString("en-US")} VND`, {
        align: "right",
      });
      currentY += lineSpacing;
    });

    drawDashedLine(currentY);
    currentY += lineSpacing;

    if (order.note) {
      doc.font("Helvetica-Bold").fontSize(8).text("Note:", { align: "left" });
      currentY += lineSpacing;
      doc.font("Helvetica").fontSize(8).text(order.note, { align: "left", width: 190 });
      currentY += lineSpacing * 2;
    }

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

    doc.font("Helvetica-Bold").fontSize(10);
    const totalAmount = order.order_subtotal - (order.order_discount_value || 0);
    doc.text(`Total: ${totalAmount.toLocaleString("en-US")} VND`, { align: "right" });
    currentY += lineSpacing;

    doc.font("Helvetica").fontSize(8);
    doc.text("Payment: Online Payment", { align: "left" });
    currentY += lineSpacing;
    doc.text("Status: PAID", { align: "left" });
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
    doc.image(qrImage, 58, currentY, { width: 100, align: "center" });
    currentY += 110;
    doc.fontSize(6).text("Scan to view order details", { align: "center" });
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    doc.font("Helvetica").fontSize(8);
    doc.text("Thank you for shopping with us!", { align: "center" });
    currentY += lineSpacing;
    doc.text(`Generated on ${new Date().toLocaleString("en-GB")}`, { align: "center" });
    currentY += lineSpacing;

    doc.page.height = currentY + doc.page.margins.bottom;

    doc.end();

    console.log("PDF generation complete, collecting buffer for orderId:", orderId);
    const pdfBuffer = await new Promise((resolve) => {
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    console.log("Uploading PDF to Firebase for orderId:", orderId);
    const invoiceUrl = await uploadFileToFirebase(pdfBuffer, `receipt_${orderId}.pdf`, "application/pdf");
    console.log("Firebase upload successful, invoiceUrl:", invoiceUrl);

    order.invoiceUrl = invoiceUrl;
    await order.save({ transaction });
    console.log("Order updated with invoiceUrl for orderId:", orderId, invoiceUrl);

    return invoiceUrl;
  } catch (error) {
    console.error("Error in generateAndUploadInvoice for orderId:", orderId, error.message, error.stack);
    return null;
  }
}

const getUserOrders = async (req, res) => {
  console.log("getUserOrders called at:", new Date().toISOString());
  console.log("User ID:", req.userId);

  const userId = req.userId;

  try {
    const orders = await Order.findAll({
      where: { userId },
      attributes: [
        "orderId",
        "payment_time",
        "order_create_at",
        "order_address",
        "status_id",
        "order_shipping_fee",
        "order_discount_value",
        "order_amount",
        "invoiceUrl",
        "order_point_earn",
        "note",
        "payment_method_id",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["fullName", "phone_number"],
        },
        {
          model: OrderItem,
          as: "OrderItems",
          attributes: ["productId", "quantity", "price"],
          include: [
            {
              model: Product,
              as: "Product",
              attributes: ["name"],
            },
          ],
        },
        {
          model: OrderStatus,
          as: "OrderStatus",
          attributes: ["status"],
        },
        {
          model: PaymentMethod,
          as: "PaymentMethod",
          attributes: ["name"],
        },
      ],
    });

    console.log("Fetched orders:", orders.length);

    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      payment_time: order.payment_time,
      order_create_at: order.order_create_at,
      order_address: order.order_address,
      status: order.OrderStatus ? order.OrderStatus.status : null,
      fullName: order.User ? order.User.fullName : null,
      phone_number: order.User ? order.User.phone_number : null,
      orderItems: order.OrderItems.map((item) => ({
        productId: item.productId,
        name: item.Product ? item.Product.name : null,
        quantity: item.quantity,
        price: item.price,
      })),
      order_shipping_fee: order.order_shipping_fee,
      order_discount_value: order.order_discount_value,
      order_amount: order.order_amount,
      invoiceUrl: order.invoiceUrl,
      order_point_earn: order.order_point_earn,
      note: order.note,
      payment_method: order.PaymentMethod ? order.PaymentMethod.name : null,
    }));

    console.log("Returning formatted orders:", JSON.stringify(formattedOrders, null, 2));
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error in getUserOrders:", error.message, error.stack);
    res.status(500).json({ message: "Failed to retrieve orders", error: error.message });
  }
};

module.exports = { createOrder, handlePaymentSuccess, getUserOrders };
