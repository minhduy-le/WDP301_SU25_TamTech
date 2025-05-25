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
} from "antd";
import "../style/Checkout.css";
import { useState } from "react";
import dayjs from "dayjs";

const { Option } = Select;
const { Title, Text } = Typography;

const Checkout = () => {
  const [deliveryTimeOption, setDeliveryTimeOption] = useState("now");
  const currentDate = dayjs().format("DD/MM/YYYY");

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
                }}
              />
              <Input
                placeholder="Số điện thoại"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              />
              <Input
                placeholder="Email"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              />
              <Row>
                <Title
                  level={3}
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Thông tin giao hàng
                </Title>
                <div className="checkbox-label">
                  <Checkbox defaultChecked />
                  <Text style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    Đặt hộ
                  </Text>
                </div>
              </Row>
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
                    defaultValue="tinh"
                    style={{
                      width: "100%",
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    <Option value="tinh">Tỉnh thành</Option>
                  </Select>
                </Col>
                <Col span={11}>
                  <Select
                    defaultValue="huyen"
                    style={{
                      width: "100%",
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    <Option value="huyen">Quận huyện</Option>
                  </Select>
                </Col>
              </Row>
              <Row style={{ justifyContent: "space-between" }}>
                <Col span={11}>
                  <Select
                    defaultValue="xa"
                    style={{
                      width: "100%",
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    <Option value="xa">Phường xã</Option>
                  </Select>
                </Col>
                <Col span={11}>
                  <Select
                    defaultValue="duong"
                    style={{
                      width: "100%",
                      background: "transparent",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    <Option value="duong">Đường</Option>
                  </Select>
                </Col>
              </Row>
              <Input
                placeholder="Địa chỉ chi tiết"
                style={{
                  background: "transparent",
                  fontFamily: "'Montserrat', sans-serif",
                }}
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
            <Radio.Group defaultValue="cash">
              <Space direction="vertical">
                <Radio
                  value="momo"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Ví MOMO
                </Radio>
                <Radio
                  value="vnpay"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Ví VNPay
                </Radio>
                <Radio
                  value="qr"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Quét mã QR VNPay
                </Radio>
                <Radio
                  value="cash"
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
            <div className="order-item" style={{ marginTop: 16 }}>
              <Row style={{ justifyContent: "space-between" }}>
                <Col>
                  <Text
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 17,
                    }}
                  >
                    COMBO - SÀ BÌ CHƯỞNG
                  </Text>
                  <Text
                    className="sub-item"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    • Canh chua
                  </Text>
                  <Text
                    className="sub-item"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    • Nước ngọt: Coca Cola
                  </Text>
                  <Text
                    className="sub-item"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    • Cơm thêm
                  </Text>
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
                      134,000đ
                    </Text>
                    <div className="quantity-controls">
                      <Button>-</Button>
                      <span>1</span>
                      <Button>+</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="order-item">
              <Row style={{ justifyContent: "space-between" }}>
                <Col>
                  <Text
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 17,
                    }}
                  >
                    CƠM SƯỜN CỌNG
                  </Text>
                  <Text
                    className="sub-item"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    • Canh chua
                  </Text>
                  <Text
                    className="sub-item"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Ghi chú: Lấy thêm cơm
                  </Text>
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
                      85,000đ
                    </Text>
                    <div className="quantity-controls">
                      <Button>-</Button>
                      <span>1</span>
                      <Button>+</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="order-item">
              <Row style={{ justifyContent: "space-between" }}>
                <Col>
                  <Text
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 17,
                    }}
                  >
                    Chả Trứng Hấp
                  </Text>
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
                      60,000đ
                    </Text>
                    <div className="quantity-controls">
                      <Button>-</Button>
                      <span>1</span>
                      <Button>+</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="order-item">
              <Row style={{ justifyContent: "space-between" }}>
                <Col>
                  <Text
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 17,
                    }}
                  >
                    Coca Cola
                  </Text>
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
                      12,000đ
                    </Text>
                    <div className="quantity-controls">
                      <Button>-</Button>
                      <span>1</span>
                      <Button>+</Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
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
                  442,000đ
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
                  -21,400đ
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
                  62,500đ
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
                  16,000đ
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
                  372,900đ
                </Text>
              </div>
            </div>
            <Button
              type="primary"
              block
              className="submit-button"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
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
