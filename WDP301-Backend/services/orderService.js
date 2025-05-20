const sequelize = require("../config/database");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const PaymentMethod = require("../models/paymentMethod");
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require("vnpay");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const QRCode = require("qrcode"); // Thêm thư viện QRCode
const { uploadFileToFirebase } = require("../config/firebase");

// Initialize VNPay
const vnpay = new VNPay({
  tmnCode: "9TKDVWYK",
  secureSecret: "LH6SD44ECTBWU1PHK3D2YCOI5HLUWGPH",
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
  hashAlgorithm: "SHA512",
  loggerFn: ignoreLogger,
});

const createOrder = async (orderData, orderItems, userId) => {
  const transaction = await sequelize.transaction();

  try {
    // Find the OrderStatus ID for "Pending"
    const OrderStatus = require("../models/orderStatus");
    const pendingStatus = await OrderStatus.findOne({
      where: { status: "Pending" },
      transaction,
    });
    if (!pendingStatus) {
      throw new Error("Pending status not found");
    }

    // Find the PaymentMethod ID based on the provided name
    const paymentMethod = await PaymentMethod.findOne({
      where: { name: orderData.payment_method_name },
      transaction,
    });
    if (!paymentMethod) {
      throw new Error(`Payment method ${orderData.payment_method_name} not found`);
    }

    // Step 1: Calculate the total price of items (price * quantity for all items)
    let itemsTotal = 0;
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      console.log("Product Price:", { productId: item.productId, price: product.price, quantity: item.quantity });
      itemsTotal += Number(product.price) * item.quantity;
    }

    // Step 2: Calculate order_subtotal (itemsTotal + order_shipping_fee, no discount applied)
    const shippingFee = Number(orderData.order_shipping_fee) || 0;
    const orderSubtotal = itemsTotal + shippingFee;

    // Step 3: Calculate order_discount_value and order_discount_percent
    const orderDiscountValue = Number(orderData.order_discount_value) || 0;
    const orderDiscountPercent = orderSubtotal > 0 ? (orderDiscountValue / orderSubtotal) * 100 : 0;

    // Step 4: Calculate order_amount (orderSubtotal - order_discount_value)
    const orderAmount = orderSubtotal - orderDiscountValue;

    // Step 5: Calculate order_point_earn (1 point per 10,000 in order_amount)
    const orderPointEarn = Math.floor(orderAmount / 10000);

    // Create the order with updated values
    const order = await Order.create(
      {
        storeId: orderData.storeId,
        userId: userId, // Use userId from token
        order_amount: orderAmount,
        order_discount_percent: orderDiscountPercent,
        order_discount_value: orderDiscountValue,
        order_point_earn: orderPointEarn,
        order_shipping_fee: shippingFee,
        order_subtotal: orderSubtotal,
        payment_method_id: paymentMethod.paymentMethodId,
        shipped_by: null, // Explicitly set to null
        status_id: pendingStatus.orderStatusId,
        order_create_at: new Date(),
        order_address: orderData.order_address,
      },
      { transaction }
    );

    // Log order details to debug
    console.log("Order Created:", {
      orderId: order.orderId,
      order_amount: order.order_amount,
      order_shipping_fee: order.order_shipping_fee,
      order_subtotal: order.order_subtotal,
      order_discount_percent: order.order_discount_percent,
      order_discount_value: order.order_discount_value,
    });

    // Create order items
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }
      await OrderItem.create(
        {
          orderId: order.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        },
        { transaction }
      );
    }

    // Generate VNPay payment URL
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Payment amount is order_amount (which already includes shipping fee and discount applied)
    const paymentAmount = orderAmount;
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }
    console.log("Payment Request Data:", {
      vnp_Amount: paymentAmount * 100,
      vnp_IpAddr: "127.0.0.1",
      vnp_TxnRef: order.orderId.toString(),
      vnp_OrderInfo: `Payment for order ${order.orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:3000/api/orders/payment-callback",
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    const vnpayResponse = await vnpay.buildPaymentUrl({
      vnp_Amount: paymentAmount * 100,
      vnp_IpAddr: "127.0.0.1",
      vnp_TxnRef: order.orderId.toString(),
      vnp_OrderInfo: `Payment for order ${order.orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:3000/api/orders/payment-callback",
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    await transaction.commit();

    return { order, paymentUrl: vnpayResponse };
  } catch (error) {
    console.error("Transaction Error:", error);
    if (transaction.finished !== "rollback") {
      await transaction.rollback();
    }
    throw error;
  }
};

const handlePaymentCallback = async (query) => {
  console.log("VNPay Callback Query:", query);
  // Manual hash verification based on VNPay documentation
  const vnp_SecureHash = query.vnp_SecureHash;
  if (!vnp_SecureHash) {
    throw new Error("Missing secure hash");
  }

  // Sort query parameters alphabetically (excluding vnp_SecureHash)
  const signData = Object.keys(query)
    .filter((key) => key !== "vnp_SecureHash" && query[key])
    .sort()
    .map((key) => `${key}=${encodeURIComponent(query[key]).replace(/%20/g, "+")}`)
    .join("&");
  const secureSecret = "LH6SD44ECTBWU1PHK3D2YCOI5HLUWGPH";
  const expectedHash = require("crypto").createHmac("sha512", secureSecret).update(signData).digest("hex");

  const isValid = expectedHash === vnp_SecureHash;
  console.log("Hash Verification:", { isValid, expectedHash, receivedHash: vnp_SecureHash, signData });

  if (!isValid) {
    throw new Error("Invalid payment signature");
  }

  const orderId = query.vnp_TxnRef;
  const responseCode = query.vnp_ResponseCode;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (responseCode === "00") {
    // Payment successful
    const OrderStatus = require("../models/orderStatus");
    const paidStatus = await OrderStatus.findOne({ where: { status: "Paid" } });
    if (!paidStatus) {
      throw new Error("Paid status not found");
    }

    // Update order status to Paid
    await order.update({
      status_id: paidStatus.orderStatusId,
      payment_time: new Date(),
    });

    // Generate and upload invoice PDF
    const invoiceUrl = await generateAndUploadInvoice(order);
    console.log("Invoice URL Generated:", invoiceUrl);
    await order.update({ invoiceUrl });
  }

  return { success: responseCode === "00", orderId };
};

const generateAndUploadInvoice = async (order) => {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const fileName = `invoice_order_${order.orderId}.pdf`;
  const filePath = `./temp/${fileName}`;

  // Ensure temp directory exists
  if (!fs.existsSync("./temp")) {
    fs.mkdirSync("./temp");
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  try {
    // Header: Logo và tiêu đề
    doc.fontSize(25).fillColor("#2e86c1").text("INVOICE", 50, 50, { align: "center" }).moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#444444")
      .text("Course Shop", 50, 75, { align: "center" })
      .text("123 Business Road, City", { align: "center" })
      .moveDown(1);

    // Thông tin hóa đơn
    doc
      .fontSize(12)
      .fillColor("#000000")
      .text(`Invoice #: ${order.orderId}`, 50, 110)
      .text(`Date: ${order.order_create_at.toISOString().split("T")[0]}`)
      .text(`Address: ${order.order_address || "No address provided"}`)
      .moveDown(1);

    // Tạo mã QR
    const qrCodeUrl = `https://wdp-301-0fd32c261026.herokuapp.com/api/orders/${order.orderId}`;
    const qrCodePath = `./temp/qr_order_${order.orderId}.png`;
    await QRCode.toFile(qrCodePath, qrCodeUrl, {
      color: { dark: "#000", light: "#FFF" },
      width: 100,
    });

    // Thêm mã QR vào PDF
    doc.image(qrCodePath, 450, 50, { width: 100 });
    doc.fontSize(10).text("Scan to view order details", 450, 155, { align: "center" }).moveDown(2);

    // Bảng sản phẩm
    const tableTop = 200;
    const itemRowHeight = 20;
    const tableHeaders = ["No.", "Item", "Qty", "Unit Price", "Total"];
    const columnWidths = [50, 200, 50, 100, 100];

    // Vẽ header bảng
    doc.fontSize(12).fillColor("#2e86c1").font("Helvetica-Bold");
    tableHeaders.forEach((header, i) => {
      doc.text(header, 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), tableTop, {
        width: columnWidths[i],
        align: "center",
      });
    });

    // Vẽ đường kẻ ngang dưới header
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Fetch order items
    const orderItems = await OrderItem.findAll({
      where: { orderId: order.orderId },
      include: [{ model: Product, as: "Product" }],
    });
    console.log("Order Items:", orderItems);

    // Thêm các dòng sản phẩm vào bảng
    doc.font("Helvetica").fontSize(10).fillColor("#000000");
    orderItems.forEach((item, index) => {
      const y = tableTop + 25 + index * itemRowHeight;
      const row = [
        (index + 1).toString(),
        item.Product?.name || "Unknown Product",
        item.quantity.toString(),
        `${Number(item.price).toLocaleString("vi-VN")} VND`,
        `${(Number(item.price) * item.quantity).toLocaleString("vi-VN")} VND`,
      ];

      console.log("Adding Item to PDF:", {
        index: index + 1,
        name: item.Product?.name,
        quantity: item.quantity,
        price: item.price,
        total: Number(item.price) * item.quantity,
      });

      row.forEach((cell, i) => {
        doc.text(cell, 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
          width: columnWidths[i],
          align: i === 0 || i === 2 ? "center" : "left",
        });
      });

      // Vẽ đường kẻ ngang giữa các dòng
      doc
        .moveTo(50, y + 15)
        .lineTo(550, y + 15)
        .stroke();
    });

    // Tính toán vị trí tổng cộng
    const totalTop = tableTop + 25 + orderItems.length * itemRowHeight + 20;
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Subtotal: ${order.order_subtotal.toLocaleString("vi-VN")} VND`, 350, totalTop)
      .text(`Discount: ${order.order_discount_value.toLocaleString("vi-VN")} VND`, 350, totalTop + 20)
      .text(`Shipping Fee: ${order.order_shipping_fee.toLocaleString("vi-VN")} VND`, 350, totalTop + 40)
      .text(`Total: ${order.order_amount.toLocaleString("vi-VN")} VND`, 350, totalTop + 60);

    // Footer
    doc
      .fontSize(10)
      .fillColor("#444444")
      .text("Thank you for your business!", 50, doc.page.height - 100, { align: "center" })
      .text("Contact: support@courseshop.com | Phone: +84 123 456 789 | Website: courseshop.com", {
        align: "center",
      });

    doc.end();

    // Xóa file QR tạm
    fs.unlinkSync(qrCodePath);
  } catch (error) {
    console.error("Error generating PDF content:", error);
    throw error;
  }

  // Wait for the PDF to finish writing
  await new Promise((resolve) => stream.on("finish", resolve));

  // Upload PDF to Firebase
  const pdfBuffer = fs.readFileSync(filePath);
  if (pdfBuffer.length === 0) {
    console.error("PDF buffer is empty for file:", filePath);
    throw new Error("Failed to generate PDF content");
  }
  const downloadUrl = await uploadFileToFirebase(pdfBuffer, fileName, "application/pdf");
  console.log("PDF Uploaded to:", downloadUrl);
  console.log("PDF Content Length:", pdfBuffer.length);

  // Clean up temp file
  fs.unlinkSync(filePath);

  return downloadUrl;
};

module.exports = { createOrder, handlePaymentCallback };
