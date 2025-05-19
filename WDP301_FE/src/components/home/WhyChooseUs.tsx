import React, { useEffect } from 'react';
import { Row, Col, Typography } from 'antd';
import './WhyChooseUs.css';

const { Title, Text } = Typography;

interface Feature {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const features: Feature[] = [
  {
    id: 1,
    image: "https://i-giadinh.vnecdn.net/2024/03/07/7Honthinthnhphm1-1709800144-8583-1709800424.jpg",
    title: "NGUYÊN LIỆU TƯƠI NGON ĐẬM VỊ",
    subtitle: "Cơm tấm Tắc sử dụng nguyên liệu tươi mỗi ngày, đảm bảo an toàn và chất lượng cao.",
  },
  {
    id: 2,
    image: "https://static.vinwonders.com/production/Com-tam-Nha-Trang-23-1.jpeg",
    title: "CÔNG THỨC ƯỚP ĐỘC QUYỀN",
    subtitle: "Khám phá bí quyết ướp gia vị độc quyền mang đến hương vị chuẩn cơm tấm.",
  },
  {
    id: 3,
    image: "https://expleo.co.nz/cdn/shop/products/100600147.jpg?v=1584848322",
    title: "GIÁ CẢ PHẢI CHĂNG",
    subtitle: "Chất lượng đỉnh cao với mức giá hợp lý, phù hợp cho mọi bữa ăn gia đình.",
  },
];

const WhyChooseUs: React.FC = () => {
  useEffect(() => {
    const blocks = document.querySelectorAll('.feature-block');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-in');
          }
        });
      },
      { threshold: 0.2 }
    );

    blocks.forEach((block) => observer.observe(block));
    return () => blocks.forEach((block) => observer.unobserve(block));
  }, []);

  return (
    <section className="why-choose-us-section">
      <div className="why-choose-us-container">
        <Title level={2} style={{ textAlign: 'center', fontWeight: '700', fontSize: '2.5rem', paddingBottom: '2rem' }}>
          TẠI SAO CHỌN CƠM <span style={{ color: '#da7339' }}>TẤM</span> <span style={{ color: '#78a243' }}>TẮC</span>?
        </Title>
        {features.map((feature, index) => (
          <Row
            key={feature.id}
            className={`feature-block ${index % 2 !== 0 ? 'reverse' : ''}`}
            gutter={[24, 24]}
            justify="center"
            align="middle"
            style={{ flexDirection: index % 2 !== 0 ? 'row-reverse' : 'row' }}
          >
            <Col xs={24} md={10}>
              <div className="image-wrapper">
                <img
                  alt={feature.title}
                  src={feature.image}
                  className="feature-image"
                />
              </div>
            </Col>
            <Col xs={24} md={14}>
              <div className="content-wrapper">
                <Title level={3} className="feature-title">
                  {feature.title}
                </Title>
                <Text className="feature-subtitle">{feature.subtitle}</Text>
              </div>
            </Col>
          </Row>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;