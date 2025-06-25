/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
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
  Descriptions,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  SendOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { ColumnType } from "antd/es/table";
import {
  useFeedbacks,
  type FeedbackDto,
  useResponseFeedback,
} from "../../../hooks/feedbacksApi";
import { useQueryClient } from "@tanstack/react-query";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault(dayjs.tz.guess());

const { Option } = Select;
const { TextArea } = Input;

const CustomerFeedbackManagement = () => {
  const { data: feedbacks, isLoading: isFeedbackLoading } = useFeedbacks();
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Tất cả");
  // const [filterType, setFilterType] = useState<string>("Tất cả");

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackDto | null>(
    null
  );

  const [replyForm] = Form.useForm();
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const queryClient = useQueryClient();
  const { mutate: respondFeedback, isPending: isResponding } =
    useResponseFeedback();

  const handleViewReply = (feedback: FeedbackDto) => {
    setSelectedFeedback(feedback);
    replyForm.setFieldsValue({
      replyContent: feedback.FeedbackResponses?.[0]?.content || "",
    });
    setModalVisible(true);
  };

  const handleReplySubmit = async () => {
    if (!selectedFeedback) return;
    setIsSubmittingReply(true);
    try {
      const values = await replyForm.validateFields();
      respondFeedback(
        {
          feedbackId: selectedFeedback.id,
          responseFeedback: { content: values.replyContent },
        },
        {
          onSuccess: (data) => {
            // Đảm bảo dữ liệu trả về có FeedbackResponses và RepliedBy đầy đủ
            const updatedFeedback: FeedbackDto = {
              ...data,
              FeedbackResponses: data.FeedbackResponses || [
                {
                  id: selectedFeedback.FeedbackResponses?.[0]?.id || 0,
                  feedbackId: selectedFeedback.id,
                  repliedBy:
                    selectedFeedback.FeedbackResponses?.[0]?.repliedBy || 0,
                  content: values.replyContent,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  RepliedBy: selectedFeedback.FeedbackResponses?.[0]
                    ?.RepliedBy || {
                    id: 0,
                    fullName: "Admin",
                  },
                },
              ],
            };
            setSelectedFeedback(updatedFeedback); // Cập nhật selectedFeedback với dữ liệu mới
            message.success("Đã gửi trả lời và cập nhật trạng thái!");
            setModalVisible(false);
            replyForm.resetFields();
            queryClient.refetchQueries({ queryKey: ["feedback"] }); // Làm mới dữ liệu bảng
          },
          onError: (error) => {
            message.error("Lỗi khi gửi trả lời. Vui lòng thử lại.");
            console.error("Reply submit error:", error);
          },
        }
      );
    } catch (error) {
      message.error("Lỗi khi gửi trả lời. Vui lòng thử lại.");
      console.error("Reply submit error:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusTagColor = (isResponsed: boolean) => {
    return isResponsed ? "#C8E6C9" : "#FFCDD2"; // Xanh nhạt cho Đã phản hồi, đỏ nhạt cho Chưa phản hồi
  };

  const getStatusTagTextColor = (isResponsed: boolean) => {
    return isResponsed ? "#388E3C" : "#C62828"; // Xanh đậm cho Đã phản hồi, đỏ đậm cho Chưa phản hồi
  };

  const filteredFeedbackList = useMemo(() => {
    if (!feedbacks) return [];
    return feedbacks
      .filter((fb) => {
        const searchTextLower = searchText.toLowerCase();
        return (
          fb.User.fullName.toString().toLowerCase().includes(searchTextLower) ||
          fb.comment.toLowerCase().includes(searchTextLower.substring(0, 50))
        );
      })
      .filter(
        (fb) =>
          filterStatus === "Tất cả" ||
          fb.isResponsed.toString() === filterStatus
      );
    // .filter(
    //   (fb) => filterType === "Tất cả" || fb.rating.toString() === filterType // Cần ánh xạ hợp lý hơn nếu có loại phản hồi
    // );
  }, [feedbacks, searchText, filterStatus]);

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
      dataIndex: "orderId",
      key: "orderId",
      width: 100,
      sorter: (a: FeedbackDto, b: FeedbackDto) => a.orderId - b.orderId,
    },
    {
      title: "Khách hàng",
      dataIndex: ["User", "fullName"],
      key: "customerName",
      width: 130,
      ellipsis: true,
      sorter: (a: FeedbackDto, b: FeedbackDto) =>
        a.User.fullName.toString().localeCompare(b.User.fullName.toString()),
      render: (name: number) => (
        <span style={{ fontWeight: 500 }}>{name.toString()}</span>
      ),
    },
    {
      title: "Sản phẩm",
      dataIndex: ["Product", "name"],
      key: "productName",
      width: 150,
      sorter: (a: FeedbackDto, b: FeedbackDto) =>
        a.Product.name.toString().localeCompare(b.Product.name.toString()),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      width: 250,
      ellipsis: true,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: Date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
      sorter: (a: FeedbackDto, b: FeedbackDto) =>
        dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: "Trạng thái",
      dataIndex: "isResponsed",
      key: "isResponsed",
      width: 150,
      align: "center",
      render: (isResponsed: boolean) => (
        <Tag
          style={{
            background: getStatusTagColor(isResponsed),
            color: getStatusTagTextColor(isResponsed),
            fontWeight: "bold",
            borderRadius: 6,
            padding: "2px 10px",
          }}
        >
          {isResponsed ? "Đã phản hồi" : "Chưa phản hồi"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 150,
      // fixed: "right",
      align: "center",
      render: (_: any, record: FeedbackDto) => (
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
        padding: "5px 30px 30px 60px",
      }}
    >
      <style>{`
        .ant-table-thead > tr > th { background-color: ${headerBgColor} !important; color: ${headerColor} !important; font-weight: bold !important; border-right: 1px solid ${borderColor} !important; border-bottom: 2px solid ${tableBorderColor} !important; }
        .ant-table-thead > tr > th.ant-table-cell-fix-right:last-child { border-right: none !important; }
        .feedback-table .ant-table-tbody > tr.even-row-feedback > td { background-color: ${evenRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .feedback-table .ant-table-tbody > tr.odd-row-feedback > td { background-color: ${oddRowBgColor}; color: ${cellTextColor}; border-right: 1px solid ${borderColor}; border-bottom: 1px solid ${borderColor}; }
        .feedback-table .ant-table-tbody > tr > td:last-child:not(.ant-table-selection-column) { border-right: none; }
        .feedback-table .ant-table-tbody > tr:hover > td { background-color: #FDEBC8 !important; }
        .feedback-table .ant-table-cell-fix-right { background: inherit !important; }
        .feedback-table .ant-table-thead > tr > th.ant-table-cell-fix-right { background-color: ${headerBgColor} !important; }
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
            marginTop: 15,
          }}
        >
          Phản hồi Khách hàng <CommentOutlined />
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
              placeholder="Tìm kiếm tên KH"
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
            {/* <Select
              value={filterType}
              style={{ width: 200, borderRadius: 6 }}
              onChange={(value) => setFilterType(value)}
              placeholder="Lọc theo loại"
            >
              <Option value="Tất cả">Tất cả loại</Option>
            </Select> */}
            <Select
              value={filterStatus}
              style={{ width: 200, borderRadius: 6 }}
              onChange={(value) => setFilterStatus(value)}
              placeholder="Lọc theo trạng thái"
            >
              <Option value="Tất cả">Tất cả trạng thái</Option>
              <Option value="true">Đã phản hồi</Option>
              <Option value="false">Chưa phản hồi</Option>
            </Select>
          </div>

          <Table
            className="feedback-table"
            columns={columns as ColumnType<FeedbackDto>[]}
            dataSource={filteredFeedbackList}
            loading={isFeedbackLoading}
            rowKey="id"
            pagination={{
              pageSize: 5,
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
              disabled={isSubmittingReply || isResponding}
            >
              Hủy
            </Button>,
            !selectedFeedback?.FeedbackResponses?.[0]?.content && (
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
                loading={isSubmittingReply || isResponding}
              >
                Gửi trả lời & Cập nhật
              </Button>
            ),
          ].filter(Boolean)}
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
                    {selectedFeedback.User.fullName.toString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Comment">
                    {selectedFeedback.comment}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {dayjs(selectedFeedback.createdAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item
                    label="Nội dung phản hồi"
                    span={1}
                    contentStyle={{ whiteSpace: "pre-wrap" }}
                  >
                    {selectedFeedback.comment}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      style={{
                        background: getStatusTagColor(
                          selectedFeedback.isResponsed
                        ),
                        color: getStatusTagTextColor(
                          selectedFeedback.isResponsed
                        ),
                        fontWeight: "bold",
                        borderRadius: 6,
                        padding: "2px 10px",
                      }}
                    >
                      {selectedFeedback.isResponsed
                        ? "Đã phản hồi"
                        : "Chưa phản hồi"}
                    </Tag>
                  </Descriptions.Item>
                  {selectedFeedback.FeedbackResponses?.[0]?.content && (
                    <>
                      <Descriptions.Item
                        label="Nội dung đã trả lời"
                        span={1}
                        contentStyle={{
                          whiteSpace: "pre-wrap",
                          background: "#FFFBE6",
                        }}
                      >
                        {selectedFeedback.FeedbackResponses[0].content}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trả lời bởi">
                        {selectedFeedback.FeedbackResponses[0]?.RepliedBy
                          ?.fullName || "Admin"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày trả lời">
                        {dayjs(
                          selectedFeedback.FeedbackResponses[0].createdAt
                        ).format("DD/MM/YYYY HH:mm:ss")}
                      </Descriptions.Item>
                    </>
                  )}
                </Descriptions>
              </Card>
              {!selectedFeedback.FeedbackResponses?.[0]?.content && (
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
                  </Form>
                </Card>
              )}
            </Space>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default CustomerFeedbackManagement;
