import { useEffect, useState } from "react";
import { Table, Card, Button, Modal, Descriptions, Tag } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const statusMap: { [key: string]: string } = {
  Pending: "Chờ thanh toán",
  Paid: "Đã thanh toán",
  Approved: "Xác nhận đơn",
  Preparing: "Đang nấu ăn",
  Cooked: "Đã nấu xong",
  Delivering: "Đang giao",
  Delivered: "Đã giao",
  Canceled: "Đã hủy",
};

const getStatusTheme = (
  status: string
): { tagBg: string; tagText: string; iconColor?: string } => {
  switch (status) {
    case "Pending":
      return { tagBg: "#FEF3C7", tagText: "#92400E", iconColor: "#92400E" };
    case "Paid":
      return { tagBg: "#D1FAE5", tagText: "#065F46", iconColor: "#065F46" };
    case "Approved":
      return { tagBg: "#DBEAFE", tagText: "#1E40AF", iconColor: "#1E40AF" };
    case "Preparing":
      return { tagBg: "#FEF3C7", tagText: "#92400E", iconColor: "#92400E" };
    case "Cooked":
      return { tagBg: "#FDE68A", tagText: "#92400E", iconColor: "#92400E" };
    case "Delivering":
      return { tagBg: "#E0E7FF", tagText: "#3730A3", iconColor: "#3730A3" };
    case "Delivered":
      return { tagBg: "#D1FAE5", tagText: "#065F46", iconColor: "#065F46" };
    case "Canceled":
      return { tagBg: "#FEE2E2", tagText: "#991B1B", iconColor: "#991B1B" };
    default:
      return { tagBg: "#F3F4F6", tagText: "#374151" };
  }
};

const getStatusIcon = (status: string) => {
  const theme = getStatusTheme(status);
  switch (status) {
    case "Pending":
      return <ClockCircleOutlined style={{ color: theme.iconColor }} />;
    case "Paid":
      return <CheckCircleOutlined style={{ color: theme.iconColor }} />;
    case "Approved":
      return <CheckCircleOutlined style={{ color: theme.iconColor }} />;
    case "Preparing":
      return <ClockCircleOutlined style={{ color: theme.iconColor }} />;
    case "Cooked":
      return <CheckCircleOutlined style={{ color: theme.iconColor }} />;
    case "Delivering":
      return <ClockCircleOutlined style={{ color: theme.iconColor }} />;
    case "Delivered":
      return <CheckCircleOutlined style={{ color: theme.iconColor }} />;
    case "Canceled":
      return <CloseCircleOutlined style={{ color: theme.iconColor }} />;
    default:
      return null;
  }
};

const LatestOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    {
      title: "Mã",
      dataIndex: "orderId",
      key: "orderId",
      render: (id: number) => `${id}`,
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_: any, record: any) =>
        record.orderItems && record.orderItems.length > 0
          ? record.orderItems.map((item: any) => item.name).join(", ")
          : "",
    },
    {
      title: "Số tiền",
      dataIndex: "order_amount",
      key: "order_amount",
      render: (amount: string) => `${parseFloat(amount).toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const theme = getStatusTheme(status);
        return (
          <Tag
            icon={getStatusIcon(status)}
            style={{
              color: theme.tagText,
              fontWeight: 600,
              background: theme.tagBg,
              borderColor: theme.tagBg,
              borderRadius: 12,
              padding: "2px 12px",
              textAlign: "center",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {statusMap[status] ||
              status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Xem chi tiết",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedOrder(record);
            setIsModalVisible(true);
          }}
          style={{
            color: "#D97B41",
            fontWeight: 600,
            padding: 0,
            outline: "none",
            boxShadow: "none",
            border: "none",
          }}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card
      title={
        <span style={{ color: "#8D572A", fontWeight: 700, fontSize: 20 }}>
          Đơn hàng mới nhất
        </span>
      }
      style={{
        borderRadius: 16,
        border: "none",
        marginBottom: 30,
        boxShadow: "0 2px 8px #f0e1d0",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        columns={columns}
        dataSource={orders.slice(0, 5)}
        loading={loading}
        pagination={false}
        rowKey="orderId"
        style={{ borderRadius: 12, overflow: "hidden" }}
        bordered={false}
      />

      <Modal
        title={
          <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
            Chi tiết đơn hàng
          </span>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => setIsModalVisible(false)}
            style={{
              borderRadius: 6,
              borderColor: "#D97B41",
              color: "#D97B41",
              outline: "none",
              border: "#D",
            }}
          >
            Đóng
          </Button>,
        ]}
        width={800}
        styles={{
          body: {
            background: "#FFF9F0",
            borderRadius: "0 0 12px 12px",
            padding: "24px",
          },
          header: {
            borderBottom: `1px solid #E9C97B`,
            paddingTop: 16,
            paddingBottom: 16,
          },
        }}
        style={{ borderRadius: 12, top: 20 }}
      >
        {selectedOrder && (
          <Card
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(217, 123, 65, 0.08)",
              border: `1px solid #E9C97B`,
              padding: 16,
            }}
          >
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              size="default"
              labelStyle={{
                color: "#A05A2C",
                fontWeight: 600,
                background: "#FFF9F0",
                width: "160px",
              }}
              contentStyle={{ color: "#5D4037", background: "#FFFFFF" }}
            >
              <Descriptions.Item label="Mã đơn hàng">
                {selectedOrder.orderId}
              </Descriptions.Item>
              <Descriptions.Item label="Khách hàng">
                {selectedOrder.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">
                {dayjs(selectedOrder.order_create_at).format(
                  "DD/MM/YYYY HH:mm:ss"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {(() => {
                  const theme = getStatusTheme(selectedOrder.status);
                  return (
                    <Tag
                      icon={getStatusIcon(selectedOrder.status)}
                      style={{
                        color: theme.tagText,
                        fontWeight: 600,
                        background: theme.tagBg,
                        borderColor: theme.tagBg,
                        borderRadius: 12,
                        padding: "2px 12px",
                        minWidth: "120px",
                        textAlign: "center",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {statusMap[selectedOrder.status] ||
                        selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                    </Tag>
                  );
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <span
                  style={{
                    color: "#D97B41",
                    fontWeight: "bold",
                    fontSize: "1.1em",
                  }}
                >
                  {parseFloat(selectedOrder.order_amount).toLocaleString()}đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <span>
                  {parseFloat(
                    selectedOrder.order_shipping_fee
                  ).toLocaleString()}
                  đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <span>
                  {parseFloat(
                    selectedOrder.order_discount_value
                  ).toLocaleString()}
                  đ
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                <span>{selectedOrder.payment_method}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">
                <span>{selectedOrder.order_address}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                <span>{selectedOrder.phone_number}</span>
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Ghi chú" span={2}>
                  <span>{selectedOrder.note}</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Chi tiết sản phẩm" span={2}>
                <Table
                  className="order-items-table"
                  dataSource={selectedOrder.orderItems}
                  columns={[
                    {
                      title: "Tên sản phẩm",
                      dataIndex: "name",
                      key: "name",
                      width: "40%",
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                      align: "center" as const,
                      width: "15%",
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "price",
                      key: "price",
                      align: "right" as const,
                      width: "20%",
                      render: (price: string) =>
                        `${parseFloat(price).toLocaleString()}đ`,
                    },
                    {
                      title: "Thành tiền",
                      key: "subtotal",
                      align: "right" as const,
                      width: "25%",
                      render: (_: any, item: any) =>
                        `${(
                          item.quantity * parseFloat(item.price)
                        ).toLocaleString()}đ`,
                    },
                  ]}
                  pagination={false}
                  rowKey="productId"
                  size="small"
                  style={{
                    background: "#FFFDF5",
                    borderRadius: 8,
                    border: "1px solid #F5EAD9",
                    overflow: "hidden",
                  }}
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}
      </Modal>
    </Card>
  );
};

export default LatestOrders;
