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
  Promotion,
  ReasonCancel,
  FcmToken,
} = require("../models/associations");
const sequelize = require("../config/database");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");
const { sendPushNotification } = require("../config/firebase");

console.log("Loading orderServicePosApp.js version 2025-07-15-pos-app-v1");

const payos = new PayOS(
  "669d4d45-4e88-4daa-9394-916beea82d6b",
  "4ca70acc-44eb-400a-88fb-9edcd9d1a745",
  "eb38f8b3a3b43bd30a79030407cbe19c9b0cf599916d1e2428f4c3f92c8fbda4"
);
const YOUR_DOMAIN = "https://wdp301-su25.space";
const FRONTEND_DOMAIN = "https://wdp301-su25.space";

const createOrder = async (req, res) => {
  console.log("createOrder called at:", new Date().toISOString());
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));

  if (!req.body || typeof req.body !== "object") {
    console.log("Invalid req.body:", req.body);
    return res.status(400).send("Request body is missing or invalid");
  }

  const {
    orderItems,
    order_discount_value,
    promotion_code,
    order_shipping_fee,
    payment_method_id,
    order_address,
    note,
    isDatHo,
    tenNguoiDatHo,
    soDienThoaiNguoiDatHo,
    customerId,
  } = req.body;
  let userId = req.userId;

  if (customerId) {
    userId = customerId;
  }

  const storeId = 1;
  const platform = "pos"; // Set platform to 'pos' for POS app

  console.log("Destructured parameters:", {
    orderItems,
    userId,
    note,
    order_address,
    payment_method_id,
    promotion_code,
    order_discount_value,
    isDatHo,
    tenNguoiDatHo,
    soDienThoaiNguoiDatHo,
  });

  // Validation logic
  if (orderItems === undefined) {
    console.log("orderItems is undefined");
    return res.status(400).send("Order items are required");
  }
  if (!Array.isArray(orderItems)) {
    console.log("orderItems is not an array:", orderItems);
    return res.status(400).send("Order items must be an array");
  }
  if (orderItems.length === 0) {
    console.log("orderItems is empty");
    return res.status(400).send("Order items array cannot be empty");
  }
  console.log("orderItems validation passed:", JSON.stringify(orderItems, null, 2));

  if (!order_address) {
    console.log("order_address is missing");
    return res.status(400).send("Order address is required");
  }
  if (!payment_method_id || ![1, 2, 3, 4].includes(payment_method_id)) {
    console.log("Invalid payment_method_id:", payment_method_id);
    return res.status(400).send("Valid payment method ID is required (1-4)");
  }

  for (const item of orderItems) {
    if (!item.productId || !item.quantity || !item.price) {
      console.log("Invalid order item:", item);
      return res.status(400).send("Each order item must have productId, quantity, and price");
    }
    if (typeof item.productId !== "number" || typeof item.quantity !== "number" || typeof item.price !== "number") {
      console.log("Invalid order item types:", item);
      return res.status(400).send("productId, quantity, and price must be numbers");
    }
    if (item.quantity < 1) {
      console.log("Invalid quantity:", item.quantity);
      return res.status(400).send("Quantity must be at least 1");
    }
    if (item.price < 0) {
      console.log("Invalid price:", item.price);
      return res.status(400).send("Price cannot be negative");
    }
  }

  // Promotion validation
  if (promotion_code || order_discount_value) {
    if (!promotion_code) {
      console.log("Missing promotion_code when order_discount_value is provided:", order_discount_value);
      return res.status(400).send("Promotion code is required when a discount value is provided");
    }
    if (!order_discount_value) {
      console.log("Missing order_discount_value when promotion_code is provided:", promotion_code);
      return res.status(400).send("Discount value is required when a promotion code is provided");
    }

    const promotion = await Promotion.findOne({
      where: { code: promotion_code, isActive: true },
    });
    if (!promotion) {
      console.log("Promotion not found or inactive for code:", promotion_code);
      return res.status(400).send(`Promotion code '${promotion_code}' not found or is not active`);
    }

    const currentDate = new Date();
    if (currentDate < promotion.startDate || currentDate > promotion.endDate) {
      console.log("Promotion is not active for current date:", {
        promotion_code,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        currentDate,
      });
      return res.status(400).send(`Promotion code '${promotion_code}' is not active for the current date`);
    }

    if (promotion.NumberCurrentUses >= promotion.maxNumberOfUses) {
      console.log("Promotion has reached maximum uses:", {
        promotion_code,
        NumberCurrentUses: promotion.NumberCurrentUses,
        maxNumberOfUses: promotion.maxNumberOfUses,
      });
      return res.status(400).send(`Promotion code '${promotion_code}' has reached its maximum usage limit`);
    }

    const order_amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (order_amount < promotion.minOrderAmount) {
      console.log("Order amount does not meet minimum requirement for promotion:", {
        promotion_code,
        order_amount,
        minOrderAmount: promotion.minOrderAmount,
      });
      return res
        .status(400)
        .send(`Order amount does not meet the minimum requirement for promotion code '${promotion_code}'`);
    }

    if (parseFloat(order_discount_value) !== parseFloat(promotion.discountAmount)) {
      console.log("Discount value does not match promotion:", {
        order_discount_value,
        promotion_discountAmount: promotion.discountAmount,
      });
      return res
        .status(400)
        .send(`Discount value does not match the promotion code '${promotion_code}' discount amount`);
    }
  }

  console.log("Starting database transaction");
  const transaction = await sequelize.transaction();
  console.log("Transaction started");

  try {
    // Product and material validation
    for (const item of orderItems) {
      const product = await Product.findOne({
        where: { productId: item.productId, isActive: true },
        transaction,
      });
      if (!product) {
        console.log(`Product not found or inactive for productId: ${item.productId}`);
        await transaction.rollback();
        console.log("Transaction rolled back due to product not found");
        return res.status(400).send(`Product with ID ${item.productId} not found or inactive`);
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
        console.log("Transaction rolled back due to price mismatch");
        return res.status(400).send(`Price for product ID ${item.productId} does not match`);
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
        console.log("Transaction rolled back due to no recipes found");
        return res.status(400).send(`No recipes found for product ID ${item.productId}`);
      }

      for (const recipe of recipes) {
        const material = recipe.Material;
        const requiredQuantity = recipe.quantity * item.quantity;
        if (material.quantity < requiredQuantity) {
          console.log(
            `Insufficient material quantity for materialId: ${material.materialId}. Required: ${requiredQuantity}, Available: ${material.quantity}`
          );
          await transaction.rollback();
          console.log("Transaction rolled back due to insufficient material");
          return res
            .status(400)
            .send(
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

    // Calculate order details
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
      isDatHo: isDatHo || false,
      tenNguoiDatHo: tenNguoiDatHo || null,
      soDienThoaiNguoiDatHo: soDienThoaiNguoiDatHo || null,
      platform,
      customerId: userId || null,
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
        isDatHo: isDatHo || false,
        tenNguoiDatHo: tenNguoiDatHo || null,
        soDienThoaiNguoiDatHo: soDienThoaiNguoiDatHo || null,
        platform,
        customerId: userId || null,
      },
      { transaction }
    );

    if (promotion_code) {
      const promotion = await Promotion.findOne({ where: { code: promotion_code }, transaction });
      promotion.NumberCurrentUses += 1;
      await promotion.save({ transaction });
      console.log(
        `Incremented NumberCurrentUses for promotion code '${promotion_code}' to ${promotion.NumberCurrentUses}`
      );
    }

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
      console.log("Transaction rolled back due to order items creation failure");
      return res.status(500).send("Failed to create order items");
    }

    const paymentLinkData = {
      orderCode: order.orderId,
      amount: Math.round(order_subtotal - (order_discount_value || 0)),
      description: `Order #${order.orderId}`,
      returnUrl: `${YOUR_DOMAIN}/api/pos-orders/success?orderId=${order.orderId}`,
      cancelUrl: `${YOUR_DOMAIN}/api/pos-orders/cancel?orderId=${order.orderId}`,
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
      console.log("Transaction rolled back due to payment link creation failure");
      return res.status(500).send("Failed to create payment link");
    }

    await transaction.commit();
    console.log("Transaction committed successfully");

    // Send push notifications to Staff and Manager
    console.log(`[${order.orderId}] Starting notification process for Staff and Manager users...`);
    const staffAndManagers = await User.findAll({
      where: { role: ["Staff", "Manager"] },
      attributes: ["id", "fullName", "role"],
      include: [{ model: FcmToken, as: "FcmTokens", attributes: ["fcmToken"] }],
    });

    console.log(`[${order.orderId}] Found ${staffAndManagers.length} Staff/Manager users`);
    if (staffAndManagers.length === 0) {
      console.warn(`[${order.orderId}] No Staff or Manager users found for notifications`);
    } else {
      console.log(
        `[${order.orderId}] Users: ${JSON.stringify(
          staffAndManagers.map((u) => ({ id: u.id, fullName: u.fullName, role: u.role })),
          null,
          2
        )}`
      );
    }

    const notificationPromises = [];
    for (const staffOrManager of staffAndManagers) {
      if (staffOrManager.FcmTokens && staffOrManager.FcmTokens.length > 0) {
        console.log(
          `[${order.orderId}] User ${staffOrManager.id} (${staffOrManager.fullName}, ${staffOrManager.role}) has ${staffOrManager.FcmTokens.length} FCM tokens`
        );
        for (const token of staffOrManager.FcmTokens) {
          if (token.fcmToken) {
            console.log(
              `[${order.orderId}] Preparing notification for user ${staffOrManager.id} with token: ${token.fcmToken}`
            );
            notificationPromises.push(
              sendPushNotification(token.fcmToken, `Order #${order.orderId}`, "Khách đã đặt hàng thành công", {
                orderId: order.orderId.toString(),
                userId: staffOrManager.id.toString(),
              })
                .then((response) => {
                  console.log(
                    `[${order.orderId}] Notification sent successfully to user ${staffOrManager.id}: ${response}`
                  );
                  return { status: "fulfilled", userId: staffOrManager.id, response, fcmToken: token.fcmToken };
                })
                .catch((error) => {
                  console.error(
                    `[${order.orderId}] Failed to send notification to user ${staffOrManager.id}: ${error.message}`,
                    error.stack
                  );
                  return { status: "rejected", userId: staffOrManager.id, error, fcmToken: token.fcmToken };
                })
            );
          } else {
            console.warn(
              `[${order.orderId}] Empty FCM token for user ${staffOrManager.id} (${staffOrManager.fullName})`
            );
          }
        }
      } else {
        console.warn(
          `[${order.orderId}] No FCM tokens found for user ${staffOrManager.id} (${staffOrManager.fullName}, ${staffOrManager.role})`
        );
      }
    }

    if (notificationPromises.length === 0) {
      console.warn(`[${order.orderId}] No notifications sent: No valid FCM tokens found for Staff or Manager users`);
    } else {
      console.log(`[${order.orderId}] Sending ${notificationPromises.length} notifications...`);
      const results = await Promise.allSettled(notificationPromises);
      let hasErrors = false;
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          console.log(
            `[${order.orderId}] Notification ${index + 1} for user ${result.value.userId} sent successfully: ${
              result.value.response
            }`
          );
        } else {
          hasErrors = true;
          console.error(
            `[${order.orderId}] Notification ${index + 1} for user ${result.reason.userId} failed: ${
              result.reason.error.message
            }`
          );
          if (result.reason.error.code === "messaging/registration-token-not-registered") {
            console.log(
              `[${order.orderId}] Removing invalid FCM token for user ${result.reason.userId}: ${result.reason.fcmToken}`
            );
            FcmToken.destroy({ where: { fcmToken: result.reason.fcmToken } });
          }
        }
      });
      if (hasErrors) {
        console.warn(`[${order.orderId}] Some notifications failed to send, but proceeding with response`);
      } else {
        console.log(`[${order.orderId}] All notifications sent successfully`);
      }
    }

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
        return res.status(500).send("Order was not saved correctly after commit");
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
    console.log("Transaction rolled back due to error");
    return res.status(500).send("Failed to create order");
  }
};

