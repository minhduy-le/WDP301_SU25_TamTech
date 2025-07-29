import React, { useEffect, useState } from "react";
import { Row, Col, Button, Card, message, Typography, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../hooks/usersApi";
import { useProductTypes } from "../../hooks/productTypesApi";
import type { ProductDto } from "../../hooks/productsApi";
import { useGetProductByTypeId } from "../../hooks/productsApi";
import AddOnModal from "./AddOnModal";
import "./OurMenu.css";
const { Title, Text } = Typography;

const OurMenu: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { data: productTypes, isLoading: isProductTypesLoading } = useProductTypes();
  const [activeTypeId, setActiveTypeId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<ProductDto | null>(null);

  useEffect(() => {
    if (!isProductTypesLoading && productTypes && productTypes.length > 0 && activeTypeId === null) {
      setActiveTypeId(productTypes[0].productTypeId);
    }
  }, [isProductTypesLoading, productTypes, activeTypeId]);

  const {
    data: products = [],
    isLoading: isProductsLoading,
  } = useGetProductByTypeId(activeTypeId ?? 0);

  const handleOpenModal = (product: ProductDto) => {
    setSelectedProductForModal(product);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedProductForModal(null);
  };

  const tabButtonStyle = (tabId: number) => ({
    padding: "10px 28px",
    fontSize: "18px",
    fontWeight: 600,
    borderRadius: "8px",
    margin: "0 8px",
    transition: "all 0.3s ease",
    border: "1px solid transparent",
    color: activeTypeId === tabId ? "#fff" : "#f97316",
    backgroundColor: activeTypeId === tabId ? "#f97316" : "transparent",
    boxShadow: activeTypeId === tabId ? "0 4px 14px rgba(249, 115, 22, 0.3)" : "none",
    outline: "none",
    fontFamily: "'Montserrat', sans-serif",
  });

  return (
    <div style={{ padding: "5px 0 50px 0", background: "#fff7e6" }}>
      <div className="our-menu-title-wrapper">
        <span className="our-menu-title">THỰC ĐƠN CỦA CHÚNG TÔI</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        {isProductTypesLoading ? (
          <Spin />
        ) : (
          productTypes?.map((type) => (
            <Button
              key={type.productTypeId}
              style={tabButtonStyle(type.productTypeId)}
              onClick={() => setActiveTypeId(type.productTypeId)}
            >
              {type.name}
            </Button>
          ))
        )}
      </div>

      <Row
        gutter={[24, 32]}
        justify="center"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {isProductsLoading ? (
          <Col span={24} style={{ textAlign: "center" }}>
            <Spin />
          </Col>
        ) : products.length === 0 ? (
          <Col span={24}>
            <p style={{ textAlign: "center", fontSize: 16, color: "#666" }}>
              Không có món nào trong danh mục này.
            </p>
          </Col>
        ) : (
          products.slice(0, 4).map((item) => {
            const displayDescription =
              item.description &&
              item.description.trim() !== "" &&
              item.description.trim().toLowerCase() !== item.name.trim().toLowerCase()
                ? item.description
                : "Hương vị tuyệt vời, lựa chọn hoàn hảo cho bữa ăn của bạn.";

            const isMainDish =
              productTypes?.find((t) => t.productTypeId === activeTypeId)?.name === "Đồ ăn";

            return (
              <Col key={item.productId} xs={24} sm={12} md={8} lg={6}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.07)",
                    transition: "all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    background: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    width: "100%",
                    border: "1px solid #e67e22",
                  }}
                  bodyStyle={{
                    padding: "0",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-8px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 35px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.07)";
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      paddingTop: "75%",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://via.placeholder.com/400x300/FDFCFB/CCC?text=Ảnh+món";
                      }}
                    />
                    {typeof item.averageRating !== 'undefined' && item.averageRating !== null && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: 'rgba(255,255,255,0.95)',
                          borderRadius: 16,
                          padding: '2px 10px 2px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          fontWeight: 600,
                          fontSize: 15,
                          color: '#e67e22',
                          zIndex: 2,
                        }}
                      >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="#f7b731" style={{marginRight: 4}}>
                          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                        </svg>
                        {parseFloat(String(item.averageRating)).toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "16px",
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Title
                      level={5}
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 600,
                        color: "#2c3e50",
                        marginBottom: "4px",
                        lineHeight: 1.35,
                        height: "calc(1.35em * 1.5)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        marginTop: "10px",
                        cursor: "pointer",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                      title={item.name}
                      onClick={() => navigate(`/product/${item.productId}`)}
                    >
                      {item.name}
                    </Title>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "0.875rem",
                        color: "#7f8c8d",
                        lineHeight: 1.5,
                        height: "calc(1.5em * 2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        marginBottom: "12px",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {displayDescription}
                    </Text>

                    <div
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: "bold",
                          color: "#e67e22",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {parseFloat(item.price.toString()).toLocaleString()}đ
                      </Text>
                      <Button
                        type="primary"
                        shape="circle"
                        style={{
                          backgroundColor: "#f97316",
                          borderColor: "#e67e22",
                          width: "100px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 10px rgba(230, 126, 34, 0.3)",
                          fontWeight: "bold",
                          outline: "none",
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                        onClick={() => {
                          if (isMainDish) {
                            handleOpenModal(item);
                          } else {
                            if (!user?.id) {
                              message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
                              return;
                            }
                            const cartItem = {
                              userId: user.id,
                              productId: item.productId,
                              productName: item.name,
                              addOns: [],
                              quantity: 1,
                              price: item.price,
                              totalPrice: item.price,
                            };
                            addToCart(cartItem);
                            message.success(`${item.name} đã được thêm vào giỏ hàng!`);
                          }
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#fb923c";
                          (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#f97316";
                          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                        }}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })
        )}
      </Row>

      <AddOnModal
        open={isModalVisible}
        onClose={handleCloseModal}
        product={selectedProductForModal as any}
      />
    </div>
  );
};

export default OurMenu;
