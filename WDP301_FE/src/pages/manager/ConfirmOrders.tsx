import React, { useState } from "react";
import { Table, Button, Tag, Modal, Descriptions, Space, message } from "antd";
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
      okButtonProps: {
        style: { borderColor: "#f97316", outline: "none", boxShadow: "none", background: "#f97316", border: "#f97316" },
      },
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
      okButtonProps: {
        danger: true,
        style: { borderColor: "#f97316", outline: "none", boxShadow: "none", border: "#f97316" },
      },
      onOk: () => {
        setOrders((prev) => prev.filter((order) => order.id !== id));
        message.error("Đã từ chối đơn hàng!");
      },
    });
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => `${amount.toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        if (status === "pending")
          return (
            <Tag icon={<ClockCircleOutlined />} color="warning">
              Chờ xác nhận
            </Tag>
          );
        if (status === "confirmed")
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Đã xác nhận
            </Tag>
          );
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Đã từ chối
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_: any, record: Order) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedOrder(record);
              setModalVisible(true);
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
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{
              background: "#f97316",
              borderColor: "#f97316",
              border: "#f97316",
              boxShadow: "none",
              outline: "none",
            }}
            disabled={record.status !== "pending"}
            onClick={() => handleConfirm(record.id)}
          >
            Xác nhận
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            disabled={record.status !== "pending"}
            onClick={() => handleReject(record.id)}
            style={{
              boxShadow: "none",
              outline: "none",
            }}
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
        maxWidth: 1100,
        background: "#fff",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <h2
          style={{
            color: "#f97316",
            fontWeight: 700,
            fontSize: 28,
            marginBottom: 24,
          }}
        >
          Xác nhận đơn hàng
        </h2>
        <Button
          type="primary"
          style={{ background: "#f97316", borderColor: "#f97316", border: "#f97316", outline: "none"}}
        >
            Xác nhận tất cả
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />
      <Modal
        open={modalVisible}
        title="Chi tiết đơn hàng"
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đơn">
              {selectedOrder.id}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {selectedOrder.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt">
              {new Date(selectedOrder.orderDate).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              {selectedOrder.totalAmount.toLocaleString()}đ
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              {selectedOrder.status === "pending" && (
                <Tag icon={<ClockCircleOutlined />} color="warning">
                  Chờ xác nhận
                </Tag>
              )}
              {selectedOrder.status === "confirmed" && (
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Đã xác nhận
                </Tag>
              )}
              {selectedOrder.status === "rejected" && (
                <Tag icon={<CloseCircleOutlined />} color="error">
                  Đã từ chối
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm" span={2}>
              <Table
                dataSource={selectedOrder.items}
                columns={[
                  { title: "Tên", dataIndex: "name", key: "name" },
                  { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
                  {
                    title: "Đơn giá",
                    dataIndex: "price",
                    key: "price",
                    render: (p: number) => `${p.toLocaleString()}đ`,
                  },
                ]}
                pagination={false}
                rowKey="id"
                size="small"
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ConfirmOrders;
