const { OrderItem, User, Product } = require("../models/associations");
const { uploadFileToFirebase } = require("../config/firebase");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

async function generateInvoice(order, orderId, transaction, isPosReceipt = false) {
  console.log(`generateInvoice called for orderId: ${orderId}, isPosReceipt: ${isPosReceipt}`);
  try {
    const orderItems = await OrderItem.findAll({
      where: { orderId },
      include: [{ model: Product, as: "Product", attributes: ["name"] }],
      attributes: ["quantity", "price"],
      transaction,
    });
    console.log("Fetched order items:", JSON.stringify(orderItems, null, 2));

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

    const doc = new PDFDocument({
      size: isPosReceipt ? [216, 800] : "A4",
      margin: isPosReceipt ? 15 : 50,
      info: {
        Title: `Hóa đơn #${order.orderId}`,
        Author: "Tấm Tắc Shop",
        Subject: "Hóa đơn bán hàng",
        Keywords: "hóa đơn, đơn hàng",
      },
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    doc.registerFont("NotoSans", "./fonts/NotoSans-Regular.ttf");
    doc.registerFont("NotoSans-Bold", "./fonts/NotoSans-SemiBold.ttf");

    const textColor = "#000000";
    const lineColor = isPosReceipt ? "#CCCCCC" : "#E0E0E0";
    const lineSpacing = isPosReceipt ? 10 : 15;
    const sectionSpacing = isPosReceipt ? 15 : 20;

    let currentY = isPosReceipt ? 15 : 45;

    const drawDashedLine = (y, dashLength = isPosReceipt ? 4 : 5, gapLength = isPosReceipt ? 4 : 5) => {
      doc.lineWidth(isPosReceipt ? 0.5 : 1).strokeColor(lineColor);
      for (let x = doc.page.margins.left; x < doc.page.width - doc.page.margins.right; x += dashLength + gapLength) {
        doc
          .moveTo(x, y)
          .lineTo(x + dashLength, y)
          .stroke();
      }
    };

    if (!isPosReceipt) {
      doc
        .image("public/logo.png", 50, 45, { width: 70 })
        .fillColor("#2E7D32")
        .font("NotoSans-Bold")
        .fontSize(24)
        .text("Tấm Tắc Shop", 130, 50)
        .fontSize(10)
        .fillColor("#666666")
        .font("NotoSans-Regular")
        .text("123 Đường Kinh Doanh, Quận 1, TP. Hồ Chí Minh", 50, 80, { align: "left" })
        .text("contact@tamtacshop.com | (08) 1234 5678", 50, 95, { align: "left" })
        .moveDown(2);
    } else {
      doc.font("NotoSans-Bold").fontSize(14).fillColor(textColor).text("TẤM TẮC SHOP", { align: "center" });
      currentY += lineSpacing;
      doc.font("NotoSans").fontSize(9).text("123 Đường Kinh Doanh, Quận 1", { align: "center" });
      currentY += lineSpacing;
      doc.text("TP. Hồ Chí Minh", { align: "center" });
      currentY += lineSpacing;
      doc.text("Điện thoại: +84 909 123 456", { align: "center" });
      currentY += sectionSpacing;
    }

    drawDashedLine(currentY);
    currentY += sectionSpacing;

    if (!isPosReceipt) {
      doc
        .fillColor(textColor)
        .font("NotoSans-Bold")
        .fontSize(30)
        .text("HÓA ĐƠN THANH TOÁN", 50, 140, { align: "center" })
        .moveDown(1);
      const customerInfoTop = 200;
      doc
        .strokeColor(lineColor)
        .lineWidth(1)
        .moveTo(50, customerInfoTop - 15)
        .lineTo(550, customerInfoTop - 15)
        .stroke();
      doc
        .fontSize(12)
        .font("NotoSans-Bold")
        .text("KHÁCH HÀNG:", 50, customerInfoTop)
        .font("NotoSans-Regular")
        .text(customerName, 50, customerInfoTop + 20)
        .text("ĐỊA CHỈ:", 50, customerInfoTop + 50)
        .text(order.order_address || "Chưa cập nhật", 50, customerInfoTop + 70, { width: 250 })
        .text("SỐ ĐIỆN THOẠI:", 50, customerInfoTop + 100)
        .text(order.User?.phone_number || "Chưa có", 50, customerInfoTop + 120)
        .text("MÃ ĐƠN HÀNG:", 300, customerInfoTop)
        .text(`#${order.orderId}`, 300, customerInfoTop + 20)
        .text("NGÀY TẠO:", 300, customerInfoTop + 50)
        .text(new Date(order.order_create_at).toLocaleDateString("vi-VN"), 300, customerInfoTop + 70);
      currentY = 300;
    } else {
      doc
        .font("NotoSans-Bold")
        .fontSize(12)
        .text(`HÓA ĐƠN #${order.orderId.toString().padStart(6, "0")}`, { align: "center" });
      currentY += lineSpacing;
      doc
        .font("NotoSans")
        .fontSize(8)
        .text(`Ngày: ${new Date(order.order_create_at).toLocaleDateString("vi-VN")}`, 15, currentY, { align: "left" })
        .text(
          `Thời gian: ${new Date(order.payment_time || new Date()).toLocaleTimeString("vi-VN")}`,
          doc.page.width - 15,
          currentY,
          { align: "right" }
        );
      currentY += lineSpacing;
      doc.text(`Khách hàng: ${customerName}`, 15, currentY, { align: "left" });
      currentY += lineSpacing;
      doc.text(`Nhân viên: ${createByStaffId}`, 15, currentY, { align: "left" });
      currentY += sectionSpacing;
    }

    drawDashedLine(currentY);
    currentY += sectionSpacing;

    if (!isPosReceipt) {
      doc
        .font("NotoSans-Bold")
        .fontSize(12)
        .text("SẢN PHẨM", 50, currentY)
        .text("SL", 350, currentY, { width: 50, align: "center" })
        .text("ĐƠN GIÁ", 400, currentY, { width: 75, align: "right" })
        .text("THÀNH TIỀN", 475, currentY, { width: 75, align: "right" });
      currentY += 20;
      doc.moveTo(50, currentY).lineTo(550, currentY).lineWidth(1).stroke();
      currentY += 10;
    } else {
      doc
        .font("NotoSans-Bold")
        .fontSize(9)
        .text("SẢN PHẨM", 15, currentY, { align: "left", width: 100 })
        .text("SL", 115, currentY, { align: "center", width: 30 })
        .text("ĐƠN GIÁ", 145, currentY, { align: "right", width: 35 })
        .text("TỔNG", 180, currentY, { align: "right" });
      currentY += lineSpacing;
      drawDashedLine(currentY);
      currentY += 5;
    }

    doc.font(isPosReceipt ? "NotoSans" : "NotoSans-Regular").fontSize(isPosReceipt ? 8 : 10);
    orderItems.forEach((item) => {
      const itemTotal = item.quantity * item.price;
      const productName =
        item.Product.name.length > (isPosReceipt ? 20 : 30)
          ? item.Product.name.substring(0, isPosReceipt ? 17 : 27) + "..."
          : item.Product.name;
      if (!isPosReceipt) {
        doc
          .text(productName, 50, currentY, { width: 300 })
          .text(item.quantity.toString(), 350, currentY, { width: 50, align: "center" })
          .text((item.price / 1000).toLocaleString("vi-VN") + "k VNĐ", 400, currentY, { width: 75, align: "right" })
          .text((itemTotal / 1000).toLocaleString("vi-VN") + "k VNĐ", 475, currentY, { width: 75, align: "right" });
        currentY += 25;
      } else {
        doc
          .text(productName, 15, currentY, { align: "left", width: 100 })
          .text(item.quantity.toString(), 115, currentY, { align: "center", width: 30 })
          .text(item.price.toLocaleString("vi-VN") + " VNĐ", 145, currentY, { align: "right", width: 35 })
          .text(itemTotal.toLocaleString("vi-VN") + " VNĐ", 180, currentY, { align: "right" });
        currentY += lineSpacing;
      }
    });

    if (!isPosReceipt) {
      doc.moveTo(50, currentY).lineTo(550, currentY).lineWidth(0.5).strokeOpacity(0.7).stroke();
      currentY += 20;
    } else {
      currentY += 5;
      drawDashedLine(currentY);
      currentY += sectionSpacing;
    }

    if (!isPosReceipt) {
      const summaryLeft = 350;
      doc
        .font("NotoSans-Regular")
        .fontSize(10)
        .text("Tạm tính:", summaryLeft, currentY, { align: "left" })
        .text((order.order_amount / 1000).toLocaleString("vi-VN") + "k VNĐ", 475, currentY, { align: "right" });
      currentY += 20;
      doc
        .text("Phí vận chuyển:", summaryLeft, currentY, { align: "left" })
        .text((order.order_shipping_fee / 1000).toLocaleString("vi-VN") + "k VNĐ", 475, currentY, { align: "right" });
      currentY += 20;
      doc
        .text("Giảm giá:", summaryLeft, currentY, { align: "left" })
        .text(`-${(order.order_discount_value / 1000).toLocaleString("vi-VN")}k VNĐ`, 475, currentY, {
          align: "right",
        });
      currentY += 45;
      doc
        .moveTo(summaryLeft - 20, currentY)
        .lineTo(550, currentY)
        .lineWidth(1.5)
        .stroke();
      currentY += 10;
      doc
        .font("NotoSans-Bold")
        .fontSize(14)
        .text("Tổng cộng:", summaryLeft, currentY, { align: "left" })
        .text(
          ((order.order_amount + order.order_shipping_fee - order.order_discount_value) / 1000).toLocaleString(
            "vi-VN"
          ) + "k VNĐ",
          475,
          currentY,
          { align: "right" }
        );
      currentY += 50;
    } else {
      if (order.note) {
        doc.font("NotoSans-Bold").fontSize(9).text("GHI CHÚ:", 15, currentY, { align: "left" });
        currentY += lineSpacing;
        doc.font("NotoSans").fontSize(8).text(order.note, 15, currentY, { align: "left", width: 165 });
        currentY += lineSpacing * 2;
      }
      doc
        .font("NotoSans")
        .fontSize(9)
        .text(`Tổng phụ: ${order.order_amount.toLocaleString("vi-VN")} VNĐ`, 15, currentY, { align: "right" });
      currentY += lineSpacing;
      if (order.order_discount_value > 0) {
        doc.text(`Giảm giá: -${order.order_discount_value.toLocaleString("vi-VN")} VNĐ`, 15, currentY, {
          align: "right",
        });
        currentY += lineSpacing;
      }
      doc
        .font("NotoSans-Bold")
        .fontSize(10)
        .text(`Tổng cộng: ${order.order_subtotal.toLocaleString("vi-VN")} VNĐ`, 15, currentY, { align: "right" });
      currentY += sectionSpacing;
    }

    if (!isPosReceipt) {
      doc
        .font("NotoSans-Regular")
        .fontSize(10)
        .fillColor("#666666")
        .text("Cảm ơn bạn đã mua hàng! Liên hệ với chúng tôi nếu có thắc mắc.", 50, 750, {
          align: "center",
          lineBreak: false,
        });
    } else {
      doc.font("NotoSans").fontSize(9).text("Thanh toán: Thanh toán tại quầy", 15, currentY, { align: "left" });
      currentY += lineSpacing;
      doc.text("Trạng thái: ĐÃ THANH TOÁN", 15, currentY, { align: "left" });
      currentY += sectionSpacing;
      drawDashedLine(currentY);
      currentY += sectionSpacing;
      const qrImage = Buffer.from(qrCodeUrl.split(",")[1], "base64");
      doc.image(qrImage, (doc.page.width - 80) / 2, currentY, { width: 80, align: "center" });
      currentY += 90;
      doc.font("NotoSans").fontSize(7).text("Quét mã để xem chi tiết đơn hàng", { align: "center" });
      currentY += sectionSpacing;
      drawDashedLine(currentY);
      currentY += sectionSpacing;
      doc.font("NotoSans").fontSize(8).text("Cảm ơn bạn đã mua sắm cùng chúng tôi!", { align: "center" });
      currentY += lineSpacing;
      doc.fontSize(7).text(`Được tạo vào ${new Date().toLocaleString("vi-VN")}`, { align: "center" });
    }

    doc.page.height = currentY + doc.page.margins.bottom;
    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });
    console.log("PDF buffer size:", pdfBuffer.length);

    const invoiceUrl = await uploadFileToFirebase(pdfBuffer, `receipt_${orderId}.pdf`, "application/pdf");
    console.log("Firebase upload successful, invoiceUrl:", invoiceUrl);

    order.invoiceUrl = invoiceUrl;
    await order.save({ transaction });
    console.log("Order updated with invoiceUrl for orderId:", orderId, invoiceUrl);

    return invoiceUrl;
  } catch (error) {
    console.error("Error in generateInvoice for orderId:", orderId, error.message, error.stack);
    throw error;
  }
}

module.exports = { generateInvoice };
