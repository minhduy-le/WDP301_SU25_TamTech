import React from 'react';
import { Row, Col, Card, Button } from 'antd';

interface SideDish {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
}

const sideDishes: SideDish[] = [
  {
    id: 1,
    name: "Canh Rong Biển",
    image: "https://storage.googleapis.com/onelife-public/blog.onelife.vn/2021/11/cach-lam-canh-rong-bien-nau-tom-mon-chinh-954333940591.jpg",
    description: "Giải nhiệt, bổ dưỡng",
    price: 15000,
  },
  {
    id: 2,
    name: "Chả Trứng",
    image: "https://cdn.tgdd.vn/Files/2018/01/29/1062867/cach-lam-cha-trung-hap-don-gian-tai-nha-202203041434088984.jpg",
    description: "Béo thơm, mềm mịn",
    price: 12000,
  },
  {
    id: 3,
    name: "Rau Luộc Chấm Kho Quẹt",
    image: "https://file.hstatic.net/200000385717/article/ia-chi-ban-com-chay-kho-quet-can-tho-duoc-yeu-thich-nhat-07-1649155337_2f52b84169dd496c8c30794a1d1d556d.jpg",
    description: "Đậm đà hương vị quê",
    price: 18000,
  },
  {
    id: 4,
    name: "Đồ Chua",
    image: "https://www.seriouseats.com/thmb/v0epZZi6W-RBZlA0rxi81OB-HBI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20230712-SEA-DoChua-MaureenCelestine-hero-fc08b05e43f0470aa611993727f8e2e9.jpg",
    description: "Chua ngọt, tươi mát",
    price: 10000,
  },
];

const SideDishes: React.FC = () => {
  return (
    <section
      style={{
        padding: '40px 0',
        background: 'linear-gradient(to bottom, #f2d884)',
      }}
    >
      <div className="container mx-auto px-4">
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
          MÓN ĂN KÈM
        </h2>
        <Row gutter={[16, 16]} justify="center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {sideDishes.map((dish) => (
            <Col key={dish.id} xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  borderRadius: '5px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                bodyStyle={{ padding: '16px' }}
                cover={
                  <img
                    alt={dish.name}
                    src={dish.image}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                }
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
              >
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  {dish.name}
                </h3>
                {dish.description && (
                  <p
                    style={{
                      fontSize: '14px',
                      marginBottom: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    {dish.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#f97316',
                    }}
                  >
                    {dish.price.toLocaleString()}đ
                  </span>
                  <Button
                    style={{
                      backgroundColor: '#f97316',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      width: '90px',
                      height: '36px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#fb923c';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f97316';
                      (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                    }}
                  >
                    Thêm
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default SideDishes;
