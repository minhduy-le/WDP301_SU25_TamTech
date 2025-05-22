import React, { useState } from "react";
import {
  Row,
  Col,
  Image,
  Typography,
  Rate,
  Button,
  InputNumber,
  Tabs,
  List,
  Avatar,
  Card,
  Tag,
} from "antd";
import { HeartOutlined} from "@ant-design/icons";
import "./ProductDetail.css";

const { Title, Text, Paragraph } = Typography;

const product = {
  name: "COMBO - SƯỜN CHUNG",
  price: 100000,
  image: "https://sakos.vn/wp-content/uploads/2024/09/bia.jpg",
  rating: 5,
  description:
    "Catahoula cher hot sauce make a roux Acadiana Mardi Gras fried chicken. Turducken fais do do cajun interstate andouille remoulade hunting Mardi Gras Thibideaux sac a lait. Mardi Gras viens ci trail ride levee food fishing red beans & rice. Yams sauce piquante pirogue boiled crawfish boiled crawfish lagniappe ca c'est bon. Bbq pecan pie canaille Acadiana cher cher. Boucherie gumbo cayenne andouille trail ride viens ci barbed wire sa fait chaud pecan pie.",
  categories: ["Fruits", "Vegetables"],
  reviews: [
    {
      id: 1,
      user: "Admin",
      date: "April 03, 2016",
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      content:
        "Sed eget turpis a pede tempor malesuada. Vivamus quis mi at leo pulvinar hendrerit. Cum sociis natoque penatibus et magnis dis",
    },
    {
      id: 2,
      user: "Jane",
      date: "May 10, 2017",
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      content:
        "Aliquam erat volutpat. Etiam feugiat, sem ac scelerisque placerat, enim urna cursus erat, nec dictum erat elit eu sapien.",
    },
  ],
};

