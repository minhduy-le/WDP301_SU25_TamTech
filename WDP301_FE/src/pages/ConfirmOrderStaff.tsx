/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Table, Tag, Space, Button, Card, Modal, Descriptions } from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useGetOrders, type OrderHistory } from "../hooks/ordersApi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const getFormattedPrice = (price: string | number) => {
  const priceStr = typeof price === "number" ? price.toString() : price;
  const integerPart = parseFloat(priceStr.split(".")[0]).toLocaleString();
  return `${integerPart}đ`;
};

const StaffConfirmOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { data: orders, isLoading: isOrderLoading } = useGetOrders();

  // const handleConfirm = (orderToConfirm: Order) => {
  //   Modal.confirm({
  //     title: "Xác nhận đơn hàng",
  //     content: `Bạn có chắc chắn muốn xác nhận đơn hàng #${orderToConfirm.id} của khách ${orderToConfirm.customerName}?`,
  //     okText: "Xác nhận",
  //     cancelText: "Hủy",
  //     okButtonProps: {
  //       style: { background: "#60A5FA", borderColor: "#60A5FA", color: "#fff" },
  //     },
  //     cancelButtonProps: { style: { borderRadius: 6 } },
  //     onOk: () => {
  //       setOrders((prev) =>
  //         prev
  //           .map((order) =>
  //             order.id === orderToConfirm.id
  //               ? { ...order, status: "confirmed" as const }
  //               : order
  //           )
  //           .filter((order) => order.status === "pending")
  //       );
  //       message.success(`Đã xác nhận đơn hàng #${orderToConfirm.id}!`);
  //     },
  //   });
  // };

  // const handleReject = (orderToReject: Order) => {
  //   Modal.confirm({
  //     title: "Từ chối đơn hàng",
  //     content: `Bạn có chắc chắn muốn từ chối đơn hàng #${orderToReject.id} của khách ${orderToReject.customerName}?`,
  //     okText: "Từ chối",
  //     okType: "danger",
  //     cancelText: "Hủy",
  //     okButtonProps: {
  //       style: { background: "#EF4444", borderColor: "#EF4444", color: "#fff" },
  //     },
  //     cancelButtonProps: { style: { borderRadius: 6 } },
  //     onOk: () => {
  //       setOrders((prev) =>
  //         prev
  //           .map((order) =>
  //             order.id === orderToReject.id
  //               ? { ...order, status: "rejected" as const }
  //               : order
  //           )
  //           .filter((order) => order.status === "pending")
  //       );
  //       message.error(`Đã từ chối đơn hàng #${orderToReject.id}!`);
  //     },
  //   });
  // };

  const getStatusTheme = (
    status: string
  ): { tagBg: string; tagText: string; iconColor?: string } => {
    switch (status) {
      case "Pending":
        return { tagBg: "#BFDBFE", tagText: "#1E40AF", iconColor: "#1E40AF" };
      case "Paid":
        return { tagBg: "#93C5FD", tagText: "#1E40AF", iconColor: "#1E40AF" };
      case "Preparing":
        return { tagBg: "#93C5FD", tagText: "#1E40AF", iconColor: "#1E40AF" };
      case "Cooked":
        return { tagBg: "#60A5FA", tagText: "#fff", iconColor: "#fff" };
      case "Delivering":
        return { tagBg: "#93C5FD", tagText: "#1E40AF", iconColor: "#1E40AF" };
      case "Delivered":
        return { tagBg: "#60A5FA", tagText: "#fff", iconColor: "#fff" };
      case "Canceled":
        return { tagBg: "#EF4444", tagText: "#fff", iconColor: "#fff" };
      default:
        return { tagBg: "#E0E7FF", tagText: "#1E40AF" };
    }
  };

  const getStatusIcon = (status: string) => {
    const theme = getStatusTheme(status);
    switch (status) {
      case "Pending":
        return <ClockCircleOutlined style={{ color: theme.iconColor }} />;
      case "Paid":
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

  const headerColor = "#e8f5e9";
  const headerBgColor = "#1E3A8A";
  const evenRowBgColor = "#E0E7FF";
  const oddRowBgColor = "#D1E0FF";
  const cellTextColor = "#1E40AF";
  const borderColor = "#3B82F6";
  const tableBorderColor = "#3B82F6";

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      sorter: (a: OrderHistory, b: OrderHistory) => a.orderId - b.orderId,
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
      ellipsis: true,
      sorter: (a: OrderHistory, b: OrderHistory) =>
        a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Ngày đặt",
      dataIndex: "order_create_at",
      key: "order_create_at",
      width: 180,
      render: (order_create_at: string) =>
        dayjs(order_create_at).format("DD/MM/YYYY HH:mm"),
      sorter: (a: OrderHistory, b: OrderHistory) =>
        dayjs(a.order_create_at).unix() - dayjs(b.order_create_at).unix(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "order_amount",
      key: "order_amount",
      width: 130,
      align: "right" as const,
      render: (order_amount: number) => `${getFormattedPrice(order_amount)}`,
      sorter: (a: OrderHistory, b: OrderHistory) =>
        a.order_amount - b.order_amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center" as const,
      render: (status: OrderHistory["status"]) => {
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
              minWidth: "120px",
              textAlign: "center",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 320,
      align: "center" as const,
      render: (_: any, record: OrderHistory) => (
        <Space size={12}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setModalVisible(true);
            }}
            style={{
              color: "#3B82F6",
              fontWeight: 600,
              padding: 0,
              outline: "none",
              boxShadow: "none",
              border: "none",
            }}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{
              background: "#60A5FA",
              borderColor: "#60A5FA",
              color: "#fff",
              fontWeight: 600,
              outline: "none",
              boxShadow: "none",
              border: "none",
            }}
            disabled={record.status !== "Paid"}
            // onClick={() => handleConfirm(record)}
          >
            Xác nhận
          </Button>
          <Button
            type="default"
            danger
            icon={<CloseCircleOutlined />}
            style={{ fontWeight: 600, outline: "none", boxShadow: "none" }}
            disabled={record.status !== "Pending"}
            // onClick={() => handleReject(record)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#E0E7FF",
        padding: "20px 30px 30px 60px",
      }}
    >
      <style>{`
        .confirm-orders-table-staff .ant-table-thead > tr > th,
        .confirm-orders-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .confirm-orders-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .confirm-orders-table-staff .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .confirm-orders-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
           border-right: none !important;
        }
        .confirm-orders-table-staff .ant-table-tbody > tr.even-row-confirm-order > td {
          background-color: ${evenRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .confirm-orders-table-staff .ant-table-tbody > tr.odd-row-confirm-order > td {
          background-color: ${oddRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .confirm-orders-table-staff .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .confirm-orders-table-staff .ant-table-tbody > tr:hover > td {
          background-color: #93C5FD !important;
        }
        .confirm-orders-table-staff .ant-table-tbody > tr.even-row-confirm-order > td.ant-table-cell-fix-right,
        .confirm-orders-table-staff .ant-table-tbody > tr.odd-row-confirm-order > td.ant-table-cell-fix-right,
        .confirm-orders-table-staff .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
        .confirm-orders-table-staff .ant-table-column-sorters .ant-table-column-sorter {
           color: ${headerColor} !important;
        }
        .confirm-orders-table-staff .ant-table-filter-column .anticon-filter {
           color: ${headerColor} !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            color: "#1E40AF",
            fontWeight: 800,
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Xác nhận đơn hàng
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(30, 64, 175, 0.08)",
            border: `1px solid ${tableBorderColor}`,
            padding: "16px 24px",
          }}
        >
          <Table
            className="confirm-orders-table-staff"
            columns={columns}
            dataSource={orders?.filter((order) => order.status === "Paid")}
            rowKey="id"
            loading={isOrderLoading}
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0
                ? "even-row-confirm-order"
                : "odd-row-confirm-order"
            }
            scroll={{ x: 1000 }}
            sticky
          />
        </Card>
        <Modal
          title={
            <span style={{ color: "#3B82F6", fontWeight: 700, fontSize: 22 }}>
              Chi tiết đơn hàng
            </span>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <Button
              key="close"
              onClick={() => setModalVisible(false)}
              style={{
                borderRadius: 6,
                borderColor: "#3B82F6",
                color: "#3B82F6",
              }}
            >
              Đóng
            </Button>,
          ]}
          width={800}
          styles={{
            body: {
              background: "#E0E7FF",
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid ${tableBorderColor}`,
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
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.08)",
                border: `1px solid ${tableBorderColor}`,
                padding: 16,
              }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#1E40AF",
                  fontWeight: 600,
                  background: "#E0E7FF",
                  width: "160px",
                }}
                contentStyle={{ color: cellTextColor, background: "#FFFFFF" }}
              >
                <Descriptions.Item label="Mã đơn">
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
                <Descriptions.Item label="Tổng tiền">
                  <span
                    style={{
                      color: "#3B82F6",
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}
                  >
                    {getFormattedPrice(selectedOrder.order_amount)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
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
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={2}>
                  <Table
                    className="order-items-table-modal-staff"
                    dataSource={selectedOrder.orderItems}
                    columns={[
                      {
                        title: <span style={{ color: headerColor }}>Tên</span>,
                        dataIndex: "name",
                        key: "name",
                        render: (text: string) => (
                          <span style={{ color: cellTextColor }}>{text}</span>
                        ),
                      },
                      {
                        title: (
                          <span style={{ color: headerColor }}>Số lượng</span>
                        ),
                        dataIndex: "quantity",
                        key: "quantity",
                        align: "center" as const,
                        render: (text: number) => (
                          <span style={{ color: cellTextColor }}>{text}</span>
                        ),
                      },
                      {
                        title: (
                          <span style={{ color: headerColor }}>Đơn giá</span>
                        ),
                        dataIndex: "price",
                        key: "price",
                        align: "right" as const,
                        render: (p: number) => (
                          <span style={{ color: cellTextColor }}>
                            {p.toLocaleString()}đ
                          </span>
                        ),
                      },
                      {
                        title: (
                          <span style={{ color: headerColor }}>Thành tiền</span>
                        ),
                        key: "subtotal",
                        align: "right" as const,
                        render: (
                          _: any,
                          item: { quantity: number; price: number }
                        ) => (
                          <span
                            style={{ color: cellTextColor, fontWeight: 500 }}
                          >
                            {(item.quantity * item.price).toLocaleString()}đ
                          </span>
                        ),
                      },
                    ]}
                    pagination={false}
                    rowKey="orderId"
                    size="small"
                    style={{
                      background: evenRowBgColor,
                      borderRadius: 8,
                      border: `1px solid ${borderColor}`,
                    }}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StaffConfirmOrders;
