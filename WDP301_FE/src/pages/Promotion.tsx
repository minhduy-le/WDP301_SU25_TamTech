import { Row, Col, Card, Typography } from "antd";
import "../style/Promotion.css";

const { Text } = Typography;

const Promotion = () => {
  const vouchers = [
    {
      id: 1,
      title: "Giảm 30% cho hóa đơn từ 100.000đ",
      discount: "Giảm tối đa 50.000đ",
      expiry: "HSD: 23:59, 23/02/2025",
    },
    {
      id: 2,
      title: "Tặng 1 phần đồ ăn thêm khi dùng COMBO",
      details: "Đồ ăn thêm: bì, chả, trứng, lạp xưởng",
      expiry: "HSD: 23:59, 23/02/2025",
    },
    {
      id: 3,
      title: "Giảm 30% cho hóa đơn từ 100.000đ",
      discount: "Giảm tối đa 50.000đ",
      expiry: "HSD: 23:59, 23/02/2025",
    },
    {
      id: 4,
      title: "Tặng 1 phần đồ ăn thêm khi dùng COMBO",
      details: "Đồ ăn thêm: bì, chả, trứng, lạp xưởng",
      expiry: "HSD: 23:59, 23/02/2025",
    },
  ];

  return (
    <div className="voucher-container">
      <Row gutter={[16, 16]} justify="center">
        {vouchers.map((voucher) => (
          <Col key={voucher.id} xs={24} sm={12} md={12} lg={12} xl={12}>
            <Card className="voucher-card">
              <div className="voucher-content">
                <div className="voucher-barcode"></div>
                <Text className="voucher-title">{voucher.title}</Text>
                {voucher.discount && (
                  <Text className="voucher-details">– {voucher.discount}</Text>
                )}
                {voucher.details && (
                  <Text className="voucher-details">– {voucher.details}</Text>
                )}
                <Text className="voucher-expiry">– {voucher.expiry}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Promotion;
