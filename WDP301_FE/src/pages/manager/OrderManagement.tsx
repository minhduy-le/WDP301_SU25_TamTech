import React, { useState, useEffect } from "react";
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
  DownloadOutlined,
} from "@ant-design/icons";
const { Option } = Select;

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: OrderItem[];
}

const fakeData: Order[] = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    orderDate: "2025-05-20T10:30:00Z",
    totalAmount: 1500000,
    status: "pending",
    items: [
      { id: 1, name: "Sản phẩm 1", quantity: 2, price: 500000 },
      { id: 2, name: "Sản phẩm 2", quantity: 1, price: 500000 },
    ],
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    orderDate: "2025-05-21T15:00:00Z",
    totalAmount: 2300000,
    status: "completed",
    items: [
      { id: 3, name: "Sản phẩm 3", quantity: 1, price: 1000000 },
      { id: 4, name: "Sản phẩm 4", quantity: 2, price: 650000 },
    ],
  },
];

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    setOrders(fakeData);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#F9E4B7";
      case "processing":
        return "#FAD2A5";
      case "completed":
        return "#D97B41";
      case "cancelled":
        return "#A05A2C";
      default:
        return "#E9C97B";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockCircleOutlined />;
      case "processing":
        return <ClockCircleOutlined />;
      case "completed":
        return <CheckCircleOutlined />;
      case "cancelled":
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const columns = [
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Order ID</span>,
      dataIndex: "id",
      key: "id",
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Customer</span>,
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Order Date</span>,
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Total Amount</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString()}đ`,
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Status</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag
          icon={getStatusIcon(status)}
          color={getStatusColor(status)}
          style={{
            color: status === "pending" || status === "processing" ? "#A05A2C" : "#fff",
            fontWeight: 600,
            background: getStatusColor(status),
            borderRadius: 12,
            padding: "0 12px",
          }}
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Actions</span>,
      key: "actions",
      render: (_: any, record: Order) => (
        <Space size={12}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsModalVisible(true);
            }}
            style={{ color: "#D97B41", fontWeight: 600, padding: 0 }}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            style={{ color: "#D97B41", borderColor: "#D97B41", background: "#fff", boxShadow: "none", outline: "none", fontWeight: 600 }}
          >
            Tải biên lai
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id.toString().includes(searchText);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#FFF3D6"}}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 800, color: "#D97B41", fontSize: 36, marginBottom: 24, textAlign: "left" }}>
          Quản lý đơn hàng
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(217, 123, 65, 0.1)",
            padding: 24,
            border: "1px solid #E9C97B",
            marginBottom: 24,
          }}
        >
          <div style={{ marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Input
              placeholder="Tìm kiếm đơn hàng..."
              prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 250, borderColor: "#E9C97B", background: "#F9E4B7" }}
            />
            <Select
              defaultValue="all"
              style={{ width: 200, borderRadius: 20 }}
              onChange={(value) => setStatusFilter(value)}
              dropdownStyle={{ borderRadius: 12 }}
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="pending">Chờ xử lý</Option>
              <Option value="processing">Đang xử lý</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              style={{ color: "#D97B41", borderColor: "#D97B41", background: "#fff", boxShadow: "none", outline: "none", fontWeight: 600 }}
            >
              Filter + Export to PDF/Excel
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={filteredOrders}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} đơn hàng`,
            }}
            style={{ background: "#fff", borderRadius: 12 }}
            scroll={{ x: 1000 }}
          />
        </Card>

        <Modal
          title={<span style={{ color: "#D97B41", fontWeight: 700, fontSize: 24 }}>Chi tiết đơn hàng</span>}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
          style={{ borderRadius: 16 }}
          bodyStyle={{ background: "#FFF3D6", borderRadius: 16, padding: 24 }}
        >
          {selectedOrder && (
            <Card
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 8px rgba(217, 123, 65, 0.1)",
                border: "1px solid #E9C97B",
                padding: 16,
              }}
            >
              <Descriptions
                bordered
                column={2}
                size="middle"
                style={{ background: "#fff", borderRadius: 12 }}
                labelStyle={{ color: "#A05A2C", fontWeight: 600 }}
                contentStyle={{ color: "#333" }}
              >
                <Descriptions.Item label="Mã đơn hàng">{selectedOrder.id}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.orderDate).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag
                    icon={getStatusIcon(selectedOrder.status)}
                    color={getStatusColor(selectedOrder.status)}
                    style={{
                      color: selectedOrder.status === "pending" || selectedOrder.status === "processing" ? "#A05A2C" : "#fff",
                      fontWeight: 600,
                      background: getStatusColor(selectedOrder.status),
                      borderRadius: 12,
                      padding: "0 12px",
                    }}
                  >
                    {selectedOrder.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền" span={2}>
                  {selectedOrder.totalAmount.toLocaleString()}đ
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={2}>
                  <Table
                    dataSource={selectedOrder.items}
                    columns={[
                      { title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Tên</span>, dataIndex: "name", key: "name" },
                      { title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Số lượng</span>, dataIndex: "quantity", key: "quantity" },
                      { title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Đơn giá</span>, dataIndex: "price", key: "price", render: (price: number) => `${price.toLocaleString()}đ` },
                    ]}
                    pagination={false}
                    rowKey="id"
                    size="middle"
                    style={{ background: "#fff", borderRadius: 8 }}
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