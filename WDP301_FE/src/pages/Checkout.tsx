/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Layout,
  Row,
  Col,
  Input,
  Select,
  Radio,
  Button,
  Card,
  Typography,
  Space,
  Checkbox,
  Divider,
  TimePicker,
  message,
} from "antd";
import "../style/Checkout.css";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDistricts, useWardByDistrictId } from "../hooks/locationsApi";
import { useCalculateShipping, useCreateOrder } from "../hooks/ordersApi";
import { useAuthStore } from "../hooks/usersApi";
import { useGetProfileUser } from "../hooks/profileApi";
import { useCartStore } from "../store/cart.store";

const { Option } = Select;
const { Title, Text } = Typography;

interface AddOn {
  productId: number;
  productTypeName: string;
  quantity: number;
  price: number;
}

interface CartItem {
  userId: string;
  productId: number;
  productName: string;
  addOns: AddOn[];
  quantity: number;
  price: number;
  totalPrice: number;
}

interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

const Checkout = () => {
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("now");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(
    null
  );
  const [detailedAddress, setDetailedAddress] = useState("");
  const [isProxyOrder, setIsProxyOrder] = useState(false);
  const currentDate = dayjs().format("DD/MM/YYYY");
  const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [note, setNote] = useState("");
  const [detailedAddressProxy, setDetailedAddressProxy] = useState("");
  const [selectedWard, setSelectedWard] = useState<string | null>(null);
  const { cartItems, updateCartItems } = useCartStore();
  const { user } = useAuthStore();
  const userId = user?.id;

  const { data: userProfile } = useGetProfileUser(userId || 0);

  const { data: districts = [], isLoading, isError } = useDistricts();
  const {
    data: wards = [],
    isLoading: isWardsLoading,
    isError: isWardsError,
  } = useWardByDistrictId(selectedDistrictId);

  const location = useLocation();
  const { selectedItems: initialSelectedItems = [] } = (location.state ||
    {}) as {
    selectedItems: CartItem[];
  };

  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);

  // Initialize selectedItems with quantities from initialSelectedItems
  useEffect(() => {
    setSelectedItems(initialSelectedItems);
  }, [initialSelectedItems]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );
  const discountOnItems = 0;
  const promoDiscount = 0;
  const [deliveryFee, setDeliveryFee] = useState(0);
  const total = subtotal - discountOnItems - promoDiscount + deliveryFee;

  const handleDistrictChange = (value: number) => {
    setSelectedDistrictId(value);
    setSelectedWard(null);
  };

  const handleWardChange = (value: string) => {
    setSelectedWard(value);
  };

  const { mutate: calculateShipping } = useCalculateShipping();
  const { mutate: createOrder } = useCreateOrder();

  const handleAddressBlurUser = () => {
    if (detailedAddress) {
      const deliverAddress = detailedAddress.trim();
      calculateShipping(
        { deliver_address: deliverAddress },
        {
          onSuccess: (data: any) => {
            setDeliveryFee(data.fee || 0);
            message.success("Phí giao hàng đã được cập nhật.");
          },
          onError: (error: any) => {
            message.error(error.response.data?.message);
            setDeliveryFee(22000);
          },
        }
      );
    }
  };

  const handleAddressBlur = () => {
    if (detailedAddressProxy && selectedDistrictId && wards.length > 0) {
      const selectedWardName = selectedWard;
      const selectedDistrict = districts.find(
        (district) => district.districtId === selectedDistrictId
      );
      const deliverAddress =
        `${detailedAddressProxy}, ${selectedWardName}, ${selectedDistrict?.name}, TPHCM`.trim();
      calculateShipping(
        { deliver_address: deliverAddress },
        {
          onSuccess: (data: any) => {
            setDeliveryFee(data.fee || 0);
            message.success("Phí giao hàng đã được cập nhật.");
          },
          onError: (error: any) => {
            console.error("Error calculating shipping:", error);
            message.error(
              "Không thể tính phí giao hàng. Sử dụng phí mặc định."
            );
            setDeliveryFee(22000);
          },
        }
      );
    }
  };

  const handleOrderSubmit = () => {
    const orderItems: OrderItem[] = [];

    selectedItems.forEach((item) => {
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      });

      if (item.addOns && item.addOns.length > 0) {
        item.addOns.forEach((addOn) => {
          if (addOn.quantity > 0) {
            orderItems.push({
              productId: addOn.productId,
              quantity: addOn.quantity,
              price: addOn.price,
            });
          }
        });
      }
    });

    const paymentMethodId = paymentMethod ?? 0;

    let orderAddress = detailedAddress.trim();
    if (isProxyOrder && detailedAddressProxy) {
      orderAddress = detailedAddressProxy.trim();
    }

    const orderData = {
      orderItems,
      order_discount_value: 0,
      order_shipping_fee: deliveryFee,
      payment_method_id: paymentMethodId,
      order_address: orderAddress,
      note: note || "",
    };

    createOrder(orderData, {
      onSuccess: (data: any) => {
        message.success("Đặt hàng thành công!");
        window.location.href = data.checkoutUrl;
        const updatedCartItems = cartItems.filter((cartItem) => {
          return !selectedItems.some(
            (selectedItem) => selectedItem.productId === cartItem.productId
          );
        });
        updateCartItems(updatedCartItems);
      },
      onError: (error) => {
        const errorMessage = error.response.data;
        message.error(errorMessage);
      },
    });
  };

  const handleIncrement = (productId: number) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId) {
          const newQuantity = item.quantity + 1;
          const newTotalPrice = item.price * newQuantity;
          return { ...item, quantity: newQuantity, totalPrice: newTotalPrice };
        }
        return item;
      })
    );
  };

  // Handle decrement quantity
  const handleDecrement = (productId: number) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.productId === productId && item.quantity > 1) {
          const newQuantity = item.quantity - 1;
          const newTotalPrice = item.price * newQuantity;
          return { ...item, quantity: newQuantity, totalPrice: newTotalPrice };
        }
        return item;
      })
    );
  };

  return (
    <Layout className="layout">
      <div className="header">
        <Title level={3} className="checkout-title">
          Xác nhận đơn hàng
        </Title>
      </div>
      <Row gutter={16}>
        <Col span={12}>
          <Card className="section-card">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div className="radio-group" style={{ display: "flex" }}>
                <Title
                  level={3}
                  style={{
                    margin: "0 25px 0 0",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  Hình thức
                </Title>
                <Radio.Group defaultValue="delivery">
                  <Radio
                    value="delivery"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Giao hàng
                  </Radio>
                  <Radio
                    value="pickup"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Dùng tại quán
                  </Radio>
                </Radio.Group>
              </div>
              <Title
                level={3}
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Thông tin khách hàng
              </Title>
              <Input
                placeholder="Tên khách hàng"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#da7339",
                }}
                value={userProfile?.fullName}
                disabled
              />
              <Input
                placeholder="Số điện thoại"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#da7339",
                }}
                value={userProfile?.phone_number}
                disabled
              />
              <Input
                placeholder="Email"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                  color: "#da7339",
                }}
                value={userProfile?.email}
                disabled
              />
              {!isProxyOrder && (
                <Input
                  placeholder="Địa chỉ chi tiết"
                  style={{
                    background: "transparent",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                  value={detailedAddress}
                  onChange={(e) => setDetailedAddress(e.target.value)}
                  onBlur={handleAddressBlurUser}
                />
              )}
              <Row>
                <Title
                  level={3}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Thông tin giao hàng
                </Title>
                <div className="checkbox-label">
                  <Checkbox
                    checked={isProxyOrder}
                    onChange={(e) => setIsProxyOrder(e.target.checked)}
                  />
                  <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Đặt hộ
                  </Text>
                </div>
              </Row>
              {isProxyOrder && (
                <>
                  <Input
                    placeholder="Tên người nhận"
                    style={{
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  />
                  <Input
                    placeholder="Số điện thoại người nhận"
                    style={{
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  />
                  <Row style={{ justifyContent: "space-between" }}>
                    <Col span={11}>
                      <Select
                        defaultValue={null}
                        style={{
                          width: "100%",
                          background: "transparent",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        placeholder="Quận huyện"
                        loading={isLoading}
                        disabled={isError}
                        onChange={handleDistrictChange}
                        value={selectedDistrictId || undefined}
                      >
                        {districts.map((district) => (
                          <Option
                            key={district.districtId}
                            value={district.districtId}
                          >
                            {district.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                    <Col span={11}>
                      <Select
                        value={selectedWard}
                        onChange={handleWardChange}
                        placeholder="Phường xã"
                        style={{
                          width: "100%",
                          background: "transparent",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        loading={isWardsLoading}
                        disabled={isWardsError || !selectedDistrictId}
                      >
                        {wards.map((ward, index) => (
                          <Option key={index} value={ward.name}>
                            {ward.name}
                          </Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <Input
                    placeholder="Địa chỉ chi tiết"
                    style={{
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                    value={detailedAddressProxy}
                    onChange={(e) => setDetailedAddressProxy(e.target.value)}
                    onBlur={handleAddressBlur}
                  />
                  <div className="delivery-info">
                    <Radio.Group
                      value={deliveryTimeOption}
                      onChange={(e) => setDeliveryTimeOption(e.target.value)}
                    >
                      <Radio
                        value="now"
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          marginBottom: 6,
                        }}
                      >
                        Giao ngay
                      </Radio>
                      <Radio
                        value="later"
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                      >
                        Hẹn lịch giao lúc{" "}
                        <TimePicker
                          format="HH:mm"
                          placeholder="Chọn thời gian ngay tại đây luôn"
                          // minuteStep={5}
                          style={{ width: 112 }}
                        />{" "}
                        ngày <span>{currentDate}</span>
                      </Radio>
                    </Radio.Group>
                  </div>
                </>
              )}
            </Space>
          </Card>

          <Divider className="divider" />

          <Card className="section-card payment-method">
            <Title
              level={3}
              style={{ fontFamily: "'Montserrat', sans-serif", marginTop: 0 }}
            >
              Phương thức thanh toán
            </Title>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <Space direction="vertical">
                <Radio
                  value={4}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Quét mã QR
                </Radio>
                <Radio
                  value={1}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Tiền mặt (COD)
                </Radio>
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        <Col span={12}>
          <Card className="confirm-card section-card order-details">
            <Title
              className="title-card"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              TẤM TẮC LÀNG ĐẠI HỌC
            </Title>
            <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh
            </Text>
            {selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <div
                  className="order-item"
                  style={{ marginTop: 16 }}
                  key={item.productId}
                >
                  <Row style={{ justifyContent: "space-between" }}>
                    <Col>
                      <Text
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 17,
                        }}
                      >
                        {item.productName}
                      </Text>
                      {item.addOns.length > 0 && (
                        <>
                          {item.addOns.map((addOn, index) => (
                            <Text
                              key={index}
                              className="sub-item"
                              style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                              • {addOn.productTypeName}
                            </Text>
                          ))}
                        </>
                      )}
                    </Col>
                    <Col>
                      <div className="order-price">
                        <Text
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            color: "#DA7339",
                            fontSize: 15,
                            fontWeight: 700,
                            marginRight: 13,
                          }}
                        >
                          {(item.totalPrice / item.quantity).toLocaleString()}đ
                        </Text>
                        <div className="quantity-controls">
                          <Button
                            disabled={item.quantity === 1}
                            onClick={() => handleDecrement(item.productId)}
                          >
                            -
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            onClick={() => handleIncrement(item.productId)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))
            ) : (
              <Text
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  marginTop: 16,
                }}
              >
                Không có món nào được chọn.
              </Text>
            )}
          </Card>
          <Card className="confirm-card section-card order-details">
            <Row style={{ justifyContent: "space-between" }}>
              <Col span={20}>
                <Input
                  placeholder="Nhập mã khuyến mãi"
                  style={{
                    marginTop: "10px",
                    background: "#efe6db",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                />
              </Col>
              <Col>
                <Button
                  type="primary"
                  className="apply-promo"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    height: 40,
                  }}
                >
                  Áp dụng
                </Button>
              </Col>
            </Row>
            <Input
              placeholder="Ghi chú cho cửa hàng"
              style={{
                marginTop: "8px",
                background: "#efe6db",
                fontFamily: "'Montserrat', sans-serif",
              }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Card>
          <Card className="confirm-card section-card order-details">
            <div className="order-summary">
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Giá gốc
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {subtotal.toLocaleString()}đ
                </Text>
              </div>
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Giảm giá trên món
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  -{discountOnItems.toLocaleString()}đ
                </Text>
              </div>
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Giảm giá từ khuyến mãi
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {promoDiscount.toLocaleString()}đ
                </Text>
              </div>
              <div className="summary-item">
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  Phí giao hàng
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#DA7339",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {deliveryFee.toLocaleString()}đ
                </Text>
              </div>
              <Divider style={{ border: "1px solid black" }} />
              <div className="summary-item total">
                <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  TỔNG CỘNG
                </Text>
                <Text
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 15,
                  }}
                >
                  {total.toLocaleString()}đ
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              block
              className="submit-button"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              onClick={handleOrderSubmit}
            >
              Đặt hàng
            </Button>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Checkout;
