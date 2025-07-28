import {
  Row,
  Col,
  Button,
  Steps,
  Divider,
  Modal,
  Select,
  Input,
  Form,
  message,
} from "antd";
import "../style/OrderTracking.css";
import { useState } from "react";
import {
  // ShoppingOutlined,
  // BookOutlined,
  // CarOutlined,
  // DeleteOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getFormattedPrice } from "../utils/formatPrice";
import {
  useGetOrderById,
  useGetBank,
  useCancelOrder,
  useCancelOrderSendEmail,
} from "../hooks/ordersApi";
import { useQueryClient } from "@tanstack/react-query";

const { Option } = Select;

const items = [
  {
    title: "Chờ thanh toán",
  },
  {
    title: "Đặt hàng thành công",
  },
  {
    title: "Xác nhận đơn hàng",
  },
  {
    title: "Đang chuẩn bị",
  },
  {
    title: "Đang nấu",
  },
  {
    title: "Đang giao",
  },
  {
    title: "Hoàn thành giao hàng",
  },
  {
    title: "Đã hủy",
  },
];

const getStepIndex = (status: string) => {
  switch (status) {
    case "Pending":
      return 1;
    case "Paid":
      return 2;
    case "Approved":
      return 3;
    case "Preparing":
      return 4;
    case "Cooked":
      return 5;
    case "Delivering":
      return 6;
    case "Delivered":
      return 7;
    case "Canceled":
      return 8;
    default:
      return 0;
  }
};

interface OrderTrackingProps {
  orderId?: number;
  onBackClick?: () => void;
}

// const statusMap: { [key: string]: string } & {
//   Pending: string;
//   Paid: string;
//   Approved: string;
//   Preparing: string;
//   Cooked: string;
//   Delivering: string;
//   Delivered: string;
//   Canceled: string;
// } = {
//   Pending: "Chờ thanh toán",
//   Paid: "Đã thanh toán",
//   Approved: "Xác nhận đơn",
//   Preparing: "Đang nấu ăn",
//   Cooked: "Đã nấu xong",
//   Delivering: "Đang giao",
//   Delivered: "Đã giao",
//   Canceled: "Đã hủy",
// };

const OrderTracking = ({ orderId, onBackClick }: OrderTrackingProps) => {
  const { data: order, isLoading } = useGetOrderById(orderId || 0);
  console.log("OrderTracking received order:", order);
  const originalPrice = order?.orderItems
    ? order.orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )
    : 0;

  const currentStep = order ? getStepIndex(order.status) : 0;
  const queryClient = useQueryClient();

  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Hooks
  const { data: bankData } = useGetBank();
  const cancelOrderMutation = useCancelOrder();
  const sendEmailMutation = useCancelOrderSendEmail();

  // useEffect(() => {
  //   const stepIcons = document.querySelectorAll(".ant-steps-item-icon");
  //   const icons = [
  //     <ShoppingOutlined key="shop" />,
  //     <BookOutlined key="prep" />,
  //     <CarOutlined key="ship" />,
  //     <BookOutlined key="done" />,
  //     <DeleteOutlined key="cancel" />,
  //   ];

  //   stepIcons.forEach((icon, index) => {
  //     if (!icon.parentElement?.querySelector(".menu-icon")) {
  //       const menuIconDiv = document.createElement("div");
  //       menuIconDiv.className = "menu-icon";
  //       menuIconDiv.innerHTML = ReactDOMServer.renderToString(icons[index]);
  //       icon.parentElement?.insertBefore(menuIconDiv, icon);
  //     } else {
  //       const existingIcon = icon.parentElement?.querySelector(".menu-icon");
  //       if (existingIcon && !existingIcon.innerHTML) {
  //         existingIcon.innerHTML = ReactDOMServer.renderToString(icons[index]);
  //       }
  //     }
  //   });
  // }, []);

  if (isLoading) {
    return <div>Đang tải thông tin đơn hàng...</div>;
  }

  if (!order) {
    return <div>Không tìm thấy thông tin đơn hàng.</div>;
  }

  const totalAmount =
    originalPrice + order.order_shipping_fee - order.order_discount_value;

  const handleCancelOrder = () => {
    form
      .validateFields()
      .then((values) => {
        const cancelReason = {
          reason: values.reason,
          bankName: values.bankName,
          bankNumber: values.bankNumber,
        };

        cancelOrderMutation.mutate(
          { orderId: order.orderId, cancelReason },
          {
            onSuccess: () => {
              sendEmailMutation.mutate(
                { orderId: order.orderId },
                {
                  onSuccess: () => {
                    message.success("Hủy đơn thành công và email đã được gửi!");
                    setIsCancelModalVisible(false);
                    form.resetFields();
                    queryClient.invalidateQueries({ queryKey: ["orders"] });
                  },
                  onError: (error) => {
                    message.error("Gửi email thất bại: " + error.message);
                  },
                }
              );
            },
            onError: (error) => {
              message.error("Hủy đơn thất bại: " + error.message);
            },
          }
        );
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

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
              {/* <div className="ship-status">
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
                  {statusMap[order.status] || order.status}
                </div>
              </div> */}
            </p>
            <Row>
              <Col span={12}>
                <div className="tracking-timeline">
                  <Steps
                    current={currentStep}
                    labelPlacement="vertical"
                    direction="vertical"
                    items={items}
                  />
                </div>
              </Col>
              <Col span={12}>
                <p className="shipping-info">
                  <p className="item-title">Thông tin giao hàng</p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 15,
                    }}
                  >
                    <Row
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 15,
                      }}
                    >
                      Tên khách hàng: {order.fullName}
                    </Row>
                    <Row
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 15,
                      }}
                    >
                      Số điện thoại: {order.phone_number}
                    </Row>
                    <Row
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 15,
                      }}
                    >
                      Địa chỉ giao hàng: {order.order_address}
                    </Row>
                  </div>
                </p>
              </Col>
            </Row>
            <div className="order-items">
              <p className="item-title">Thông tin đơn hàng</p>
              {order.orderItems && order.orderItems.length > 0 ? (
                order.orderItems.map(
                  (
                    item: {
                      productId: number;
                      name: string;
                      quantity: number;
                      price: number;
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
                    -{order.order_discount_value.toLocaleString()}đ
                  </strong>
                </span>
              </div>
              <div className="item-row">
                <span>Phí giao hàng</span>
                <span>
                  <strong style={{ color: "#DA7339" }}>
                    {order.order_shipping_fee.toLocaleString()}đ
                  </strong>
                </span>
              </div>
              <div className="item-row total">
                <span>TỔNG CỘNG</span>
                <span>{totalAmount.toLocaleString()}đ</span>
              </div>
            </div>
            <div className="button-group">
              {order.status === "Paid" && (
                <Button
                  className="view-order"
                  onClick={() => setIsCancelModalVisible(true)}
                >
                  Hủy đơn
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Modal
        visible={isCancelModalVisible}
        onOk={handleCancelOrder}
        onCancel={() => {
          setIsCancelModalVisible(false);
          form.resetFields();
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        footer={null}
        className="modal-edit-profile"
      >
        <Form
          form={form}
          name="cancelOrderForm"
          layout="vertical"
          onFinish={handleCancelOrder}
        >
          <div className="edit-title">Hủy đơn hàng</div>
          <Divider
            style={{ borderTop: "1px solid #2D1E1A", margin: "12px 0" }}
          />
          <Form.Item
            name="reason"
            label="Lý do hủy"
            rules={[{ required: true, message: "Vui lòng nhập lý do hủy!" }]}
          >
            <Input placeholder="Nhập lý do hủy" />
          </Form.Item>
          <Form.Item
            name="bankName"
            label="Chọn ngân hàng"
            rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
          >
            <Select placeholder="Chọn ngân hàng">
              {bankData?.data?.map((bank) => (
                <Option key={bank.id} value={bank.name}>
                  {bank.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="bankNumber"
            label="Số tài khoản"
            rules={[
              { required: true, message: "Vui lòng nhập số tài khoản!" },
              {
                pattern: /^\d+$/,
                message: "Số tài khoản phải là số!",
              },
            ]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              onClick={handleCancelOrder}
              className="update-profile-btn"
            >
              Hủy đơn
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderTracking;
