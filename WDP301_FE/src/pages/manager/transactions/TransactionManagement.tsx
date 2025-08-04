import React, { useEffect, useState, useMemo } from "react";
import { Table, Card, Button, Modal, Descriptions, Tag, Space, Input, DatePicker, Select, message } from "antd";
import { EyeOutlined, SearchOutlined, CreditCardOutlined } from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";
import type { ColumnType } from "antd/es/table";

const { RangePicker } = DatePicker;

interface Transaction {
  transactionId: number;
  orderId: number;
  payment_method: string;
  amount: number;
  status: string;
  transaction_time: string;
  type: string;
}

const statusMap: { [key: string]: string } = {
  PAID: "Đã thanh toán",
  PENDING: "Đang xử lý",
  CANCELED: "Đã hủy",
  CANCEL: "Đã hủy",
};

const getStatusTheme = (
  status: string
): { tagBg: string; tagText: string } => {
  switch (status) {
    case "PAID":
      return { tagBg: "#D1FAE5", tagText: "#065F46" };
    case "PENDING":
    case "PROCESSING":
      return { tagBg: "#FEF3C7", tagText: "#92400E" };
    case "CANCELED":
    case "CANCEL":
      return { tagBg: "#F3F4F6", tagText: "#6B7280" };
    default:
      return { tagBg: "#F3F4F6", tagText: "#374151" };
  }
};

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTransactions(response.data);
    } catch (error) {
      message.error("Failed to fetch transactions");
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedTransaction(null);
  };

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesSearch =
          transaction.transactionId.toString().includes(searchText) ||
          transaction.orderId.toString().includes(searchText) ||
          transaction.payment_method.toLowerCase().includes(searchText.toLowerCase());
        const matchesType =
          typeFilter === "all" || transaction.type === typeFilter;
        const matchesStatus =
          statusFilter === "all" || transaction.status === statusFilter;
        const matchesDate = !dateRange || (
          dayjs(transaction.transaction_time).isAfter(dateRange[0].startOf('day')) &&
          dayjs(transaction.transaction_time).isBefore(dateRange[1].endOf('day'))
        );
        return matchesSearch && matchesType && matchesStatus && matchesDate;
      }),
    [transactions, searchText, typeFilter, statusFilter, dateRange]
  );

  const columns = [
    {
      title: "Mã GD",
      dataIndex: "transactionId",
      key: "transactionId",
      width: 100,
      sorter: (a: Transaction, b: Transaction) => a.transactionId - b.transactionId,
    },
    {
      title: "Mã đơn hàng",
      dataIndex: "orderId",
      key: "orderId",
      width: 120,
      sorter: (a: Transaction, b: Transaction) => a.orderId - b.orderId,
      render: (id: number) => <span style={{ fontWeight: 500 }}>{id}</span>,
    },
    {
      title: "Phương thức",
      dataIndex: "payment_method",
      key: "payment_method",
      width: 150,
      ellipsis: true,
      sorter: (a: Transaction, b: Transaction) => a.payment_method.localeCompare(b.payment_method),
      render: (method: string) => (
        <Tag 
          style={{ 
            backgroundColor: "#FFF9F0", 
            color: "#D97B41", 
            border: "1px solid #E9C97B",
            borderRadius: 8,
            fontWeight: 500
          }}
        >
          {method}
        </Tag>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "transaction_time",
      key: "transaction_time",
      width: 180,
      sorter: (a: Transaction, b: Transaction) =>
        dayjs(a.transaction_time).unix() - dayjs(b.transaction_time).unix(),
      render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      align: "right" as const,
      sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
      render: (amount: number, record: Transaction) => (
        <span style={{ 
          color: record.type === "IN" ? "#059669" : "#DC2626",
          fontWeight: 600 
        }}>
          {record.type === "IN" ? "+" : "-"}{amount.toLocaleString()}đ
        </span>
      ),
    },
    {
      title: "Loại giao dịch",
      dataIndex: "type",
      key: "type",
      width: 130,
      align: "center" as const,
      sorter: (a: Transaction, b: Transaction) => a.type.localeCompare(b.type),
      render: (type: string) => (
        <Tag 
          style={{
            backgroundColor: type === "IN" ? "#D1FAE5" : "#FEE2E2",
            color: type === "IN" ? "#065F46" : "#991B1B",
            border: `1px solid ${type === "IN" ? "#A7F3D0" : "#FECACA"}`,
            borderRadius: 8,
            fontWeight: 600,
            padding: "2px 8px"
          }}
        >
          {type === "IN" ? "Tiền nhận" : "Tiền hoàn"}
        </Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      align: "center" as const,
      render: (status: string) => {
        const theme = getStatusTheme(status);
        return (
          <Tag
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
      width: 120,
      align: "center" as const,
      render: (_: any, record: Transaction) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
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
      ),
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF9F0",
        padding: "20px 30px 30px 60px",
      }}
    >
             <style>{`
        /* Your CSS styles remain the same */
        .ant-table-thead > tr > th { background-color: ${headerBgColor} !important; color: ${headerColor} !important; font-weight: bold !important; border-right: 1px solid ${borderColor} !important; border-bottom: 2px solid ${tableBorderColor} !important; }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { border-right: none !important; }
        .transaction-table .ant-table-tbody > tr.even-row-transaction > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .transaction-table .ant-table-tbody > tr.odd-row-transaction > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .transaction-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .transaction-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .transaction-table .ant-table-cell-fix-right { background: inherit !important; }
        .transaction-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background-color: ${headerBgColor} !important; }
        .ant-input-number:focus, .ant-input-number-focused, .ant-input-number:hover,
        .ant-select-focused .ant-select-selector, .ant-select-selector:focus, .ant-select-selector:hover,
        .ant-picker:focus, .ant-picker:hover, .ant-input:focus, .ant-input:hover,
        .ant-input-affix-wrapper:focus, .ant-input-affix-wrapper-focused, .ant-input-affix-wrapper:hover, .ant-input-affix-wrapper:focus-within {
          border-color: #D97B41 !important; box-shadow: none !important;
        }
        .ant-pagination .ant-pagination-item-active, .ant-pagination .ant-pagination-item-active a { border-color: #D97B41 !important; color: #D97B41 !important; }
        .ant-select-selector { border-color: #E9C97B !important; }
        .ant-select-selector:hover { border-color: #D97B41 !important; }
        .ant-table-column-sorter-up.active svg,
        .ant-table-column-sorter-down.active svg {
          color: #D97B41 !important;
          fill: #D97B41 !important;
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
          Quản lý Giao dịch <CreditCardOutlined />
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
                placeholder="Tìm kiếm mã giao dịch, mã đơn hàng, phương thức thanh toán..."
                prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 320,
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
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 200 }}
              options={[
                { label: "Tất cả loại giao dịch", value: "all" },
                { label: "Tiền nhận", value: "IN" },
                { label: "Tiền hoàn", value: "OUT" },
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Đã thanh toán", value: "PAID" },
                { label: "Đang xử lý", value: "PENDING" },
                { label: "Đã hủy", value: "CANCELED" },
              ]}
            />
            <RangePicker
              placeholder={["Từ ngày", "Đến ngày"]}
              format="DD/MM/YYYY"
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              style={{ borderColor: "#E9C97B" }}
            />
          </div>

          <Table
            className="transaction-table"
            columns={columns as ColumnType<Transaction>[]}
            dataSource={filteredTransactions}
            loading={loading}
            rowKey="transactionId"
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-transaction" : "odd-row-transaction"
            }
            scroll={{ x: 980 }}
            sticky
          />
        </Card>

        <Modal
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Chi tiết giao dịch
            </span>
          }
          open={isModalVisible}
          onCancel={handleModalClose}
          footer={[
            <Button
              key="back"
              onClick={handleModalClose}
              style={{
                borderRadius: 6,
                borderColor: "#D97B41",
                color: "#D97B41",
                outline: "none",
              }}
            >
              Đóng
            </Button>,
          ]}
          width={800}
          styles={{
            body: {
              background: "#FFF9F0",
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
          {selectedTransaction && (
            <Card
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(217, 123, 65, 0.08)",
                border: `1px solid ${tableBorderColor}`,
                padding: 16,
              }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#A05A2C",
                  fontWeight: 600,
                  background: "#FFF9F0",
                  width: "160px",
                }}
                contentStyle={{ color: cellTextColor, background: "#FFFFFF" }}
              >
                <Descriptions.Item label="Mã giao dịch">
                  {selectedTransaction.transactionId}
                </Descriptions.Item>
                <Descriptions.Item label="Mã đơn hàng">
                  {selectedTransaction.orderId}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian giao dịch">
                  {dayjs(selectedTransaction.transaction_time).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Loại giao dịch">
                  <Tag 
                    style={{
                      backgroundColor: selectedTransaction.type === "IN" ? "#D1FAE5" : "#FEE2E2",
                      color: selectedTransaction.type === "IN" ? "#065F46" : "#991B1B",
                      border: `1px solid ${selectedTransaction.type === "IN" ? "#A7F3D0" : "#FECACA"}`,
                      borderRadius: 8,
                      fontWeight: 600,
                      padding: "4px 12px"
                    }}
                  >
                    {selectedTransaction.type === "IN" ? "Tiền nhận" : "Tiền hoàn"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {(() => {
                    const theme = getStatusTheme(selectedTransaction.status);
                    return (
                      <Tag
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
                        {statusMap[selectedTransaction.status] ||
                          selectedTransaction.status.charAt(0).toUpperCase() + selectedTransaction.status.slice(1)}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền giao dịch" span={2}>
                  <span
                    style={{
                      color: cellTextColor,
                      fontSize: "1.1em",
                    }}
                  >
                    {selectedTransaction.amount.toLocaleString()}đ
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  <span style={{ color: cellTextColor }}>
                    {selectedTransaction.payment_method}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default TransactionManagement;