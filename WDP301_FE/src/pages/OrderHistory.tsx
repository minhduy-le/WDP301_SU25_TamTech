/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Modal,
  Rate,
  Input,
  Tabs,
} from "antd";
import "../style/OrderHistory.css";
import IMAGE from "../assets/login.png";
import { useState } from "react";
import { useGetOrderHistory } from "../hooks/ordersApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface OrderHistoryProps {
  onDetailClick?: (order: any) => void;
}

const getFormattedPrice = (price: string) => {
  const integerPart = parseFloat(price.split(".")[0]).toLocaleString();
  return `${integerPart}đ`;
};

const OrderHistory = ({ onDetailClick }: OrderHistoryProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [, setSelectedOrder] = useState<{
    id: number;
    status: string;
    image: string;
    address: string;
    price: string;
    date: string;
    actions: string[];
  } | null>(null);

  const showModal = (order: {
    id: number;
    status: string;
    image: string;
    address: string;
    price: string;
    date: string;
    actions: string[];
  }) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const { data: orderHistory, isLoading: isOrderHistoryLoading } =
    useGetOrderHistory();

  const getActionsForStatus = (status: string) => {
    switch (status) {
      case "Delivered":
        return ["Đánh giá", "Đặt lại"];
      case "Canceled":
        return ["Đặt lại"];
      case "Preparing":
      case "Delivering":
        return ["Đặt tiếp"];
      default:
        return [];
    }
  };

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

  const statusTabs = [
    "Pending",
    "Paid",
    "Delivering",
    "Delivered",
    "Canceled",
    "Preparing",
  ];

  return (
    <div className="order-history-container">
      <Title level={2} className="order-history-title">
        Lịch sử mua hàng
      </Title>
      <Tabs defaultActiveKey="all" style={{ marginBottom: 16 }}>
        <Tabs.TabPane tab="Tất cả" key="all">
          {isOrderHistoryLoading ? (
            <div>Loading order history...</div>
          ) : orderHistory && orderHistory.length > 0 ? (
            orderHistory.map((order) => {
              const actions = getActionsForStatus(order.status);
              const itemCount = order.orderItems ? order.orderItems.length : 0;
              return (
                <Col
                  key={order.orderId}
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
                          <img alt="order" src={IMAGE} />
                        </div>
                        <div className="order-details">
                          <Text
                            className="order-date"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            {dayjs(order.order_create_at).format(
                              "DD/MM/YYYY HH:mm"
                            )}
                          </Text>
                          <Text
                            className="order-address"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia
                            TP. Hồ Chí Minh
                          </Text>
                          <Text
                            className="order-price"
                            style={{ fontFamily: "Montserrat, sans-serif" }}
                          >
                            {getFormattedPrice(order.order_amount)} ({itemCount}{" "}
                            món)
                          </Text>
                        </div>
                      </Row>
                      <hr className="order-divider" />
                      <Row
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          className="order-status"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
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
                          {order.status}
                        </div>
                        <div className="order-actions">
                          <Button
                            className="gray-button"
                            onClick={() =>
                              onDetailClick && onDetailClick(order)
                            }
                          >
                            Chi tiết
                          </Button>
                          {actions.map((action, index) =>
                            action === "Đánh giá" ? (
                              <Button
                                key={index}
                                className="gray-button"
                                onClick={() =>
                                  showModal({
                                    id: order.orderId,
                                    status: order.status,
                                    image: IMAGE,
                                    address:
                                      "Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh",
                                    price: `${order.order_amount.toLocaleString()}đ`,
                                    date: dayjs(order.order_create_at).format(
                                      "DD/MM/YYYY HH:mm"
                                    ),
                                    actions: actions,
                                  })
                                }
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
              );
            })
          ) : (
            <div>No order history.</div>
          )}
        </Tabs.TabPane>

        {statusTabs.map((status) => (
          <Tabs.TabPane tab={status} key={status}>
            {isOrderHistoryLoading ? (
              <div>Loading order history...</div>
            ) : orderHistory && orderHistory.length > 0 ? (
              orderHistory
                .filter((order) => order.status === status)
                .map((order) => {
                  const actions = getActionsForStatus(order.status);
                  const itemCount = order.orderItems
                    ? order.orderItems.length
                    : 0;
                  return (
                    <Col
                      key={order.orderId}
                      xs={24}
                      sm={24}
                      md={24}
                      lg={24}
                      style={{
                        backgroundColor: "transparent",
                        marginBottom: 16,
                      }}
                    >
                      <Card className="order-card">
                        <div className="order-content">
                          <Row>
                            <div className="order-image">
                              <img alt="order" src={IMAGE} />
                            </div>
                            <div className="order-details">
                              <Text
                                className="order-date"
                                style={{ fontFamily: "Montserrat, sans-serif" }}
                              >
                                {dayjs(order.order_create_at).format(
                                  "DD/MM/YYYY HH:mm"
                                )}
                              </Text>
                              <Text
                                className="order-address"
                                style={{ fontFamily: "Montserrat, sans-serif" }}
                              >
                                Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc
                                gia TP. Hồ Chí Minh
                              </Text>
                              <Text
                                className="order-price"
                                style={{ fontFamily: "Montserrat, sans-serif" }}
                              >
                                {getFormattedPrice(order.order_amount)} (
                                {itemCount} món)
                              </Text>
                            </div>
                          </Row>
                          <hr className="order-divider" />
                          <Row
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div
                              className="order-status"
                              style={{
                                fontFamily: "Montserrat, sans-serif",
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
                              {order.status}
                            </div>
                            <div className="order-actions">
                              <Button
                                className="gray-button"
                                // onClick={() =>
                                //   onDetailClick && onDetailClick(order.orderId)
                                // }
                                onClick={() =>
                                  onDetailClick && onDetailClick(order)
                                }
                              >
                                Chi tiết
                              </Button>
                              {actions.map((action, index) =>
                                action === "Đánh giá" ? (
                                  <Button
                                    key={index}
                                    className="gray-button"
                                    onClick={() =>
                                      showModal({
                                        id: order.orderId,
                                        status: order.status,
                                        image: IMAGE,
                                        address:
                                          "Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh",
                                        price: `${order.order_amount.toLocaleString()}đ`,
                                        date: dayjs(
                                          order.order_create_at
                                        ).format("DD/MM/YYYY HH:mm"),
                                        actions: actions,
                                      })
                                    }
                                  >
                                    {action}
                                  </Button>
                                ) : (
                                  <Button
                                    key={index}
                                    className={
                                      action === "Đặt tiếp" ||
                                      action === "Đặt lại"
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
                  );
                })
            ) : (
              <div>No order history.</div>
            )}
          </Tabs.TabPane>
        ))}
      </Tabs>

      <Modal
        title={
          <Title
            level={4}
            style={{
              fontFamily: "Montserrat, sans-serif",
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
                    fontFamily: "Montserrat, sans-serif",
                    color: "#2d1e1a",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#2d1e1a",
                  }}
                >
                  {item.detail}
                </Text>
                <Text
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    color: "#2d1e1a",
                  }}
                >
                  {item.note}
                </Text>
              </Col>
              <Col span={7} style={{ textAlign: "right" }}>
                <Text
                  style={{
                    fontFamily: "Montserrat, sans-serif",
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
                  fontFamily: "Montserrat, sans-serif",
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
                    fontFamily: "Montserrat, sans-serif",
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
