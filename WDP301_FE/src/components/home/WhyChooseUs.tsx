import React from 'react';
import { Row, Col } from 'antd';

interface Feature {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
}

const features: Feature[] = [
  {
    id: 1,
    image: "https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/474725lIf/nuoc-mam-com-tam-1.jpg",
    title: "NGUYÊN LIỆU TƯƠI NGON",
    subtitle: "- AN TOÀN",
  },
  {
    id: 2,
    image: "https://static.vinwonders.com/production/Com-tam-Nha-Trang-23-1.jpeg",
    title: "CÔNG THỨC ƯỚP ĐỘC QUYỀN",
    subtitle: "- NGON CHUẨN VỊ",
  },
  {
    id: 3,
    image: "https://expleo.co.nz/cdn/shop/products/100600147.jpg?v=1584848322",
    title: "",
    subtitle: "GIÁ CẢ PHẢI CHĂNG",
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section
      style={{
        background: 'linear-gradient(to bottom, #efe6db, #efe6db)',
        fontFamily: 'Playfair Display, serif',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
            width: '100%',
            maxWidth: '1200px', 
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap', 
            
        }}
      >
        <h2
          style={{
            fontSize: '35px',
            fontWeight: 'bold',
            textAlign: 'center',
            color: '#000',
            letterSpacing: '1px',
            marginTop: '30px',
            
          }}
        >
          TẠI SAO CHỌN CƠM{' '}
          <span style={{ color: '#f26d21' }}>TẤM</span>{' '}
          <span style={{ color: '#78a243' }}>TẮC</span>?
        </h2>

        <Row gutter={[24, 24]} justify="center">
          {features.map((feature) => (
            <Col key={feature.id} xs={24} sm={12} md={8}>
              <div
                style={{
                  textAlign: 'center',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  margin: '0 40px 0 40px',
                }}
              >
                <img
                  alt={feature.title}
                  src={feature.image}
                  style={{
                    width: '300px',
                    height: '250px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    display: 'block',
                  }}
                />
                <div style={{ padding: '16px', fontFamily: 'Playfair Display' }}>
                  <h3
                    style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: feature.id === 3 ? '16px' : '4px',
                      color: '#000',
                      textTransform: 'uppercase',
                    }}
                  >
                    {feature.title}
                  </h3>
                  {feature.subtitle && (
                    <h3
                      style={{
                        color: '#000',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginTop: feature.id === 3 ? '0' : '8px',
                        textTransform: 'none',
                        letterSpacing: 0,
                        textAlign: 'center',
                        lineHeight: '1.5',
                      }}
                    >
                      {feature.subtitle}
                    </h3>
                  )}
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