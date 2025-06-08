import  { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Descriptions } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import { EyeOutlined } from '@ant-design/icons';

const statusMap: Record<string, { bg: string; color: string; text: string }> = {
  paid: { bg: '#F9E4B7', color: '#8D572A', text: 'Thành công' },
  processing: { bg: '#FFE6B0', color: '#F6A700', text: 'Đang xử lý' },
  pending: { bg: '#FFE6B0', color: '#F6A700', text: 'Đang xử lý' },
  cancelled: { bg: '#FFE6B0', color: '#F6A700', text: 'Hủy' },
};

const formatOrderId = (id: number) => `ORD${id.toString().padStart(3, '0')}`;

const LatestOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    axios.get('https://wdp-301-0fd32c261026.herokuapp.com/api/orders', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);


  const columns = [
    {
      title: 'Mã',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id: number) => formatOrderId(id),
    },
    {
      title: 'Khách hàng',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_: any, record: any) =>
        record.orderItems && record.orderItems.length > 0
          ? record.orderItems.map((item: any) => item.name).join(', ')
          : '',
    },
    {
      title: 'Số tiền',
      dataIndex: 'order_amount',
      key: 'order_amount',
      render: (amount: string) => `${parseFloat(amount).toLocaleString()}đ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = statusMap[status.toLowerCase()] || { bg: '#F9E4B7', color: '#8D572A', text: status };
        return (
          <span
            style={{
              background: s.bg,
              color: s.color,
              fontWeight: 600,
              borderRadius: 6,
              padding: '2px 16px',
              display: 'inline-block',
              minWidth: 80,
              textAlign: 'center',
              border: 'none',
            }}
          >
            {s.text}
          </span>
        );
      },
    },
    {
      title: 'Xem chi tiết',
      key: 'action',
      render: (_: any, record: any) => (
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
      ),
    },
  ];

  return (
    <Card
      title={<span style={{ color: '#8D572A', fontWeight: 700, fontSize: 20 }}>Đơn hàng mới nhất</span>}
      style={{
        background: '#FFF8F1',
        borderRadius: 16,
        border: 'none',
        margin: 16,
        boxShadow: '0 2px 8px #f0e1d0',
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        columns={columns}
        dataSource={orders.slice(0, 5)}
        loading={loading}
        pagination={false}
        rowKey="orderId"
        style={{ borderRadius: 12, overflow: 'hidden' }}
        bordered={false}
      />

      <Modal
        title={<span style={{ color: '#D97B41', fontWeight: 700, fontSize: 22 }}>Chi tiết đơn hàng</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)} style={{ borderRadius: 6, borderColor: "#D97B41", color: "#D97B41", outline: "none", border: "#D" }}>Đóng</Button>
        ]}
        width={800}
        styles={{
          body: { background: "#FFF9F0", borderRadius: "0 0 12px 12px", padding: "24px" },
          header: { borderBottom: `1px solid #E9C97B`, paddingTop: 16, paddingBottom: 16 }
        }}
        style={{ borderRadius: 12, top: 20 }}
      >
        {selectedOrder && (
          <Card
            style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(217, 123, 65, 0.08)", border: `1px solid #E9C97B`, padding: 16, }}
          >
            <Descriptions
              bordered
              column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              size="default"
              labelStyle={{ color: "#A05A2C", fontWeight: 600, background: '#FFF9F0', width: '160px' }}
              contentStyle={{ color: "#5D4037", background: '#FFFFFF' }}
            >
              <Descriptions.Item label="Mã đơn hàng">{formatOrderId(selectedOrder.orderId)}</Descriptions.Item>
              <Descriptions.Item label="Khách hàng">{selectedOrder.fullName}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.order_create_at).format("DD/MM/YYYY HH:mm:ss")}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <span
                  style={{
                    background: statusMap[selectedOrder.status.toLowerCase()]?.bg || '#F9E4B7',
                    color: statusMap[selectedOrder.status.toLowerCase()]?.color || '#8D572A',
                    fontWeight: 600,
                    borderRadius: 6,
                    padding: '2px 16px',
                    display: 'inline-block',
                    minWidth: 80,
                    textAlign: 'center',
                    border: 'none',
                  }}
                >
                  {statusMap[selectedOrder.status.toLowerCase()]?.text || selectedOrder.status}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <span style={{ color: "#D97B41", fontWeight: 'bold', fontSize: '1.1em' }}>{parseFloat(selectedOrder.order_amount).toLocaleString()}đ</span>
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                <span>{parseFloat(selectedOrder.order_shipping_fee).toLocaleString()}đ</span>
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                <span>{parseFloat(selectedOrder.order_discount_value).toLocaleString()}đ</span>
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
                    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
                    { title: "Số lượng", dataIndex: "quantity", key: "quantity", align: 'center' as const },
                    { title: "Đơn giá", dataIndex: "price", key: "price", align: 'right' as const, render: (price: string) => `${parseFloat(price).toLocaleString()}đ` },
                    { title: "Thành tiền", key: "subtotal", align: 'right' as const, render: (_: any, item: any) => `${(item.quantity * parseFloat(item.price)).toLocaleString()}đ` },
                  ]}
                  pagination={false}
                  rowKey="productId"
                  size="small"
                  style={{ background: "#FFFDF5", borderRadius: 8, border: `1px solid #F5EAD9` }}
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