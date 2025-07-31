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
  Upload,
} from "antd";
import type { UploadFile, UploadChangeParam } from "antd/es/upload/interface";
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
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
  useCancelOrderSendEmail,
  useUploadRefundCertificate,
} from "../hooks/ordersApi";
import { AxiosError } from "axios";
import { useAssignShipper, useGetShipperScheduled } from "../hooks/shipperApi";
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
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { data: orders, isLoading: isOrderLoading } = useGetOrders();
  const { data: shippers, isLoading: isShippersLoading } =
    useGetShipperScheduled();
  const assignShipperMutation = useAssignShipper();

  const approveOrderMutation = useApproveOrder();
  const prepareOrderMutation = usePrepareOrder();
  const cookOrderMutation = useCookOrder();
  const sendEmailMutation = useCancelOrderSendEmail();
  const uploadRefundCertificateMutation = useUploadRefundCertificate();

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
          setIsAssignModalVisible(false);
        },
        onError: (error: AxiosError) => {
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
        return { tagBg: "#fffbeb", tagText: "#92400e", iconColor: "#92400e" };
      case "Paid":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" };
      case "Approved":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" };
      case "Preparing":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" };
      case "Cooked":
        return { tagBg: "#fcd34d", tagText: "#92400e", iconColor: "#92400e" };
      case "Delivering":
        return { tagBg: "#fde68a", tagText: "#92400e", iconColor: "#92400e" };
      case "Delivered":
        return { tagBg: "#fcd34d", tagText: "#92400e", iconColor: "#92400e" };
      case "Canceled":
        return { tagBg: "#E57373", tagText: "#92400e", iconColor: "#92400e" };
      default:
        return { tagBg: "#fffbeb", tagText: "#92400e" };
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

  const handleUploadRefundCertificate = (orderId: number) => {
    const order = orders?.find((o) => o.orderId === orderId);
    setSelectedOrder(order || null);
    setCurrentOrderId(orderId);
    setIsUploadModalVisible(true);
  };

  const handleFileChange = (info: UploadChangeParam) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} đã được tải lên thành công!`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} tải lên thất bại!`);
    }

    setFileList(info.fileList);

    if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
      setSelectedFile(info.fileList[0].originFileObj);
    } else if (info.file.status === "removed") {
      setSelectedFile(null);
    }
  };

  const handleUploadSubmit = () => {
    if (!currentOrderId || !selectedFile) {
      message.error("Vui lòng chọn một file ảnh và đơn hàng!");
      return;
    }

    uploadRefundCertificateMutation.mutate(
      { orderId: currentOrderId, file: selectedFile },
      {
        onSuccess: () => {
          sendEmailMutation.mutate(
            { orderId: currentOrderId },
            {
              onSuccess: () => {
                message.success(
                  "Chứng từ hoàn tiền đã được tải lên và gửi tới email người dùng!"
                );
                setIsUploadModalVisible(false);
                setSelectedFile(null);
                setFileList([]);
              },
              onError: (error: any) => {
                message.error("Gửi email thất bại: " + error.message);
              },
            }
          );
        },
        onError: (error) => {
          console.error("Upload error:", error);
          message.error(error.message || "Tải lên thất bại!");
        },
      }
    );
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
      width: 160,
      align: "center" as const,
      filters: [
        { text: "Chờ thanh toán", value: "Pending" },
        { text: "Đã thanh toán", value: "Paid" },
        { text: "Xác nhận đơn", value: "Approved" },
        { text: "Đang nấu ăn", value: "Preparing" },
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
      title: "Shipper",
      dataIndex: "assignToShipperId",
      key: "shipper",
      width: 150,
      align: "center" as const,
      render: (assignToShipperId: number) => {
        if (assignToShipperId === null) {
          return "";
        }
        const shipper = shippers?.find((s) => s.id === assignToShipperId);
        return shipper ? shipper.fullName : "";
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
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
                color: "#d97706",
                fontWeight: 600,
                padding: 0,
                outline: "none",
                boxShadow: "none",
                border: "none",
                background: "#fefce8",
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
                  style: { background: "#fcd34d", borderColor: "#fcd34d" },
                }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <CheckCircleOutlined
                      style={{ fontSize: 16, color: "#d97706" }}
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
                  style: { background: "#fcd34d", borderColor: "#fcd34d" },
                }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <ClockCircleOutlined
                      style={{ fontSize: 16, color: "#d97706" }}
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
                  style: { background: "#fcd34d", borderColor: "#fcd34d" },
                }}
              >
                <Button
                  type="text"
                  danger
                  icon={
                    <CheckCircleOutlined
                      style={{ fontSize: 16, color: "#d97706" }}
                    />
                  }
                  className="btn-action-status"
                />
              </Popconfirm>
            </Tooltip>
          )}
          {record.status === "Cooked" && record.assignToShipperId === null && (
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
          {record.status === "Canceled" && record.invoiceUrl !== null && (
            <Tooltip title="Chụp ảnh hoàn tiền">
              <Button
                type="text"
                icon={<UploadOutlined />}
                onClick={() => handleUploadRefundCertificate(record.orderId)}
                style={{
                  color: "#d97706",
                  fontWeight: 600,
                  padding: 0,
                  outline: "none",
                  boxShadow: "none",
                  border: "none",
                  background: "#fefce8",
                }}
              />
            </Tooltip>
          )}
          {record.status !== "Pending" && record.status !== "Canceled" && (
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
                  background: "#fefce8",
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
        return matchesSearch;
      }),
    [orders, searchText]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fefce8",
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
          background-color: #ffffff !important;
          color: #92400e !important;
          font-weight: bold !important;
          border-right: 1px solid #fde68a !important;
          border-bottom: 2px solid #fde68a !important;
        }
        .order-table-staff .ant-table-thead > tr > th:last-child {
            border-right: none !important;
        }
        .order-table-staff .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last {
           border-right: none !important;
        }
        .order-table-staff .ant-table-tbody > tr.even-row-order > td {
          background-color: #ffffff;
          color: #d97706;
          border-right: 1px solid #fde68a;
          border-bottom: 1px solid #fde68a;
        }
        .order-table-staff .ant-table-tbody > tr.odd-row-order > td {
          background-color: #ffffff;
          color: #d97706;
          border-right: 1px solid #fde68a;
          border-bottom: 1px solid #fde68a;
        }
        .order-table-staff .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) {
           border-right: none;
        }
        .order-table-staff .ant-table-tbody > tr:hover > td {
          background-color: #fcd34d !important;
        }
        .order-table-staff .ant-table-tbody > tr.even-row-order > td.ant-table-cell-fix-right,
        .order-table-staff .ant-table-tbody > tr.odd-row-order > td.ant-table-cell-fix-right,
        .order-table-staff .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right {
           background: inherit !important;
        }
        .order-table-staff .ant-table-column-sorters .ant-table-column-sorter {
           color: #92400e !important;
        }
        .order-table-staff .ant-table-filter-column .anticon-filter {
           color: #92400e !important;
        }
        .order-search .ant-input-outlined input::placeholder {
           color: #d97706 !important;
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
            background: #fefce8 !important;
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
            color: "#92400e",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Quản lý Đơn hàng
        </h1>
        <Card
          style={{
            background: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 6px 16px rgba(146, 64, 14, 0.08)",
            padding: "16px 24px",
            border: `1px solid #fde68a`,
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
                prefix={<SearchOutlined style={{ color: "#92400e" }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  width: 280,
                  borderRadius: 6,
                  borderColor: "#fde68a",
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fefce8",
                }}
                allowClear
              />
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
              border: `1px solid #fde68a`,
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
              Chi tiết đơn hàng
            </span>
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={1000}
          styles={{
            body: {
              background: "#fefce8",
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid #fde68a`,
              paddingBottom: 16,
              marginBottom: 0,
            },
          }}
          style={{ borderRadius: 12, top: 20 }}
        >
          {selectedOrder && (
            <Card
              style={{
                background: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(217, 119, 6, 0.08)",
                border: `1px solid #fde68a`,
                padding: 16,
              }}
            >
              <Descriptions
                bordered
                column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
                size="default"
                labelStyle={{
                  color: "#92400e",
                  fontWeight: 600,
                  background: "#fefce8",
                }}
                contentStyle={{ color: "#d97706", background: "#ffffff" }}
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
                      color: "#d97706",
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
                    {getFormattedPrice(selectedOrder.order_shipping_fee)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  <span style={{ color: "#d97706" }}>
                    {getFormattedPrice(selectedOrder.order_discount_value)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức thanh toán">
                  <span style={{ color: "#d97706" }}>
                    {selectedOrder.payment_method}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ giao hàng">
                  <span style={{ color: "#d97706" }}>
                    {selectedOrder.order_address}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <span style={{ color: "#d97706" }}>
                    {selectedOrder.phone_number}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Shipper">
                  <span style={{ color: "#d97706" }}>
                    {selectedOrder.assignToShipperId
                      ? shippers?.find(
                          (s) => s.id === selectedOrder.assignToShipperId
                        )?.fullName || ""
                      : ""}
                  </span>
                </Descriptions.Item>
                {selectedOrder.note && (
                  <Descriptions.Item label="Ghi chú" span={2}>
                    <span style={{ color: "#d97706" }}>
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
                          <span style={{ color: "#d97706" }}>{text}</span>
                        ),
                      },
                      {
                        title: "Số lượng",
                        dataIndex: "quantity",
                        key: "quantity",
                        align: "center" as const,
                        render: (text: number) => (
                          <span style={{ color: "#d97706" }}>{text}</span>
                        ),
                      },
                      {
                        title: "Đơn giá",
                        dataIndex: "price",
                        key: "price",
                        align: "center" as const,
                        render: (price: number) => (
                          <span style={{ color: "#d97706" }}>
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
                          <span style={{ color: "#d97706", fontWeight: 500 }}>
                            {(item.quantity * item.price).toLocaleString()}đ
                          </span>
                        ),
                      },
                    ]}
                    pagination={false}
                    rowKey="orderId"
                    size="small"
                    style={{
                      background: "#ffffff",
                      borderRadius: 8,
                      border: `1px solid #fde68a`,
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
              Chọn Shipper Giao Hàng
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
                borderColor: "#fde68a",
                color: "#d97706",
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
                background: "#fcd34d",
                borderColor: "#fcd34d",
                borderRadius: 6,
              }}
            >
              Xác nhận
            </Button>,
          ]}
          styles={{
            body: {
              background: "#fefce8",
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid #fde68a`,
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
              border: "#fde68a",
              background: "#ffffff",
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

        <Modal
          title={
            <span style={{ color: "#d97706", fontWeight: 700, fontSize: 22 }}>
              Tải lên Chứng từ Hoàn tiền
            </span>
          }
          centered
          open={isUploadModalVisible}
          onCancel={() => {
            setIsUploadModalVisible(false);
            setSelectedFile(null);
            setFileList([]);
          }}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setIsUploadModalVisible(false);
                setSelectedFile(null);
                setFileList([]);
              }}
              style={{
                borderRadius: 6,
                borderColor: "#fde68a",
                color: "#d97706",
              }}
            >
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              disabled={!fileList.length || !currentOrderId}
              onClick={handleUploadSubmit}
              style={{
                background: "#fcd34d",
                borderColor: "#fcd34d",
                borderRadius: 6,
              }}
            >
              Tải lên
            </Button>,
          ]}
          styles={{
            body: {
              background: "#fefce8",
              borderRadius: "0 0 12px 12px",
              padding: "24px",
            },
            header: {
              borderBottom: `1px solid #fde68a`,
              paddingBottom: 16,
              marginBottom: 0,
            },
          }}
          className="modal-upload-refund"
          style={{ borderRadius: 12, top: 20 }}
        >
          {selectedOrder && selectedOrder.bankAccounts.length > 0 && (
            <>
              <Input
                value={selectedOrder.bankAccounts[0].bankName}
                disabled
                style={{
                  width: "100%",
                  borderRadius: 6,
                  borderColor: "#fde68a",
                  background: "#ffffff",
                  color: "black",
                  fontWeight: 600,
                }}
                placeholder="Tên ngân hàng"
              />
              <Input
                value={selectedOrder.bankAccounts[0].bankNumber}
                disabled
                style={{
                  marginTop: 8,
                  width: "100%",
                  borderRadius: 6,
                  borderColor: "#fde68a",
                  background: "#ffffff",
                  color: "black",
                  fontWeight: 600,
                }}
                placeholder="Số tài khoản"
              />
            </>
          )}
          <Upload
            beforeUpload={() => false}
            onChange={handleFileChange}
            fileList={fileList}
            accept="image/*"
            style={{ marginTop: 8 }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn file ảnh</Button>
          </Upload>
        </Modal>
      </div>
    </div>
  );
};

export default StaffOrderManagement;
