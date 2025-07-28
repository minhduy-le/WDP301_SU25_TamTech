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
const nodemailer = require("nodemailer");
const fs = require("fs").promises;
const path = require("path");
const handlebars = require("handlebars"); // Thêm dòng này
const { sendPushNotification } = require("../config/firebase");

console.log("Loading orderService.js version 2025-05-28-frontend-redirect-v2");

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
    platform,
    customerId,
  } = req.body;
  let userId = req.userId;

  if (customerId) {
    userId = customerId;
  }

  const storeId = 1;

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

  // Validation logic (giữ nguyên)
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

  // Promotion validation (giữ nguyên)
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
    // Product and material validation (giữ nguyên)
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

    // Calculate order details (giữ nguyên)
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
        platform: platform,
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
      returnUrl: `${YOUR_DOMAIN}/api/orders/success?orderId=${order.orderId}`,
      cancelUrl: `${YOUR_DOMAIN}/api/orders/cancel?orderId=${order.orderId}`,
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

    // Thêm thử nghiệm gửi thông báo đến userId hiện tại (để debug)
    console.log(`[${order.orderId}] Attempting to send test notification to current user (userId: ${userId})`);
    const currentUserTokens = await FcmToken.findAll({ where: { userId }, attributes: ["fcmToken"] });
    if (currentUserTokens.length > 0) {
      console.log(`[${order.orderId}] Found ${currentUserTokens.length} FCM tokens for user ${userId}`);
      for (const token of currentUserTokens) {
        console.log(`[${order.orderId}] Sending test notification to user ${userId} with token: ${token.fcmToken}`);
        try {
          const response = await sendPushNotification(
            token.fcmToken,
            `Test Order #${order.orderId}`,
            "Test notification for order creation",
            { orderId: order.orderId.toString(), userId: userId.toString() }
          );
          console.log(`[${order.orderId}] Test notification sent to user ${userId}: ${response}`);
        } catch (error) {
          console.error(
            `[${order.orderId}] Failed to send test notification to user ${userId}: ${error.message}`,
            error.stack
          );
          if (error.code === "messaging/registration-token-not-registered") {
            console.log(`[${order.orderId}] Removing invalid FCM token for user ${userId}: ${token.fcmToken}`);
            await FcmToken.destroy({ where: { fcmToken: token.fcmToken } });
          }
        }
      }
    } else {
      console.warn(`[${order.orderId}] No FCM tokens found for current user ${userId}`);
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

const getOrderDetails = async (req, res) => {
  console.log("getOrderDetails called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.status(400).send("Invalid order ID");
  }

  try {
    const order = await Order.findOne({
      where: { orderId: parsedOrderId },
      attributes: [
        "orderId",
        "userId",
        "payment_time",
        "order_create_at",
        "order_address",
        "status_id",
        "order_shipping_fee",
        "order_discount_value",
        "order_amount",
        "order_subtotal",
        "invoiceUrl",
        "order_point_earn",
        "note",
        "payment_method_id",
        "isDatHo",
        "tenNguoiDatHo",
        "soDienThoaiNguoiDatHo",
        "certificationOfDelivered",
        "order_delivery_at",
        "isRefund",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "fullName", "phone_number"],
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

    if (!order) {
      console.log("Order not found for orderId:", parsedOrderId);
      return res.status(404).send("Order not found");
    }

    if (order.userId !== userId && !["Staff", "Admin"].includes(userRole)) {
      console.log("Unauthorized access attempt by userId:", userId, "for orderId:", parsedOrderId);
      return res.status(403).send("Unauthorized: You do not have permission to view this order");
    }

    const formattedOrder = {
      orderId: order.orderId,
      userId: order.userId,
      payment_time: order.payment_time,
      order_create_at: order.order_create_at,
      order_address: order.order_address,
      status: order.OrderStatus ? order.OrderStatus.status : null,
      fullName: order.User ? order.User.fullName : null,
      phone_number: order.User ? order.User.phone_number : null,
      orderItemsCount: order.OrderItems.length,
      orderItems: order.OrderItems.map((item) => ({
        productId: item.productId,
        name: item.Product ? item.Product.name : null,
        quantity: item.quantity,
        price: item.price,
      })),
      order_shipping_fee: order.order_shipping_fee,
      order_discount_value: order.order_discount_value,
      order_amount: order.order_amount,
      order_subtotal: order.order_subtotal,
      invoiceUrl: order.invoiceUrl,
      order_point_earn: order.order_point_earn,
      note: order.note,
      payment_method: order.PaymentMethod ? order.PaymentMethod.name : null,
      isDatHo: order.isDatHo,
      tenNguoiDatHo: order.tenNguoiDatHo,
      soDienThoaiNguoiDatHo: order.soDienThoaiNguoiDatHo,
      certificationOfDelivered: order.certificationOfDelivered,
      order_delivery_at: order.order_delivery_at,
    };

    console.log("Returning formatted order:", JSON.stringify(formattedOrder, null, 2));
    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error("Error in getOrderDetails:", error.message, error.stack);
    res.status(500).json({ message: "Failed to retrieve order details", error: error.message });
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
      size: [216, 700], // Tăng chiều cao để có đủ không gian
      margin: 15, // Giảm margin để tối ưu không gian
      info: {
        Title: `Hóa đơn #${order.orderId}`,
        Author: "Tấm Tắc",
        Subject: "Hóa đơn bán hàng",
        Keywords: "hóa đơn, đơn hàng",
      },
    });

    // Register custom fonts with proper paths
    doc.registerFont("NotoSans", "./fonts/NotoSans-Regular.ttf");
    doc.registerFont("NotoSans-Bold", "./fonts/NotoSans-SemiBold.ttf");

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    // Enhanced styling constants
    const colors = {
      primary: "#2563EB", // Blue
      secondary: "#64748B", // Gray
      accent: "#059669", // Green
      text: "#1E293B", // Dark gray
      light: "#F1F5F9", // Light gray
      border: "#E2E8F0", // Border gray
      success: "#10B981", // Success green
    };

    const spacing = {
      small: 8,
      medium: 12,
      large: 16,
      xlarge: 20,
    };

    let currentY = 15;
    const pageWidth = 216;
    const contentWidth = pageWidth - 30; // 15px margin on each side

    // =============== HEADER SECTION ===============
    // Company logo background
    doc.rect(15, currentY, contentWidth, 50).fillColor(colors.light).fill();

    currentY += 10;

    // Company name with enhanced styling
    doc.font("NotoSans-Bold").fontSize(18).fillColor(colors.primary).text("TẤM TẮC", { align: "center" });

    currentY += spacing.large;

    // Company info
    doc
      .font("NotoSans")
      .fontSize(9)
      .fillColor(colors.secondary)
      .text("123 Đường Kinh Doanh, Quận 1", { align: "center" });

    currentY += spacing.small;

    doc.text("TP. Hồ Chí Minh | Tel: +84 909 123 456", { align: "center" });

    currentY += spacing.medium;

    // Decorative line
    doc.lineWidth(2).strokeColor(colors.primary).moveTo(60, currentY).lineTo(156, currentY).stroke();

    currentY += spacing.medium;

    // =============== INVOICE INFO SECTION ===============
    // Invoice title with background
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

    // Invoice details in a clean layout
    const invoiceDetails = [
      { label: "Ngày:", value: new Date(order.order_create_at).toLocaleDateString("vi-VN") },
      { label: "Thời gian:", value: new Date(order.payment_time || new Date()).toLocaleTimeString("vi-VN") },
      { label: "Khách hàng:", value: user ? user.fullName || "Khách lẻ" : "Khách lẻ" },
    ];

    // Add booking info if exists
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

    // =============== ITEMS TABLE SECTION ===============
    // Table header with background
    doc.rect(15, currentY, contentWidth, 20).fillColor(colors.accent).fill();

    doc
      .font("NotoSans-Bold")
      .fontSize(9)
      .fillColor("white")
      .text("SẢN PHẨM", 20, currentY + 6)
      .text("SL", 130, currentY + 6, { width: 25, align: "center" })
      .text("GIÁ", 160, currentY + 6, { width: 36, align: "right" });

    currentY += 25;

    // Table items with alternating background
    orderItems.forEach((item, index) => {
      const itemTotal = item.quantity * item.price;

      // Alternating row colors
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

    // Table bottom border
    doc.lineWidth(1).strokeColor(colors.border).moveTo(15, currentY).lineTo(201, currentY).stroke();

    currentY += spacing.large;

    // =============== NOTES SECTION ===============
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

    // =============== SUMMARY SECTION ===============
    currentY += spacing.medium;

    // Summary items with proper spacing and alignment
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

    // Separator line before total
    doc.lineWidth(1).strokeColor(colors.border).moveTo(100, currentY).lineTo(196, currentY).stroke();
    currentY += spacing.small;

    // Total amount with highlighted background
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

    // =============== PAYMENT STATUS ===============
    doc.rect(15, currentY, contentWidth, 20).fillColor(colors.success).fill();

    doc
      .font("NotoSans-Bold")
      .fontSize(9)
      .fillColor("white")
      .text("✓ ĐÃ THANH TOÁN", 15, currentY + 6, { width: contentWidth, align: "center" });

    currentY += 25;

    // =============== QR CODE SECTION ===============
    // QR section with border containing everything
    doc.rect(15, currentY, contentWidth, 120).fillColor("white").strokeColor(colors.success).lineWidth(2).stroke();

    currentY += 10;

    // QR code title
    doc
      .font("NotoSans")
      .fontSize(7)
      .fillColor(colors.text)
      .text("Quét mã để xem chi tiết đơn hàng", 15, currentY, { width: contentWidth, align: "center" });

    currentY += 15;

    // QR code image
    const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
    doc.image(qrImage, 63, currentY, { width: 60 });

    currentY += 70;

    // Thank you message
    doc
      .font("NotoSans-Bold")
      .fontSize(10)
      .fillColor(colors.primary)
      .text("CẢM ƠN QUÝ KHÁCH!", 15, currentY, { width: contentWidth, align: "center" });

    currentY += 15;

    // Timestamp
    doc
      .font("NotoSans")
      .fontSize(6)
      .fillColor(colors.secondary)
      .text(`Được tạo vào ${new Date().toLocaleString("vi-VN")}`, 15, currentY, {
        width: contentWidth,
        align: "center",
      });

    // Set final page height with some bottom padding
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

    // Check if order is already paid (possibly updated by webhook)
    if (order.status_id === 2) {
      console.log(`Order ${parsedOrderId} already processed with status_id: 2`);
      let invoiceUrl = order.invoiceUrl;
      if (!invoiceUrl) {
        console.log("No invoiceUrl, generating PDF for orderId:", parsedOrderId);
        invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);
      }
      await transaction.commit();
      console.log("Redirecting to frontend success page for orderId:", parsedOrderId);
      console.log("Order platform value:", order.platform); // Debug log
      const redirectPath =
        order.platform === "mobile" ? `${FRONTEND_DOMAIN}/staff/payment-success` : `${FRONTEND_DOMAIN}/payment-success`;
      const redirectUrl = `${redirectPath}?orderId=${parsedOrderId}&code=00&status=PAID&invoiceUrl=${encodeURIComponent(
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

    // Validate payment status
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

      // Determine redirect URL based on platform
      const redirectPath =
        order.platform === "mobile" ? `${FRONTEND_DOMAIN}/staff/payment-success` : `${FRONTEND_DOMAIN}/payment-success`;
      const redirectUrl = `${redirectPath}?orderId=${parsedOrderId}&code=${paymentStatus.code}&status=${
        paymentStatus.status
      }&invoiceUrl=${encodeURIComponent(invoiceUrl || "")}`;

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

const setOrderToCanceledWhenUserCancel = async (orderId, userId) => {
  const transaction = await sequelize.transaction();
  try {
    const order = await Order.findOne({
      where: { orderId, userId },
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return { status: 404, message: "Order not found or you don't have permission" };
    }

    if (order.status_id !== 1) {
      await transaction.rollback();
      return { status: 400, message: "Only pending orders can be canceled" };
    }

    await Order.update({ status_id: 5 }, { where: { orderId }, transaction });

    await transaction.commit();
    return { status: 200, message: "Order canceled successfully" };
  } catch (error) {
    await transaction.rollback();
    console.error("Error in setOrderToCanceled:", error);
    return { status: 500, message: "Internal server error" };
  }
};

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
          attributes: ["id", "fullName", "phone_number"],
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
      order: [["order_create_at", "DESC"]],
    });

    console.log("Fetched user orders:", orders.length);

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
      orderItemsCount: order.OrderItems.length,
      order_shipping_fee: order.order_shipping_fee,
      order_discount_value: order.order_discount_value,
      order_amount: order.order_amount,
      invoiceUrl: order.invoiceUrl,
      order_point_earn: order.order_point_earn,
      note: order.note,
      payment_method: order.PaymentMethod ? order.PaymentMethod.name : null,
    }));

    console.log("Returning formatted user orders:", formattedOrders.length);
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error in getUserOrders:", error.message, error.stack);
    res.status(500).json({ message: "Failed to retrieve user orders", error: error.message });
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
    order.approvedBy = userId; // Set approvedBy to the userId from verifyToken
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

const setOrderToDelivering = async (req, res) => {
  console.log("setOrderToDelivering called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!["Staff", "Shipper"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff or Shipper can set orders to Delivering");
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

    if (order.status_id !== 7) {
      const currentStatus = order.OrderStatus ? order.OrderStatus.status : `status_id: ${order.status_id}`;
      console.log("Invalid status transition for orderId:", parsedOrderId, "Current status:", currentStatus);
      await transaction.rollback();
      return res
        .status(400)
        .send(
          `Invalid status transition: Order is currently ${currentStatus}. It must be Cooked to transition to Delivering.`
        );
    }

    order.status_id = 3; // Delivering
    if (userRole === "Shipper") {
      order.assignToShipperId = userId;
      console.log("Assigned shipperId:", userId, "to orderId:", parsedOrderId);
    }

    await order.save({ transaction });

    await transaction.commit();
    console.log("Order status updated to Delivering for orderId:", parsedOrderId);

    res.status(200).json({
      message: "Order status updated to Delivering",
      orderId: parsedOrderId,
      status: "Delivering",
    });
  } catch (error) {
    console.error("Error in setOrderToDelivering:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to update order status");
  }
};

const setOrderToDelivered = async (req, res) => {
  console.log("setOrderToDelivered called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;
  const imageFile = req.file;

  if (!["Shipper"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Shipper can set orders to Delivered");
  }

  if (!imageFile) {
    console.log("No certification image provided for orderId:", orderId);
    return res.status(400).send("Certification image is required");
  }

  const allowedMimes = ["image/jpeg", "image/png"];
  if (!allowedMimes.includes(imageFile.mimetype)) {
    console.log("Invalid image format for orderId:", orderId, "Mime:", imageFile.mimetype);
    return res.status(400).send("Invalid image format. Only JPEG and PNG are allowed");
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

    if (order.status_id !== 3) {
      const currentStatus = order.OrderStatus ? order.OrderStatus.status : `status_id: ${order.status_id}`;
      console.log("Invalid status transition for orderId:", parsedOrderId, "Current status:", currentStatus);
      await transaction.rollback();
      return res
        .status(400)
        .send(
          `Invalid status transition: Order is currently ${currentStatus}. It must be Delivering to transition to Delivered.`
        );
    }

    if (order.assignToShipperId !== userId) {
      console.log("Order not assigned to shipperId:", userId, "for orderId:", parsedOrderId);
      await transaction.rollback();
      return res.status(403).send("Unauthorized: Order not assigned to this Shipper");
    }

    let imageUrl;
    try {
      imageUrl = await uploadFileToFirebase(
        imageFile.buffer,
        `delivery_cert_${parsedOrderId}_${Date.now()}.jpg`,
        imageFile.mimetype
      );
      console.log("Image uploaded to Firebase for orderId:", parsedOrderId, "URL:", imageUrl);
    } catch (uploadError) {
      console.error("Failed to upload image for orderId:", parsedOrderId, uploadError.message);
      await transaction.rollback();
      return res.status(500).send("Failed to upload certification image");
    }

    const deliveryTime = new Date();
    order.status_id = 4; // Delivered
    order.certificationOfDelivered = imageUrl;
    order.order_delivery_at = deliveryTime;
    await order.save({ transaction });

    await transaction.commit();
    console.log("Order status updated to Delivered for orderId:", parsedOrderId);

    res.status(200).json({
      message: "Order status updated to Delivered",
      orderId: parsedOrderId,
      status: "Delivered",
      certificationOfDelivered: imageUrl,
      order_delivery_at: deliveryTime,
    });
  } catch (error) {
    console.error("Error in setOrderToDelivered:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to update order status");
  }
};

const getAllOrders = async (req, res) => {
  console.log("getAllOrders called at:", new Date().toISOString());
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const userRole = req.userRole;

  try {
    const orders = await Order.findAll({
      attributes: [
        "orderId",
        "userId",
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
        "isRefund",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "fullName", "phone_number"],
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
        {
          model: ReasonCancel,
          as: "ReasonCancels",
          attributes: ["reason"],
        },
      ],
      order: [["order_create_at", "DESC"]],
    });

    console.log("Fetched all orders:", orders.length);

    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      userId: order.userId,
      payment_time: order.payment_time,
      order_create_at: order.order_create_at,
      order_address: order.order_address,
      status: order.OrderStatus ? order.OrderStatus.status : null,
      fullName: order.User ? order.User.fullName : null,
      phone_number: order.User ? order.User.phone_number : null,
      isRefund: order.isRefund,
      reason: order.ReasonCancels?.length > 0 ? order.ReasonCancels[0].reason : null,
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

    console.log("Returning formatted orders:", formattedOrders.length);
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error in getAllOrders:", error.message, error.stack);
    res.status(500).json({ message: "Failed to retrieve orders", error: error.message });
  }
};

const getPaidOrders = async (req, res) => {
  console.log("getPaidOrders called at:", new Date().toISOString());
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const userRole = req.userRole;

  if (!["Staff", "Admin"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", req.userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff or Admin can view Paid orders");
  }

  try {
    const orders = await Order.findAll({
      where: { status_id: 2 }, // Paid
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
        "userId",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "fullName", "phone_number"],
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
      order: [["order_create_at", "DESC"]],
    });

    console.log("Fetched Paid orders:", orders.length);

    const formattedOrders = orders.map((order) => ({
      orderId: order.orderId,
      userId: order.userId,
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
      order_discount_value: order.discount_value,
      order_amount: order.order_amount,
      invoiceUrl: order.invoiceUrl,
      order_point_earn: order.order_point_earn,
      note: order.note,
      payment_method: order.PaymentMethod ? order.PaymentMethod.name : null,
    }));

    console.log("Returning formatted Paid orders:", formattedOrders.length);
    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Error in getPaidOrders:", error.message, error.stack);
    res.status(500).json({ message: "Failed to retrieve Paid orders", error: error.message });
  }
};

const setOrderToCanceled = async (orderId, reason, userId, bankName, bankNumber) => {
  const transaction = await sequelize.transaction();
  try {
    console.log(`Starting transaction for orderId: ${orderId}`);
    const order = await Order.findOne({ where: { orderId }, transaction });
    if (!order) {
      console.log(`Order not found for orderId: ${orderId}`);
      throw Object.assign(new Error("Order not found"), { status: 404 });
    }

    if (order.status_id === 5) {
      console.log(`Order ${orderId} is already canceled`);
      throw Object.assign(new Error("Order is already canceled"), { status: 400 });
    }
    if (!reason || reason.trim() === "") {
      console.log(`Reason is missing or empty for orderId: ${orderId}`);
      throw Object.assign(new Error("Reason for cancellation is required"), { status: 400 });
    }

    order.status_id = 5; // Canceled status
    await order.save({ transaction });
    console.log(`Order ${orderId} status updated to canceled`);

    await ReasonCancel.create(
      {
        orderId,
        userId,
        reason,
        bankName: bankName || null,
        bankNumber: bankNumber || null,
        certificationRefund: null, // Initially null, updated later
        createdAt: new Date(),
      },
      { transaction }
    );
    console.log(`ReasonCancel created for orderId: ${orderId} with bankName: ${bankName}, bankNumber: ${bankNumber}`);

    await transaction.commit();
    console.log(`Transaction committed for orderId: ${orderId}`);
    return { success: true, message: "Order canceled successfully" };
  } catch (error) {
    if (transaction.finished !== "rollback") {
      console.error(`Rolling back transaction for orderId: ${orderId} due to error: ${error.message}`);
      await transaction.rollback();
    } else {
      console.warn(`Transaction already rolled back for orderId: ${orderId}`);
    }
    throw error;
  }
};

const uploadRefundCertification = async (orderId, userId, file) => {
  const transaction = await sequelize.transaction();
  try {
    console.log(`Starting upload for refund certification for orderId: ${orderId}`);
    const order = await Order.findOne({ where: { orderId }, transaction });
    if (!order) {
      console.log(`Order not found for orderId: ${orderId}`);
      throw Object.assign(new Error("Order not found"), { status: 404 });
    }

    if (order.status_id !== 5) {
      console.log(`Order ${orderId} is not canceled`);
      throw Object.assign(new Error("Order must be canceled to upload refund certification"), { status: 400 });
    }

    if (!file) {
      console.log(`No file provided for orderId: ${orderId}`);
      throw Object.assign(new Error("Refund certification image is required"), { status: 400 });
    }

    const allowedMimes = ["image/jpeg", "image/png"];
    if (!allowedMimes.includes(file.mimetype)) {
      console.log(`Invalid image format for orderId: ${orderId}, Mime: ${file.mimetype}`);
      throw Object.assign(new Error("Invalid image format. Only JPEG and PNG are allowed"), { status: 400 });
    }

    let certificationRefundUrl;
    try {
      certificationRefundUrl = await uploadFileToFirebase(
        file.buffer,
        `refund_cert_${orderId}_${Date.now()}.${file.mimetype.split("/")[1]}`,
        file.mimetype
      );
      console.log(`Image uploaded to Firebase for orderId: ${orderId}, URL: ${certificationRefundUrl}`);
    } catch (uploadError) {
      console.error(`Failed to upload image for orderId: ${orderId}`, uploadError.message);
      throw Object.assign(new Error("Failed to upload certification image"), { status: 500 });
    }

    const reasonCancel = await ReasonCancel.findOne({ where: { orderId }, transaction });
    if (!reasonCancel) {
      console.log(`ReasonCancel not found for orderId: ${orderId}`);
      throw Object.assign(new Error("ReasonCancel not found"), { status: 404 });
    }

    reasonCancel.certificationRefund = certificationRefundUrl;
    await reasonCancel.save({ transaction });
    console.log(`ReasonCancel updated with certificationRefund for orderId: ${orderId}`);

    await transaction.commit();
    console.log(`Transaction committed for orderId: ${orderId}`);
    return {
      success: true,
      message: "Refund certification uploaded successfully",
      certificationRefund: certificationRefundUrl,
    };
  } catch (error) {
    if (transaction.finished !== "rollback") {
      console.error(`Rolling back transaction for orderId: ${orderId} due to error: ${error.message}`);
      await transaction.rollback();
    } else {
      console.warn(`Transaction already rolled back for orderId: ${orderId}`);
    }
    throw error;
  }
};

const sendRefundEmail = async (orderId, userId) => {
  try {
    console.log(`Preparing refund email for orderId: ${orderId}`);
    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
      console.log(`Order not found for orderId: ${orderId}`);
      throw new Error("Order not found");
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      console.log(`User not found for userId: ${userId}`);
      throw new Error("User not found");
    }

    const reasonCancel = await ReasonCancel.findOne({ where: { orderId } });
    if (!reasonCancel) {
      console.log(`ReasonCancel not found for orderId: ${orderId}`);
      throw new Error("ReasonCancel not found");
    }

    // Cập nhật isRefund thành true
    await order.update({ isRefund: true });

    const emailTemplatePath = path.join(__dirname, "../templates/refundedEmail.html");
    const emailTemplateSource = await fs.readFile(emailTemplatePath, "utf8");
    const template = handlebars.compile(emailTemplateSource);

    const orderDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const templateData = {
      fullName: user.fullName || "Khách hàng",
      orderId,
      orderAmount: order.order_subtotal.toLocaleString("vi-VN"), // Sửa thành order_subtotal
      orderDate,
      certificationRefund: reasonCancel.certificationRefund || null,
    };

    const htmlContent = template(templateData);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Tấm Tắc" <support@tam tac.vn>',
      to: user.email,
      subject: `Thông báo hoàn tiền đơn hàng #${orderId}`,
      html: htmlContent,
    });

    console.log(`Refund email sent successfully for orderId: ${orderId}`);
    return { success: true, message: "Refund email sent successfully" };
  } catch (error) {
    console.error(`Failed to send refund email for orderId: ${orderId}`, error.message);
    throw error;
  }
};

const getLatestOrder = async (req, res) => {
  console.log("getLatestOrder called at:", new Date().toISOString());
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const userId = req.userId;
  const userRole = req.userRole;

  try {
    // Kiểm tra role User
    if (userRole === "User") {
      console.log("Unauthorized access attempt by User with userId:", userId);
      return res.status(403).send("Users cannot access latest order");
    }

    // Kiểm tra role hợp lệ
    if (!["Staff", "Admin", "Shipper"].includes(userRole)) {
      console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
      return res.status(403).send("Unauthorized: Invalid role");
    }

    // Lấy đơn hàng mới nhất (không giới hạn userId cho Staff, Admin, Shipper)
    const order = await Order.findOne({
      attributes: [
        "orderId",
        "userId",
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
          attributes: ["id", "fullName", "phone_number"],
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
      order: [["order_create_at", "DESC"]], // Sắp xếp theo thời gian tạo mới nhất
    });

    if (!order) {
      console.log("No order found");
      return res.status(404).send("No order found");
    }

    // Định dạng response theo schema Swagger
    const formattedOrder = {
      orderId: order.orderId,
      userId: order.userId,
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
      orderItemsCount: order.OrderItems.length,
      order_shipping_fee: order.order_shipping_fee,
      order_discount_value: order.order_discount_value,
      order_amount: order.order_amount,
      invoiceUrl: order.invoiceUrl,
      order_point_earn: order.order_point_earn,
      note: order.note,
      payment_method: order.PaymentMethod ? order.PaymentMethod.name : null,
    };

    console.log("Returning latest order:", formattedOrder.orderId);
    res.status(200).json(formattedOrder);
  } catch (error) {
    console.error("Error in getLatestOrder:", error.message, error.stack);
    res.status(500).json({ message: "Failed to retrieve latest order", error: error.message });
  }
};

module.exports = {
  createOrder,
  handlePaymentSuccess,
  getUserOrders,
  setOrderToApproved,
  setOrderToPreparing,
  setOrderToCooked,
  setOrderToDelivering,
  setOrderToDelivered,
  getAllOrders,
  getPaidOrders,
  getOrderDetails,
  setOrderToCanceled,
  sendRefundEmail,
  uploadRefundCertification,
  getLatestOrder,
  setOrderToCanceledWhenUserCancel,
};
