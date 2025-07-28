import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Input,
  Card,
  Modal,
  Descriptions,
  message,
  Select,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import axios from "axios";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: string;
}

interface Order {
  orderId: number;
  userId: number;
  payment_time: string;
  order_create_at: string;
  order_address: string;
  status: string;
  fullName: string;
  phone_number: string;
  orderItems: OrderItem[];
  order_shipping_fee: string;
  order_discount_value: string;
  order_amount: string;
  invoiceUrl: string;
  order_point_earn: number;
  note: string;
  payment_method: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      message.error("Failed to fetch orders");
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const columns = [
    {
      title: "Mã ĐH",
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      sorter: (a: Order, b: Order) => a.orderId - b.orderId,
    },
    {
      title: "Khách hàng",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
      ellipsis: true,
      sorter: (a: Order, b: Order) => a.fullName.localeCompare(b.fullName),
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "Ngày đặt",
      dataIndex: "order_create_at",
      key: "order_create_at",
      width: 180,
      sorter: (a: Order, b: Order) =>
        dayjs(a.order_create_at).unix() - dayjs(b.order_create_at).unix(),
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "order_amount",
      key: "order_amount",
      width: 150,
      align: "right" as const,
      sorter: (a: Order, b: Order) =>
        parseFloat(a.order_amount) - parseFloat(b.order_amount),
      render: (amount: string) => `${parseFloat(amount).toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      align: "center" as const,
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
      title: "Hành động",
      key: "actions",
      width: 220,
      align: "center" as const,
      render: (_: any, record: Order) => (
        <Space size={12}>
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
          <Button
            type="default"
            icon={<DownloadOutlined />}
            onClick={() => window.open(record.invoiceUrl, "_blank")}
            style={{
              color: "#D97B41",
              borderColor: "#D97B41",
              background: "#FFF9F0",
              fontWeight: 600,
              outline: "none",
              boxShadow: "none",
            }}
          >
            Biên lai
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
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
        background: "#FFF9F0",
        padding: "20px 30px 30px 60px",
      }}
    >
             <style>{`
         /* Table styles */
         .ant-table-thead > tr > th { 
           background-color: ${headerBgColor} !important; 
           color: ${headerColor} !important; 
           font-weight: bold !important; 
           border-right: 1px solid ${borderColor} !important; 
           border-bottom: 2px solid ${tableBorderColor} !important; 
         }
         .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { 
           border-right: none !important; 
         }
         .order-table .ant-table-tbody > tr.even-row-order > td { 
           background-color: ${evenRowBgColor}; 
           color: ${cellTextColor}; 
           border-right: 1px solid ${borderColor}; 
           border-bottom: 1px solid ${borderColor}; 
         }
         .order-table .ant-table-tbody > tr.odd-row-order > td { 
           background-color: ${oddRowBgColor}; 
           color: ${cellTextColor}; 
           border-right: 1px solid ${borderColor}; 
           border-bottom: 1px solid ${borderColor}; 
         }
         .order-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { 
           border-right: none; 
         }
         .order-table .ant-table-tbody > tr:hover > td { 
           background-color: #EFF6FF !important; 
         }
         .order-table .ant-table-cell-fix-right { 
           background: inherit !important; 
         }
         .order-table .ant-table-thead > tr > th.ant-table-cell-fix-right { 
           background-color: ${headerBgColor} !important; 
         }
         
         /* Input and Select styles */
         .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
         .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
         .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
         .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
           border-color: #3B82F6 !important; 
           box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
         }
         
         /* Pagination styles */
         .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { 
           border-color: #3B82F6 !important; 
           color: #3B82F6 !important; 
         }
         
         /* Select styles */
         .ant-select-selector { 
           border-color: #D1D5DB !important; 
         }
         .ant-select-selector:hover { 
           border-color: #3B82F6 !important; 
         }
         
         /* Table sorter styles */
         .ant-table-column-sorter-up.active svg,
         .ant-table-column-sorter-down.active svg {
           color: #3B82F6 !important;
           fill: #3B82F6 !important;
         }
       `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 700,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
            paddingTop: 0,  
            marginTop: 0,
          }}
        >
          Quản lý Đơn hàng <ShoppingOutlined />
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(160, 90, 44, 0.08)",
            padding: "16px 24px",
            border: `1px solid ${tableBorderColor}`,
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
            <Space>
              <Input
                placeholder="Nhập mã đơn hàng, tên khách hàng..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#E9C97B",
                  height: 33,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                allowClear
              />
            </Space>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Chờ thanh toán", value: "Pending" },
                { label: "Đã thanh toán", value: "Paid" },
                { label: "Xác nhận đơn", value: "Approved" },
                { label: "Đang nấu ăn", value: "Preparing" },
                { label: "Đã nấu xong", value: "Cooked" },
                { label: "Đang giao", value: "Delivering" },
                { label: "Đã giao", value: "Delivered" },
                { label: "Đã hủy", value: "Canceled" },
              ]}
            />
          </div>

          <Table
            className="order-table"
            columns={columns as ColumnType<Order>[]}
            dataSource={filteredOrders}
            loading={loading}
            rowKey="orderId"
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
             <span style={{ color: "#1F2937", fontWeight: 700, fontSize: 22 }}>
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
                 borderRadius: 8,
                 borderColor: "#6B7280",
                 color: "#6B7280",
                 background: "#F9FAFB",
               }}
             >
               Đóng
             </Button>,
           ]}
           width={800}
           styles={{
             body: {
               background: "#F8FAFC",
               borderRadius: "0 0 16px 16px",
               padding: "24px",
             },
             header: {
               borderBottom: `1px solid ${borderColor}`,
               paddingTop: 16,
               paddingBottom: 16,
             },
           }}
           style={{ borderRadius: 16, top: 20 }}
         >
          {selectedOrder && (
                         <Card
               style={{
                 background: "#fff",
                 borderRadius: 12,
                 boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                 border: `1px solid ${borderColor}`,
                 padding: 20,
               }}
             >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                                 labelStyle={{
                   color: "#374151",
                   fontWeight: 600,
                   background: "#F9FAFB",
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
                       color: "#059669",
                       fontWeight: "bold",
                       fontSize: "1.1em",
                     }}
                   >
                     {parseFloat(selectedOrder.order_amount).toLocaleString()}đ
                   </span>
                 </Descriptions.Item>
                <Descriptions.Item label="Phí vận chuyển">
                  <span style={{ color: cellTextColor }}>
                    {parseFloat(
                      selectedOrder.order_shipping_fee
                    ).toLocaleString()}
                    đ
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  <span style={{ color: cellTextColor }}>
                    {parseFloat(
                      selectedOrder.order_discount_value
                    ).toLocaleString()}
                    đ
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  <span style={{ color: cellTextColor }}>
                    {selectedOrder.payment_method}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                  <span style={{ color: cellTextColor }}>
                    {selectedOrder.order_address}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <span style={{ color: cellTextColor }}>
                    {selectedOrder.phone_number}
                  </span>
                </Descriptions.Item>
                {selectedOrder.note && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <span style={{ color: cellTextColor }}>
                      {selectedOrder.note}
                    </span>
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
                        render: (price: string) => (
                          <span style={{ color: cellTextColor }}>
                            {parseFloat(price).toLocaleString()}đ
                          </span>
                        ),
                      },
                      {
                        title: "Thành tiền",
                        key: "subtotal",
                        align: "right" as const,
                        render: (_: any, item: OrderItem) => (
                          <span
                            style={{ color: cellTextColor, fontWeight: 500 }}
                          >
                            {(
                              item.quantity * parseFloat(item.price)
                            ).toLocaleString()}
                            đ
                          </span>
                        ),
                      },
                    ]}
                    pagination={false}
                    rowKey="productId"
                    size="small"
                                         style={{
                       background: "#F9FAFB",
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

export default OrderManagement;
