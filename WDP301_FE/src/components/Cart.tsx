import {
  Card,
  Checkbox,
  List,
  Button,
  Typography,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import "../style/Cart.css";
import { useState, useEffect } from "react";
import { useCartStore } from "../store/cart.store";
import { DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface CartItem {
  userId: number;
  productId: number;
  productName: string;
  addOns: {
    productId: number;
    productTypeName: string;
    quantity: number;
    price: number;
  }[];
  quantity: number;
  price: number;
  totalPrice: number;
}

interface CartProps {
  cartItems: CartItem[];
  onConfirmOrder: (selectedItems: CartItem[]) => void;
}

const Cart = ({ cartItems, onConfirmOrder }: CartProps) => {
  // Sử dụng mảng uniqueId để theo dõi các item được chọn
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>(
    () => cartItems.map((_, index) => index) // Khởi tạo với tất cả index làm uniqueId
  );
  const { removeFromCart } = useCartStore();

  // Cập nhật selectedItemIds khi cartItems thay đổi
  useEffect(() => {
    setSelectedItemIds(cartItems.map((_, index) => index));
  }, [cartItems]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    setSelectedItemIds((prev) => {
      if (checked) {
        return [...prev, index]; // Thêm index nếu check
      } else {
        return prev.filter((id) => id !== index); // Loại bỏ index nếu uncheck
      }
    });
  };

  // Lấy danh sách item được chọn dựa trên index
  const selectedItems = cartItems.filter((_, index) =>
    selectedItemIds.includes(index)
  );

  const total = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleRemoveItem = (item: CartItem) => {
    const indexToRemove = cartItems.findIndex(
      (cartItem) =>
        cartItem.productId === item.productId &&
        JSON.stringify(cartItem.addOns) === JSON.stringify(item.addOns)
    );
    if (indexToRemove !== -1) {
      removeFromCart(item.userId, item.productId, item.addOns);
      setSelectedItemIds((prev) => prev.filter((id) => id !== indexToRemove));
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const handleConfirmOrder = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một món để xác nhận đơn hàng!");
      return;
    }
    onConfirmOrder(selectedItems);
  };

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
          renderItem={(item, index) => (
            <List.Item className="cart-item">
              <Row style={{ width: "100%" }}>
                <Col span={1} style={{ paddingTop: 1 }}>
                  <Checkbox
                    onChange={(e) =>
                      handleCheckboxChange(index, e.target.checked)
                    }
                    checked={selectedItemIds.includes(index)}
                    className="checkbox-cart"
                  />
                </Col>
                <Col span={16} style={{ paddingLeft: 9 }}>
                  <Text className="cart-item-name">{item.productName}</Text>
                  {item.addOns.length > 0 && (
                    <ul className="item-description-list">
                      {item.addOns.map((addOn, addOnIndex) => (
                        <li key={addOnIndex} className="item-description">
                          {addOn.productTypeName}
                          {/* x{addOn.quantity} */}
                        </li>
                      ))}
                    </ul>
                  )}
                </Col>
                <Col
                  span={5}
                  style={{
                    textAlign: "right",
                    display: "flex",
                    gap: 5,
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 5, justifyContent: "end" }}
                  >
                    <Text className="item-price">
                      {item.price.toLocaleString()}đ
                    </Text>
                    <Text className="item-quantity">x{item.quantity}</Text>
                  </div>
                  {item.addOns.length > 0 && (
                    <div>
                      {item.addOns.map((addOn, addOnIndex) => (
                        <div
                          key={addOnIndex}
                          style={{
                            display: "flex",
                            gap: 5,
                            justifyContent: "end",
                          }}
                        >
                          <Text className="item-price">
                            {addOn.price.toLocaleString()}đ
                          </Text>
                          <Text className="item-quantity">
                            x{addOn.quantity}
                          </Text>
                        </div>
                      ))}
                    </div>
                  )}
                </Col>
                <Col
                  span={2}
                  style={{
                    textAlign: "right",
                    display: "flex",
                    gap: 5,
                    paddingLeft: 12,
                  }}
                >
                  <Button
                    type="text"
                    onClick={() => handleRemoveItem(item)}
                    className="btn-remove-cart"
                  >
                    <DeleteOutlined />
                  </Button>
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
        <Button
          className="confirm-button"
          block
          onClick={handleConfirmOrder}
          disabled={selectedItems.length === 0}
        >
          Xác nhận đơn hàng
        </Button>
      </Card>
    </div>
  );
};

export default Cart;