async function generateAndUploadInvoice(order, orderId, transaction) {
  console.log("generateAndUploadInvoice called for orderId:", orderId);
  try {
    const orderItems = await OrderItem.findAll({
      where: { orderId },
      include: [{ model: Product, as: "Product", attributes: ["name"] }],
      attributes: ["quantity", "price"],
      transaction,
    });
    console.log("Fetched order items:", JSON.stringify(orderItems, null, 2));

    const user = await User.findOne({
      where: { id: order.userId },
      attributes: ["id", "fullName"],
      transaction,
    });
    console.log("Fetched user:", user ? user.fullName : "Khách hàng");

    const qrCodeUrl = await QRCode.toDataURL(`${FRONTEND_DOMAIN}/order/${order.orderId}`);
    console.log("Generated QR code for URL:", qrCodeUrl.slice(0, 50) + "...");

    console.log("Starting PDF generation for orderId:", orderId);
    const doc = new PDFDocument({
      size: [216, 700],
      margin: 15,
      info: {
        Title: `Hóa đơn #${order.orderId}`,
        Author: "Tấm Tắc",
        Subject: "Hóa đơn bán hàng",
        Keywords: "hóa đơn, đơn hàng",
      },
    });

    doc.registerFont("NotoSans", "./fonts/NotoSans-Regular.ttf");
    doc.registerFont("NotoSans-Bold", "./fonts/NotoSans-SemiBold.ttf");

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    const colors = {
      primary: "#2563EB",
      secondary: "#64748B",
      accent: "#059669",
      text: "#1E293B",
      light: "#F1F5F9",
      border: "#E2E8F0",
      success: "#10B981",
    };

    const spacing = {
      small: 8,
      medium: 12,
      large: 16,
      xlarge: 20,
    };

    let currentY = 15;
    const pageWidth = 216;
    const contentWidth = pageWidth - 30;

    doc.rect(15, currentY, contentWidth, 50).fillColor(colors.light).fill();
    currentY += 10;
    doc.font("NotoSans-Bold").fontSize(18).fillColor(colors.primary).text("TẤM TẮC", { align: "center" });
    currentY += spacing.large;
    doc
      .font("NotoSans")
      .fontSize(9)
      .fillColor(colors.secondary)
      .text("123 Đường Kinh Doanh, Quận 1", { align: "center" });
    currentY += spacing.small;
    doc.text("TP. Hồ Chí Minh | Tel: +84 909 123 456", { align: "center" });
    currentY += spacing.medium;
    doc.lineWidth(2).strokeColor(colors.primary).moveTo(60, currentY).lineTo(156, currentY).stroke();
    currentY += spacing.medium;
    doc.rect(15, currentY, contentWidth, 25).fillColor(colors.primary).fill();
    doc
      .font("NotoSans-Bold")
      .fontSize(12)
      .fillColor("white")
      .text(`HÓA ĐƠN #${order.orderId.toString().padStart(6, "0")}`, 15, currentY + 8, {
        width: contentWidth,
        align: "center",
      });
    currentY += 35;

    const invoiceDetails = [
      { label: "Ngày:", value: new Date(order.order_create_at).toLocaleDateString("vi-VN") },
      { label: "Thời gian:", value: new Date(order.payment_time || new Date()).toLocaleTimeString("vi-VN") },
      { label: "Khách hàng:", value: user ? user.fullName || "Khách lẻ" : "Khách lẻ" },
    ];

    if (order.isDatHo && order.tenNguoiDatHo && order.soDienThoaiNguoiDatHo) {
      invoiceDetails.push({
        label: "Đặt hộ:",
        value: `${order.tenNguoiDatHo} - SĐT: ${order.soDienThoaiNguoiDatHo}`,
      });
    }

    invoiceDetails.forEach((detail) => {
      doc
        .font("NotoSans")
        .fontSize(8)
        .fillColor(colors.text)
        .text(detail.label, 20, currentY, { width: 45 })
        .text(detail.value, 70, currentY, { width: 125 });
      currentY += spacing.small + 2;
    });

    currentY += spacing.large;
    doc.rect(15, currentY, contentWidth, 20).fillColor(colors.accent).fill();
    doc
      .font("NotoSans-Bold")
      .fontSize(9)
      .fillColor("white")
      .text("SẢN PHẨM", 20, currentY + 6)
      .text("SL", 130, currentY + 6, { width: 25, align: "center" })
      .text("GIÁ", 160, currentY + 6, { width: 36, align: "right" });
    currentY += 25;

    orderItems.forEach((item, index) => {
      const itemTotal = item.quantity * item.price;
      if (index % 2 === 0) {
        doc
          .rect(15, currentY - 3, contentWidth, spacing.large + 2)
          .fillColor(colors.light)
          .fill();
      }
      doc
        .font("NotoSans")
        .fontSize(8)
        .fillColor(colors.text)
        .text(item.Product.name, 20, currentY, { width: 105 })
        .text(item.quantity.toString(), 130, currentY, { width: 25, align: "center" })
        .text(`${item.price.toLocaleString("vi-VN")}`, 160, currentY, { width: 36, align: "right" });
      currentY += spacing.medium + 2;
    });

    doc.lineWidth(1).strokeColor(colors.border).moveTo(15, currentY).lineTo(201, currentY).stroke();
    currentY += spacing.large;

    if (order.note) {
      doc.rect(15, currentY, contentWidth, 15).fillColor(colors.secondary).fill();
      doc
        .font("NotoSans-Bold")
        .fontSize(9)
        .fillColor("white")
        .text("GHI CHÚ", 20, currentY + 4);
      currentY += 20;
      doc
        .font("NotoSans")
        .fontSize(8)
        .fillColor(colors.text)
        .text(order.note, 20, currentY, { width: contentWidth - 10 });
      currentY += spacing.large + 5;
    }

    currentY += spacing.medium;
    const summaryItems = [
      { label: "Tổng phụ:", value: `${order.order_amount.toLocaleString("vi-VN")} VND`, color: colors.text },
      {
        label: "Phí vận chuyển:",
        value: `${order.order_shipping_fee.toLocaleString("vi-VN")} VND`,
        color: colors.text,
      },
    ];

    if (order.order_discount_value > 0) {
      summaryItems.push({
        label: "Giảm giá:",
        value: `-${order.order_discount_value.toLocaleString("vi-VN")} VND`,
        color: colors.accent,
      });
    }

    summaryItems.forEach((item) => {
      doc
        .font("NotoSans")
        .fontSize(8)
        .fillColor(item.color || colors.text)
        .text(item.label, 100, currentY, { width: 70, align: "left" })
        .text(item.value, 130, currentY, { width: 66, align: "right" });
      currentY += spacing.small + 2;
    });

    doc.lineWidth(1).strokeColor(colors.border).moveTo(100, currentY).lineTo(196, currentY).stroke();
    currentY += spacing.small;

    doc
      .rect(100, currentY - 2, 96, 16)
      .fillColor(colors.accent)
      .fill();
    const totalAmount = order.order_subtotal - (order.order_discount_value || 0);
    doc
      .font("NotoSans-Bold")
      .fontSize(6)
      .fillColor("white")
      .text("TỔNG CỘNG:", 105, currentY + 1, { width: 60, align: "left" })
      .text(`${totalAmount.toLocaleString("vi-VN")} VND`, 135, currentY + 1, { width: 56, align: "right" });
    currentY += spacing.large + 10;

    doc.rect(15, currentY, contentWidth, 20).fillColor(colors.success).fill();
    doc
      .font("NotoSans-Bold")
      .fontSize(9)
      .fillColor("white")
      .text("✓ ĐÃ THANH TOÁN", 15, currentY + 6, { width: contentWidth, align: "center" });
    currentY += 25;

    doc.rect(15, currentY, contentWidth, 120).fillColor("white").strokeColor(colors.success).lineWidth(2).stroke();
    currentY += 10;
    doc
      .font("NotoSans")
      .fontSize(7)
      .fillColor(colors.text)
      .text("Quét mã để xem chi tiết đơn hàng", 15, currentY, { width: contentWidth, align: "center" });
    currentY += 15;
    const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
    doc.image(qrImage, 63, currentY, { width: 60 });
    currentY += 70;
    doc
      .font("NotoSans-Bold")
      .fontSize(10)
      .fillColor(colors.primary)
      .text("CẢM ƠN QUÝ KHÁCH!", 15, currentY, { width: contentWidth, align: "center" });
    currentY += 15;
    doc
      .font("NotoSans")
      .fontSize(6)
      .fillColor(colors.secondary)
      .text(`Được tạo vào ${new Date().toLocaleString("vi-VN")}`, 15, currentY, {
        width: contentWidth,
        align: "center",
      });

    doc.page.height = currentY + 25;
    doc.end();

    console.log("PDF generation complete, collecting buffer for orderId:", orderId);
    const pdfBuffer = await new Promise((resolve) => {
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });
    console.log("PDF buffer size:", pdfBuffer.length);

    console.log("Uploading PDF to Firebase for orderId:", orderId);
    const invoiceUrl = await uploadFileToFirebase(pdfBuffer, `receipt_${orderId}.pdf`, "application/pdf");
    console.log("Firebase upload successful, invoiceUrl:", invoiceUrl);

    order.invoiceUrl = invoiceUrl;
    await order.save({ transaction });
    console.log("Order updated with invoiceUrl for orderId:", orderId, invoiceUrl);

    return invoiceUrl;
  } catch (error) {
    console.error("Error in generateAndUploadInvoice for orderId:", orderId, error.message, error.stack);
    throw error;
  }
}

