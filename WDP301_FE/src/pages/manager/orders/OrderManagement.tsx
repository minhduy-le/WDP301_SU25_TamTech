import React, { useEffect, useState, useMemo } from "react";
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());


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
  {
    id: 3,
    customerName: "Lê Văn C",
    orderDate: "2025-05-22T09:15:00Z",
    totalAmount: 850000,
    status: "processing",
    items: [{ id: 5, name: "Sản phẩm 5", quantity: 1, price: 850000 }],
  },
  {
    id: 4,
    customerName: "Phạm Thị D",
    orderDate: "2025-05-19T11:00:00Z",
    totalAmount: 1200000,
    status: "cancelled",
    items: [{ id: 6, name: "Sản phẩm 6", quantity: 3, price: 400000 }],
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
    setTimeout(() => {
        setOrders(fakeData);
        setLoading(false);
    }, 500);
  }, []);

  const getStatusTheme = (status: string): { tagBg: string; tagText: string; iconColor?: string } => {
    switch (status) {
      case "pending":
        return { tagBg: "#F9E4B7", tagText: "#A05A2C", iconColor: "#A05A2C" };
      case "processing":
        return { tagBg: "#FAD2A5", tagText: "#A05A2C", iconColor: "#A05A2C" };
      case "completed":
        return { tagBg: "#81C784", tagText: "#fff", iconColor: "#fff" };
      case "cancelled":
        return { tagBg: "#E57373", tagText: "#fff", iconColor: "#fff" };
      default:
        return { tagBg: "#E9C97B", tagText: "#A05A2C" };
    }
  };

  const getStatusIcon = (status: string) => {
    const theme = getStatusTheme(status);
    switch (status) {
      case "pending":
        return <ClockCircleOutlined style={{color: theme.iconColor}} />;
      case "processing":
        return <ClockCircleOutlined style={{color: theme.iconColor}} />;
      case "completed":
        return <CheckCircleOutlined style={{color: theme.iconColor}}/>;
      case "cancelled":
        return <CloseCircleOutlined style={{color: theme.iconColor}}/>;
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
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a: Order, b: Order) => a.id - b.id,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 200,
      ellipsis: true,
      sorter: (a: Order, b: Order) => a.customerName.localeCompare(b.customerName),
      render: (name: string) => <span style={{fontWeight: 500}}>{name}</span>
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 180,
      sorter: (a: Order, b: Order) => dayjs(a.orderDate).unix() - dayjs(b.orderDate).unix(),
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      align: 'right' as const,
      sorter: (a: Order, b: Order) => a.totalAmount - b.totalAmount,
      render: (amount: number) => `${amount.toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 180,
      align: 'center' as const,
      filters: [
        { text: 'Chờ xử lý', value: 'pending' },
        { text: 'Đang xử lý', value: 'processing' },
        { text: 'Hoàn thành', value: 'completed' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value: string | number | boolean, record: Order) => record.status === value,
      render: (status: Order["status"]) => {
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
                minWidth: '120px',
                textAlign: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
                }}
            >
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
        );
      }
    },
    {
      title: "Hành động",
      key: "actions",
      width: 220,
      align: 'center' as const,
      render: (_: any, record: Order) => (
        <Space size={12}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setIsModalVisible(true);
            }}
            style={{ color: "#D97B41", fontWeight: 600, padding: 0, outline: "none", boxShadow: "none", border: "none" }}
          >
            Chi tiết
          </Button>
          <Button
            type="default"
            icon={<DownloadOutlined />}
            style={{ color: "#D97B41", borderColor: "#D97B41", background: "#FFF9F0", fontWeight: 600, outline: "none", boxShadow: "none" }}
          >
            Biên lai
          </Button>
        </Space>
      ),
    },
  ];

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.id.toString().includes(searchText);
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [orders, searchText, statusFilter]);

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0", padding: "20px 30px 30px 60px" }}>
      <style>{`
        .order-table .ant-table-thead > tr > th,
        .order-table .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .order-table .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .order-table .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .order-table .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
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
          background-color: #FDEBC8 !important;
        }
        .order-table .ant-table-tbody > tr.even-row-order > td.ant-table-cell-fix-right,
        .order-table .ant-table-tbody > tr.odd-row-order > td.ant-table-cell-fix-right,
        .order-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 800, color: "#A05A2C", fontSize: 36, marginBottom: 24, textAlign: "left" }}>
          Quản lý Đơn hàng
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
          <div style={{ marginBottom: 24, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", justifyContent: 'space-between' }}>
            <Space wrap>
              <Input
                placeholder="Tìm theo ID, Tên khách..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280, borderRadius: 6, borderColor: "#E9C97B", background: "#FFF9F0" }}
                allowClear
              />
              <Select
                value={statusFilter}
                style={{ width: 200, borderRadius: 6 }}
                onChange={(value) => setStatusFilter(value)}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="pending">Chờ xử lý</Option>
                <Option value="processing">Đang xử lý</Option>
                <Option value="completed">Hoàn thành</Option>
                <Option value="cancelled">Đã hủy</Option>
              </Select>
            </Space>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              style={{ color: "#D97B41", borderColor: "#D97B41", background: "#FFF9F0", fontWeight: 600, borderRadius: 6 }}
            >
              Xuất báo cáo
            </Button>
          </div>

          <Table
            className="order-table"
            columns={columns as ColumnType<Order>[]}
            dataSource={filteredOrders}
            loading={loading}
            rowKey="id"
            style={{ borderRadius: 8, border: `1px solid ${tableBorderColor}`, overflow: 'hidden' }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row-order' : 'odd-row-order')}
            scroll={{ x: 980 }}
            sticky
          />
        </Card>

        <Modal
          title={<span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>Chi tiết đơn hàng</span>}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[<Button key="back" onClick={() => setIsModalVisible(false)} style={{borderRadius: 6, borderColor: "#D97B41", color: "#D97B41"}}>Đóng</Button>]}
          width={800}
          styles={{
            body: { background: "#FFF9F0", borderRadius: "0 0 12px 12px", padding: "24px" },
            header: {borderBottom: `1px solid ${tableBorderColor}`, paddingTop: 16, paddingBottom: 16}
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {selectedOrder && (
            <Card
              style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(217, 123, 65, 0.08)", border: `1px solid ${tableBorderColor}`, padding: 16, }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{ color: "#A05A2C", fontWeight: 600, background: '#FFF9F0', width: '160px' }}
                contentStyle={{ color: cellTextColor, background: '#FFFFFF' }}
              >
                <Descriptions.Item label="Mã đơn hàng">{selectedOrder.id}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.orderDate).format("DD/MM/YYYY HH:mm:ss")}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {(() => {
                      const theme = getStatusTheme(selectedOrder.status);
                      return (
                          <Tag
                              icon={getStatusIcon(selectedOrder.status)}
                              style={{ color: theme.tagText, fontWeight: 600, background: theme.tagBg, borderColor: theme.tagBg, borderRadius: 12, padding: "2px 12px", minWidth: '120px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                              {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                          </Tag>
                      );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền" span={2}>
                  <span style={{color: "#D97B41", fontWeight: 'bold', fontSize: '1.1em'}}>{selectedOrder.totalAmount.toLocaleString()}đ</span>
                </Descriptions.Item>
                <Descriptions.Item label="Chi tiết sản phẩm" span={2}>
                  <Table
                    className="order-items-table"
                    dataSource={selectedOrder.items}
                    columns={[
                      { title: "Tên sản phẩm", dataIndex: "name", key: "name", render: (text: string) => <span style={{color: cellTextColor}}>{text}</span> },
                      { title: "Số lượng", dataIndex: "quantity", key: "quantity", align: 'center' as const, render: (text: number) => <span style={{color: cellTextColor}}>{text}</span> },
                      { title: "Đơn giá", dataIndex: "price", key: "price", align: 'right' as const, render: (price: number) => <span style={{color: cellTextColor}}>{price.toLocaleString()}đ</span> },
                      { title: "Thành tiền", key: "subtotal", align: 'right' as const, render: (_:any, item: OrderItem) => <span style={{color: cellTextColor, fontWeight: 500}}>{(item.quantity * item.price).toLocaleString()}đ</span> },
                    ]}
                    pagination={false}
                    rowKey="id"
                    size="small"
                    style={{ background: evenRowBgColor, borderRadius: 8, border: `1px solid ${borderColor}` }}
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