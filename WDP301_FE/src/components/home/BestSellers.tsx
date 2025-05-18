import React from "react";
import { Row, Col, Card, Button, InputNumber } from "antd";

interface Product {
  id: number;
  image: string;
  title: string;
  description: string[];
  price: number;
  originalPrice: number;
  quantity?: number;
}

const bestSellers: Product[] = [
  {
    id: 1,
    image: "https://congthucgiadinh.com/storage/47/01J2JHNWAAKNAJD3J8Z561DHA2.jpg",
    title: "CƠM SƯỜN NƯỚNG MỀM",
    description: [
      "Sườn nướng mềm mọng, dùng cùng cơm nóng và rau chua",
    ],
    price: 99000,
    originalPrice: 123000,
  },
  {
    id: 2,
    image: "https://daotaobep.com/wp-content/uploads/khoa-hoc-nau-com-tam-suon-bi-cha-de-mo-quan-kinh-doanh-7.jpg",
    title: "COMBO - SƯỜN CHUNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 99000,
    originalPrice: 123000,
  },
  {
    id: 3,
    image: "https://comtamthuankieu.com.vn/wp-content/uploads/2020/12/IMG_0081-scaled.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 99000,
    originalPrice: 123000,
  },
];

const BestSellers: React.FC = () => {
  return (
    <section
      style={{
        padding: "40px 0",
        backgroundColor: "#f2d884",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "30px",
          color: "#000",
          letterSpacing: "1px",
          marginTop: "0px",
          fontFamily: 'Playfair Display, serif',
        }}
      >
        BEST SELLERS
      </h2>
      <div>
        <Row gutter={[16, 16]} justify="center">
          {bestSellers.map((product, idx) => (
            <Col key={product.id} xs={24} sm={12} md={7}>
              <div
                style={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#efe6db",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  margin: "0 20px 0 20px",
                  minHeight: 370,
                  fontFamily: 'Playfair Display, serif',
                }}
              >
                <div style={{ position: "relative" }}>
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                      borderRadius: "20px 20px 0 0",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "#fff",
                      color: "#78a243",
                      padding: "2px 12px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#78a243", fontSize: 16, marginRight: 4 }}>★</span> 1000+
                  </div>
                </div>
                <div style={{ padding: "18px 18px 10px 18px" }}>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: "#000",
                      textAlign: "left",
                      marginBottom: 6,
                    }}
                  >
                    {product.title}
                  </div>
                  <div
                    style={{
                      fontSize: "15px",
                      color: "#222",
                      textAlign: "left",
                      marginBottom: 12,
                      minHeight: 60,
                      fontFamily: 'Playfair Display, serif',
                      lineHeight: 1.5,
                    }}
                  >
                    {product.description.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <span
                        style={{
                          background: "#f97316",
                          color: "#fff",
                          borderRadius: "8px",
                          padding: "4px 16px",
                          paddingBottom: "7px",
                          fontWeight: 600,
                          fontSize: 16,
                          marginRight: 8,
                        }}
                      >
                        {product.price.toLocaleString()}đ
                      </span>
                      <span
                        style={{
                          color: "#888",
                          textDecoration: "line-through",
                          fontSize: 15,
                        }}
                      >
                        {product.originalPrice.toLocaleString()}đ
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {product.quantity && product.quantity > 1 ? (
                      <InputNumber
                        min={1}
                        max={99}
                        defaultValue={product.quantity}
                        style={{
                          width: '55px',
                          height: '36px',
                          borderColor: '#f97316',
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
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
};

export default BestSellers;