/* eslint-disable @typescript-eslint/no-explicit-any */
import { Row, Col, Button, Steps, Divider } from "antd";
import "../style/OrderTracking.css";
import { useEffect } from "react";
import ReactDOMServer from "react-dom/server";
import {
  ShoppingOutlined,
  BookOutlined,
  CarOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const items = [
  {
    title: "Đặt hàng thành công",
  },
  {
    title: "Đang chuẩn bị",
  },
  {
    title: "Đang vận chuyển",
  },
  {
    title: "Hoàn thành",
  },
  {
    title: "Đã hủy",
  },
];

const getStepIndex = (status: string) => {
  switch (status) {
    case "Pending":
      return 0;
    case "Paid":
    case "Preparing":
      return 1;
    case "Cooked":
      return 2;
    case "Delivering":
      return 3;
    case "Delivered":
      return 4;
    case "Canceled":
      return 5;
    default:
      return 0;
  }
};

interface OrderTrackingProps {
  order?: any;
  onBackClick?: () => void;
}

const getFormattedPrice = (price: string) => {
  const integerPart = parseFloat(price.split(".")[0]).toLocaleString();
  return `${integerPart}đ`;
};

const OrderTracking = ({ order, onBackClick }: OrderTrackingProps) => {
  console.log("OrderTracking received order:", order);
  const originalPrice = order?.orderItems
    ? order.orderItems.reduce(
        (sum: number, item: { price: string; quantity: number }) =>
          sum + parseFloat(item.price) * item.quantity,
        0
      )
    : 0;

  const currentStep = order ? getStepIndex(order.status) : 0;

  useEffect(() => {
    const stepIcons = document.querySelectorAll(".ant-steps-item-icon");
    const icons = [
      <ShoppingOutlined key="shop" />,
      <BookOutlined key="prep" />,
      <CarOutlined key="ship" />,
      <BookOutlined key="done" />,
      <DeleteOutlined key="cancel" />,
    ];

    stepIcons.forEach((icon, index) => {
      if (!icon.parentElement?.querySelector(".menu-icon")) {
        const menuIconDiv = document.createElement("div");
        menuIconDiv.className = "menu-icon";
        menuIconDiv.innerHTML = ReactDOMServer.renderToString(icons[index]);
        icon.parentElement?.insertBefore(menuIconDiv, icon);
      } else {
        const existingIcon = icon.parentElement?.querySelector(".menu-icon");
        if (existingIcon && !existingIcon.innerHTML) {
          existingIcon.innerHTML = ReactDOMServer.renderToString(icons[index]);
        }
      }
    });
  }, []);

  if (!order) {
    return <div>Không tìm thấy thông tin đơn hàng.</div>;
  }

  const totalAmount =
    originalPrice +
    parseFloat(order.order_shipping_fee) -
    parseFloat(order.order_discount_value);

  return (
    <div className="order-tracking-container">
      <Row gutter={[16, 16]}>
        <Col span={24} className="content-col">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={onBackClick}
            className="btn-back"
          />
          <div className="order-header">Tra cứu đơn hàng</div>
          <div className="order-details">
            <p className="order-info">
              Mã đơn hàng: {order.orderId}
              <br />
              Thời gian đặt hàng:{" "}
              {dayjs(order.order_create_at).format("HH:mm, DD/MM/YYYY")}
            </p>
            <div className="tracking-timeline">
              <Steps
                current={currentStep}
                labelPlacement="vertical"
                items={items}
              />
            </div>
            <div className="ship-status">
              Tình trạng đơn hàng:{" "}
              <div
                className="ship-status-bold"
                style={{
                  color:
                    order.status === "Paid"
                      ? "#78A243"
                      : order.status === "Canceled"
                      ? "#DA7339"
                      : order.status === "Pending"
                      ? "yellow"
                      : "#2d1e1a",
                }}
              >
                {" "}
                {order.status}
              </div>
            </div>
            <p className="shipping-info">
              <p className="item-title">Thông tin giao hàng</p>
              <br />
              <Row>
                <Col
                  span={12}
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15 }}
                >
                  Tên khách hàng: {order.fullName}
                </Col>
                <Col
                  span={12}
                  style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15 }}
                >
                  Số điện thoại: {order.phone_number}
                </Col>
              </Row>
              <Row
                style={{ fontFamily: "Montserrat, sans-serif", fontSize: 15 }}
              >
                Địa chỉ giao hàng: {order.order_address}
              </Row>
            </p>
            <div className="order-items">
              <p className="item-title">Thông tin đơn hàng</p>
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map(
                  (
                    item: {
                      productId: number;
                      name: string;
                      quantity: number;
                      price: string;
                    },
                    index: number
                  ) => (
                    <div key={index} className="item-row">
                      <Col
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          padding: 0,
                          fontFamily: "Montserrat, sans-serif",
                        }}
                      >
                        <span className="menu-main-item">{item.name}</span>
                      </Col>
                      <span style={{ fontFamily: "Montserrat, sans-serif" }}>
                        <strong style={{ color: "#DA7339" }}>
                          {getFormattedPrice(item.price)}
                        </strong>{" "}
                        x{item.quantity}
                      </span>
                    </div>
                  )
                )
              ) : (
                <div>Không có sản phẩm trong đơn hàng.</div>
              )}
              <Divider
                style={{ border: "1px solid #2d1e1a", margin: "12px 0" }}
              />
              {order.note && (
                <div className="item-row">
                  <span>Ghi chú: {order.note}</span>
                </div>
              )}
              <div className="item-row">
                <span>Giá gốc</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>
                    {originalPrice.toLocaleString()}đ
                  </strong>
                </span>
              </div>
              <div className="item-row">
                <span>Giảm giá</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>
                    {parseFloat(order.order_discount_value).toLocaleString()}đ
                  </strong>
                </span>
              </div>
              <div className="item-row">
                <span>Phí giao hàng</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>
                    {parseFloat(order.order_shipping_fee).toLocaleString()}đ
                  </strong>
                </span>
              </div>
              <div className="item-row total">
                <span>TỔNG CỘNG</span>
                <span>{totalAmount.toLocaleString()}đ</span>
              </div>
            </div>
            <div className="button-group">
              <Button className="view-order">Hủy đơn</Button>
              {/* <Button className="track-order">Theo dõi đơn hàng</Button> */}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OrderTracking;
