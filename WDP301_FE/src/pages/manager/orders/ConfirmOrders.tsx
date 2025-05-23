import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Card,
  Modal,
  Descriptions,
  message,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

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

const fakeOrdersData: Order[] = [
  {
    id: 101,
    customerName: "Nguyễn Văn An",
    orderDate: "2025-05-22T10:30:00Z",
    totalAmount: 1200000,
    status: "pending",
    items: [
      { id: 1, name: "Sản phẩm Sang Trọng X1", quantity: 2, price: 300000 },
      { id: 2, name: "Vật phẩm Cao Cấp Y2", quantity: 1, price: 600000 },
    ],
  },
  {
    id: 102,
    customerName: "Trần Thị Bích",
    orderDate: "2025-05-22T12:00:00Z",
    totalAmount: 800000,
    status: "pending",
    items: [{ id: 3, name: "Mặt hàng Độc Đáo Z3", quantity: 1, price: 800000 }],
  },
  {
    id: 103,
    customerName: "Lê Hoàng Cảnh",
    orderDate: "2025-05-23T09:15:00Z",
    totalAmount: 2500000,
    status: "pending",
    items: [
        { id: 4, name: "Thiết bị Hiện Đại A4", quantity: 1, price: 1500000 },
        { id: 5, name: "Phụ kiện Thời Trang B5", quantity: 2, price: 500000 },
    ],
  },
];

const ConfirmOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(fakeOrdersData);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setOrders(fakeOrdersData.filter(o => o.status === 'pending'));
      setLoading(false);
    }, 300);
  }, []);


  const handleConfirm = (orderToConfirm: Order) => {
    Modal.confirm({
      title: "Xác nhận đơn hàng",
      content: `Bạn có chắc chắn muốn xác nhận đơn hàng #${orderToConfirm.id} của khách ${orderToConfirm.customerName}?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: { style: { background: "#D97B41", borderColor: "#D97B41", color: "#fff" } },
      cancelButtonProps: { style: { borderRadius: 6 } },
      onOk: () => {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderToConfirm.id ? { ...order, status: "confirmed" as const } : order
          ).filter(order => order.status === 'pending')
        );
        message.success(`Đã xác nhận đơn hàng #${orderToConfirm.id}!`);
      },
    });
  };

  const handleReject = (orderToReject: Order) => {
    Modal.confirm({
      title: "Từ chối đơn hàng",
      content: `Bạn có chắc chắn muốn từ chối đơn hàng #${orderToReject.id} của khách ${orderToReject.customerName}?`,
      okText: "Từ chối",
      okType: "danger",
      cancelText: "Hủy",
      okButtonProps: { style: { background: "#A05A2C", borderColor: "#A05A2C", color: "#fff" } },
      cancelButtonProps: { style: { borderRadius: 6 } },
      onOk: () => {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderToReject.id ? { ...order, status: "rejected" as const } : order
          ).filter(order => order.status === 'pending')
        );
        message.error(`Đã từ chối đơn hàng #${orderToReject.id}!`);
      },
    });
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
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a: Order, b: Order) => a.id - b.id,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,
      ellipsis: true,
      sorter: (a: Order, b: Order) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Ngày đặt",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 180,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a:Order, b:Order) => dayjs(a.orderDate).unix() - dayjs(b.orderDate).unix(),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 130,
      align: 'right' as const,
      render: (amount: number) => `${amount.toLocaleString()}đ`,
      sorter: (a:Order, b:Order) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: 'center' as const,
      render: (status: string) => {
        let color = "#A05A2C";
        let icon = <ClockCircleOutlined />;
        let text = "Chờ xác nhận";
        let tagTextColor = cellTextColor;
        let tagBgColor = "#F9E4B7";

        if (status === "pending") {
            color = "#F9E4B7";
            icon = <ClockCircleOutlined style={{color: "#A05A2C"}}/>;
            tagTextColor = "#A05A2C";
            tagBgColor = "#F9E4B7";
        } else if (status === "confirmed") {
            color = "#87d068";
            icon = <CheckCircleOutlined style={{color: "#fff"}}/>;
            text = "Đã xác nhận";
            tagTextColor = "#fff";
            tagBgColor = "#81C784";
        } else if (status === "rejected") {
            color = "#f50";
            icon = <CloseCircleOutlined style={{color: "#fff"}}/>;
            text = "Đã từ chối";
            tagTextColor = "#fff";
            tagBgColor = "#E57373";
        }
        return (
          <Tag icon={icon} style={{ color: tagTextColor, background: tagBgColor, borderColor: tagBgColor, fontWeight: 600, borderRadius: 12, padding: "2px 12px", minWidth: '130px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 320,
      align: 'center' as const,
      render: (_: any, record: Order) => (
        <Space size={12}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => { setSelectedOrder(record); setModalVisible(true); }}
            style={{ color: "#D97B41", fontWeight: 600, padding: 0, outline: "none", boxShadow: "none", border: "none" }}
          >
            Chi tiết
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            style={{ background: "#81C784", borderColor: "#81C784", color: "#fff", fontWeight: 600, outline: "none", boxShadow: "none", border: "none" }}
            disabled={record.status !== "pending"}
            onClick={() => handleConfirm(record)}
          >
            Xác nhận
          </Button>
          <Button
            type="default"
            danger
            icon={<CloseCircleOutlined />}
            style={{ fontWeight: 600, outline: "none", boxShadow: "none" }}
            disabled={record.status !== "pending"}
            onClick={() => handleReject(record)}
          >
            Từ chối
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#FFF9F0", padding: "20px 30px 30px 60px" }}>
      <style>{`
        .confirm-orders-table .ant-table-thead > tr > th,
        .confirm-orders-table .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .confirm-orders-table .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .confirm-orders-table .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .confirm-orders-table .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
           border-right: none !important;
        }
        .confirm-orders-table .ant-table-tbody > tr.even-row-confirm-order > td {
          background-color: ${evenRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .confirm-orders-table .ant-table-tbody > tr.odd-row-confirm-order > td {
          background-color: ${oddRowBgColor};
          color: ${cellTextColor};
          border-right: 1px solid ${borderColor};
          border-bottom: 1px solid ${borderColor};
        }
        .confirm-orders-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .confirm-orders-table .ant-table-tbody > tr:hover > td {
          background-color: #FDEBC8 !important;
        }
        .confirm-orders-table .ant-table-tbody > tr.even-row-confirm-order > td.ant-table-cell-fix-right,
        .confirm-orders-table .ant-table-tbody > tr.odd-row-confirm-order > td.ant-table-cell-fix-right,
        .confirm-orders-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1 style={{ color: "#A05A2C", fontWeight: 800, fontSize: 36, marginBottom: 24, textAlign: "left" }}>
          Xác nhận đơn hàng
        </h1>
        <Card
          style={{
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(160, 90, 44, 0.08)",
            border: `1px solid ${tableBorderColor}`,
            padding: "16px 24px",
          }}
        >
          <Table
            className="confirm-orders-table"
            columns={columns}
            dataSource={orders.filter(order => order.status === 'pending')}
            rowKey="id"
            loading={loading}
            style={{ borderRadius: 8, border: `1px solid ${tableBorderColor}`, overflow: 'hidden' }}
            rowClassName={(_, index) => (index % 2 === 0 ? 'even-row-confirm-order' : 'odd-row-confirm-order')}
            scroll={{ x: 1000 }}
            sticky
          />
        </Card>
        <Modal
          title={<span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>Chi tiết đơn hàng</span>}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[<Button key="close" onClick={() => setModalVisible(false)} style={{borderRadius: 6, borderColor: "#D97B41", color: "#D97B41"}}>Đóng</Button>]}
          width={800}
          styles={{
            body: { background: "#FFF9F0", borderRadius: "0 0 12px 12px", padding: "24px" },
            header: {borderBottom: `1px solid ${tableBorderColor}`, paddingTop: 16, paddingBottom: 16}
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {selectedOrder && (
            <Card
              style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(217, 123, 65, 0.08)", border: `1px solid ${tableBorderColor}`, padding: 16 }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{ color: "#A05A2C", fontWeight: 600, background: '#FFF9F0', width: '160px' }}
                contentStyle={{ color: cellTextColor, background: '#FFFFFF' }}
              >
                <Descriptions.Item label="Mã đơn">{selectedOrder.id}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{selectedOrder.customerName}</Descriptions.Item>
                <Descriptions.Item label="Ngày đặt">{dayjs(selectedOrder.orderDate).format("DD/MM/YYYY HH:mm:ss")}</Descriptions.Item>
                <Descriptions.Item label="Tổng tiền"><span style={{color: "#D97B41", fontWeight: 'bold', fontSize: '1.1em'}}>{selectedOrder.totalAmount.toLocaleString()}đ</span></Descriptions.Item>
                 <Descriptions.Item label="Trạng thái" span={2}>
                  {(() => {
                      let statusText = "Chờ xác nhận";
                      let statusBg = "#F9E4B7";
                      let statusColorText = "#A05A2C";
                      let statusIcon = <ClockCircleOutlined style={{color: statusColorText}}/>;

                      if (selectedOrder.status === "confirmed") {
                          statusText = "Đã xác nhận";
                          statusBg = "#81C784";
                          statusColorText = "#fff";
                          statusIcon = <CheckCircleOutlined style={{color: statusColorText}}/>;
                      } else if (selectedOrder.status === "rejected") {
                          statusText = "Đã từ chối";
                          statusBg = "#E57373";
                          statusColorText = "#fff";
                          statusIcon = <CloseCircleOutlined style={{color: statusColorText}}/>;
                      }
                      return (
                          <Tag icon={statusIcon} style={{ color: statusColorText, fontWeight: 600, background: statusBg, borderColor: statusBg, borderRadius: 12, padding: "2px 12px", minWidth: '130px', textAlign: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {statusText}
                          </Tag>
                      );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={2}>
                  <Table
                    className="order-items-table-modal"
                    dataSource={selectedOrder.items}
                    columns={[
                      { title: <span style={{color: headerColor}}>Tên</span>, dataIndex: "name", key: "name", render: (text: string) => <span style={{color: cellTextColor}}>{text}</span> },
                      { title: <span style={{color: headerColor}}>Số lượng</span>, dataIndex: "quantity", key: "quantity", align: 'center' as const, render: (text: number) => <span style={{color: cellTextColor}}>{text}</span> },
                      { title: <span style={{color: headerColor}}>Đơn giá</span>, dataIndex: "price", key: "price", align: 'right' as const, render: (p: number) => <span style={{color: cellTextColor}}>{p.toLocaleString()}đ</span> },
                      { title: <span style={{color: headerColor}}>Thành tiền</span>, key: "subtotal", align: 'right' as const, render: (_:any, item: OrderItem) => <span style={{color: cellTextColor, fontWeight: 500}}>{(item.quantity * item.price).toLocaleString()}đ</span> },
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

export default ConfirmOrders;