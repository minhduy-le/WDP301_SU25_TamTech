import React, { useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import './WhyChooseUs.css'; 

const { Title, Paragraph } = Typography;

interface ArtisticFeature {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  accentColor: string;
}

const artisticLayerFeaturesData: ArtisticFeature[] = [
  {
    id: 1,
    image: "https://i-giadinh.vnecdn.net/2024/03/07/7Honthinthnhphm1-1709800144-8583-1709800424.jpg",
    title: "NGUYÊN LIỆU TRỌN LÀNH",
    subtitle: "Từ đồng quê đến bàn ăn, mỗi nguyên liệu là một lời cam kết về sự tươi mới và chất lượng.",
    accentColor: "#78a243",
  },
  {
    id: 2,
    image: "https://static.vinwonders.com/production/Com-tam-Nha-Trang-23-1.jpeg",
    title: "HƯƠNG VỊ KÝ ỨC",
    subtitle: "Bí quyết gia truyền được gìn giữ, đánh thức hương vị cơm tấm thân quen, đậm đà khó phai.",
    accentColor: "#da7339",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
    title: "NIỀM VUI TRỌN VẸN",
    subtitle: "Chất lượng xứng tầm, giá cả sẻ chia. Để mỗi bữa cơm không chỉ no bụng mà còn ấm lòng.",
    accentColor: "#f39c12",
  },
];

const WhyChooseUs: React.FC = () => {
  useEffect(() => {
    const featureElements = document.querySelectorAll('.artistic-layer-feature');
    if (featureElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    featureElements.forEach((item) => observer.observe(item));
    return () => featureElements.forEach((item) => observer.unobserve(item));
  }, []);

  return (
    <section className="artistic-layer-wcu-section">
      <div className="artistic-layer-wcu-container">
        <Title level={2} className="artistic-layer-main-title">
          Điều Gì Tạo Nên <span className="brand-tam">Cơm Tấm Tắc</span> <span className="brand-tac">Đặc Sắc</span>?
        </Title>
        
        <Row gutter={[48, 64]} justify="center"> 
          {artisticLayerFeaturesData.map((feature, _index) => (
            <Col xs={24} md={8} key={feature.id} className="artistic-layer-feature-col">
              <div className="artistic-layer-feature">
                <div className="artistic-feature-number-bg" style={{ color: feature.accentColor }}>
                  0{feature.id}
                </div>
                <div className="artistic-image-holder">
                  <div className="artistic-image-shape" style={{ borderColor: feature.accentColor }}>
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="artistic-feature-img"
                    />
                  </div>
                </div>
                <div className="artistic-content-holder">
                  <Title level={3} className="artistic-feature-title" style={{ color: feature.accentColor }}>
                    {feature.title}
                  </Title>
                  <Paragraph className="artistic-feature-subtitle">
                    {feature.subtitle}
                  </Paragraph>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default WhyChooseUs;