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
} from "antd";
import "../style/Checkout.css";

const { Option } = Select;
const { Title, Text } = Typography;

const Checkout = () => {
  return (
    <Layout className="layout">
      <div className="header">
        <Title level={3} className="checkout-title">
          Xác nhận đơn hàng
        </Title>
      </div>
      <Row gutter={16}>
        {/* Left Section */}
        <Col span={12}>
          <Card title="THÔNG TIN KHÁCH HÀNG" className="section-card">
            <Space direction="vertical" style={{ width: "100%" }}>
              <div className="radio-group">
                <Radio.Group defaultValue="delivery">
                  <Radio value="delivery">Giao hàng</Radio>
                  <Radio value="pickup">Đường quán</Radio>
                </Radio.Group>
              </div>
              <Input placeholder="Tên khách hàng" />
              <Input placeholder="Số điện thoại" />
              <Input placeholder="Email" />
              <div className="checkbox-label">
                <Checkbox defaultChecked />
                <Text>Đặt hộ</Text>
              </div>
              <Input placeholder="Tên người nhận" />
              <Input placeholder="Số điện thoại người nhận" />
              <Select defaultValue="huyen" style={{ width: "100%" }}>
                <Option value="huyen">Quận huyện</Option>
              </Select>
              <Select defaultValue="xa" style={{ width: "100%" }}>
                <Option value="xa">Đường</Option>
              </Select>
              <Input placeholder="Địa chỉ chi tiết" />
              <div className="delivery-info">
                <Radio.Group defaultValue="now">
                  <Radio value="now">Giao ngay</Radio>
                  <Radio value="later">
                    Hẹn lịch giao lúc{" "}
                    <span className="time">13:45 ngày 07.02.2025</span>
                  </Radio>
                </Radio.Group>
              </div>
            </Space>
          </Card>

          <Card
            title="PHƯƠNG THỨC THANH TOÁN"
            className="section-card payment-method"
          >
            <Radio.Group defaultValue="cash">
              <Space direction="vertical">
                <Radio value="momo">Ví MOMO</Radio>
                <Radio value="vnpay">Ví VNPay</Radio>
                <Radio value="qr">Quét mã QR VNPay</Radio>
                <Radio value="cash">Tiền mặt (COD)</Radio>
              </Space>
            </Radio.Group>
          </Card>
        </Col>

        {/* Right Section */}
        <Col span={12}>
          <Card className="confirm-card section-card order-details">
            <Title className="title-card">TẤM TẮC LÀNG ĐẠI HỌC</Title>
            <Text>
              Nhà văn hóa sinh viên, Khu đô thị Đại học Quốc gia TP. Hồ Chí Minh
            </Text>
            <div className="order-item">
              <Text>COMBO - SÀ BÌ CHƯỞNG</Text>
              <div className="order-price">
                <Text>134,000đ</Text>
                <div className="quantity-controls">
                  <Button>-</Button>
                  <span>1</span>
                  <Button>+</Button>
                </div>
              </div>
              <Text className="sub-item">• Canh chua</Text>
              <Text className="sub-item">• Nước ngọt: Coca Cola</Text>
              <Text className="sub-item">• Com thêm</Text>
            </div>
            <div className="order-item">
              <Text>COMBO - SÀ BÌ CHƯỞNG</Text>
              <div className="order-price">
                <Text>134,000đ</Text>
                <div className="quantity-controls">
                  <Button>-</Button>
                  <span>1</span>
                  <Button>+</Button>
                </div>
              </div>
              <Text className="sub-item">• Canh chua</Text>
              <Text className="sub-item">• Nước ngọt: Coca Cola</Text>
              <Text className="sub-item">• Rau thêm</Text>
            </div>
            <div className="order-item">
              <Text>CƠM SƯỜN CƯNG</Text>
              <div className="order-price">
                <Text>85,000đ</Text>
                <div className="quantity-controls">
                  <Button>-</Button>
                  <span>1</span>
                  <Button>+</Button>
                </div>
              </div>
              <Text className="sub-item">• Canh chua</Text>
              <Text className="sub-item">Ghi chú: Lấy thêm cơm</Text>
            </div>
            <div className="order-item">
              <Text>Chả Trứng Hấp</Text>
              <div className="order-price">
                <Text>60,000đ</Text>
                <div className="quantity-controls">
                  <Button>-</Button>
                  <span>1</span>
                  <Button>+</Button>
                </div>
              </div>
            </div>
            <div className="order-item">
              <Text>Coca Cola</Text>
              <div className="order-price">
                <Text>12,000đ</Text>
                <div className="quantity-controls">
                  <Button>-</Button>
                  <span>1</span>
                  <Button>+</Button>
                </div>
              </div>
            </div>
            <Input
              placeholder="Nhập mã khuyến mãi"
              style={{ marginTop: "10px" }}
            />
            <Button type="primary" className="apply-promo">
              Áp dụng
            </Button>
            <div className="order-summary">
              <div className="summary-item">
                <Text>Giao gốc</Text>
                <Text>442,000đ</Text>
              </div>
              <div className="summary-item">
                <Text>Giảm giá trên món</Text>
                <Text>-21,400đ</Text>
              </div>
              <div className="summary-item">
                <Text>Giảm giá khuyến mãi</Text>
                <Text>62,500đ</Text>
              </div>
              <div className="summary-item">
                <Text>Phí giao hàng</Text>
                <Text>16,000đ</Text>
              </div>
              <div className="summary-item total">
                <Text>TỔNG CỘNG</Text>
                <Text>372,900đ</Text>
              </div>
            </div>
            <Button type="primary" block className="submit-button">
              Đặt hàng
            </Button>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Checkout;
