import React from "react";
import { Row, Col, Card, Button, InputNumber } from "antd";

interface Product {
  id: number;
  image: string;
  title: string;
  description: string | string[];
  price: number;
  originalPrice?: number;
  quantity?: number;
}

const bestSellers: Product[] = [
  {
    id: 1,
    image:
      "https://congthucgiadinh.com/storage/47/01J2JHNWAAKNAJD3J8Z561DHA2.jpg",
    title: "CƠM SƯỜN NƯỚNG MỀM",
    description: [
      "Sườn nướng mềm mọng, dùng cùng cơm nóng và rau chua",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 82000,
    originalPrice: 99000,
    quantity: 5,
  },
  {
    id: 2,
    image:
      "https://daotaobep.com/wp-content/uploads/khoa-hoc-nau-com-tam-suon-bi-cha-de-mo-quan-kinh-doanh-7.jpg",
    title: "COMBO - SƯỜN CHUNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 99000,
    quantity: 3,
  },
  {
    id: 3,
    image:
      "https://comtamthuankieu.com.vn/wp-content/uploads/2020/12/IMG_0081-scaled.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 89000,
    quantity: 4,
  },
  {
    id: 4,
    image:
      "https://comtamthuankieu.com.vn/wp-content/uploads/2020/12/IMG_0081-scaled.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 89000,
    quantity: 2,
  },
  {
    id: 5,
    image:
      "https://comtamthuankieu.com.vn/wp-content/uploads/2020/12/IMG_0081-scaled.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 89000,
    quantity: 6,
  },
  {
    id: 6,
    image:
      "https://comtamthuankieu.com.vn/wp-content/uploads/2020/12/IMG_0081-scaled.jpg",
    title: "COMBO - SÀ BÌ CHƯỞNG",
    description: [
      "Cơm: sườn nướng, bì, chả trứng",
      "Canh tùy chọn",
      "Nước ngọt tùy chọn",
    ],
    price: 89000,
    quantity: 3,
  },
];

const BestSellers: React.FC = () => {
  return (
    <section style={{ padding: "40px 0", backgroundColor: "#f2d884" }}>
      <h2
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "30px",
          color: "#000",
          letterSpacing: "1px",
          marginTop: "10px",
        }}
      >
        BEST SELLERS
      </h2>
      <div className="container mx-auto px-4">
        <Row gutter={[16, 16]} justify="center">
          {bestSellers.map((product) => (
            <Col key={product.id} xs={24} sm={12} md={7}>
              <Card
                hoverable
                style={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
                bodyStyle={{ padding: "16px", textAlign: "left" }}
                cover={
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                }
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: "#000",
                  }}
                >
                  {product.title}
                </h3>
                {typeof product.description === "string" ? (
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#5A6A7A",
                      marginBottom: "12px",
                      lineHeight: "1.5",
                    }}
                  >
                    {product.description}
                  </p>
                ) : (
                  <ul
                    style={{
                      fontSize: "14px",
                      color: "#5A6A7A",
                      marginBottom: "12px",
                      paddingLeft: "20px",
                      lineHeight: "1.5",
                    }}
                  >
                    {product.description.map((line, idx) => (
                      <li key={idx}>{line}</li>
                    ))}
                  </ul>
                )}

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#f97316",
                    }}
                  >
                    {product.price.toLocaleString()}đ
                    {product.originalPrice && (
                      <span
                        style={{
                          fontSize: "14px",
                          color: "#888",
                          textDecoration: "line-through",
                          marginLeft: "8px",
                        }}
                      >
                        {product.originalPrice.toLocaleString()}đ
                      </span>
                    )}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {product.quantity && product.quantity > 1 ? (
                      <InputNumber
                        min={1}
                        max={99}
                        defaultValue={product.quantity}
                        style={{
                          width: "60px",
                          height: "40px",
                          borderColor: "#f97316",
                        }}
                      />
                    ) : null}
                    <Button
                      style={{
                        backgroundColor: "#f97316",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        width: "100px",
                        height: "40px",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        const btn = e.currentTarget as HTMLElement;
                        btn.style.backgroundColor = "#fb923c";
                        btn.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        const btn = e.currentTarget as HTMLElement;
                        btn.style.backgroundColor = "#f97316";
                        btn.style.transform = "scale(1)";
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

export default BestSellers;
