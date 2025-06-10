import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Card,
  Spin,
  message,
  Typography,
} from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../hooks/usersApi";
import { useProductTypes } from "../../hooks/productTypesApi";
import AddOnModal from "./AddOnModal";
import "./OurMenu.css";
const { Title, Text } = Typography;

interface Product {
  productId: number;
  name: string;
  image: string;
  description?: string;
  price: string;
  quantity?: number;
  isFavorite?: boolean;
  ProductType?: { name?: string };
}
const OurMenu: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { data: productTypes, isLoading: isProductTypesLoading } =
    useProductTypes();
  const [mainDishes, setMainDishes] = useState<Product[]>([]);
  const [drinks, setDrinks] = useState<Product[]>([]);
  const [sideDishes, setSideDishes] = useState<Product[]>([]);
  const [soup, setSoup] = useState<Product[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [loadingSide, setLoadingSide] = useState(true);
  const [loadingSoup, setLoadingSoup] = useState(true);
  const [activeTab, setActiveTab] = useState("mainDishes");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMainProductForModal, setSelectedMainProductForModal] =
    useState<Product | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!productTypes) return;

        const mainType = productTypes.find((type) => type.productTypeId === 1);
        const drinkType = productTypes.find((type) => type.productTypeId === 2);
        const sideType = productTypes.find((type) => type.productTypeId === 3);
        const soupType = productTypes.find((type) => type.productTypeId === 4);

        const [mainResponse, drinksResponse, sideResponse, soupResponse] =
          await Promise.all([
            mainType
              ? axios.get(
                  `https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/${mainType.productTypeId}`
                )
              : Promise.resolve({ data: { products: [] } }),
            drinkType
              ? axios.get(
                  `https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/${drinkType.productTypeId}`
                )
              : Promise.resolve({ data: { products: [] } }),
            sideType
              ? axios.get(
                  `https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/${sideType.productTypeId}`
                )
              : Promise.resolve({ data: { products: [] } }),
            soupType
              ? axios.get(
                  `https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/${soupType.productTypeId}`
                )
              : Promise.resolve({ data: { products: [] } }),
          ]);

        const parseProductData = (data: any[]): Product[] =>
          data.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            description: item.description,
            price: item.price,
            quantity: 1,
            isFavorite: false,
            ProductType: item.ProductType,
          }));

        setMainDishes(parseProductData(mainResponse.data.products));
        setDrinks(parseProductData(drinksResponse.data.products));
        setSideDishes(parseProductData(sideResponse.data.products));
        setSoup(parseProductData(soupResponse.data.products));
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu menu chính:", error);
        message.error("Không thể tải thực đơn. Vui lòng thử lại!");
      } finally {
        setLoadingMain(false);
        setLoadingDrinks(false);
        setLoadingSide(false);
        setLoadingSoup(false);
      }
    };

    if (!isProductTypesLoading && productTypes) {
      fetchData();
    }
  }, [isProductTypesLoading, productTypes]);

  const handleOpenModal = (product: Product) => {
    setSelectedMainProductForModal(product);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMainProductForModal(null);
  };


  const itemsToDisplay =
    activeTab === "mainDishes"
      ? mainDishes
      : activeTab === "sideDishes"
      ? sideDishes
      : activeTab === "soup"
      ? soup
      : drinks;

  const tabButtonStyle = (tabName: string) => ({
    padding: "10px 28px",
    fontSize: "18px",
    fontWeight: 600,
    borderRadius: "8px",
    margin: "0 8px",
    transition: "all 0.3s ease",
    border: "1px solid transparent",
    color: activeTab === tabName ? "#fff" : "#f97316",
    backgroundColor: activeTab === tabName ? "#f97316" : "transparent",
    boxShadow:
      activeTab === tabName ? "0 4px 14px rgba(249, 115, 22, 0.3)" : "none",
    outline: "none",
  });
 
  return (
    <div style={{ padding: "5px 0 50px 0", background: "#fff7e6" }}>
      <div className="our-menu-title-wrapper">
        <span className="our-menu-title">THỰC ĐƠN CỦA CHÚNG TÔI</span>
      </div>

      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <Button
          style={tabButtonStyle("mainDishes")}
          onClick={() => setActiveTab("mainDishes")}
        >
          MÓN CHÍNH
        </Button>
        <Button
          style={tabButtonStyle("sideDishes")}
          onClick={() => setActiveTab("sideDishes")}
        >
          MÓN ĂN KÈM
        </Button>
        <Button
          style={tabButtonStyle("drinks")}
          onClick={() => setActiveTab("drinks")}
        >
          ĐỒ UỐNG
        </Button>
        <Button
          style={tabButtonStyle("soup")}
          onClick={() => setActiveTab("soup")}
        >
          CANH
        </Button>
      </div>

      <Row
        gutter={[24, 32]}
        justify="center"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {(activeTab === "mainDishes" && loadingMain) ||
        (activeTab === "drinks" && loadingDrinks) ||
        (activeTab === "sideDishes" && loadingSide) ||
        (activeTab === "soup" && loadingSoup) ? (
          <Col span={24} style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" tip="Đang tải thực đơn..." />
          </Col>
        ) : itemsToDisplay.length === 0 ? (
          <Col span={24}>
            <p style={{ textAlign: "center", fontSize: 16, color: "#666" }}>
              Không có món nào trong danh mục này.
            </p>
          </Col>
        ) : (
          itemsToDisplay.slice(0, 4).map((item) => {
            const displayDescription =
              item.description &&
              item.description.trim() !== "" &&
              item.description.trim().toLowerCase() !==
                item.name.trim().toLowerCase()
                ? item.description
                : "Hương vị tuyệt vời, lựa chọn hoàn hảo cho bữa ăn của bạn.";

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
                  }}
                  bodyStyle={{
                    padding: "0",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(-8px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 18px 35px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 10px 30px rgba(0, 0, 0, 0.07)";
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
                        }}
                      >
                        {parseFloat(item.price).toLocaleString()}đ
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
                        }}
                        onClick={() => {
                          if (activeTab === "mainDishes") {
                            handleOpenModal(item);
                          } else {
                            if (!user?.id) {
                              message.error(
                                "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!"
                              );
                              return;
                            }
                            const cartItem = {
                              userId: user.id,
                              productId: item.productId,
                              productName: item.name,
                              addOns: [],
                              quantity: 1,
                              price: parseFloat(item.price),
                              totalPrice: parseFloat(item.price),
                            };
                            addToCart(cartItem);
                            message.success(
                              `${item.name} đã được thêm vào giỏ hàng!`
                            );
                          }
                        }}
                        onMouseEnter={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#fb923c";
                          (e.currentTarget as HTMLElement).style.transform =
                            "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          (
                            e.currentTarget as HTMLElement
                          ).style.backgroundColor = "#f97316";
                          (e.currentTarget as HTMLElement).style.transform =
                            "scale(1)";
                        }}
                      >
                        Thêm vào giỏ
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
        product={selectedMainProductForModal}
      />
    </div>
  );
};

export default OurMenu;
