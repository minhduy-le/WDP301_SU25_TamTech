const PayOS = require("@payos/node");
const {
  Order,
  OrderItem,
  User,
  Product,
  OrderStatus,
  ProductRecipe,
  Material,
  Promotion,
} = require("../models/associations");
const sequelize = require("../config/database");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

console.log("Loading orderServicePosApp.js version 2025-06-17-pos-app-v4");

const payos = new PayOS(
  "1c2c9333-3b87-4c3d-9058-2a47c4731355",
  "f638f7e1-6366-4198-b17b-5c09139f1be3",
  "b4162d82b524a0c54bd674ff0a02ec57983b326fb9a07d0dce4878bbff5f62ce"
);
const YOUR_DOMAIN = "https://wdp301-su25.space";

const createOrderPosApp = async (req, res) => {
  console.log("createOrderPosApp called at:", new Date().toISOString());
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  console.log("Request headers:", JSON.stringify(req.headers, null, 2));

  const createByStaffId = req.userId;
  const userRole = req.userRole;

  if (!["Staff", "Admin"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", createByStaffId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff or Admin can create POS orders");
  }

  if (!req.body || typeof req.body !== "object") {
    console.log("Invalid req.body:", req.body);
    return res.status(400).send("Request body is missing or invalid");
  }

  const { orderItems, order_discount_value, promotion_code, note, phone_number } = req.body;
  const storeId = 1;

  console.log("Destructured parameters:", {
    orderItems,
    phone_number,
    note,
    promotion_code,
    order_discount_value,
    createByStaffId,
  });

  // Input validation
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
  if (!phone_number || typeof phone_number !== "string" || !/^\d{10,12}$/.test(phone_number)) {
    console.log("Invalid phone_number:", phone_number);
    return res.status(400).send("Valid phone number (10-12 digits) is required");
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

  // Check if phone_number exists in User table
  const user = await User.findOne({
    where: { phone_number, isActive: true },
    attributes: ["id"],
  });
  if (!user) {
    console.log("User not found for phone_number:", phone_number);
    return res.status(400).send(`No active user found with phone number ${phone_number}`);
  }
  const userId = user.id;
  console.log("Found user with id:", userId, "for phone_number:", phone_number);

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

  // Start database transaction
  const transaction = await sequelize.transaction();
  console.log("Transaction started");

  try {
    // Validate products and prices
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
      if (productPrice !== itemPrice) {
        console.log(`Price mismatch for productId: ${item.productId}. Expected: ${productPrice}, Got: ${itemPrice}`);
        await transaction.rollback();
        console.log("Transaction rolled back due to price mismatch");
        return res.status(400).send(`Price for product ID ${item.productId} does not match`);
      }
    }

    // Validate and update material quantities
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

    // Calculate order amounts
    const order_amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    console.log("Calculated order_amount:", order_amount);

    const order_discount_percent =
      order_discount_value && order_amount > 0 ? (order_discount_value / order_amount) * 100 : 0;
    console.log("Calculated order_discount_percent:", order_discount_percent);

    const order_subtotal = order_amount; // No shipping fee for POS orders
    console.log("Calculated order_subtotal:", order_subtotal);

    const order_point_earn = Math.floor(order_amount / 10000);
    console.log("Calculated order_point_earn:", order_point_earn);

    // Create order
    console.log("Creating order with data:", {
      storeId,
      userId,
      order_amount,
      order_discount_percent: order_discount_percent.toFixed(2),
      order_discount_value: order_discount_value || 0,
      order_point_earn,
      order_subtotal,
      status_id: 1,
      order_create_at: new Date(),
      note: note || null,
      createByStaffId,
      payment_method_id: 4, // Hardcoded for POS payment
    });

    const order = await Order.create(
      {
        storeId,
        userId,
        order_amount,
        order_discount_percent: order_discount_percent.toFixed(2),
        order_discount_value: order_discount_value || 0,
        order_point_earn,
        order_subtotal,
        payment_method_id: 4,
        status_id: 1, // Pending
        order_create_at: new Date(),
        note: note || null,
        createByStaffId,
      },
      { transaction }
    );

    // Update promotion usage
    if (promotion_code) {
      const promotion = await Promotion.findOne({ where: { code: promotion_code }, transaction });
      promotion.NumberCurrentUses += 1;
      await promotion.save({ transaction });
      console.log(
        `Incremented NumberCurrentUses for promotion code '${promotion_code}' to ${promotion.NumberCurrentUses}`
      );
    }

    // Create order items
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

    // Create PayOS payment link
    const paymentLinkData = {
      orderCode: order.orderId,
      amount: Math.round(order_subtotal - (order_discount_value || 0)),
      description: `Order #${order.orderId}`,
      returnUrl: `${YOUR_DOMAIN}/api/pos/orders/success?orderId=${order.orderId}`,
      cancelUrl: `${YOUR_DOMAIN}/api/pos/orders/cancel?orderId=${order.orderId}`,
    };
    console.log("Creating PayOS payment link with:", JSON.stringify(paymentLinkData, null, 2));

    let paymentLink;
    try {
      paymentLink = await payos.createPaymentLink(paymentLinkData);
      console.log("PayOS payment link created:", paymentLink.checkoutUrl);
    } catch (payosError) {
      console.error("Error in payos.createPaymentLink:", payosError.message);
      await transaction.rollback();
      console.log("Transaction rolled back due to payment link creation failure");
      return res.status(500).send("Failed to create payment link");
    }

    await transaction.commit();
    console.log("Transaction committed successfully");

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
    console.error("Error in createOrderPosApp:", error.message, error.stack);
    await transaction.rollback();
    console.log("Transaction rolled back due to error");
    return res.status(500).send("Failed to create order");
  }
};

