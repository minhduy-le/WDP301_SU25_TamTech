import React, { useState } from "react";
import { Table, Button, Tag, Modal, Descriptions, Space, message, Card } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

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
  status: "pending" | "confirmed" | "rejected";
  items: OrderItem[];
}

const fakeOrders: Order[] = [
  {
    id: 101,
    customerName: "Nguyễn Văn A",
    orderDate: "2025-05-22T10:30:00Z",
    totalAmount: 1200000,
    status: "pending",
    items: [
      { id: 1, name: "Sản phẩm 1", quantity: 2, price: 300000 },
      { id: 2, name: "Sản phẩm 2", quantity: 1, price: 600000 },
    ],
  },
  {
    id: 102,
    customerName: "Trần Thị B",
    orderDate: "2025-05-22T12:00:00Z",
    totalAmount: 800000,
    status: "pending",
    items: [{ id: 3, name: "Sản phẩm 3", quantity: 1, price: 800000 }],
  },
];

const ConfirmOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(fakeOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleConfirm = (id: number) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xác nhận đơn hàng này?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { style: { background: "#D97B41", borderColor: "#D97B41", outline: "none", boxShadow: "none" } },
      onOk: () => {
        setOrders((prev) => prev.filter((order) => order.id !== id));
        message.success("Đã xác nhận đơn hàng!");
      },
    });
  };

  const handleReject = (id: number) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn từ chối đơn hàng này?",
      okText: "Từ chối",
      cancelText: "Hủy",
      okButtonProps: { style: { background: "#A05A2C", borderColor: "#A05A2C", outline: "none", boxShadow: "none" } },
      onOk: () => {
        setOrders((prev) => prev.filter((order) => order.id !== id));
        message.error("Đã từ chối đơn hàng!");
      },
    });
  };

  const columns = [
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Mã đơn</span>,
      dataIndex: "id",
      key: "id",
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Khách hàng</span>,
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Ngày đặt</span>,
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Tổng tiền</span>,
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString()}đ`,
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Trạng thái</span>,
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "pending")
          return (
            <Tag icon={<ClockCircleOutlined />} color="#E9C97B" style={{ color: "#A05A2C", fontWeight: 600, background: "#F9E4B7", borderRadius: 12, padding: "0 12px" }}>
              Chờ xác nhận
            </Tag>
          );
        if (status === "confirmed")
          return (
            <Tag icon={<CheckCircleOutlined />} color="#D97B41" style={{ color: "#fff", fontWeight: 600, background: "#FAD2A5", borderRadius: 12, padding: "0 12px" }}>
              Đã xác nhận
            </Tag>
          );
        return (
          <Tag icon={<CloseCircleOutlined />} color="#A05A2C" style={{ color: "#fff", fontWeight: 600, background: "#D9B28C", borderRadius: 12, padding: "0 12px" }}>
            Đã từ chối
          </Tag>
        );
      },
    },
    {
      title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Hành động</span>,
      key: "actions",
      render: (_: any, record: Order) => (
        <Space size={12}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => { setSelectedOrder(record); setModalVisible(true); }}
            style={{ color: "#D97B41", fontWeight: 600, padding: 0 }}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: "#D97B41", borderColor: "#D97B41", boxShadow: "none", outline: "none", fontWeight: 600 }}
            disabled={record.status !== "pending"}
            onClick={() => handleConfirm(record.id)}
          >
            Xác nhận
          </Button>
          <Button
            type="default"
            icon={<CloseCircleOutlined />}
            style={{ color: "#A05A2C", borderColor: "#A05A2C", background: "#fff", boxShadow: "none", outline: "none", fontWeight: 600 }}
            disabled={record.status !== "pending"}
            onClick={() => handleReject(record.id)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFF3D6"}}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ color: "#D97B41", fontWeight: 800, fontSize: 36, marginBottom: 24, textAlign: "left" }}>
          Xác nhận đơn hàng
        </h2>
        <Card
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 12px rgba(217, 123, 65, 0.1)",
            border: "1px solid #E9C97B",
          }}
        >
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={{ pageSize: 5, showSizeChanger: true }}
            style={{ background: "#fff", borderRadius: 12 }}
            scroll={{ x: 1000 }}
          />
        </Card>
        <Modal
          open={modalVisible}
          title={<span style={{ color: "#D97B41", fontWeight: 700, fontSize: 24 }}>Chi tiết đơn hàng</span>}
          onCancel={() => setModalVisible(false)}
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
                <Descriptions.Item label="Mã đơn">{selectedOrder.id}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">{new Date(selectedOrder.orderDate).toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">{selectedOrder.totalAmount.toLocaleString()}đ</Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  {selectedOrder.status === "pending" && (
                    <Tag icon={<ClockCircleOutlined />} color="#E9C97B" style={{ color: "#A05A2C", fontWeight: 600, background: "#F9E4B7", borderRadius: 12, padding: "0 12px" }}>
                      Chờ xác nhận
                    </Tag>
                  )}
                  {selectedOrder.status === "confirmed" && (
                    <Tag icon={<CheckCircleOutlined />} color="#D97B41" style={{ color: "#fff", fontWeight: 600, background: "#FAD2A5", borderRadius: 12, padding: "0 12px" }}>
                      Đã xác nhận
                    </Tag>
                  )}
                  {selectedOrder.status === "rejected" && (
                    <Tag icon={<CloseCircleOutlined />} color="#A05A2C" style={{ color: "#fff", fontWeight: 600, background: "#D9B28C", borderRadius: 12, padding: "0 12px" }}>
                      Đã từ chối
                    </Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={2}>
                  <Table
                    dataSource={selectedOrder.items}
                    columns={[
                      { title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Tên</span>, dataIndex: "name", key: "name" },
                      { title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Số lượng</span>, dataIndex: "quantity", key: "quantity" },
                      { title: <span style={{ color: "#A05A2C", fontWeight: 700 }}>Đơn giá</span>, dataIndex: "price", key: "price", render: (p: number) => `${p.toLocaleString()}đ` },
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

export default ConfirmOrders;