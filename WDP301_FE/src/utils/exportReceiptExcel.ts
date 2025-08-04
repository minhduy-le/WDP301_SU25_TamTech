import * as XLSX from "xlsx";
// @ts-ignore
import { saveAs } from "file-saver";

export interface Order {
  orderId: number;
  userId: number;
  payment_time: string;
  order_create_at: string;
  order_address: string;
  status: string;
  fullName: string;
  phone_number: string;
  orderItems: any[]; 
  order_shipping_fee: string;
  order_discount_value: string;
  order_amount: string;
  order_subtotal: string;
  invoiceUrl: string;
  order_point_earn: number;
  note: string;
  payment_method: string;
}

export const exportReceiptToExcel = (order: Order): void => {
  const data = [
    {
      "Mã đơn": order.orderId,
      "Họ tên khách hàng": order.fullName,
      "Số điện thoại": order.phone_number,
      "Địa chỉ giao hàng": order.order_address,
      "Ngày đặt hàng": formatDate(order.order_create_at),
      "Thời gian thanh toán": formatDate(order.payment_time),
      "Phương thức thanh toán": order.payment_method,
      "Trạng thái đơn hàng": order.status,
      "Tổng phụ": formatCurrency(order.order_subtotal),
      "Phí vận chuyển": formatCurrency(order.order_shipping_fee),
      "Giảm giá": formatCurrency(order.order_discount_value),
      "Tổng tiền": formatCurrency(order.order_amount),
      "Điểm thưởng tích lũy": order.order_point_earn,
      "Ghi chú": order.note || "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Biên lai");

  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `bien-lai-${order.orderId}.xlsx`);
};

const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (value: string): string => {
  const number = parseFloat(value);
  return number.toLocaleString("vi-VN") + " ₫";
};
