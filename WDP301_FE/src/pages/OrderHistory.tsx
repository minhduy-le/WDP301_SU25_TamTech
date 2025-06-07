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
  message,
  Skeleton,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "../style/OrderHistory.css";
import IMAGE from "../assets/login.png";
import { useState } from "react";
import { useGetOrderHistory, type OrderHistory } from "../hooks/ordersApi";
import { useCreateFeedback } from "../hooks/feedbacksApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface OrderHistoryProps {
  onDetailClick?: (order: OrderHistory) => void;
}

interface FeedbackItem {
  productId: number;
  name: string;
  quantity: number;
  price: string;
  rating: number;
  comment: string;
}

const getFormattedPrice = (price: string | number) => {
  const priceStr = typeof price === "number" ? price.toString() : price;
  const integerPart = parseFloat(priceStr.split(".")[0]).toLocaleString();
  return `${integerPart}đ`;
};

const OrderHistorys = ({ onDetailClick }: OrderHistoryProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<{
    id: number;
    status: string;
    image: string;
    address: string;
    price: string;
    date: string;
    actions: string[];
    orderItems: FeedbackItem[];
  } | null>(null);

  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loadingButtons, setLoadingButtons] = useState<Record<number, boolean>>(
    {}
  );
  const [submittingFeedback, setSubmittingFeedback] = useState<
    Record<number, boolean>
  >({});

  const { mutate: createFeedback } = useCreateFeedback();

  const showModal = (order: OrderHistory) => {
    setLoadingButtons((prev) => ({ ...prev, [order.orderId]: true }));

    const actions = getActionsForStatus(order.status);
    const feedbackItems: FeedbackItem[] = order.orderItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      price: `${getFormattedPrice(item.price)} x${item.quantity}`,
      rating: 0,
      comment: "",
    }));
    setSelectedOrder({
      id: order.orderId,
      status: order.status,
      image: IMAGE,
      address:
        order.order_address ||
        "Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh",
      price: `${getFormattedPrice(order.order_amount)}`,
      date: dayjs(order.order_create_at).format("DD/MM/YYYY HH:mm"),
      actions: actions,
      orderItems: feedbackItems,
    });
    setFeedbackItems(feedbackItems);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!selectedOrder) return;

    const itemsToSubmit = feedbackItems.filter(
      (item) => item.rating > 0 || item.comment.trim()
    );

    if (itemsToSubmit.length === 0) {
      setIsModalVisible(false);
      setFeedbackItems([]);
      setLoadingButtons((prev) => ({ ...prev, [selectedOrder.id]: false }));
      return;
    }

    setSubmittingFeedback((prev) => ({ ...prev, [selectedOrder.id]: true }));

    try {
      const promises = itemsToSubmit.map(
        (item) =>
          new Promise<void>((resolve, reject) => {
            createFeedback(
              {
                productId: item.productId,
                feedbackData: {
                  comment: item.comment,
                  rating: item.rating,
                },
              },
              {
                onSuccess: () => {
                  message.success(`Đánh giá cho ${item.name} đã được gửi!`);
                  resolve();
                },
                onError: (error: any) => {
                  message.error(
                    `Đã xảy ra lỗi khi gửi đánh giá cho ${item.name}.`
                  );
                  console.error(error);
                  reject(error);
                },
              }
            );
          })
      );

      await Promise.all(promises);

      setIsModalVisible(false);
      setFeedbackItems([]);
      setLoadingButtons((prev) => ({ ...prev, [selectedOrder.id]: false }));
      setSubmittingFeedback((prev) => ({ ...prev, [selectedOrder.id]: false }));
    } catch (error) {
      console.error("Feedback submission failed:", error);
      setSubmittingFeedback((prev) => ({ ...prev, [selectedOrder.id]: false }));
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setFeedbackItems([]);
    if (selectedOrder) {
      setLoadingButtons((prev) => ({ ...prev, [selectedOrder.id]: false }));
      setSubmittingFeedback((prev) => ({ ...prev, [selectedOrder.id]: false }));
    }
  };

  const handleRatingChange = (index: number, value: number) => {
    setFeedbackItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, rating: value } : item))
    );
  };

  const handleCommentChange = (index: number, value: string) => {
    setFeedbackItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, comment: value } : item))
    );
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
      <Tabs defaultActiveKey="all" style={{ marginBottom: 16 }} type="card">
        <Tabs.TabPane tab="Tất cả" key="all">
          {isOrderHistoryLoading ? (
            <Skeleton active style={{ padding: "0 34px" }} />
          ) : orderHistory && orderHistory.length > 0 ? (
            orderHistory.map((order) => {
              const actions = getActionsForStatus(order.status);
              const itemCount = order.orderItems ? order.orderItems.length : 0;
              const isLoading = loadingButtons[order.orderId] || false;
              const isSubmitting = submittingFeedback[order.orderId] || false;
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
                                onClick={() => showModal(order)}
                                disabled={isLoading}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {action}
                                {isSubmitting && (
                                  <LoadingOutlined
                                    style={{ marginLeft: 8, fontSize: 14 }}
                                    spin
                                  />
                                )}
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
            <div style={{ padding: "0 34px" }}>Chưa có lịch sử mua hàng</div>
          )}
        </Tabs.TabPane>

        {statusTabs.map((status) => (
          <Tabs.TabPane tab={status} key={status}>
            {isOrderHistoryLoading ? (
              <Skeleton active style={{ padding: "0 34px" }} />
            ) : orderHistory && orderHistory.length > 0 ? (
              orderHistory
                .filter((order) => order.status === status)
                .map((order) => {
                  const actions = getActionsForStatus(order.status);
                  const itemCount = order.orderItems
                    ? order.orderItems.length
                    : 0;
                  const isLoading = loadingButtons[order.orderId] || false;
                  const isSubmitting =
                    submittingFeedback[order.orderId] || false;
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
                                    onClick={() => showModal(order)}
                                    disabled={isLoading}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {action}
                                    {isSubmitting && (
                                      <LoadingOutlined
                                        style={{ marginLeft: 8, fontSize: 14 }}
                                        spin
                                      />
                                    )}
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
              backgroundColor: "#EFE6DB",
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
            loading={
              selectedOrder ? submittingFeedback[selectedOrder.id] : false
            }
            disabled={
              selectedOrder ? submittingFeedback[selectedOrder.id] : false
            }
          >
            Gửi đánh giá
          </Button>,
        ]}
        width={700}
        className="modal-feedback"
        style={{
          overflowY: "auto",
          top: 0,
          marginTop: 15,
          marginBottom: 15,
          paddingBottom: 0,
          borderRadius: 8,
        }}
      >
        {selectedOrder && selectedOrder.orderItems.length > 0 ? (
          selectedOrder.orderItems.map((item, index) => (
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
                    defaultValue={item.rating}
                    onChange={(value) => handleRatingChange(index, value)}
                    style={{ color: "#78A243" }}
                    disabled={
                      selectedOrder
                        ? submittingFeedback[selectedOrder.id]
                        : false
                    }
                  />
                </Col>
                <Col span={17}>
                  <Input
                    placeholder="Nhận xét"
                    defaultValue={item.comment}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      width: "100%",
                    }}
                    disabled={
                      selectedOrder
                        ? submittingFeedback[selectedOrder.id]
                        : false
                    }
                  />
                </Col>
              </Row>
              {index < selectedOrder.orderItems.length - 1 && (
                <hr
                  style={{
                    border: "0",
                    borderTop: "1px solid #000",
                    margin: "10px 0",
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <Text>Không có món nào để đánh giá.</Text>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistorys;
