import {
  Card,
  Checkbox,
  List,
  Button,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import "../style/Cart.css";

const { Text } = Typography;

const Cart = () => {
  const cartItems = [
    {
      key: "1",
      name: "COMBO - SÁ BÍ CHỦNG",
      description: ["Canh chua", "Nước ngọt: Coca Cola", "Cơm thêm"],
      price: "123.000đ",
      quantity: 1,
    },
    {
      key: "2",
      name: "COMBO - SÁ BÍ CHỦNG",
      description: [
        "Canh chua",
        "Nước ngọt: Coca Cola",
        "Cơm thêm",
        "Rau chua thêm",
      ],
      price: "138.000đ",
      quantity: 1,
    },
    {
      key: "3",
      name: "CƠM SƯỜN CỌNG",
      description: ["Canh chua"],
      price: "85.000đ",
      quantity: 1,
    },
    {
      key: "4",
      name: "Chả Trứng Hấp",
      description: [],
      price: "12.000đ",
      quantity: 1,
    },
    {
      key: "5",
      name: "Coca Cola",
      description: [],
      price: "12.000đ",
      quantity: 4,
    },
  ];

  const total = 419000;

  return (
    <div className="cart-container">
      <Card className="cart-card">
        <Text className="cart-title">Tấm Tắc Làng Đại học</Text>
        <Text className="cart-subtitle">
          Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh
        </Text>
        <Divider style={{ borderTop: "1px solid #2d1e1a", margin: "6px 0" }} />
        <List
          dataSource={cartItems}
          renderItem={(item) => (
            <List.Item className="cart-item">
              <Row style={{ width: "100%" }}>
                <Col span={2}>
                  <Checkbox />
                </Col>
                <Col span={16}>
                  <Text className="cart-item-name">{item.name}</Text>
                  {/* {item.description && (
                    <Text className="item-description">
                      - {item.description}
                    </Text>
                  )} */}
                  {item.description.length > 0 && (
                    <ul className="item-description-list">
                      {item.description.map((desc, index) => (
                        <li key={index} className="item-description">
                          {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                </Col>
                <Col
                  span={6}
                  style={{ textAlign: "right", display: "flex", gap: 5 }}
                >
                  <Text className="item-price">{item.price}</Text>
                  <Text className="item-quantity">x{item.quantity}</Text>
                </Col>
              </Row>
            </List.Item>
          )}
          bordered={false}
        />
        <hr className="cart-divider" />
        <Row style={{ marginTop: "10px" }}>
          <Col span={12}>
            <Text className="total-text">Tạm tính</Text>
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            <Text className="total-price">{total.toLocaleString()}đ</Text>
          </Col>
        </Row>
        <Button className="confirm-button" block>
          Xác nhận đơn hàng
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
