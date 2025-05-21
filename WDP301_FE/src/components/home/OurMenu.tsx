import React, { useEffect, useState } from 'react';
import { Row, Col, Button, InputNumber, Card, Tag } from 'antd';
import axios from 'axios';

interface Item {
  id: number;
  name: string;
  image: string;
  description?: string;
  price: number;
  quantity?: number;
  isFavorite?: boolean;
}

interface Product {
  productId: number;
  name: string;
  image: string;
  description?: string;
  price: string;
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

const OurMenu: React.FC = () => {
  const [mainDishes, setMainDishes] = useState<Product[]>([]);
  const [drinks, setDrinks] = useState<Product[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [activeTab, setActiveTab] = useState('mainDishes');
  const [hoverMain, setHoverMain] = useState(false);
  const [hoverSide, setHoverSide] = useState(false);
  const [hoverDrink, setHoverDrink] = useState(false);

  useEffect(() => {
    const fetchMainDishes = async () => {
      try {
        const response = await axios.get('https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/1');
        const data = response.data.products.map((item: Product) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          description: item.description,
          price: parseFloat(item.price),
          quantity: 1,
          isFavorite: false,
        }));
        console.log('Main Dishes:', data);
        setMainDishes(data);
      } catch (error) {
        console.error('Lỗi khi fetch món chính:', error);
      } finally {
        setLoadingMain(false);
      }
    };

    const fetchDrinks = async () => {
      try {
        const response = await axios.get('https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/2');
        const data = response.data.products.map((item: Product) => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          description: item.description,
          price: parseFloat(item.price),
          quantity: 1,
          isFavorite: false,
        }));
        console.log('Drinks:', data);
        setDrinks(data);
      } catch (error) {
        console.error('Lỗi khi fetch đồ uống:', error);
      } finally {
        setLoadingDrinks(false);
      }
    };

    fetchMainDishes();
    fetchDrinks();
  }, []);

  const items = activeTab === 'mainDishes' ? mainDishes : activeTab === 'sideDishes' ? sideDishes : drinks;

  return (
    <div style={{ padding: '10px 0 50px 0', background: 'linear-gradient(to bottom, #efe6db)' }}>
      <h2 style={{ color: '#f97316', textAlign: 'center', fontSize: '40px', marginBottom: '32px' }}>
        THỰC ĐƠN CỦA CHÚNG TÔI
      </h2>

      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Button
          style={{
            border: '2px solid #f97316',
            background: hoverMain || activeTab === 'mainDishes' ? '#f97316' : '#efe6db',
            color: hoverMain || activeTab === 'mainDishes' ? '#efe6db' : '#f97316',
            fontWeight: 700,
            borderRadius: 5,
            padding: '10px 28px',
            fontSize: 20,
            transition: 'all 0.3s',
            marginRight: 16,
            outline: 'none',
            boxShadow: 'none',
          }}
          onMouseEnter={() => setHoverMain(true)}
          onMouseLeave={() => setHoverMain(false)}
          onClick={() => setActiveTab('mainDishes')}
        >
          MÓN CHÍNH
        </Button>
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
        {(activeTab === 'mainDishes' && loadingMain) || (activeTab === 'drinks' && loadingDrinks) ? (
          <Col span={24}>
            <p style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>Đang tải dữ liệu...</p>
          </Col>
        ) : items.length === 0 ? (
          <Col span={24}>
            <p style={{ textAlign: 'center', fontSize: 16, color: '#666' }}>Không có món nào trong danh mục này.</p>
          </Col>
        ) : (
          items.map((item) => (
            <Col key={item.id || item.productId} xs={24} sm={12} md={6}>
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
                  {item.description || 'Món ăn thơm ngon, hấp dẫn'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag
                    color="orange"
                    style={{ fontWeight: 600, padding: '4px 12px', borderRadius: '8px' }}
                  >
                    {(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toLocaleString()}đ
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
          ))
        )}
      </Row>
    </div>
  );
};

export default OurMenu;