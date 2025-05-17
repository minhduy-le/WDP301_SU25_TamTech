import React from 'react';
import { Row, Col, Card } from 'antd';
import { ThumbsUp } from 'lucide-react';

interface Feature {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  description: string;
}

const features: Feature[] = [
  {
    id: 1,
    image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474725lIf/nuoc-mam-com-tam-1.jpg",
    title: "NGUYÊN LIỆU TƯƠI NGON",
    subtitle: "AN TOÀN",
    description: "Chúng tôi cam kết sử dụng nguyên liệu tươi mới mỗi ngày"
  },
  {
    id: 2,
    image: "https://static.vinwonders.com/production/Com-tam-Nha-Trang-23-1.jpeg",
    title: "CÔNG THỨC ƯỚP ĐỘC QUYỀN",
    subtitle: "NGON CHUẨN VỊ",
    description: "Công thức gia truyền được phát triển bởi các đầu bếp hàng đầu"
  },
  {
    id: 3,
    image: "https://expleo.co.nz/cdn/shop/products/100600147.jpg?v=1584848322",
    title: "GIÁ CẢ PHẢI CHĂNG",
    subtitle: "HỢP LÝ",
    description: "Giá cả hợp lý cho sinh viên và mọi đối tượng khách hàng"
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-16 bg-com-tam-cream" id="about" style={{ background: 'linear-gradient(to bottom, #fff7ed, #ffffff)' }}>
      <div style={{ background: '#efe6db', padding: '2rem 3rem' }} className="container">
         <h2
          style={{
            fontSize: '40px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '30px',
            color: '#000',
            letterSpacing: '1px',
            marginTop: '10px',
          }}
        >
          TẠI SAO CHỌN CƠM <span style={{ color: '#f97316' }}>TẤM TẮC</span>?
        </h2>
        
        <Row gutter={[16, 16]} justify="center">
          {features.map((feature) => (
            <Col key={feature.id} xs={24} sm={12} md={7}>
              <Card
                cover={
                  <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                    <img
                      alt={feature.title}
                      src={feature.image}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                }
                bodyStyle={{ textAlign: 'center', padding: '16px' }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <ThumbsUp style={{ marginRight: '8px', color: '#f97316' }} />
                </div>
                <h3 className="text-lg font-bold mb-1">{feature.title}</h3>
                {feature.subtitle && (
                  <p style={{ marginRight: '8px', color: '#f97316', fontSize: '16px', fontWeight: 'bold' }}>{feature.subtitle}</p>
                )}
              </Card> 
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default WhyChooseUs;