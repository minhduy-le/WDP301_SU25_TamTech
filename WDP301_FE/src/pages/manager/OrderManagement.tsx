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
    console.log(orders);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "processing":
        return "processing";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
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
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString()}đ`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsModalVisible(true);
            }}
            style={{
              border: "none",
              color: "#f97316",
              boxShadow: "none",
              outline: "none",
            }}
            className="custom-orange-button"
          >
            Chi tiết
          </Button>

          <Button
            icon={<DownloadOutlined />}
            size="small"
            style={{
              border: "none",
              color: "#f97316",
              boxShadow: "none",
              outline: "none",
            }}
            className="custom-orange-button"
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
    <div style={{ display: "flex" }}>
      <div style={{ width: "100%" }}>
        <h2 style={{ fontSize: "30px", fontWeight: "bold", color: "#f97316" }}>Quản lý đơn hàng</h2>
        <Card>
          <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
            <Input
              placeholder="Search orders..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select
              defaultValue="all"
              style={{ width: 200 }}
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={filteredOrders}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} orders`,
            }}
          />
        </Card>

        <Modal
          title="Order Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Order ID">
                {selectedOrder.id}
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {selectedOrder.customerName}
              </Descriptions.Item>
              <Descriptions.Item label="Order Date">
                {new Date(selectedOrder.orderDate).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  icon={getStatusIcon(selectedOrder.status)}
                  color={getStatusColor(selectedOrder.status)}
                >
                  {selectedOrder.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount" span={2}>
                {selectedOrder.totalAmount.toLocaleString()}đ
              </Descriptions.Item>
              <Descriptions.Item label="Order Items" span={2}>
                <Table
                  dataSource={selectedOrder.items}
                  columns={[
                    {
                      title: "Item",
                      dataIndex: "name",
                      key: "name",
                    },
                    {
                      title: "Quantity",
                      dataIndex: "quantity",
                      key: "quantity",
                    },
                    {
                      title: "Price",
                      dataIndex: "price",
                      key: "price",
                      render: (price: number) => `${price.toLocaleString()}đ`,
                    },
                  ]}
                  pagination={false}
                />
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default OrderManagement;