const handlePaymentSuccess = async (req, res) => {
  console.log("handlePaymentSuccess called at:", new Date().toISOString());
  console.log("Request method:", req.method);
  console.log("Raw URL:", req.originalUrl);
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));
  console.log("Request query:", JSON.stringify(req.query, null, 2));
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("All request parameters:", {
    query: req.query,
    body: req.body,
    url: req.originalUrl,
    method: req.method,
  });

  const { orderId, code, id: paymentId, status, cancel, orderCode } = req.method === "GET" ? req.query : req.body;
  console.log("Extracted parameters:", { orderId, code, paymentId, status, cancel, orderCode });

  if (!orderId) {
    console.log("Missing orderId in request");
    return res.status(400).json({ message: "Order ID is required" });
  }

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.status(400).json({ message: "Invalid order ID" });
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
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status_id === 2) {
      console.log(`Order ${parsedOrderId} already processed with status_id: 2`);
      let invoiceUrl = order.invoiceUrl;
      if (!invoiceUrl) {
        console.log("No invoiceUrl, generating PDF for orderId:", parsedOrderId);
        invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);
      }
      await transaction.commit();
      console.log("Redirecting to frontend success page for orderId:", parsedOrderId);
      const redirectUrl = `${FRONTEND_DOMAIN}/staff/payment-success?orderId=${parsedOrderId}&code=00&status=PAID&invoiceUrl=${encodeURIComponent(
        invoiceUrl || ""
      )}`;
      console.log("Redirect URL:", redirectUrl);
      return res.redirect(redirectUrl);
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

    let paymentStatus = { code: code || "unknown", status: status || "unknown" };
    console.log("Initial paymentStatus:", paymentStatus);

    if (!code || !status || paymentStatus.code === "unknown" || paymentStatus.status === "unknown") {
      console.log("Missing or unknown code/status, fetching from PayOS for orderId:", parsedOrderId);
      try {
        const paymentInfo = await payos.getPaymentLinkInformation(paymentId || orderCode || parsedOrderId);
        console.log("PayOS payment info:", JSON.stringify(paymentInfo, null, 2));
        paymentStatus = {
          code: paymentInfo.data?.code || paymentInfo.code || "unknown",
          status: paymentInfo.data?.status || paymentInfo.status || "unknown",
        };
        console.log("Updated paymentStatus from PayOS:", paymentStatus);
      } catch (payosError) {
        console.error("Failed to fetch PayOS payment info:", payosError.message, payosError.stack);
        await transaction.rollback();
        return res.status(500).json({ message: "Failed to verify payment status", error: payosError.message });
      }
    }

    const isPaymentSuccessful = paymentStatus.code === "00" || paymentStatus.status.toUpperCase() === "PAID";
    console.log("Payment success check:", { isPaymentSuccessful, paymentStatus });

    if (isPaymentSuccessful) {
      console.log("Payment successful for orderId:", parsedOrderId);
      order.status_id = 2; // Paid
      order.payment_time = new Date();

      const currentMemberPoint = user.member_point || 0;
      const orderPointEarn = order.order_point_earn || 0;
      user.member_point = currentMemberPoint + orderPointEarn;
      console.log(`Updating user ${user.id} member_point to ${user.member_point}`);

      try {
        await user.save({ transaction });
        console.log("User saved successfully");
        await order.save({ transaction });
        console.log("Order saved successfully with status_id: 2");
      } catch (saveError) {
        console.error("Failed to save user or order:", saveError.message, saveError.stack);
        await transaction.rollback();
        return res.status(500).json({ message: "Failed to update order status", error: saveError.message });
      }

      const invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);
      console.log("Invoice generated:", invoiceUrl);

      try {
        await transaction.commit();
        console.log("Transaction committed successfully for orderId:", parsedOrderId);
      } catch (commitError) {
        console.error("Failed to commit transaction:", commitError.message, commitError.stack);
        return res.status(500).json({ message: "Failed to commit transaction", error: commitError.message });
      }

      const redirectUrl = `${FRONTEND_DOMAIN}/staff/payment-success?orderId=${parsedOrderId}&code=${
        paymentStatus.code
      }&status=${paymentStatus.status}&invoiceUrl=${encodeURIComponent(invoiceUrl || "")}`;
      console.log("Redirecting to:", redirectUrl);
      return res.redirect(redirectUrl);
    } else {
      console.log("Payment failed for orderId:", parsedOrderId, paymentStatus);
      await transaction.rollback();
      return res.status(400).json({ message: "Payment not successful", paymentStatus });
    }
  } catch (error) {
    console.error("Error in handlePaymentSuccess:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const setOrderToApproved = async (req, res) => {
  console.log("setOrderToApproved called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!["Staff", "Admin"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff or Admin can set orders to Approved");
  }

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.status(400).send("Invalid order ID");
  }

  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { orderId: parsedOrderId },
      include: [{ model: OrderStatus, as: "OrderStatus", attributes: ["status"] }],
      transaction,
    });

    if (!order) {
      console.log("Order not found for orderId:", parsedOrderId);
      await transaction.rollback();
      return res.status(404).send("Order not found");
    }

    if (order.status_id !== 2) {
      const currentStatus = order.OrderStatus ? order.OrderStatus.status : `status_id: ${order.status_id}`;
      console.log("Invalid status transition for orderId:", parsedOrderId, "Current status:", currentStatus);
      await transaction.rollback();
      return res
        .status(400)
        .send(
          `Invalid status transition: Order is currently ${currentStatus}. It must be Paid to transition to Approved.`
        );
    }

    order.status_id = 8; // Approved
    order.approvedBy = userId;
    await order.save({ transaction });

    await transaction.commit();
    console.log("Order status updated to Approved for orderId:", parsedOrderId, "Approved by userId:", userId);

    res.status(200).json({
      message: "Order status updated to Approved",
      orderId: parsedOrderId,
      status: "Approved",
      approvedBy: userId,
    });
  } catch (error) {
    console.error("Error in setOrderToApproved:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to update order status");
  }
};

