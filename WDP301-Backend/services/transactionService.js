const { Transaction, PaymentMethod } = require("../models/associations");

const getAllTransactions = async (req, res) => {
  try {
    // Truy vấn tất cả giao dịch
    const transactions = await Transaction.findAll({
      // Bao gồm model PaymentMethod để lấy thông tin liên quan
      include: [
        {
          model: PaymentMethod,
          as: "PaymentMethod", // Sử dụng alias đã định nghĩa trong associations
          attributes: ["name"], // Chỉ lấy trường 'name' từ bảng payment_methods
        },
      ],
      // Sắp xếp các giao dịch theo thời gian mới nhất
      order: [["transaction_time", "DESC"]],
    });

    // Định dạng lại kết quả để khớp với yêu cầu API
    const formattedTransactions = transactions.map((tx) => ({
      transactionId: tx.transactionId,
      orderId: tx.orderId,
      payment_method: tx.PaymentMethod ? tx.PaymentMethod.name : null, // Lấy tên từ object lồng nhau
      amount: tx.amount,
      status: tx.status,
      transaction_time: tx.transaction_time,
      type: tx.type,
    }));

    res.status(200).json(formattedTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to retrieve transactions", error: error.message });
  }
};

const setTransactionToPaid = async (req, res) => {
  try {
    const { orderId } = req.params;
    const parsedOrderId = parseInt(orderId, 10);

    // 1. Kiểm tra xem orderId có phải là một số hợp lệ không
    if (isNaN(parsedOrderId)) {
      return res.status(400).json({ message: "Order ID không hợp lệ." });
    }

    // 2. Tìm giao dịch dựa trên orderId
    const transaction = await Transaction.findOne({ where: { orderId: parsedOrderId } });

    // 3. Nếu không tìm thấy, trả về lỗi 404
    if (!transaction) {
      return res.status(404).json({ message: `Không tìm thấy giao dịch cho Order ID: ${parsedOrderId}` });
    }

    // 4. Cập nhật trạng thái và lưu lại
    transaction.status = "PAID";
    await transaction.save();

    // 5. Trả về thông báo thành công cùng với đối tượng giao dịch đã cập nhật
    res.status(200).json({
      message: "Cập nhật trạng thái giao dịch thành PAID thành công.",
      transaction: transaction,
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật trạng thái giao dịch", error: error.message });
  }
};

module.exports = {
  getAllTransactions,
  setTransactionToPaid,
};
