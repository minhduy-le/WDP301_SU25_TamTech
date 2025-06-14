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
} = require("../models/associations");
const sequelize = require("../config/database");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");

console.log("Loading orderService.js version 2025-05-28-frontend-redirect-v2");

const payos = new PayOS(
  "1c2c9333-3b87-4c3d-9058-2a47c4731355",
  "f638f7e1-6366-4198-b17b-5c09139f1be3",
  "b4162d82b524a0c54bd674ff0a02ec57983b326fb9a07d0dce4878bbff5f62ce"
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
  } = req.body;
  const userId = req.userId;
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

  console.log("Starting promotion validation");
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
      returnUrl: `${YOUR_DOMAIN}/api/orders/success?orderId=${order.orderId}&code={code}&status={status}`,
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
      size: [216, 600],
      margin: 10,
      info: {
        Title: `Hóa đơn #${order.orderId}`,
        Author: "ABC Company Limited",
        Subject: "Hóa đơn bán hàng",
        Keywords: "hóa đơn, đơn hàng",
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
    doc.text("123 Đường Kinh Doanh, Quận 1", { align: "center" });
    currentY += lineSpacing;
    doc.text("TP. Hồ Chí Minh", { align: "center" });
    currentY += lineSpacing;
    doc.text("Điện thoại: +84 909 123 456", { align: "center" });
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`HÓA ĐƠN #${order.orderId.toString().padStart(6, "0")}`, { align: "center" });
    currentY += lineSpacing;
    doc.font("Helvetica").fontSize(8);
    doc.text(`Ngày: ${new Date(order.order_create_at).toLocaleDateString("vi-VN")}`, { align: "left" });
    currentY += lineSpacing;
    doc.text(`Thời gian: ${new Date(order.payment_time || new Date()).toLocaleTimeString("vi-VN")}`, { align: "left" });
    currentY += lineSpacing;
    doc.text(`Khách hàng: ${user ? user.fullName || "Khách lẻ" : "Khách lẻ"}`, { align: "left" });
    if (order.isDatHo && order.tenNguoiDatHo && order.soDienThoaiNguoiDatHo) {
      currentY += lineSpacing;
      doc.text(`Đặt hộ: ${order.tenNguoiDatHo} - SĐT: ${order.soDienThoaiNguoiDatHo}`, { align: "left" });
    }
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    doc.font("Helvetica-Bold").fontSize(8).text("Sản phẩm", { align: "left" });
    currentY += lineSpacing;
    doc.font("Helvetica").fontSize(8);
    doc.text("Số lượng x Giá = Tổng", { align: "right" });
    currentY += lineSpacing;

    orderItems.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      doc.text(`${item.Product.name}`, { align: "left" });
      currentY += lineSpacing;
      doc.text(`${item.quantity} x ${item.price.toLocaleString("vi-VN")} = ${itemTotal.toLocaleString("vi-VN")} VND`, {
        align: "right",
      });
      currentY += lineSpacing;
    });

    drawDashedLine(currentY);
    currentY += lineSpacing;

    if (order.note) {
      doc.font("Helvetica-Bold").fontSize(8).text("Ghi chú:", { align: "left" });
      currentY += lineSpacing;
      doc.font("Helvetica").fontSize(8).text(order.note, { align: "left", width: 190 });
      currentY += lineSpacing * 2;
    }

    doc.font("Helvetica").fontSize(8);
    doc.text(`Tổng phụ: ${order.order_amount.toLocaleString("vi-VN")} VND`, { align: "right" });
    currentY += lineSpacing;
    doc.text(`Phí vận chuyển: ${order.order_shipping_fee.toLocaleString("vi-VN")} VND`, { align: "right" });
    currentY += lineSpacing;

    if (order.order_discount_value > 0) {
      doc.text(`Giảm giá: -${order.order_discount_value.toLocaleString("vi-VN")} VND`, { align: "right" });
      currentY += lineSpacing;
    }

    drawDashedLine(currentY);
    currentY += lineSpacing;

    doc.font("Helvetica-Bold").fontSize(10);
    const totalAmount = order.order_subtotal - (order.order_discount_value || 0);
    doc.text(`Tổng cộng: ${totalAmount.toLocaleString("vi-VN")} VND`, { align: "right" });
    currentY += lineSpacing;

    doc.font("Helvetica").fontSize(8);
    doc.text("Thanh toán: Thanh toán trực tuyến", { align: "left" });
    currentY += lineSpacing;
    doc.text("Trạng thái: ĐÃ THANH TOÁN", { align: "left" });
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
    doc.image(qrImage, 58, currentY, { width: 100, align: "center" });
    currentY += 110;
    doc.fontSize(6).text("Quét mã để xem chi tiết đơn hàng", { align: "center" });
    currentY += lineSpacing;

    drawDashedLine(currentY);
    currentY += lineSpacing;

    doc.font("Helvetica").fontSize(8);
    doc.text("Cảm ơn bạn đã mua sắm cùng chúng tôi!", { align: "center" });
    currentY += lineSpacing;
    doc.text(`Được tạo vào ${new Date().toLocaleString("vi-VN")}`, { align: "center" });
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
    return res.redirect(`${FRONTEND_DOMAIN}/api/orders/error?error=missing_order_id`);
  }

  const parsedOrderId = parseInt(orderId, 10);
  if (isNaN(parsedOrderId)) {
    console.log("Invalid orderId format:", orderId);
    return res.redirect(`${FRONTEND_DOMAIN}/api/orders/error?error=invalid_order_id`);
  }

  const transaction = await sequelize.transaction();
  console.log("Transaction started for orderId:", parsedOrderId);

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
      console.log("Transaction rolled back due to order not found");
      return res.redirect(`${FRONTEND_DOMAIN}/api/orders/error?orderId=${parsedOrderId}&error=order_not_found`);
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
        console.log("Generated invoiceUrl:", invoiceUrl || "Failed to generate invoice");
      } else {
        console.log("Invoice already exists for orderId:", parsedOrderId, "URL:", invoiceUrl);
      }
      await transaction.commit();
      console.log("Transaction committed successfully for already processed order");
      return res.redirect(
        `${FRONTEND_DOMAIN}/api/orders/success?orderId=${parsedOrderId}&code=${code || ""}&status=${
          status || ""
        }&invoiceUrl=${encodeURIComponent(invoiceUrl || "")}`
      );
    }

    const user = await User.findOne({
      where: { id: order.userId },
      attributes: ["id", "fullName", "email", "phone_number", "member_point"],
      transaction,
    });
    if (!user) {
      console.log("User not found for userId:", order.userId);
      await transaction.rollback();
      console.log("Transaction rolled back due to user not found");
      return res.redirect(`${FRONTEND_DOMAIN}/api/orders/error?orderId=${parsedOrderId}&error=user_not_found`);
    }

    const isPaymentSuccessful = code === "00" || status === "PAID" || status === "success";
    console.log("Payment success check:", { isPaymentSuccessful, code, status });

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

      await order.save({ transaction });
      console.log("Order saved with updated status and payment_time");

      const invoiceUrl = await generateAndUploadInvoice(order, parsedOrderId, transaction);
      console.log("Generated invoiceUrl:", invoiceUrl || "Failed to generate invoice");

      await transaction.commit();
      console.log("Transaction committed successfully for orderId:", parsedOrderId);
      console.log("Payment processed, redirecting to frontend with invoiceUrl:", invoiceUrl);
      return res.redirect(
        `${FRONTEND_DOMAIN}/api/orders/success?orderId=${parsedOrderId}&code=${code || ""}&status=${
          status || ""
        }&invoiceUrl=${encodeURIComponent(invoiceUrl || "")}`
      );
    } else {
      console.log("Payment failed for orderId:", parsedOrderId, { code, status });
      await transaction.rollback();
      console.log("Transaction rolled back due to payment failure");
      return res.redirect(`${FRONTEND_DOMAIN}/api/orders/error?orderId=${parsedOrderId}&error=payment_failed`);
    }
  } catch (error) {
    console.error("Error in handlePaymentSuccess:", error.message, error.stack);
    await transaction.rollback();
    console.log("Transaction rolled back due to error");
    return res.redirect(`${FRONTEND_DOMAIN}/api/orders/error?orderId=${parsedOrderId}&error=server_error`);
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
        "order_subtotal",
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
      order_subtotal: order.order_subtotal,
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
};
