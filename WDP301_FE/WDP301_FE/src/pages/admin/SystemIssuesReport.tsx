import React, { useState, useEffect } from "react";
import {
  Table,
  Space,
  Modal,
  Tag,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Input,
} from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import spinTamTac from "../../assets/spinTamTac.json";
import Lottie from "lottie-react";

interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  content: string;
  status: "pending" | "in_progress" | "resolved";
  createdAt: string;
  updatedAt: string;
  priority: "low" | "medium" | "high";
  category: string;
}

const ScopedGreenStyles = () => (
  <style>{`
    /* ĐỔI MÀU PHÂN TRANG VÀ PLACEHOLDER TÌM KIẾM TOÀN TRANG */
    .ant-pagination .ant-pagination-item-active {
      border-color: #4CAF50 !important;
    }
    .ant-pagination .ant-pagination-item-active a {
      color: #4CAF50 !important;
    }
    .ant-pagination .ant-pagination-item-active:hover {
      border-color: #388e3c !important;
    }
    .ant-pagination .ant-pagination-item-active a:hover {
      color: #388e3c !important;
    }
    input[placeholder="Tìm kiếm theo tiêu đề, người gửi, nội dung..."] {
      color: #4CAF50 !important;
    }
    input[placeholder="Tìm kiếm theo tiêu đề, người gửi, nội dung..."]::placeholder {
      color: #4CAF50 !important;
      opacity: 1;
    }
  `}</style>
);