const setOrderToPaidPosApp = async (req, res) => {
  console.log("setOrderToPaidPosApp called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("User ID:", req.userId, "User role:", req.userRole);

  const { orderId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  if (!["Staff", "Admin"].includes(userRole)) {
    console.log("Unauthorized access attempt by userId:", userId, "with role:", userRole);
    return res.status(403).send("Unauthorized: Only Staff or Admin can set orders to Paid");
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

    if (order.status_id !== 1) {
      const currentStatus = order.OrderStatus ? order.OrderStatus.status : `status_id: ${order.status_id}`;
      console.log("Invalid status transition for orderId:", parsedOrderId, "Current status:", currentStatus);
      await transaction.rollback();
      return res
        .status(400)
        .send(
          `Invalid status transition: Order is currently ${currentStatus}. It must be Pending to transition to Paid.`
        );
    }

    // Update member points if userId exists
    if (order.userId) {
      const user = await User.findOne({
        where: { id: order.userId },
        attributes: ["id", "member_point"],
        transaction,
      });
      if (!user) {
        console.log("User not found for userId:", order.userId);
        await transaction.rollback();
        return res.status(404).send("User not found");
      }

      const currentMemberPoint = user.member_point || 0;
      const orderPointEarn = order.order_point_earn || 0;
      user.member_point = currentMemberPoint + orderPointEarn;
      console.log(`Updating user ${user.id} member_point to ${user.member_point}`);

      try {
        await user.save({ transaction });
        console.log("User saved successfully");
      } catch (saveError) {
        console.error("Failed to save user:", saveError.message, saveError.stack);
        await transaction.rollback();
        return res.status(500).send("Failed to update user points");
      }
    } else {
      console.log("No userId for orderId:", parsedOrderId, "Skipping member point update");
    }

    order.status_id = 2; // Paid
    order.payment_time = new Date();

    try {
      await order.save({ transaction });
      console.log("Order saved successfully with status_id: 2");
    } catch (saveError) {
      console.error("Failed to save order:", saveError.message, saveError.stack);
      await transaction.rollback();
      return res.status(500).send("Failed to update order status");
    }

    const invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);
    console.log("Invoice generated:", invoiceUrl);

    await transaction.commit();
    console.log("Transaction committed successfully for orderId:", parsedOrderId);

    res.status(200).json({
      message: "Order status updated to Paid",
      orderId: parsedOrderId,
      status: "Paid",
      invoiceUrl,
    });
  } catch (error) {
    console.error("Error in setOrderToPaidPosApp:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to update order status");
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

    // Fetch user info if userId exists, else use default
    let customerName = "Khách lẻ";
    if (order.userId) {
      const user = await User.findOne({
        where: { id: order.userId },
        attributes: ["fullName"],
        transaction,
      });
      customerName = user ? user.fullName || "Khách lẻ" : "Khách lẻ";
    }
    console.log("Customer name for invoice:", customerName);

    const qrCodeUrl = await QRCode.toDataURL(`https://wdp301-su25.space/order/${order.orderId}`);
    console.log("Generated QR code for URL:", qrCodeUrl.slice(0, 50) + "...");

    console.log("Starting PDF generation for orderId:", orderId);
    const doc = new PDFDocument({
      size: [216, 800], // Increased height to accommodate content
      margin: 15,
      info: {
        Title: `Hóa đơn #${order.orderId}`,
        Author: "ABC Company Limited",
        Subject: "Hóa đơn bán hàng",
        Keywords: "hóa đơn, đơn hàng",
      },
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    // Load font for Vietnamese support
    doc.registerFont("NotoSans", "./fonts/NotoSans-Regular.ttf");
    doc.registerFont("NotoSans-Bold", "./fonts/NotoSans-SemiBold.ttf");

    const textColor = "#000000";
    const lineColor = "#000000";
    const lineSpacing = 12;
    const sectionSpacing = 20;

    let currentY = 15;

    // Drawing dashed line helper
    const drawDashedLine = (y, dashLength = 5, gapLength = 5) => {
      doc.lineWidth(1).strokeColor(lineColor);
      for (let x = doc.page.margins.left; x < doc.page.width - doc.page.margins.right; x += dashLength + gapLength) {
        doc
          .moveTo(x, y)
          .lineTo(x + dashLength, y)
          .stroke();
      }
    };

    // Company header
    doc.font("NotoSans-Bold").fontSize(14).fillColor(textColor).text("ABC COMPANY LIMITED", { align: "center" });
    currentY += lineSpacing;
    doc.font("NotoSans").fontSize(10);
    doc.text("123 Đường Kinh Doanh, Quận 1", { align: "center" });
    currentY += lineSpacing;
    doc.text("TP. Hồ Chí Minh", { align: "center" });
    currentY += lineSpacing;
    doc.text("Điện thoại: +84 909 123 456", { align: "center" });
    currentY += sectionSpacing;

    drawDashedLine(currentY);
    currentY += sectionSpacing;

    // Invoice title and details
    doc
      .font("NotoSans-Bold")
      .fontSize(12)
      .text(`HÓA ĐƠN #${order.orderId.toString().padStart(6, "0")}`, { align: "center" });
    currentY += lineSpacing;
    doc.font("NotoSans").fontSize(10);
    doc.text(`Ngày: ${new Date(order.order_create_at).toLocaleDateString("vi-VN")}`, 15, currentY, { align: "left" });
    doc.text(
      `Thời gian: ${new Date(order.payment_time || new Date()).toLocaleTimeString("vi-VN")}`,
      doc.page.width / 2,
      currentY,
      { align: "right" }
    );
    currentY += lineSpacing;
    doc.text(`Khách hàng: ${customerName}`, 15, currentY, { align: "left" });
    currentY += sectionSpacing;

    drawDashedLine(currentY);
    currentY += sectionSpacing;

    // Order items table header
    doc.font("NotoSans-Bold").fontSize(10);
    doc.text("Sản phẩm", 15, currentY, { align: "left", width: 100 });
    doc.text("Số lượng", 115, currentY, { align: "center", width: 40 });
    doc.text("Đơn giá", 155, currentY, { align: "right", width: 40 });
    doc.text("Tổng", 195, currentY, { align: "right" });
    currentY += lineSpacing;
    drawDashedLine(currentY);
    currentY += 8;

    // Order items
    doc.font("NotoSans").fontSize(9);
    orderItems.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      const productName =
        item.Product.name.length > 20 ? item.Product.name.substring(0, 17) + "..." : item.Product.name;
      doc.text(productName, 15, currentY, { align: "left", width: 100 });
      doc.text(item.quantity.toString(), 115, currentY, { align: "center", width: 40 });
      doc.text(item.price.toLocaleString("vi-VN"), 155, currentY, { align: "right", width: 40 });
      doc.text(itemTotal.toLocaleString("vi-VN"), 195, currentY, { align: "right" });
      currentY += lineSpacing;
    });

    currentY += 8;
    drawDashedLine(currentY);
    currentY += sectionSpacing;

    // Order note
    if (order.note) {
      doc.font("NotoSans-Bold").fontSize(10).text("Ghi chú:", 15, currentY, { align: "left" });
      currentY += lineSpacing;
      doc.font("NotoSans").fontSize(9).text(order.note, 15, currentY, { align: "left", width: 186 });
      currentY += lineSpacing * 2;
    }

    // Order totals
    doc.font("NotoSans").fontSize(10);
    doc.text(`Tổng phụ: ${order.order_amount.toLocaleString("vi-VN")} VND`, 15, currentY, { align: "right" });
    currentY += lineSpacing;
    if (order.order_discount_value > 0) {
      doc.text(`Giảm giá: -${order.order_discount_value.toLocaleString("vi-VN")} VND`, 15, currentY, {
        align: "right",
      });
      currentY += lineSpacing;
    }
    doc.font("NotoSans-Bold").fontSize(12);
    const totalAmount = order.order_subtotal - (order.order_discount_value || 0);
    doc.text(`Tổng cộng: ${totalAmount.toLocaleString("vi-VN")} VND`, 15, currentY, { align: "right" });
    currentY += sectionSpacing;

    // Payment status
    doc.font("NotoSans").fontSize(10);
    doc.text("Thanh toán: Thanh toán tại quầy", 15, currentY, { align: "left" });
    currentY += lineSpacing;
    doc.text("Trạng thái: ĐÃ THANH TOÁN", 15, currentY, { align: "left" });
    currentY += sectionSpacing;

    drawDashedLine(currentY);
    currentY += sectionSpacing;

    // QR code
    const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
    doc.image(qrImage, (doc.page.width - 100) / 2, currentY, { width: 100, align: "center" });
    currentY += 110;
    doc.font("NotoSans").fontSize(8).text("Quét mã để xem chi tiết đơn hàng", { align: "center" });
    currentY += sectionSpacing;

    drawDashedLine(currentY);
    currentY += sectionSpacing;

    // Footer
    doc.font("NotoSans").fontSize(10);
    doc.text("Cảm ơn bạn đã mua sắm cùng chúng tôi!", { align: "center" });
    currentY += lineSpacing;
    doc.fontSize(8).text(`Được tạo vào ${new Date().toLocaleString("vi-VN")}`, { align: "center" });
    currentY += lineSpacing;

    doc.page.height = currentY + doc.page.margins.bottom;

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

module.exports = {
  createOrderPosApp,
  setOrderToPaidPosApp,
};
