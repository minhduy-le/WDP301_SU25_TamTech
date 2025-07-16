import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Skeleton, Card, Image } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useGetBlogById } from "../hooks/blogsApi";
import "../style/BlogDetail.css";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const blogId = id ? parseInt(id, 10) : 0;

  const {
    data: blog,
    isLoading: isLoadingBlog,
    isError: isErrorBlog,
  } = useGetBlogById(blogId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = () => {
    navigate("/blog");
  };

  if (isLoadingBlog) {
    return (
      <div className="blog-detail-container">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (isErrorBlog || !blog) {
    return (
      <div className="blog-detail-container">
        <div className="error-section">
          <Title level={2} className="error-title">
            {isErrorBlog ? "Lỗi tải bài viết" : "Bài viết không tồn tại"}
          </Title>
          <Text className="error-text">
            {isErrorBlog
              ? "Không thể tải chi tiết blog. Vui lòng thử lại sau."
              : "Không tìm thấy bài blog này."}
          </Text>
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="back-button"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      <Button
        type="link"
        icon={<ArrowLeftOutlined />}
        onClick={handleBack}
        className="back-button"
      >
        Quay lại
      </Button>
      <div className="blog-detail-header">
        <Title level={1} className="blog-detail-title">
          {blog.title}
        </Title>
        <div className="blog-detail-meta">
          <Text className="blog-detail-author">
            Tác giả:{" "}
            <span className="author-name">
              {blog.Author?.fullName || "Ẩn danh"}
            </span>
          </Text>
          <Text className="blog-detail-date">
            Ngày đăng: {dayjs(blog.createdAt).format("DD/MM/YYYY")}
          </Text>
        </div>
      </div>

      <Image
        src={blog.image}
        alt={blog.title}
        style={{ marginBottom: 20, height: 200 }}
      />
      <Card className="blog-detail-content-card">
        <Paragraph className="blog-detail-summary">{blog.content}</Paragraph>
      </Card>
    </div>
  );
};

export default BlogDetail;