const SystemIssuesReport: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [filteredInfo, setFilteredInfo] = useState<Record<string, FilterValue | null>>({});
  const [sortedInfo, setSortedInfo] = useState<SorterResult<Report>>({});

  // Fake data
  const fakeReports: Report[] = [
    {
      id: "1",
      userId: "user1",
      userName: "Nguyễn Văn A",
      userEmail: "nguyenvana@example.com",
      title: "Lỗi không thể đăng nhập",
      content: "Tôi không thể đăng nhập vào tài khoản của mình. Hệ thống hiển thị lỗi 'Invalid credentials' mặc dù tôi đã nhập đúng thông tin.",
      status: "pending",
      createdAt: "2024-03-15T08:30:00Z",
      updatedAt: "2024-03-15T08:30:00Z",
      priority: "high",
      category: "bug"
    },
    {
      id: "2",
      userId: "user2",
      userName: "Trần Thị B",
      userEmail: "tranthib@example.com",
      title: "Đề xuất tính năng mới",
      content: "Tôi muốn đề xuất thêm tính năng lưu địa chỉ giao hàng để không phải nhập lại mỗi lần đặt hàng.",
      status: "in_progress",
      createdAt: "2024-03-14T15:45:00Z",
      updatedAt: "2024-03-15T09:20:00Z",
      priority: "medium",
      category: "feature"
    },
    {
      id: "3",
      userId: "user3",
      userName: "Lê Văn C",
      userEmail: "levanc@example.com",
      title: "Góp ý về giao diện",
      content: "Giao diện trang web rất đẹp nhưng tôi nghĩ nên thêm chế độ tối (dark mode) để người dùng có thể chọn.",
      status: "resolved",
      createdAt: "2024-03-13T10:15:00Z",
      updatedAt: "2024-03-14T16:30:00Z",
      priority: "low",
      category: "feedback"
    },
    {
      id: "4",
      userId: "user4",
      userName: "Phạm Thị D",
      userEmail: "phamthid@example.com",
      title: "Lỗi hiển thị giá sản phẩm",
      content: "Giá sản phẩm hiển thị không đúng, có sự chênh lệch giữa giá hiển thị và giá khi thanh toán.",
      status: "pending",
      createdAt: "2024-03-15T11:20:00Z",
      updatedAt: "2024-03-15T11:20:00Z",
      priority: "high",
      category: "bug"
    },
    {
      id: "5",
      userId: "user5",
      userName: "Hoàng Văn E",
      userEmail: "hoangvane@example.com",
      title: "Đề xuất cải thiện UX",
      content: "Nên thêm tính năng tìm kiếm nâng cao với bộ lọc theo nhiều tiêu chí khác nhau.",
      status: "in_progress",
      createdAt: "2024-03-14T09:30:00Z",
      updatedAt: "2024-03-15T10:15:00Z",
      priority: "medium",
      category: "feature"
    }
  ];

  useEffect(() => {
    // Simulate API call with setTimeout
    setLoading(true);
    setTimeout(() => {
      setReports(fakeReports);
      setLoading(false);
      message.success("Tải danh sách báo cáo thành công!");
    }, 1000);
  }, []);

  const handleChange: TableProps<Report>["onChange"] = (
    _pagination,
    filters,
    sorter,
    _extra
  ) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter as SorterResult<Report>);
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsModalVisible(true);
  };

  const handleUpdateStatus = async (reportId: string, newStatus: Report["status"]) => {
    // Simulate API call
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );

      message.success("Cập nhật trạng thái báo cáo thành công!");
    } catch (error) {
      console.error("Error updating report status:", error);
      message.error("Không thể cập nhật trạng thái báo cáo");
    }
  };

  const columns: ColumnsType<Report> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
      sorter: (a, b) => a.id.localeCompare(b.id),
      sortOrder: sortedInfo.columnKey === "id" ? sortedInfo.order : null,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      width: 200,
      align: "center",
      sorter: (a, b) => a.title.localeCompare(b.title),
      sortOrder: sortedInfo.columnKey === "title" ? sortedInfo.order : null,
    },
    {
      title: "Người gửi",
      dataIndex: "userName",
      key: "userName",
      width: 160,
      align: "center",
      render: (_, record) => (
        <div>
          <div>{record.userName}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      align: "center",
      filters: [
        { text: "Bug", value: "bug" },
        { text: "Feature Request", value: "feature" },
        { text: "Feedback", value: "feedback" },
        { text: "Other", value: "other" },
      ],
      filteredValue: filteredInfo.category || null,
      onFilter: (value, record) => record.category === value,
    },
    {
      title: "Độ ưu tiên",
      dataIndex: "priority",
      key: "priority",
      width: 120,
      align: "center",
      render: (priority: Report["priority"]) => {
        const colorMap = {
          low: "green",
          medium: "orange",
          high: "red",
        };
        return <Tag color={colorMap[priority]}>{priority.toUpperCase()}</Tag>;
      },
      filters: [
        { text: "Low", value: "low" },
        { text: "Medium", value: "medium" },
        { text: "High", value: "high" },
      ],
      filteredValue: filteredInfo.priority || null,
      onFilter: (value, record) => record.priority === value,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      align: "center",
      render: (status: Report["status"]) => {
        const statusConfig = {
          pending: { color: "orange", icon: <ClockCircleOutlined />, text: "Chờ xử lý" },
          in_progress: { color: "blue", icon: <ExclamationCircleOutlined />, text: "Đang xử lý" },
          resolved: { color: "green", icon: <CheckCircleOutlined />, text: "Đã xử lý" },
        };
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "Chờ xử lý", value: "pending" },
        { text: "Đang xử lý", value: "in_progress" },
        { text: "Đã xử lý", value: "resolved" },
      ],
      filteredValue: filteredInfo.status || null,
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      align: "center",
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortOrder: sortedInfo.columnKey === "createdAt" ? sortedInfo.order : null,
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => handleViewReport(record)}
            style={{
              background: "#2E7D32",
              borderColor: "#2E7D32",
              borderRadius: "6px",
              outline: "none",
            }}
          >
            Chi tiết
          </Button>
          {record.status !== "resolved" && (
            <Button
              type="primary"
              onClick={() => handleUpdateStatus(record.id, "resolved")}
              style={{
                background: "#4CAF50",
                borderColor: "#4CAF50",
                borderRadius: "6px",
                outline: "none",
              }}
            >
              Đã xử lý
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter((report) => report.status === "pending").length,
    resolvedReports: reports.filter((report) => report.status === "resolved").length,
  };

  const displayedReports = reports.filter((report) => {
    const searchTextLower = searchText.toLowerCase();
    return (
      report.title.toLowerCase().includes(searchTextLower) ||
      report.userName.toLowerCase().includes(searchTextLower) ||
      report.userEmail.toLowerCase().includes(searchTextLower) ||
      report.content.toLowerCase().includes(searchTextLower)
    );
  });

  return (
    <div style={{ padding: "24px", position: "relative", minHeight: 600 }}>
      <ScopedGreenStyles />
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Lottie
            animationData={spinTamTac}
            loop={true}
            style={{ width: 200, height: 200 }}
          />
        </div>
      )}

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Tổng số báo cáo"
              value={stats.totalReports}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Báo cáo chờ xử lý"
              value={stats.pendingReports}
              prefix={<ClockCircleOutlined style={{ color: "orange" }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card bordered={false}>
            <Statistic
              title="Báo cáo đã xử lý"
              value={stats.resolvedReports}
              prefix={<CheckCircleOutlined style={{ color: "green" }} />}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <Input
            placeholder="Tìm kiếm theo tiêu đề, người gửi, nội dung..."
            prefix={<SearchOutlined style={{ color: "#2E7D32" }} />}
            style={{
              width: "300px",
              borderRadius: "20px",
              borderColor: "#4CAF50",
            }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={displayedReports}
          rowKey="id"
          scroll={{ x: 1300 }}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} báo cáo`,
          }}
          onChange={handleChange}
          locale={{
            emptyText: loading ? "Đang tải dữ liệu..." : "Không có dữ liệu",
          }}
        />
      </Card>

      <Modal
        title="Chi tiết báo cáo"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedReport(null);
        }}
        footer={null}
        
        width={700}
        style={{ top: 20 }}
      >
        {selectedReport && (
          <div style={{ padding: "20px" }}>
            <h2>{selectedReport.title}</h2>
            <div style={{ marginBottom: "20px" }}>
              <p>
                <strong>Người gửi:</strong> {selectedReport.userName} ({selectedReport.userEmail})
              </p>
              <p>
                <strong>Danh mục:</strong> {selectedReport.category}
              </p>
              <p>
                <strong>Độ ưu tiên:</strong>{" "}
                <Tag
                  color={
                    selectedReport.priority === "high"
                      ? "red"
                      : selectedReport.priority === "medium"
                      ? "orange"
                      : "green"
                  }
                >
                  {selectedReport.priority.toUpperCase()}
                </Tag>
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                <Tag
                  color={
                    selectedReport.status === "resolved"
                      ? "green"
                      : selectedReport.status === "in_progress"
                      ? "blue"
                      : "orange"
                  }
                >
                  {selectedReport.status === "resolved"
                    ? "Đã xử lý"
                    : selectedReport.status === "in_progress"
                    ? "Đang xử lý"
                    : "Chờ xử lý"}
                </Tag>
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(selectedReport.createdAt).toLocaleString()}
              </p>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <h3>Nội dung báo cáo:</h3>
              <div
                style={{
                  padding: "15px",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedReport.content}
              </div>
            </div>
            {selectedReport.status !== "resolved" && (
              <div style={{ textAlign: "right" }}>
                <Button
                  type="primary"
                  onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                  style={{
                    background: "#4CAF50",
                    borderColor: "#4CAF50",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                >
                  Đánh dấu đã xử lý
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SystemIssuesReport; 