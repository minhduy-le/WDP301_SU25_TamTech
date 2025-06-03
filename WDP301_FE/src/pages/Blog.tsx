import { Row, Col, Card, Typography, Button } from "antd";
import "../style/Blog.css";
import IMAGE from "../assets/login.png";

const { Title, Text } = Typography;

interface BlogPost {
  id: number;
  title: string;
  image: string;
  date: string;
}

const Blog = () => {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "CƠM TẤM SÀI GÒN - MỘT HÀNH TRÌNH",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 2,
      title: "CƠM TẤM TRONG CÁI TẾT VIỆT NAM",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 3,
      title: "GIỚI TRẺ VÀ `CƠN ĐÓI` MỘT BỮA CƠM NGON",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 4,
      title: "CƠM TẤM SÀI GÒN - MỘT HÀNH TRÌNH",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 5,
      title: "CƠM TẤM TRONG CÁI TẾT VIỆT NAM",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 6,
      title: "GIỚI TRẺ VÀ `CƠN ĐÓI` MỘT BỮA CƠM NGON",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 7,
      title: "CƠM TẤM SÀI GÒN - MỘT HÀNH TRÌNH",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 8,
      title: "CƠM TẤM TRONG CÁI TẾT VIỆT NAM",
      image: IMAGE,
      date: "01/01/2024",
    },
    {
      id: 9,
      title: "GIỚI TRẺ VÀ `CƠN ĐÓI` MỘT BỮA CƠM NGON",
      image: IMAGE,
      date: "01/01/2024",
    },
  ];

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
      <Row gutter={[16, 16]} className="blog-grid">
        {blogPosts.map((post) => (
          <Col
            key={post.id}
            xs={24}
            sm={12}
            md={6}
            lg={6}
            style={{ maxWidth: "-webkit-fill-available" }}
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
                  <Button className="btn-read-more">Đọc tiếp</Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <div className="see-more">
        <Button className="see-more-button">Xem thêm</Button>
      </div>
    </div>
  );
};

export default Blog;
