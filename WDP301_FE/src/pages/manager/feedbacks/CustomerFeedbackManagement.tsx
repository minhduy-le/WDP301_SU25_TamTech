import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Card,
  Modal,
  Form,
  Space,
  Tag,
  message,
  Tooltip,
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  MessageOutlined, // Icon cho phản hồi
  SendOutlined, // Icon cho gửi trả lời
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TagOutlined, // For feedback type
  InfoCircleOutlined, // For status
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const { Option } = Select;
const { TextArea } = Input;

type FeedbackStatus = "new" | "in_progress" | "resolved" | "closed";
type FeedbackType = "complaint" | "suggestion" | "compliment" | "inquiry";

interface Feedback {
  feedbackId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  feedbackType: FeedbackType;
  subject: string;
  content: string;
  receivedDate: string;
  status: FeedbackStatus;
  replyContent?: string;
  repliedDate?: string;
  repliedBy?: string;
}

const FEEDBACK_TYPES_MAP: Record<FeedbackType, string> = {
  complaint: "Khiếu nại",
  suggestion: "Góp ý",
  compliment: "Khen ngợi",
  inquiry: "Hỏi đáp/Thắc mắc",
};

const FEEDBACK_STATUS_MAP: Record<FeedbackStatus, string> = {
  new: "Mới",
  in_progress: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};
const ALL_FEEDBACK_TYPES = Object.keys(FEEDBACK_TYPES_MAP) as FeedbackType[];
const ALL_FEEDBACK_STATUSES = Object.keys(
  FEEDBACK_STATUS_MAP
) as FeedbackStatus[];

const initialFeedbackData: Feedback[] = [
  {
    feedbackId: "FB001",
    customerName: "Trần Văn Hoàng",
    customerEmail: "hoang.tv@example.com",
    feedbackType: "complaint",
    subject: "Chất lượng sản phẩm ABC không tốt",
    content:
      "Tôi đã mua sản phẩm ABC vào ngày hôm qua và rất thất vọng về chất lượng. Sản phẩm có vẻ như đã qua sử dụng và không hoạt động đúng như mô tả. Mong cửa hàng xem xét.",
    receivedDate: dayjs().subtract(2, "day").toISOString(),
    status: "new",
  },
  {
    feedbackId: "FB002",
    customerName: "Lê Thị Mai",
    customerPhone: "0987654321",
    feedbackType: "suggestion",
    subject: "Góp ý về giao diện website",
    content:
      "Giao diện website của quý công ty rất đẹp, tuy nhiên tôi nghĩ phần tìm kiếm sản phẩm có thể cải thiện để dễ sử dụng hơn, ví dụ thêm bộ lọc theo giá.",
    receivedDate: dayjs().subtract(1, "day").toISOString(),
    status: "in_progress",
    replyContent:
      "Cảm ơn chị Mai về góp ý quý báu. Chúng tôi đã ghi nhận và sẽ xem xét cải thiện trong thời gian tới.",
    repliedDate: dayjs().subtract(12, "hour").toISOString(),
    repliedBy: "CSKH Team",
  },
  {
    feedbackId: "FB003",
    customerName: "Phạm Minh Tuấn",
    customerEmail: "tuan.pm@example.com",
    feedbackType: "compliment",
    subject: "Rất hài lòng về dịch vụ",
    content:
      "Nhân viên tư vấn rất nhiệt tình và chuyên nghiệp. Tôi rất hài lòng với trải nghiệm mua sắm tại cửa hàng. Sẽ tiếp tục ủng hộ!",
    receivedDate: dayjs().subtract(3, "day").toISOString(),
    status: "resolved",
    replyContent:
      "Cảm ơn anh Tuấn đã tin tưởng và ủng hộ! Chúng tôi rất vui khi được phục vụ anh.",
    repliedDate: dayjs().subtract(2, "day").toISOString(),
    repliedBy: "Quản lý cửa hàng",
  },
  {
    feedbackId: "FB004",
    customerName: "Vũ Thị Lan Anh",
    feedbackType: "inquiry",
    subject: "Hỏi về chính sách bảo hành",
    content:
      "Tôi muốn hỏi rõ hơn về chính sách bảo hành cho sản phẩm XYZ. Thời gian bảo hành là bao lâu và quy trình như thế nào?",
    receivedDate: dayjs().subtract(5, "hour").toISOString(),
    status: "new",
  },
];

