import React from 'react';
import { Row, Col, Card, Button, InputNumber } from 'antd';

interface Drink {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
  quantity?: number;
}

const drinks: Drink[] = [
  {
    id: 1,
    name: "Trà Đào Cam Sả",
    image: "https://gachaybo.com/wp-content/uploads/2021/06/tra-dao-cam-sa.jpg",
    description: "Vị ngọt thanh, thơm mát",
    price: 35000,
  },
  {
    id: 2,
    name: "Trà Sữa Trân Châu",
    image: "https://file.huengaynay.vn/data2/image/news/2022/20220817/origin/1811660739183.jpg",
    description: "Béo ngậy, topping ngập tràn",
    price: 40000,
  },
  {
    id: 3,
    name: "Soda Việt Quất",
    image: "https://file.hstatic.net/200000528965/file/ruot-cai-thien-cac-van-de-ve-tieu-hoa_519e7933a481436a9a460b5cdfbfae27_grande.jpg",
    description: "Chua nhẹ, thơm vị trái cây",
    price: 32000,
  },
  {
    id: 4,
    name: "Nước Sâm",
    image: "https://static.gia-hanoi.com/uploads/2024/05/nau-nuoc-sam-bi-dao.jpg",
    description: "Thanh mát, ngọt dịu",
    price: 15000,
  },
];

const DrinksCollection: React.FC = () => {
  return (
    <section
      style={{
        padding: '40px 0',
        background: 'linear-gradient(to bottom, #efe6db)',
        fontFamily: 'Playfair Display, serif',
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
            marginTop: '0px',
          }}
        >
          ĐỒ UỐNG MÁT LẠNH
        </h2>
        <Row gutter={[16, 16]} justify="center" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {drinks.map((drink) => (
            <Col key={drink.id} xs={24} sm={12} md={6}>
              <Card
                hoverable
                style={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: "#efe6db",
                  fontFamily: 'Playfair Display, serif',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
                bodyStyle={{ padding: '16px' }}
                cover={
                  <img
                    alt={drink.name}
                    src={drink.image}
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
                  {drink.name}
                </h3>
                {drink.description && (
                  <p
                    style={{
                      fontSize: '14px',
                      marginBottom: '12px',
                      lineHeight: '1.5',
                    }}
                  >
                    {drink.description}
                  </p>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '17px',
                      fontWeight: 'bold',
                    }}
                  >
                    {drink.price.toLocaleString()}đ
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {drink.quantity && drink.quantity > 1 ? (
                      <InputNumber
                        min={1}
                        max={99}
                        defaultValue={drink.quantity}
                        style={{
                          width: '55px',
                          height: '36px',
                          borderColor: '#f97316',
                          backgroundColor: '#efe6db',
                        }}
                      />
                    ) : null}
                    <Button
                      style={{
                        backgroundColor: '#f97316',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        width: '80px',
                        height: '36px',
                        transition: 'all 0.3s ease',
                        fontFamily: 'Playfair Display, serif',
                        fontWeight: 'bold',
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
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default DrinksCollection;