const setOrderToPreparing = async (req, res) => {
  console.log("setOrderToPreparing called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!["Staff"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff can set orders to Preparing");
  }

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.status(400).send("Invalid order ID");
  }

  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { orderId: parsedOrderId },
      include: [{ model: OrderStatus, as: "OrderStatus", attributes: ["status"] }],
      transaction,
    });

    if (!order) {
      console.log("Order not found for orderId:", parsedOrderId);
      await transaction.rollback();
      return res.status(404).send("Order not found");
    }

    if (order.status_id !== 8) {
      const currentStatus = order.OrderStatus ? order.OrderStatus.status : `status_id: ${order.status_id}`;
      console.log("Invalid status transition for orderId:", parsedOrderId, "Current status:", currentStatus);
      await transaction.rollback();
      return res
        .status(400)
        .send(
          `Invalid status transition: Order is currently ${currentStatus}. It must be Approved to transition to Preparing.`
        );
    }

    order.status_id = 6; // Preparing
    await order.save({ transaction });

    await transaction.commit();
    console.log("Order status updated to Preparing for orderId:", parsedOrderId);

    res.status(200).json({
      message: "Order status updated to Preparing",
      orderId: parsedOrderId,
      status: "Preparing",
    });
  } catch (error) {
    console.error("Error in setOrderToPreparing:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to update order status");
  }
};

