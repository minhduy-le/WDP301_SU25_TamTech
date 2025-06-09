/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import { useGetOrders, type OrderHistory } from "../hooks/ordersApi";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const getFormattedPrice = (price: string | number) => {
  const priceStr = typeof price === "number" ? price.toString() : price;
  const integerPart = parseFloat(priceStr.split(".")[0]).toLocaleString();
  return `${integerPart}đ`;
};

const { Option } = Select;

const StaffOrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: orders, isLoading: isOrderLoading } = useGetOrders();

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

      // case "pending":
      //     return { tagBg: "#F9E4B7", tagText: "#A05A2C", iconColor: "#A05A2C" };
      //   case "processing":
      //     return { tagBg: "#FAD2A5", tagText: "#A05A2C", iconColor: "#A05A2C" };
      //   case "completed":
      //     return { tagBg: "#81C784", tagText: "#fff", iconColor: "#fff" };
      //   case "cancelled":
      //     return { tagBg: "#E57373", tagText: "#fff", iconColor: "#fff" };
      //   default:
      //     return { tagBg: "#E9C97B", tagText: "#A05A2C" };
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
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      sorter: (a: OrderHistory, b: OrderHistory) => a.orderId - b.orderId,
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      ellipsis: true,
      sorter: (a: OrderHistory, b: OrderHistory) =>
        a.fullName.localeCompare(b.fullName),
      render: (fullName: string) => (
        <span style={{ fontWeight: 500 }}>{fullName}</span>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "order_create_at",
      key: "order_create_at",
      width: 130,
      sorter: (a: OrderHistory, b: OrderHistory) =>
        dayjs(a.order_create_at).unix() - dayjs(b.order_create_at).unix(),
      render: (order_create_at: string) =>
        dayjs(order_create_at).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "order_amount",
      key: "order_amount",
      width: 120,
      sorter: (a: OrderHistory, b: OrderHistory) =>
        a.order_amount - b.order_amount,
      render: (order_amount: number) => `${getFormattedPrice(order_amount)}`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      align: "center" as const,
      filters: [
        { text: "Chờ thanh toán", value: "Pending" },
        { text: "Đã thanh toán", value: "Paid" },
        { text: "Đang nấu ăn", value: "Repairing" },
        { text: "Đã nấu xong", value: "Cooked" },
        { text: "Đang giao", value: "Delivering" },
        { text: "Đã giao", value: "Delivered" },
        { text: "Đã hủy", value: "Canceled" },
      ],
      onFilter: (value: string, record: OrderHistory) =>
        record.status === value,
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
      width: 220,
      align: "center" as const,
      render: (_: any, record: OrderHistory) => (
        <Space size={12}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsModalVisible(true);
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
          {record.status === "Paid" && (
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
              // onClick={() => handleConfirm(record)}
            >
              Bắt đầu nấu
            </Button>
          )}
          {record.status === "Preparing" && (
            <Button
              type="default"
              danger
              icon={<CloseCircleOutlined />}
              style={{ fontWeight: 600, outline: "none", boxShadow: "none" }}
              // onClick={() => handleReject(record)}
            >
              Hoàn thành nấu
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const filteredOrders = useMemo(
    () =>
      orders?.filter((order) => {
        const matchesSearch =
          order.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          order.orderId.toString().includes(searchText);
        const matchesStatus =
          statusFilter === "all" || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [orders, searchText, statusFilter]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#E0E7FF",
        padding: "20px 30px 30px 60px",
      }}
    >
      <style>{`
        .order-table-staff .ant-table-thead > tr > th,
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .order-table-staff .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
           border-right: none !important;
        }
        .order-table-staff .ant-table-tbody > tr.even-row-order > td {
          background-color: ${evenRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .order-table-staff .ant-table-tbody > tr.odd-row-order > td {
          background-color: ${oddRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .order-table-staff .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .order-table-staff .ant-table-tbody > tr:hover > td {
          background-color: #add4ff !important;
        }
        .order-table-staff .ant-table-tbody > tr.even-row-order > td.ant-table-cell-fix-right,
        .order-table-staff .ant-table-tbody > tr.odd-row-order > td.ant-table-cell-fix-right,
        .order-table-staff .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
        .order-table-staff .ant-table-column-sorters .ant-table-column-sorter {
           color: ${headerColor} !important;
        }
        .order-table-staff .ant-table-filter-column .anticon-filter {
           color: ${headerColor} !important;
        }
        .order-search .ant-input-outlined input::placeholder {
           color: ${cellTextColor} !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#1E40AF",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Đơn hàng
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(30, 64, 175, 0.08)",
            padding: "16px 24px",
            border: `1px solid ${tableBorderColor}`,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Space wrap className="order-search">
              <Input
                placeholder="Tìm theo ID, Tên khách..."
                prefix={<SearchOutlined style={{ color: "#1E40AF" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#3B82F6",
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                allowClear
              />
              <Select
                value={statusFilter}
                style={{ width: 200, borderRadius: 6 }}
                onChange={(value) => setStatusFilter(value)}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Pending">Chờ thanh toán</Option>
                <Option value="Paid">Đã thanh toán</Option>
                <Option value="Repairing">Đang nấu ăn</Option>
                <Option value="Cooked">Đã nấu xong</Option>
                <Option value="Delivering">Đang giao</Option>
                <Option value="Delivered">Đã giao</Option>
                <Option value="Canceled">Đã hủy</Option>
              </Select>
            </Space>
          </div>

          <Table
            className="order-table-staff"
            columns={columns as ColumnType<OrderHistory>[]}
            dataSource={filteredOrders}
            loading={isOrderLoading}
            rowKey="id"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-order" : "odd-row-order"
            }
            scroll={{ x: 980 }}
            sticky
          />
        </Card>

        <Modal
          title={
            <span style={{ color: "#3B82F6", fontWeight: 700, fontSize: 22 }}>
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
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1)}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền" span={2}>
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
                <Descriptions.Item label="Chi tiết sản phẩm" span={2}>
                  <Table
                    className="order-items-table"
                    dataSource={selectedOrder.orderItems}
                    columns={[
                      {
                        title: "Tên sản phẩm",
                        dataIndex: "name",
                        key: "name",
                        render: (text: string) => (
                          <span style={{ color: cellTextColor }}>{text}</span>
                        ),
                      },
                      {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                        align: "center" as const,
                        render: (text: number) => (
                          <span style={{ color: cellTextColor }}>{text}</span>
                        ),
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "price",
                        key: "price",
                        align: "right" as const,
                        render: (price: number) => (
                          <span style={{ color: cellTextColor }}>
                            {getFormattedPrice(price)}
                          </span>
                        ),
                      },
                      {
                        title: "Thành tiền",
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

export default StaffOrderManagement;
