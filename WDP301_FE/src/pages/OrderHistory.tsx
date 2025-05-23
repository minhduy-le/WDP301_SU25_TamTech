import { Row, Col, Card, Button, Typography, Modal, Rate, Input } from "antd";
import "../style/OrderHistory.css";
import IMAGE from "../assets/login.png";
import { useState } from "react";

const { Title, Text } = Typography;

const OrderHistory = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [, setSelectedOrder] = useState<{
    id: string;
    status: string;
    image: string;
    address: string;
    price: string;
    date: string;
    actions: string[];
  } | null>(null);

  const showModal = (order: (typeof orders)[0]) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

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

  const feedbackItems = [
    {
      name: "COMBO - SÀ BÌ CHƯỞNG",
      detail: "Canh chua, nước ngọt: Coca cola, cơm thêm",
      price: "134.000đ x1",
      rating: 0,
      comment: "",
    },
    {
      name: "COMBO - SÀ BÌ CHƯỞNG",
      detail: "Canh chua, nước ngọt: Coca cola, cơm thêm, rau chua thêm",
      price: "138.000đ x1",
      rating: 0,
      comment: "",
    },
    {
      name: "CƠM SƯỜN CỌNG",
      detail: "Canh chua",
      note: "Ghi chú: Lấy ít cơm",
      price: "85.000đ x2",
      rating: 0,
      comment: "",
    },
    {
      name: "Chả Trứng Hấp",
      price: "12.000đ x1",
      rating: 0,
      comment: "",
    },
    {
      name: "Coca Cola",
      price: "12.000đ x4",
      rating: 0,
      comment: "",
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
                  {/* {order.actions.map((action, index) => (
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
                  ))} */}
                  {order.actions.map((action, index) =>
                    action === "Đánh giá" ? (
                      <Button
                        key={index}
                        className="gray-button"
                        onClick={() => showModal(order)}
                      >
                        {action}
                      </Button>
                    ) : (
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
                    )
                  )}
                </div>
              </Row>
            </div>
          </Card>
        </Col>
      ))}

      <Modal
        title={
          <Title
            level={4}
            style={{
              fontFamily: "Playfair Display, serif",
              color: "#2d1e1a",
              textAlign: "center",
            }}
          >
            Đánh giá món ăn
          </Title>
        }
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            className="submt-button-feedback"
            onClick={handleOk}
          >
            Gửi đánh giá
          </Button>,
        ]}
        width={700}
        className="modal-feedback"
        style={{
          overflowY: "auto",
          maxHeight: "calc(100vh - 200px)",
          borderRadius: 8,
        }}
      >
        {feedbackItems.map((item, index) => (
          <div key={index} className="feedback-item">
            <Row>
              <Col
                span={17}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Text
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#2d1e1a",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#2d1e1a",
                  }}
                >
                  {item.detail}
                </Text>
                <Text
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#2d1e1a",
                  }}
                >
                  {item.note}
                </Text>
              </Col>
              <Col span={7} style={{ textAlign: "right" }}>
                <Text
                  style={{
                    fontFamily: "Playfair Display, serif",
                    color: "#DA7339",
                  }}
                >
                  {item.price}
                </Text>
              </Col>
            </Row>
            <Col span={24}>
              <Text
                style={{
                  fontFamily: "Playfair Display, serif",
                  color: "#DA7339",
                }}
              >
                Đánh giá món ăn
              </Text>
            </Col>
            <Row style={{ marginTop: "5px", alignItems: "center" }}>
              <Col span={7} style={{ textAlign: "left" }}>
                <Rate
                  value={item.rating}
                  onChange={(value) => console.log(value)}
                  style={{ color: "#78A243" }}
                />
              </Col>
              <Col span={17}>
                <Input
                  placeholder="Nhận xét"
                  value={item.comment}
                  onChange={(e) => console.log(e.target.value)}
                  style={{
                    fontFamily: "Playfair Display, serif",
                    width: "100%",
                    // marginBottom:
                    //   index === feedbackItems.length - 1 ? "20px" : "10px",
                  }}
                />
              </Col>
            </Row>
            {index < feedbackItems.length - 1 && (
              <hr
                style={{
                  border: "0",
                  borderTop: "1px solid #000",
                  margin: "10px 0",
                }}
              />
            )}
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default OrderHistory;