const ProductDetail: React.FC = () => {
  const [quantity, setQuantity] = useState(4);

  return (
    <div style={{ position: "relative", background: "#fff", minHeight: "100vh", backgroundColor: "#efe6db" }}>
      <img
        src={"https://cdn.tgdd.vn/2022/09/CookDish/cach-nuong-thit-khong-bi-kho-mem-ngon-don-gian-avt-1200x676-1.jpg"}
        alt={"Detail"}
        style={{ width: "100%", height: "250px", objectFit: "cover" }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "250px",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      />
      <Row gutter={[48, 32]} style={{padding: "45px 120px 0 120px" }}>
        <Col xs={24} md={10} style={{display: "flex", justifyContent: "center", alignItems: "center", width: "100vw"}}>
          <Image
            src={product.image}
            alt={product.name}
            style={{
              borderRadius: 10,
              background: "#fafafa",
              width: "100%",
              height: "100%",
            }}
            preview={false}
          />
        </Col>
        <Col xs={24} md={14}>
          <Title level={2} style={{ marginBottom: 8, color: '#7c4a03', fontWeight: 700 }}>
            {product.name}
          </Title>
          <Text strong style={{ fontSize: 22, color: "#ff7a45" }}>
            {product.price.toLocaleString()}đ
          </Text>
          <div style={{ margin: "12px 0" }}>
            <Rate disabled defaultValue={product.rating} style={{ color: '#fadb14' }} />
          </div>
          <Paragraph style={{ color: "#7c4a03", marginBottom: 24 }}>
            {product.description}
          </Paragraph>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 24,
            }}
          >
            <InputNumber
              min={1}
              value={quantity}
              onChange={(v) => setQuantity(Number(v))}
              style={{ width: 70, height: 40, borderColor: '#ff7a45', background: '#fffbe6', color: '#7c4a03' }}
              controls={{
                upIcon: <span style={{ color: '#ff7a45' }}>+</span>,
                downIcon: <span style={{ color: '#ff7a45' }}>-</span>,
              }}
            />
            <Button
              type="primary"
              style={{
                background: "#ff7a45",
                borderColor: "#ff7a45",
                fontWeight: 600,
                color: '#fff',
                boxShadow: '0 2px 8px #ffecd2',
              }}
              size="large"
            >
              ADD TO CART
            </Button>
            <Button
              type="primary"
              style={{
                background: "#fffbe6",
                color: "#ff7a45",
                fontWeight: 600,
                border: "1px solid #ff7a45",
                boxShadow: '0 2px 8px #ffecd2',
              }}
              size="large"
            >
              BUY NOW!
            </Button>
            <Button
              icon={<HeartOutlined style={{ color: '#ff7a45' }} />}
              size="large"
              style={{ background: '#fffbe6', border: '1px solid #ff7a45' }}
            />
          </div>
        </Col>
      </Row>
      <div style={{ marginTop: 48, padding: "0 120px" }}>
        <Tabs
          rootClassName="custom-tabs"
          defaultActiveKey="1"
          items={[
            {
              key: "1",
              label: "Description",
              children: (
                <Paragraph style={{ maxWidth: 800 }}>
                  {product.description}
                </Paragraph>
              ),
            },
            {
              key: "2",
              label: `Reviews (${product.reviews.length})`,
              children: (
                <div>
                  <Text strong style={{ fontSize: 16 }}>
                    {product.reviews.length} REVIEWS FOUND
                  </Text>
                  <List
                    itemLayout="horizontal"
                    dataSource={product.reviews}
                    style={{ marginTop: 16 }}
                    renderItem={(item) => (
                      <Card
                        style={{
                          marginBottom: 16,
                          background: "#efe6db",
                          border: "none",
                          borderRadius: 10,
                          boxShadow: "0 2px 8px #ffecd2"
                        }}
                      >
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Avatar src={item.avatar} size={56} />}
                            title={
                              <span>
                                <Rate
                                  disabled
                                  defaultValue={item.rating}
                                  style={{ fontSize: 16 }}
                                />
                                <Text style={{ marginLeft: 8, color: "#888" }}>
                                  {item.user} – {item.date}
                                </Text>
                              </span>
                            }
                            description={
                              <Text style={{ color: "#555" }}>
                                {item.content}
                              </Text>
                            }
                          />
                        </List.Item>
                      </Card>
                    )}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>
      <div style={{ margin: "48px 0 0 0", padding: "0 120px 50px 120px" }}>
        <Title level={1} style={{ marginBottom: 24, textAlign: "center", color: "#ff7a45", fontWeight: "bold" }}>CÁC MÓN LIÊN QUAN</Title>
        <Row gutter={[24, 24]}>
          {[
            {
              id: 1,
              name: "COMBO - SƯỜN CHUNG",
              desc: [
                "Cơm: sườn nướng, bì, chả trứng",
                "Canh tuỳ chọn",
                "Nước ngọt tuỳ chọn"
              ],
              price: 99000,
              oldPrice: 123000,
              image: "https://cdn.tgdd.vn/2021/08/CookProduct/1200-1200x676-16.jpg",
              rating: 4.8,
            },
            {
              id: 2,
              name: "Cơm tấm sườn bì chả",
              desc: [
                "Cơm: sườn, bì, chả",
                "Canh rau củ",
                "Nước ngọt tự chọn"
              ],
              price: 40000,
              oldPrice: 45000,
              image: "https://cdn.tgdd.vn/2021/08/CookProduct/1200-1200x676-17.jpg",
              rating: 4.7,
            },
            {
              id: 3,
              name: "Cơm chiên dương châu",
              desc: [
                "Cơm chiên trứng, lạp xưởng, tôm",
                "Canh tuỳ chọn"
              ],
              price: 30000,
              oldPrice: 35000,
              image: "https://cdn.tgdd.vn/2021/08/CookProduct/1200-1200x676-18.jpg",
              rating: 4.6,
            },
            {
              id: 4,
              name: "Cơm rang thập cẩm",
              desc: [
                "Cơm rang, thịt, rau củ",
                "Canh tuỳ chọn"
              ],
              price: 32000,
              oldPrice: 37000,
              image: "https://cdn.tgdd.vn/2021/08/CookProduct/1200-1200x676-19.jpg",
              rating: 4.5,
            },
          ].map((item) => (
            <Col xs={24} sm={12} md={6} key={item.id}>
              <Card className="menu-card" hoverable style={{ minHeight: 380 }}>
                <div className="card-image-container">
                  <img src={item.image} alt={item.name} className="card-image" />
                  <div style={{ fontSize: 16, top: 10, left: 10, right: 'unset', bottom: 'unset', background: '#fff7e6', color: '#da7339', padding: '2px 10px', borderRadius: 8, position: 'absolute' }}>
                    ★ {item.rating}
                  </div>
                </div>
                <div className="card-content" style={{ height: 'auto', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <h3 className="card-title" style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{item.name}</h3>
                  <div className="card-description" style={{ fontSize: 15, color: '#222' }}>
                    {item.desc.map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#da7339', fontWeight: 700, fontSize: 18 }}>{item.price.toLocaleString()}đ</span>
                      <span style={{ color: '#aaa', textDecoration: 'line-through', fontSize: 15 }}>{item.oldPrice ? item.oldPrice.toLocaleString() + 'đ' : ''}</span>
                    </div>
                    <Button style={{background: '#da7339', fontWeight: 600, borderRadius: 6, fontSize: 16, padding: '0 22px', height: 38, color: '#fff', border: 'none' }}>
                      Thêm
                    </Button>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ProductDetail;
