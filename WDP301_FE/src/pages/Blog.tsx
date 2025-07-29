import { Row, Col, Card, Typography, Button, Skeleton } from "antd";
import "../style/Blog.css";
import { useBlogs } from "../hooks/blogsApi";
import { useState } from "react";
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

const Blog = () => {
  const {
    data: blogs,
    isLoading: isLoadingBlogs,
    isError: isErrorBlogs,
  } = useBlogs();

  const [visibleBlogs, setVisibleBlogs] = useState(9);

  const handleShowMore = () => {
    setVisibleBlogs((prev) => prev + 9);
  };

  return (
    <div className="blog-page">
      <div className="header">
        <Title level={2} className="blog-title">
          CHUYỆN CƠM TẤM
        </Title>
        <Text className="blog-subtitle">
          Tấm Tắc là thương hiệu cơm tấm đồng hành cùng sinh viên trong mỗi bữa
          ăn. Đằng sau mỗi dĩa cơm là một câu chuyện chúng tôi muốn gửi đến các
          thực khách.
        </Text>
      </div>
      <div className="news-section">
        <div className="line-title"></div>
        <Text className="news-title">Tin Tức</Text>
      </div>
      <Row gutter={[48, 16]} className="blog-grid">
        {isLoadingBlogs ? (
          <Skeleton />
        ) : isErrorBlogs ? (
          <div>Lỗi loading loại sản phẩm. Vui lòng thử lại.</div>
        ) : blogs && blogs.length > 0 ? (
          blogs.slice(0, visibleBlogs).map((post) => (
            <Col
              key={post.id}
              xs={24}
              sm={12}
              md={8}
              lg={8}
              style={{ maxWidth: "33.33%" }}
            >
              <Card className="blog-card">
                <div className="card-image-container">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="blog-card-image"
                  />
                </div>
                <div className="blog-card-content">
                  <Text className="post-title">{post.title}</Text>
                  {/* <Text className="post-date">{post.date}</Text> */}
                  <div className="btn-right">
                    <Link to={`/blog/${post.id}`}>
                      <Button className="btn-read-more">Đọc tiếp</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <div>Không có blog.</div>
        )}
        {visibleBlogs < (blogs?.length || 0) && (
          <Col span={24} style={{ textAlign: "center", marginTop: "20px" }}>
            <Button className="see-more-button" onClick={handleShowMore}>
              Xem thêm
            </Button>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Blog;
