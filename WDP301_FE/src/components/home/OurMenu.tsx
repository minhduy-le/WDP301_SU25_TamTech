import React, { useState } from 'react';
import { Row, Col, Button, InputNumber, Card, Tag } from 'antd';

interface Item {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
  quantity?: number;
  isFavorite?: boolean;
}

const sideDishes: Item[] = [
  {
    id: 1,
    name: "Canh Rong Biển",
    image: "https://file.hstatic.net/200000700229/article/nau-canh-rong-bien-1_09c034dc42454fefb6159984b3aa94c1.jpg",
    description: "Giải nhiệt, bổ dưỡng",
    price: 15000,
    quantity: 4,
    isFavorite: true,
  },
  {
    id: 2,
    name: "Chả Trứng",
    image: "https://cdn.tgdd.vn/Files/2018/01/29/1062867/cach-lam-cha-trung-hap-don-gian-tai-nha-202203041434088984.jpg",
    description: "Béo thơm, mềm mịn",
    price: 12000,
    quantity: 1,
  },
  {
    id: 3,
    name: "Rau Luộc Chấm Kho Quẹt",
    image: "https://file.hstatic.net/200000385717/article/ia-chi-ban-com-chay-kho-quet-can-tho-duoc-yeu-thich-nhat-07-1649155337_2f52b84169dd496c8c30794a1d1d556d.jpg",
    description: "Đậm đà hương vị quê",
    price: 18000,
    quantity: 3,
    isFavorite: true,
  },
  {
    id: 4,
    name: "Đồ Chua",
    image: "https://www.seriouseats.com/thmb/v0epZZi6W-RBZlA0rxi81OB-HBI=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/20230712-SEA-DoChua-MaureenCelestine-hero-fc08b05e43f0470aa611993727f8e2e9.jpg",
    description: "Chua ngọt, tươi mát",
    price: 10000,
    quantity: 2,
  },
];

const drinks: Item[] = [
  {
    id: 1,
    name: "Trà Đào Cam Sả",
    image: "https://gachaybo.com/wp-content/uploads/2021/06/tra-dao-cam-sa.jpg",
    description: "Vị ngọt thanh, thơm mát",
    price: 35000,
    isFavorite: true,
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
    isFavorite: true,
  },
];

const OurMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sideDishes');
  const [hoverSide, setHoverSide] = useState(false);
  const [hoverDrink, setHoverDrink] = useState(false);

  const items = activeTab === 'sideDishes' ? sideDishes : drinks;

  return (
    <div style={{ padding: '10px 0 50px 0', background: 'linear-gradient(to bottom, #efe6db)' }}>
      <h2 style={{ color: '#f97316', textAlign: 'center', fontSize: '40px', marginBottom: '32px' }}>
        THỰC ĐƠN CỦA CHÚNG TÔI
      </h2>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Button
          style={{
            border: '2px solid #f97316',
            background: hoverSide || activeTab === 'sideDishes' ? '#f97316' : '#efe6db',
            color: hoverSide || activeTab === 'sideDishes' ? '#efe6db' : '#f97316',
            fontWeight: 700,
            borderRadius: 5,
            padding: '10px 28px',
            fontSize: 20,
            transition: 'all 0.3s',
            marginRight: 16,
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseEnter={() => setHoverSide(true)}
          onMouseLeave={() => setHoverSide(false)}
          onClick={() => setActiveTab('sideDishes')}
        >
          MÓN ĂN KÈM
        </Button>
        <Button
          style={{
            border: '2px solid #f97316',
            background: hoverDrink || activeTab === 'drinks' ? '#f97316' : '#efe6db',
            color: hoverDrink || activeTab === 'drinks' ? '#fff' : '#f97316',
            fontWeight: 700,
            borderRadius: 5,
            padding: '10px 28px',
            fontSize: 20,
            transition: 'all 0.3s',
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseEnter={() => setHoverDrink(true)}
          onMouseLeave={() => setHoverDrink(false)}
          onClick={() => setActiveTab('drinks')}
        >
          ĐỒ UỐNG
        </Button>
      </div>

      <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {items.map((item) => (
          <Col key={item.id} xs={24} sm={12} md={6}>
            <Card
              hoverable
              style={{
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                border: 'none',
              }}
              bodyStyle={{ padding: '16px' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              cover={
                <div style={{ position: 'relative', height: '180px' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px 12px 0 0',
                    }}
                  />
                  {item.isFavorite && (
                    <div style={{ position: 'absolute', bottom: 10, left: 10 }}>
                      <Tag color="orange" style={{ borderRadius: '50%', padding: '4px 10px' }}>
                        ♥
                      </Tag>
                    </div>
                  )}
                </div>
              }
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#f97316' }}>{item.name}</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                {item.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Tag
                  color="orange"
                  style={{ fontWeight: 600, padding: '4px 12px', borderRadius: '8px' }}
                >
                  {item.price.toLocaleString()}đ
                </Tag>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {item.quantity && item.quantity > 1 && (
                    <InputNumber min={1} max={99} defaultValue={item.quantity} size="small" />
                  )}
                  <Button
                    type="primary"
                    style={{
                      backgroundColor: '#f97316',
                      borderColor: '#f97316',
                      borderRadius: 5,
                      fontWeight: 600,
                      outline: 'none',
                      boxShadow: 'none',
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
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default OurMenu;