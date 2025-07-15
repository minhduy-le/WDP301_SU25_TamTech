import { Row, Col, Card, Typography, Spin } from "antd";
import "../style/Promotion.css";
import { useAuthStore } from "../hooks/usersApi";
import { useGetPromotionUser } from "../hooks/promotionApi";
import dayjs from "dayjs";

const { Text } = Typography;

const Promotion = () => {
  const { user } = useAuthStore();
  const userId = user?.id;

  // Sử dụng hook để lấy danh sách promotion của user
  const { data: userPromotions, isLoading } = useGetPromotionUser(userId ?? 0);

  // Chuyển đổi dữ liệu từ API thành định dạng phù hợp với giao diện
  const vouchers = userPromotions
    ? userPromotions.map((promotion) => ({
        id: promotion.promotionId,
        title: promotion.name,
        discount: promotion.discountAmount
          ? `Giảm tối đa ${promotion.discountAmount.toLocaleString()}đ`
          : undefined,
        details: promotion.description,
        barcode: promotion.barcode,
        expiry: `HSD: ${dayjs(promotion.endDate).format("HH:mm, DD/MM/YYYY")}`,
      }))
    : [];

  if (isLoading) return <Spin size="large" />;
  // if (isError) return <Text type="danger">Lỗi khi tải khuyến mãi</Text>;

  return (
    <div className="voucher-container">
      <Row
        gutter={[16, 16]}
        justify="center"
        style={{ width: "-webkit-fill-available" }}
      >
        {vouchers.length > 0 ? (
          vouchers.map((voucher) => (
            <Col key={voucher.id} xs={24} sm={12} md={12} lg={12} xl={12}>
              <Card className="voucher-card">
                <div className="voucher-content">
                  <div className="voucher-barcode">
                    <img
                      src={voucher.barcode}
                      alt="Voucher Barcode"
                      style={{
                        width: "-webkit-fill-available",
                        height: "-webkit-fill-available",
                      }}
                    />
                  </div>
                  <Text className="voucher-title">{voucher.title}</Text>
                  {voucher.discount && (
                    <Text className="voucher-details">
                      – {voucher.discount}
                    </Text>
                  )}
                  {voucher.details && (
                    <Text className="voucher-details">– {voucher.details}</Text>
                  )}
                  <Text className="voucher-expiry">– {voucher.expiry}</Text>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Text style={{ fontFamily: "Montserrat, sans-serif" }}>
            Không có khuyến mãi nào cho tài khoản của bạn.
          </Text>
        )}
      </Row>
    </div>
  );
};

export default Promotion;
