import { Row, Col, Card, Button, Typography } from "antd";
import "../style/OrderHistory.css";
import IMAGE from "../assets/login.png";

const { Title, Text } = Typography;

const OrderHistory = () => {
  const orders = [
    {
      id: "1",
      status: "Đặt hàng thành công/Đang chuẩn bị...",
      image: IMAGE,
      address:
        "Nhà văn hóa sinh viên, Khudo thị Đại học Quốc gia TP. Hồ Chí Minh",
      price: "130.000đ (3 món)",
      date: "09/02/2025 14:12",
      actions: ["Đặt tiếp"],
    },
    {
      id: "2",
      status: "Hoàn thành",
      image: IMAGE,
      address:
        "Nhà văn hóa sinh viên, Khudo thị Đại học Quốc gia TP. Hồ Chí Minh",
      price: "130.000đ (3 món)",
      date: "09/02/2025 14:12",
      actions: ["Đánh giá", "Đặt lại"],
    },
    {
      id: "3",
      status: "Đã hủy",
      image: IMAGE,
      address:
        "Nhà văn hóa sinh viên, Khudo thị Đại học Quốc gia TP. Hồ Chí Minh",
      price: "130.000đ (3 món)",
      date: "09/02/2025 14:12",
      actions: ["Đặt lại"],
    },
  ];

  return (
    <div className="order-history-container">
      <Title level={2} className="order-history-title">
        Lịch sử mua hàng
      </Title>
      {orders.map((order) => (
        <Col
          key={order.id}
          xs={24}
          sm={24}
          md={24}
          lg={24}
          style={{ backgroundColor: "transparent" }}
        >
          <Card className="order-card">
            <div className="order-content">
              <Row>
                <div className="order-image">
                  <img alt="order" src={order.image} />
                </div>
                <div className="order-details">
                  <Text
                    className="order-date"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {order.date}
                  </Text>
                  <Text
                    className="order-address"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {order.address}
                  </Text>
                  <Text
                    className="order-price"
                    style={{ fontFamily: "Playfair Display, serif" }}
                  >
                    {order.price}
                  </Text>
                </div>
              </Row>
              <hr className="order-divider" />
              <Row style={{ display: "flex", justifyContent: "space-between" }}>
                <div
                  className="order-status"
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color:
                      order.status === "Hoàn thành"
                        ? "#78A243"
                        : order.status === "Đã hủy"
                        ? "#DA7339"
                        : "#2d1e1a",
                  }}
                >
                  {order.status}
                </div>
                <div className="order-actions">
                  {order.actions.map((action, index) => (
                    <Button
                      key={index}
                      className={
                        action === "Đặt tiếp" || action === "Đặt lại"
                          ? "green-button"
                          : "gray-button"
                      }
                    >
                      {action}
                    </Button>
                  ))}
                </div>
              </Row>
            </div>
          </Card>
        </Col>
      ))}
    </div>
  );
};

export default OrderHistory;
