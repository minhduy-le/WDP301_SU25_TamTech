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
  Tooltip,
  Popconfirm,
  message,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  // CarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import {
  useGetOrders,
  type OrderHistory,
  useApproveOrder,
  useCookOrder,
  usePrepareOrder,
} from "../hooks/ordersApi";
import { AxiosError } from "axios";
import { useGetShippers, useAssignShipper } from "../hooks/shipperApi";
import DeliveryIcon from "../components/icon/DeliveryIcon";
import PrintIcon from "../components/icon/PrintIcon";
import { getFormattedPrice } from "../utils/formatPrice";
import printJS from "print-js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const statusMap: { [key: string]: string } & {
  Pending: string;
  Paid: string;
  Approved: string;
  Preparing: string;
  Cooked: string;
  Delivering: string;
  Delivered: string;
  Canceled: string;
} = {
  Pending: "Chờ thanh toán",
  Paid: "Đã thanh toán",
  Approved: "Xác nhận đơn",
  Preparing: "Đang nấu ăn",
  Cooked: "Đã nấu xong",
  Delivering: "Đang giao",
  Delivered: "Đã giao",
  Canceled: "Đã hủy",
};

const { Option } = Select;

const StaffOrderManagement = () => {
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: orders, isLoading: isOrderLoading } = useGetOrders();
  const { data: shippers, isLoading: isShippersLoading } = useGetShippers();
  const assignShipperMutation = useAssignShipper();

  const approveOrderMutation = useApproveOrder();
  const prepareOrderMutation = usePrepareOrder();
  const cookOrderMutation = useCookOrder();

  const handleApproveOrder = (orderId: number) => {
    approveOrderMutation.mutate(
      { orderId },
      {
        onSuccess: () => message.success("Đơn hàng đã được xác nhận!"),
        onError: (error: AxiosError) =>
          message.error(
            error.response?.data?.toString() || "Xác nhận đơn hàng thất bại!"
          ),
      }
    );
  };

  const handlePrepareOrder = (orderId: number) => {
    prepareOrderMutation.mutate(
      { orderId },
      {
        onSuccess: () => message.success("Đơn hàng đang được chuẩn bị!"),
        onError: (error: AxiosError) =>
          message.error(
            error.response?.data?.toString() || "Chuẩn bị đơn hàng thất bại!"
          ),
      }
    );
  };

  const handleCookOrder = (orderId: number) => {
    cookOrderMutation.mutate(
      { orderId },
      {
        onSuccess: () => message.success("Đơn hàng đã nấu xong!"),
        onError: (error: AxiosError) =>
          message.error(
            error.response?.data?.toString() || "Hoàn thành nấu thất bại!"
          ),
      }
    );
  };

  const handleAssignShipper = (orderId: number, shipperId: number) => {
    const orderDate = dayjs().format("MM-DD-YYYY");

    assignShipperMutation.mutate(
      { orderId, assignShipper: { shipperId, orderDate } },
      {
        onSuccess: () => {
          message.success("Đã gán shipper thành công!");
          setIsAssignModalVisible(false); // Đóng modal sau khi gán thành công
        },
        onError: (error: AxiosError) => {
          {
            const errorMessage =
              error.response?.data?.toString() || "Gán shipper thất bại!";
            if (
              errorMessage.includes("Shipper has not registered a schedule for")
            ) {
              const extractedDate =
                errorMessage.match(/(\d{2}-\d{2}-\d{4})/)?.[0] || orderDate;
              message.error(
                `Shipper chưa đăng ký lịch trình cho ngày ${extractedDate}`
              );
            } else {
              message.error(errorMessage);
            }
          }
        },
      }
    );
  };

  const [selectedShipperId, setSelectedShipperId] = useState<number | null>(
    null
  );
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  const getStatusTheme = (
    status: string
  ): { tagBg: string; tagText: string; iconColor?: string } => {
    switch (status) {
      case "Pending":
        return { tagBg: "#fffbeb", tagText: "#92400e", iconColor: "#92400e" }; // amber-50, amber-800
      case "Paid":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" }; // amber-200, amber-800
      case "Approved":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" }; // amber-200, amber-800
      case "Preparing":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" }; // amber-200, amber-800
      case "Cooked":
        return { tagBg: "#fcd34d", tagText: "#fff", iconColor: "#fff" }; // amber-300, white
      case "Delivering":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" }; // amber-200, amber-800
      case "Delivered":
        return { tagBg: "#fcd34d", tagText: "#fff", iconColor: "#fff" }; // amber-300, white
      case "Canceled":
        return { tagBg: "#E57373", tagText: "#fff", iconColor: "#fff" }; // Giữ màu đỏ nhẹ cho hủy
      default:
        return { tagBg: "#fffbeb", tagText: "#92400e" }; // amber-50, amber-800
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

  const handlePrintInvoice = (invoiceUrl: string) => {
    fetch(invoiceUrl, { method: "HEAD" })
      .then((response) => {
        if (response.ok) {
          printJS({
            printable: invoiceUrl,
            type: "pdf",
            showModal: true,
            onError: (error) => message.error(`Lỗi khi in: ${error}`),
          });
        } else {
          message.error("Không thể truy cập file PDF. Vui lòng kiểm tra URL.");
        }
      })
      .catch((error) => message.error(`Lỗi mạng: ${error.message}`));
  };

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
      width: 150,
      sorter: (a: OrderHistory, b: OrderHistory) =>
        dayjs(a.order_create_at).unix() - dayjs(b.order_create_at).unix(),
      render: (order_create_at: string) =>
        dayjs(order_create_at).format("DD/MM/YYYY HH:mm:ss"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "orderItems",
      key: "total_amount",
      width: 120,
      align: "center" as const,
      sorter: (a: OrderHistory, b: OrderHistory) => {
        const totalA =
          a.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) + parseFloat(a.order_shipping_fee.toString());
        const totalB =
          b.orderItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ) + parseFloat(b.order_shipping_fee.toString());
        return totalA - totalB;
      },
      render: (_: any, record: OrderHistory) => {
        const itemTotal = record.orderItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const total =
          itemTotal + parseFloat(record.order_shipping_fee.toString());
        return `${getFormattedPrice(total)}`;
      },
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
        { text: "Xác nhận đơn", value: "Approved" },
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
      render: (_: any, record: OrderHistory) => (
        <Space size={12}>
          <Tooltip title="Chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedOrder(record);
                setIsModalVisible(true);
              }}
              style={{
                color: "#d97706", // amber-600
                fontWeight: 600,
                padding: 0,
                outline: "none",
                boxShadow: "none",
                border: "none",
                background: "#fefce8", // amber-25
              }}
            />
          </Tooltip>
          {record.status === "Paid" && (
            <Tooltip title="Xác nhận">
              <Popconfirm
                title="Xác nhận"
                description="Bạn có chắc muốn xác nhận đơn hàng này hay không?"
                onConfirm={() => handleApproveOrder(record.orderId)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  style: { background: "#fcd34d", borderColor: "#fcd34d" }, // amber-300
                }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <CheckCircleOutlined
                      style={{ fontSize: 16, color: "#d97706" }} // amber-600
                    />
                  }
                  className="btn-action-status"
                />
              </Popconfirm>
            </Tooltip>
          )}
          {record.status === "Approved" && (
            <Tooltip title="Chuẩn bị nấu">
              <Popconfirm
                title="Xác nhận chuẩn bị nấu"
                description="Bạn có chắc muốn xác nhận chuẩn bị nấu hay không?"
                onConfirm={() => handlePrepareOrder(record.orderId)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  style: { background: "#fcd34d", borderColor: "#fcd34d" }, // amber-300
                }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <ClockCircleOutlined
                      style={{ fontSize: 16, color: "#d97706" }} // amber-600
                    />
                  }
                  className="btn-action-status"
                />
              </Popconfirm>
            </Tooltip>
          )}
          {record.status === "Preparing" && (
            <Tooltip title="Hoàn thành nấu">
              <Popconfirm
                title="Xác nhận hoàn thành nấu"
                description="Bạn có chắc muốn xác nhận hoàn thành nấu hay không?"
                onConfirm={() => handleCookOrder(record.orderId)}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                  danger: true,
                  style: { background: "#fcd34d", borderColor: "#fcd34d" }, // amber-300
                }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <CheckCircleOutlined
                      style={{ fontSize: 16, color: "#d97706" }} // amber-600
                    />
                  }
                  className="btn-action-status"
                />
              </Popconfirm>
            </Tooltip>
          )}
          {record.status === "Cooked" && (
            <Tooltip title="Giao hàng">
              <Button
                type="text"
                onClick={() => {
                  setCurrentOrderId(record.orderId);
                  setIsAssignModalVisible(true);
                }}
                icon={<DeliveryIcon />}
                className="btn-action-status"
              />
            </Tooltip>
          )}
          {record.status !== "Pending" && record.status !== "Approved" && (
            <Tooltip title="In hóa đơn">
              <Button
                type="link"
                icon={<PrintIcon />}
                onClick={() => handlePrintInvoice(record.invoiceUrl)}
                style={{
                  color: "#d97706",
                  fontWeight: 600,
                  padding: 0,
                  outline: "none",
                  boxShadow: "none",
                  border: "none",
                  background: "#fefce8", // amber-25
                }}
              />
            </Tooltip>
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
        background: "#fefce8", // amber-25
        padding: "20px 30px 30px 60px",
      }}
    >
      <style>{`
        .order-table-staff .ant-table-thead > tr > th {
          background-color: #fefce8 !important;
          color: #92400e !important; 
        }
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: #ffffff !important; // white
          color: #92400e !important; // amber-800
          font-weight: bold !important;
          border-right: 1px solid #fde68a !important; // amber-200
          border-bottom: 2px solid #fde68a !important; // amber-200
        }
        .order-table-staff .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
           border-right: none !important;
        }
        .order-table-staff .ant-table-tbody > tr.even-row-order > td {
          background-color: #ffffff; // white
          color: #d97706; // amber-600
          border-right: 1px solid #fde68a; // amber-200
          border-bottom: 1px solid #fde68a; // amber-200
        }
        .order-table-staff .ant-table-tbody > tr.odd-row-order > td {
          background-color: #ffffff; // white
          color: #d97706; // amber-600
          border-right: 1px solid #fde68a; // amber-200
          border-bottom: 1px solid #fde68a; // amber-200
        }
        .order-table-staff .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .order-table-staff .ant-table-tbody > tr:hover > td {
          background-color: #fcd34d !important; // amber-300
        }
        .order-table-staff .ant-table-tbody > tr.even-row-order > td.ant-table-cell-fix-right,
        .order-table-staff .ant-table-tbody > tr.odd-row-order > td.ant-table-cell-fix-right,
        .order-table-staff .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
        .order-table-staff .ant-table-column-sorters .ant-table-column-sorter {
           color: #92400e !important; // amber-800
        }
        .order-table-staff .ant-table-filter-column .anticon-filter {
           color: #92400e !important; // amber-800
        }
        .order-search .ant-input-outlined input::placeholder {
           color: #d97706 !important; // amber-600
        }
        .ant-descriptions-item-content .ant-table-small{
           border-radius: 8px;
        }
        .ant-descriptions-item-content .ant-table-small .ant-table-cell{
           border-radius: 8px !important;
        }
        .ant-table-cell .btn-action-status {
            outline: none;
            box-shadow: none;
            border: none;
            background: #fefce8 !important; // amber-25
        }
        .modal-assign-shipper .ant-modal-body {
          background: none !important;
          padding: 24px 0 !important;
        }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#92400e", // amber-800
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Đơn hàng
        </h1>
        <Card
          style={{
            background: "#ffffff", // white
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(146, 64, 14, 0.08)", // amber-800 với độ trong suốt
            padding: "16px 24px",
            border: `1px solid #fde68a`, // amber-200
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
                prefix={<SearchOutlined style={{ color: "#92400e" }} />} // amber-800
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#fde68a", // amber-200
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fefce8", // amber-25
                }}
                allowClear
              />
              <Select
                value={statusFilter}
                style={{ width: 200, borderRadius: 6, borderColor: "#fde68a" }} // amber-200
                onChange={(value) => setStatusFilter(value)}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Pending">Chờ thanh toán</Option>
                <Option value="Paid">Đã thanh toán</Option>
                <Option value="Approved">Xác nhận đơn</Option>
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
              border: `1px solid #fde68a`, // amber-200
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
            <span style={{ color: "#d97706", fontWeight: 700, fontSize: 22 }}>
              {" "}
            </span>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={1000}
          styles={{
            body: {
              background: "#fefce8", // amber-25
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid #fde68a`, // amber-200
              paddingBottom: 16,
              marginBottom: 0,
            },
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {selectedOrder && (
            <Card
              style={{
                background: "#ffffff", // white
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.08)", // amber-600 với độ trong suốt
                border: `1px solid #fde68a`, // amber-200
                padding: 16,
              }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#92400e", // amber-800
                  fontWeight: 600,
                  background: "#fefce8", // amber-25
                }}
                contentStyle={{ color: "#d97706", background: "#ffffff" }} // amber-600, white
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
                        {statusMap[selectedOrder.status] ||
                          selectedOrder.status.charAt(0).toUpperCase() +
                            selectedOrder.status.slice(1)}
                      </Tag>
                    );
                  })()}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  <span
                    style={{
                      color: "#d97706", // amber-600
                      fontWeight: "bold",
                      fontSize: "1.1em",
                    }}
                  >
                    {getFormattedPrice(
                      selectedOrder.orderItems.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      ) +
                        parseFloat(selectedOrder.order_shipping_fee.toString())
                    )}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phí vận chuyển">
                  <span style={{ color: "#d97706" }}>
                    {" "}
                    // amber-600
                    {getFormattedPrice(selectedOrder.order_shipping_fee)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  <span style={{ color: "#d97706" }}>
                    {" "}
                    // amber-600
                    {getFormattedPrice(selectedOrder.order_discount_value)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  <span style={{ color: "#d97706" }}>
                    {" "}
                    // amber-600
                    {selectedOrder.payment_method}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                  <span style={{ color: "#d97706" }}>
                    {" "}
                    // amber-600
                    {selectedOrder.order_address}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <span style={{ color: "#d97706" }}>
                    {" "}
                    // amber-600
                    {selectedOrder.phone_number}
                  </span>
                </Descriptions.Item>
                {selectedOrder.note && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <span style={{ color: "#d97706" }}>
                      {" "}
                      // amber-600
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
                          <span style={{ color: "#d97706" }}>
                            {" "}
                            // amber-600
                            {text}
                          </span>
                        ),
                      },
                      {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                        align: "center" as const,
                        render: (text: number) => (
                          <span style={{ color: "#d97706" }}>
                            {" "}
                            // amber-600
                            {text}
                          </span>
                        ),
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "price",
                        key: "price",
                        align: "center" as const,
                        render: (price: number) => (
                          <span style={{ color: "#d97706" }}>
                            {" "}
                            // amber-600
                            {getFormattedPrice(price)}
                          </span>
                        ),
                      },
                      {
                        title: "Thành tiền",
                        key: "subtotal",
                        align: "center" as const,
                        render: (
                          _: any,
                          item: { quantity: number; price: number }
                        ) => (
                          <span
                            style={{ color: "#d97706", fontWeight: 500 }} // amber-600
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
                      background: "#ffffff", // white
                      borderRadius: 8,
                      border: `1px solid #fde68a`, // amber-200
                    }}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}
        </Modal>

        <Modal
          title={
            <span style={{ color: "#d97706", fontWeight: 700, fontSize: 22 }}>
              {" "}
              // amber-600 Chọn Shipper Giao Hàng
            </span>
          }
          centered
          open={isAssignModalVisible}
          onCancel={() => setIsAssignModalVisible(false)}
          footer={[
            <Button
              key="back"
              onClick={() => setIsAssignModalVisible(false)}
              style={{
                borderRadius: 6,
                borderColor: "#fde68a", // amber-200
                color: "#d97706", // amber-600
              }}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              disabled={!selectedShipperId}
              onClick={() =>
                currentOrderId &&
                selectedShipperId &&
                handleAssignShipper(currentOrderId, selectedShipperId)
              }
              style={{
                background: "#fcd34d", // amber-300
                borderColor: "#fcd34d", // amber-300
                borderRadius: 6,
              }}
            >
              Xác nhận
            </Button>,
          ]}
          styles={{
            body: {
              background: "#fefce8", // amber-25
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid #fde68a`, // amber-200
              paddingBottom: 16,
              marginBottom: 0,
            },
          }}
          className="modal-assign-shipper"
          style={{ borderRadius: 12, top: 20 }}
        >
          <Select
            placeholder="Chọn shipper"
            style={{
              width: "100%",
              border: "#fde68a", // amber-200
              background: "#ffffff", // white
            }}
            onChange={(value) => setSelectedShipperId(value)}
            loading={isShippersLoading}
            value={selectedShipperId}
          >
            {shippers?.map((shipper) => (
              <Option key={shipper.id} value={shipper.id}>
                {shipper.fullName}
              </Option>
            ))}
          </Select>
        </Modal>
      </div>
    </div>
  );
};

export default StaffOrderManagement;