const setOrderToCooked = async (req, res) => {
  console.log("setOrderToCooked called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!["Staff"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff can set orders to Cooked");
  }

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.status(400).send("Invalid order ID");
  }

  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { orderId: parsedOrderId },
      include: [{ model: OrderStatus, as: "OrderStatus", attributes: ["status"] }],
      transaction,
    });

    if (!order) {
      console.log("Order not found for orderId:", parsedOrderId);
      await transaction.rollback();
      return res.status(404).send("Order not found");
    }

    if (order.status_id !== 6) {
      const currentStatus = order.OrderStatus ? order.OrderStatus.status : `status_id: ${order.status_id}`;
      console.log("Invalid status transition for orderId:", parsedOrderId, "Current status:", currentStatus);
      await transaction.rollback();
      return res
        .status(400)
        .send(
          `Invalid status transition: Order is currently ${currentStatus}. It must be Preparing to transition to Cooked.`
        );
    }

    order.status_id = 7; // Cooked
    order.cookedBy = userId;
    order.cookedTime = new Date();
    await order.save({ transaction });

    await transaction.commit();
    console.log("Order status updated to Cooked for orderId:", parsedOrderId);

    res.status(200).json({
      message: "Order status updated to Cooked",
      orderId: parsedOrderId,
      status: "Cooked",
      cookedBy: userId,
      cookedTime: order.cookedTime,
    });
  } catch (error) {
    console.error("Error in setOrderToCooked:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to update order status");
  }
};

module.exports = {
  createOrder,
  handlePaymentSuccess,
  setOrderToApproved,
  setOrderToPreparing,
  setOrderToCooked,
  generateAndUploadInvoice,
};