const CustomerFeedbackManagement: React.FC = () => {
  const [feedbackList, setFeedbackList] =
    useState<Feedback[]>(initialFeedbackData);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");
  const [filterType, setFilterType] = useState<string>("Tất cả");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  const [replyForm] = Form.useForm();
  const [tableLoading, setTableLoading] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  useEffect(() => {
    setTableLoading(true);
    setTimeout(() => {
      setFeedbackList(initialFeedbackData);
      setTableLoading(false);
    }, 300);
  }, []);

  const handleViewReply = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    replyForm.setFieldsValue({
      replyContent: feedback.replyContent || "",
      status: feedback.status,
    });
    setModalVisible(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedFeedback) return;
    setIsSubmittingReply(true);
    try {
      const values = await replyForm.validateFields();
      const updatedFeedback: Feedback = {
        ...selectedFeedback,
        replyContent: values.replyContent,
        status: values.status,
        repliedDate: dayjs().toISOString(),
        repliedBy: "Admin", // Hoặc lấy từ user đang đăng nhập
      };

      setFeedbackList((prev) =>
        prev.map((fb) =>
          fb.feedbackId === updatedFeedback.feedbackId ? updatedFeedback : fb
        )
      );
      message.success("Đã gửi trả lời và cập nhật trạng thái!");
      setModalVisible(false);
      replyForm.resetFields();
    } catch (error) {
      message.error("Lỗi khi gửi trả lời. Vui lòng thử lại.");
      console.error("Reply submit error:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusTagColor = (status: FeedbackStatus) => {
    switch (status) {
      case "new":
        return "#F9E4B7"; // Vàng nhạt
      case "in_progress":
        return "#FAD2A5"; // Cam nhạt
      case "resolved":
        return "#C8E6C9"; // Xanh lá nhạt
      case "closed":
        return "#CFD8DC"; // Xám nhạt
      default:
        return "default";
    }
  };
  const getStatusTagTextColor = (status: FeedbackStatus) => {
    switch (status) {
      case "new":
      case "in_progress":
        return "#A05A2C";
      case "resolved":
        return "#388E3C";
      case "closed":
        return "#455A64";
      default:
        return "#000";
    }
  };

  const filteredFeedbackList = useMemo(() => {
    return feedbackList
      .filter((fb) => {
        const searchTextLower = searchText.toLowerCase();
        return (
          fb.customerName.toLowerCase().includes(searchTextLower) ||
          fb.subject.toLowerCase().includes(searchTextLower) ||
          (fb.customerEmail &&
            fb.customerEmail.toLowerCase().includes(searchTextLower)) ||
          fb.content.toLowerCase().includes(searchTextLower.substring(0, 50))
        );
      })
      .filter((fb) => filterStatus === "Tất cả" || fb.status === filterStatus)
      .filter(
        (fb) => filterType === "Tất cả" || fb.feedbackType === filterType
      );
  }, [feedbackList, searchText, filterStatus, filterType]);

  const headerColor = "#A05A2C";
  const headerBgColor = "#F9E4B7";
  const evenRowBgColor = "#FFFDF5";
  const oddRowBgColor = "#FFF7E6";
  const cellTextColor = "#5D4037";
  const borderColor = "#F5EAD9";
  const tableBorderColor = "#E9C97B";

  const columns = [
    {
      title: "Khách hàng",
      dataIndex: "customerName",
      key: "customerName",
      width: 180,
      ellipsis: true,
      sorter: (a: Feedback, b: Feedback) =>
        a.customerName.localeCompare(b.customerName),
      render: (name: string) => <span style={{ fontWeight: 500 }}>{name}</span>,
    },
    {
      title: "Loại P.Hồi",
      dataIndex: "feedbackType",
      key: "feedbackType",
      width: 150,
      render: (type: FeedbackType) => (
        <Tag
          color={
            type === "complaint"
              ? "volcano"
              : type === "suggestion"
              ? "geekblue"
              : type === "compliment"
              ? "green"
              : "cyan"
          }
        >
          {FEEDBACK_TYPES_MAP[type]}
        </Tag>
      ),
      filters: ALL_FEEDBACK_TYPES.map((ft) => ({
        text: FEEDBACK_TYPES_MAP[ft],
        value: ft,
      })),
      onFilter: (value: string | number | boolean, record: Feedback) =>
        record.feedbackType === value,
    },
    {
      title: "Chủ đề",
      dataIndex: "subject",
      key: "subject",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Ngày nhận",
      dataIndex: "receivedDate",
      key: "receivedDate",
      width: 150,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a: Feedback, b: Feedback) =>
        dayjs(a.receivedDate).unix() - dayjs(b.receivedDate).unix(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      align: "center" as const,
      render: (status: FeedbackStatus) => (
        <Tag
          style={{
            background: getStatusTagColor(status),
            color: getStatusTagTextColor(status),
            fontWeight: "bold",
            borderRadius: 6,
            padding: "2px 10px",
          }}
        >
          {FEEDBACK_STATUS_MAP[status]}
        </Tag>
      ),
      filters: ALL_FEEDBACK_STATUSES.map((fs) => ({
        text: FEEDBACK_STATUS_MAP[fs],
        value: fs,
      })),
      onFilter: (value: string | number | boolean, record: Feedback) =>
        record.status === value,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      align: "center" as const,
      render: (_: any, record: Feedback) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewReply(record)}
          style={{
            color: "#D97B41",
            fontWeight: 600,
            padding: 0,
            outline: "none",
            boxShadow: "none",
            border: "none",
          }}
        >
          Xem & Trả lời
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
        .feedback-table .ant-table-thead > tr > th,
        .feedback-table .ant-table-thead > tr > th.ant-table-cell-fix-right,
        .feedback-table .ant-table-thead > tr > th.ant-table-cell-fix-left {
          background-color: ${headerBgColor} !important;
          color: ${headerColor} !important;
          font-weight: bold !important;
          border-right: 1px solid ${borderColor} !important;
          border-bottom: 2px solid ${tableBorderColor} !important;
        }
        .feedback-table .ant-table-thead > tr > th:last-child { border-right: none !important; }
        .feedback-table .ant-table-thead > tr > th.ant-table-cell-fix-right.ant-table-cell-fix-right-last { border-right: none !important; }
        .feedback-table .ant-table-tbody > tr.even-row-feedback > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .feedback-table .ant-table-tbody > tr.odd-row-feedback > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .feedback-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .feedback-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .feedback-table .ant-table-tbody > tr.even-row-feedback > td.ant-table-cell-fix-right,
        .feedback-table .ant-table-tbody > tr.odd-row-feedback > td.ant-table-cell-fix-right,
        .feedback-table .ant-table-tbody > tr:hover > td.ant-table-cell-fix-right { background: inherit !important; }
      `}</style>

      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <h1
          style={{
            fontWeight: 800,
            color: "#A05A2C",
            fontSize: 36,
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          Phản hồi Khách hàng
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
          <div
            style={{
              marginBottom: 24,
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Tìm kiếm tên KH, chủ đề, email..."
              prefix={<SearchOutlined style={{ color: "#A05A2C" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: 300,
                borderRadius: 6,
                borderColor: "#E9C97B",
                background: "#FFF9F0",
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              allowClear
            />
            <Select
              value={filterType}
              style={{ width: 200, borderRadius: 6 }}
              onChange={(value) => setFilterType(value)}
              placeholder="Lọc theo loại"
            >
              <Option value="Tất cả">Tất cả loại</Option>
              {ALL_FEEDBACK_TYPES.map((type) => (
                <Option key={type} value={type}>
                  {FEEDBACK_TYPES_MAP[type]}
                </Option>
              ))}
            </Select>
            <Select
              value={filterStatus}
              style={{ width: 200, borderRadius: 6 }}
              onChange={(value) => setFilterStatus(value)}
              placeholder="Lọc theo trạng thái"
            >
              <Option value="Tất cả">Tất cả trạng thái</Option>
              {ALL_FEEDBACK_STATUSES.map((status) => (
                <Option key={status} value={status}>
                  {FEEDBACK_STATUS_MAP[status]}
                </Option>
              ))}
            </Select>
          </div>

          <Table
            className="feedback-table"
            columns={columns as ColumnType<Feedback>[]}
            dataSource={filteredFeedbackList}
            loading={tableLoading}
            rowKey="feedbackId"
            pagination={{
              pageSize: 8,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} phản hồi`,
            }}
            style={{
              borderRadius: 8,
              border: `1px solid ${tableBorderColor}`,
              overflow: "hidden",
            }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? "even-row-feedback" : "odd-row-feedback"
            }
            scroll={{ x: 1000 }}
            sticky
          />
        </Card>

        <Modal
          open={modalVisible}
          title={
            <span style={{ color: "#D97B41", fontWeight: 700, fontSize: 22 }}>
              Chi tiết & Trả lời Phản hồi
            </span>
          }
          onCancel={() => {
            setModalVisible(false);
            replyForm.resetFields();
          }}
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
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setModalVisible(false);
                replyForm.resetFields();
              }}
              style={{ borderRadius: 6 }}
              disabled={isSubmittingReply}
            >
              {" "}
              Hủy{" "}
            </Button>,
            <Button
              key="submitReply"
              type="primary"
              icon={<SendOutlined />}
              onClick={handleReplySubmit}
              style={{
                background: "#D97B41",
                borderColor: "#D97B41",
                borderRadius: 6,
              }}
              loading={isSubmittingReply}
            >
              {" "}
              Gửi trả lời & Cập nhật{" "}
            </Button>,
          ]}
        >
          {selectedFeedback && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <Card
                title={
                  <span style={{ color: "#A05A2C" }}>Thông tin Phản hồi</span>
                }
                bordered={false}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: `1px solid ${tableBorderColor}`,
                }}
              >
                <Descriptions
                  bordered
                  column={1}
                  size="default"
                  labelStyle={{
                    color: "#A05A2C",
                    fontWeight: 600,
                    background: "#FFF9F0",
                    width: "180px",
                  }}
                  contentStyle={{ color: cellTextColor, background: "#FFFFFF" }}
                >
                  <Descriptions.Item label="Khách hàng">
                    {selectedFeedback.customerName}
                  </Descriptions.Item>
                  {selectedFeedback.customerEmail && (
                    <Descriptions.Item label="Email">
                      {selectedFeedback.customerEmail}
                    </Descriptions.Item>
                  )}
                  {selectedFeedback.customerPhone && (
                    <Descriptions.Item label="Số điện thoại">
                      {selectedFeedback.customerPhone}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Loại phản hồi">
                    {FEEDBACK_TYPES_MAP[selectedFeedback.feedbackType]}
                  </Descriptions.Item>
                  <Descriptions.Item label="Chủ đề">
                    {selectedFeedback.subject}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày nhận">
                    {dayjs(selectedFeedback.receivedDate).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Nội dung phản hồi"
                    span={1}
                    contentStyle={{ whiteSpace: "pre-wrap" }}
                  >
                    {selectedFeedback.content}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái hiện tại">
                    <Tag
                      style={{
                        background: getStatusTagColor(selectedFeedback.status),
                        color: getStatusTagTextColor(selectedFeedback.status),
                        fontWeight: "bold",
                        borderRadius: 6,
                        padding: "2px 10px",
                      }}
                    >
                      {FEEDBACK_STATUS_MAP[selectedFeedback.status]}
                    </Tag>
                  </Descriptions.Item>
                  {selectedFeedback.replyContent && (
                    <>
                      <Descriptions.Item
                        label="Nội dung đã trả lời"
                        span={1}
                        contentStyle={{
                          whiteSpace: "pre-wrap",
                          background: "#FFFBE6",
                        }}
                      >
                        {selectedFeedback.replyContent}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trả lời bởi">
                        {selectedFeedback.repliedBy}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày trả lời">
                        {dayjs(selectedFeedback.repliedDate).format(
                          "DD/MM/YYYY HH:mm:ss"
                        )}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>
              <Card
                title={
                  <span style={{ color: "#A05A2C" }}>Trả lời & Cập nhật</span>
                }
                bordered={false}
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: `1px solid ${tableBorderColor}`,
                }}
              >
                <Form form={replyForm} layout="vertical">
                  <Form.Item
                    name="replyContent"
                    label="Nội dung trả lời"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập nội dung trả lời!",
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder="Nhập nội dung phản hồi cho khách hàng..."
                    />
                  </Form.Item>
                  <Form.Item
                    name="status"
                    label="Cập nhật trạng thái"
                    initialValue={selectedFeedback.status}
                    rules={[
                      { required: true, message: "Vui lòng chọn trạng thái!" },
                    ]}
                  >
                    <Select placeholder="Chọn trạng thái mới cho phản hồi">
                      {ALL_FEEDBACK_STATUSES.map((statusKey) => (
                        <Option key={statusKey} value={statusKey}>
                          {FEEDBACK_STATUS_MAP[statusKey]}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Form>
              </Card>
            </Space>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CustomerFeedbackManagement;
