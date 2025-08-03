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
  Pagination,
} from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "../style/OrderHistory.css";
import IMAGE from "../assets/login.png";
import { useState, useEffect } from "react";
import { useGetOrderHistory, type OrderHistory } from "../hooks/ordersApi";
import { useCreateFeedback } from "../hooks/feedbacksApi";
import { useQueries } from "@tanstack/react-query";
import axiosInstance from "../config/axios";
import dayjs from "dayjs";
import { getFormattedPrice } from "../utils/formatPrice";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface FeedbackItem {
  orderId: number;
  productId: number;
  name: string;
  quantity: number;
  price: string;
  rating?: number;
  comment?: string;
}

const statusMap: { [key: string]: string } & {
  Pending: string;
  Paid: string;
  Preparing: string;
  Cooked: string;
  Delivering: string;
  Delivered: string;
  Canceled: string;
} = {
  Pending: "Chờ thanh toán",
  Paid: "Đã thanh toán",
  Preparing: "Đang nấu ăn",
  Cooked: "Đã nấu xong",
  Delivering: "Đang giao",
  Delivered: "Đã giao",
  Canceled: "Đã hủy",
};

const OrderHistorys = () => {
  const navigate = useNavigate();
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

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loadingButtons, setLoadingButtons] = useState<Record<number, boolean>>(
    {}
  );
  const [isLoadingCreateFeedback, setIsLoadingCreateFeedback] = useState(false);
  const [sortedOrderHistory, setSortedOrderHistory] = useState<OrderHistory[]>(
    []
  );

  const { mutate: createFeedback } = useCreateFeedback();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const calculateTotal = (order: OrderHistory) => {
    const itemTotal = order.orderItems.reduce(
      (sum, item) => sum + parseFloat(item.price.toString()) * item.quantity,
      0
    );
    const order_shipping_fee = parseFloat(order.order_shipping_fee.toString());
    return itemTotal + order_shipping_fee - order.order_discount_value;
  };

  const { data: orderHistory, isLoading: isOrderHistoryLoading } =
    useGetOrderHistory();

  const feedbackQueries = useQueries({
    queries: selectedOrder
      ? selectedOrder.orderItems.map((item) => ({
          queryKey: ["feedback", selectedOrder.id, item.productId],
          queryFn: () =>
            axiosInstance
              .get(`feedback/${selectedOrder.id}/${item.productId}`)
              .then((res) => res.data.feedbacks || []),
          enabled: !!selectedOrder,
        }))
      : [],
  });

  useEffect(() => {
    if (
      isOrderHistoryLoading ||
      !orderHistory ||
      !Array.isArray(orderHistory)
    ) {
      setSortedOrderHistory([]);
    } else {
      setSortedOrderHistory(
        [...orderHistory].sort((a, b) =>
          dayjs(b.order_create_at).diff(dayjs(a.order_create_at))
        )
      );
    }
  }, [orderHistory, isOrderHistoryLoading]);

  const showModal = (order: OrderHistory) => {
    const actions = getActionsForStatus(order.status);

    const feedbackItems: FeedbackItem[] = order.orderItems.map((item) => ({
      orderId: order.orderId,
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
    setFeedbacks(feedbackItems);
    setIsLoadingCreateFeedback(false);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!selectedOrder || !feedbacks.length) return;

    const hasValidFeedback = feedbacks.some(
      (item) => (item.rating ?? 0) > 0 || item.comment?.trim()
    );
    if (!hasValidFeedback) {
      message.warning("Vui lòng nhập ít nhất một đánh giá hoặc nhận xét!");
      return;
    }

    setIsLoadingCreateFeedback(true);
    setLoadingButtons((prev) => ({ ...prev, [selectedOrder.id]: true }));

    try {
      const feedbackData = feedbacks
        .filter((item) => (item.rating ?? 0) > 0 || (item.comment ?? "").trim())
        .map((item) => ({
          productId: item.productId,
          comment: item.comment || "",
          rating: item.rating || 0,
        }));

      if (feedbackData.length === 0) {
        message.warning("Không có đánh giá nào để gửi!");
        return;
      }

      await new Promise<void>((resolve, reject) => {
        createFeedback(
          {
            orderId: selectedOrder.id,
            feedbackData,
          },
          {
            onSuccess: () => resolve(),
            onError: (error: any) => {
              message.error(
                `Lỗi khi gửi đánh giá cho đơn hàng ${selectedOrder.id}.`
              );
              console.error(error);
              reject(error);
            },
          }
        );
      });

      message.success(
        `Đánh giá cho đơn hàng ${selectedOrder.id} đã được gửi thành công!`
      );
      setFeedbacks((prev) =>
        prev.map((item) => ({
          ...item,
          rating: 0,
          comment: "",
        }))
      );
    } catch (error) {
      message.error("Một số đánh giá không được gửi. Vui lòng thử lại.");
      console.error("Feedback submission failed:", error);
    } finally {
      setLoadingButtons((prev) => ({ ...prev, [selectedOrder.id]: false }));
      setIsLoadingCreateFeedback(false);
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    if (selectedOrder) {
      setLoadingButtons((prev) => ({ ...prev, [selectedOrder.id]: false }));
    }
    setIsLoadingCreateFeedback(false);
  };

  const handleRatingChange = (index: number, value: number) => {
    console.log("Rating changed:", value, "at index:", index);
    setFeedbacks((prev) => {
      const newFeedbacks = [...prev];
      newFeedbacks[index] = { ...newFeedbacks[index], rating: value };
      return newFeedbacks;
    });
  };

  const handleCommentChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    console.log("Comment changed:", value, "at index:", index);
    setFeedbacks((prev) => {
      const newFeedbacks = [...prev];
      newFeedbacks[index] = { ...newFeedbacks[index], comment: value };
      return newFeedbacks;
    });
  };

  const getActionsForStatus = (status: string) => {
    switch (status) {
      case "Delivered":
        return ["Đánh giá"];
      // case "Canceled":
      //   return ["Đặt lại"];
      // case "Preparing":
      // case "Delivering":
      //   return ["Đặt tiếp"];
      // case "Paid":
      //   return ["Đánh giá"];
      default:
        return [];
    }
  };

  const statusTabs = [
    { text: "Chờ thanh toán", value: "Pending" },
    { text: "Đã thanh toán", value: "Paid" },
    { text: "Đang nấu ăn", value: "Preparing" },
    { text: "Đã nấu xong", value: "Cooked" },
    { text: "Đang giao", value: "Delivering" },
    { text: "Đã giao", value: "Delivered" },
    { text: "Đã hủy", value: "Canceled" },
  ];

  useEffect(() => {
    if (selectedOrder && feedbackQueries.length > 0) {
      const allFeedbacks = feedbackQueries
        .map((query) => query.data || [])
        .flat();
      const updatedFeedbacks = selectedOrder.orderItems.map((item) => {
        const matchingFeedback = allFeedbacks.find(
          (fb: any) => fb.productId === item.productId
        );
        return {
          ...item,
          rating: matchingFeedback?.rating || item.rating || 0,
          comment: matchingFeedback?.comment || item.comment || "",
        };
      });
      setFeedbacks((prev) => {
        if (prev.length === 0 || !prev.some((f) => f.rating || f.comment)) {
          return updatedFeedbacks;
        }
        return prev;
      });
    }
  }, [feedbackQueries, selectedOrder]);

  const paginatedOrders = sortedOrderHistory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="order-history-container">
      <Title level={2} className="order-history-title">
        Lịch sử mua hàng
      </Title>
      <Tabs defaultActiveKey="all" style={{ marginBottom: 16 }} type="card">
        <Tabs.TabPane tab="Tất cả" key="all">
          {isOrderHistoryLoading ? (
            <Skeleton active style={{ padding: "0 34px" }} />
          ) : paginatedOrders.length > 0 ? (
            paginatedOrders.map((order) => {
              const actions = getActionsForStatus(order.status);
              const itemCount = order.orderItems.length;
              const isLoading = loadingButtons[order.orderId] || false;
              const total = calculateTotal(order);

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
                            {getFormattedPrice(total)} ({itemCount} món)
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
                          {statusMap[order.status] || order.status}
                        </div>
                        <div className="order-actions">
                          <Button
                            className="gray-button"
                            onClick={() =>
                              navigate(`/user/order-tracking/${order.orderId}`)
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
                                {isLoading && (
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
            <div
              style={{
                padding: "0 34px",
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              Chưa có lịch sử mua hàng
            </div>
          )}
          {!isOrderHistoryLoading && sortedOrderHistory.length > pageSize && (
            <div
              style={{
                marginTop: "20px",
                padding: "0 24px",
              }}
            >
              <Pagination
                current={currentPage}
                total={sortedOrderHistory.length}
                pageSize={pageSize}
                align="end"
                className="history-pagination"
                onChange={handlePageChange}
                showSizeChanger={false}
              />
            </div>
          )}
        </Tabs.TabPane>

        {statusTabs.map(({ text, value }) => (
          <Tabs.TabPane tab={text} key={value}>
            {isOrderHistoryLoading ? (
              <Skeleton active style={{ padding: "0 34px" }} />
            ) : paginatedOrders.filter((order) => order.status === value)
                .length > 0 ? (
              paginatedOrders
                .filter((order) => order.status === value)
                .map((order) => {
                  const actions = getActionsForStatus(order.status);
                  const itemCount = order.orderItems.length;
                  const isLoading = loadingButtons[order.orderId] || false;
                  const total = calculateTotal(order);

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
                                Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc
                                gia TP. Hồ Chí Minh
                              </Text>
                              <Text
                                className="order-price"
                                style={{ fontFamily: "Montserrat, sans-serif" }}
                              >
                                {getFormattedPrice(total)} ({itemCount} món)
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
                              {statusMap[order.status] || order.status}
                            </div>
                            <div className="order-actions">
                              <Button
                                className="gray-button"
                                onClick={() =>
                                  navigate(
                                    `/user/order-tracking/${order.orderId}`
                                  )
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
                                    {isLoading && (
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
              <div
                style={{
                  padding: "0 34px",
                  fontFamily: "Montserrat, sans-serif",
                }}
              >
                Chưa có lịch sử mua hàng
              </div>
            )}
            {!isOrderHistoryLoading &&
              sortedOrderHistory.filter((order) => order.status === value)
                .length > pageSize && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "0 24px",
                  }}
                >
                  <Pagination
                    current={currentPage}
                    total={
                      sortedOrderHistory.filter(
                        (order) => order.status === value
                      ).length
                    }
                    align="end"
                    className="history-pagination"
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                  />
                </div>
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
            loading={selectedOrder ? loadingButtons[selectedOrder.id] : false}
            disabled={false}
          >
            {isLoadingCreateFeedback && (
              <LoadingOutlined style={{ marginRight: 8, fontSize: 14 }} spin />
            )}
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
          selectedOrder.orderItems.map((item, index) => {
            const feedback = feedbacks[index] || {
              orderId: item.orderId,
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              rating: 0,
              comment: "",
            };
            return (
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
                      value={feedback.rating}
                      onChange={(value) => handleRatingChange(index, value)}
                      style={{ color: "#78A243" }}
                      disabled={false}
                    />
                  </Col>
                  <Col span={17}>
                    <Input
                      placeholder="Nhận xét"
                      value={feedback.comment || ""}
                      onChange={(e) => handleCommentChange(index, e)}
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        width: "100%",
                      }}
                      disabled={false}
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
            );
          })
        ) : (
          <Text>Không có món nào để đánh giá.</Text>
        )}
      </Modal>
    </div>
  );
};

export default OrderHistorys;
