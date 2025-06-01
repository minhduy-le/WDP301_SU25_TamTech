import React, { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Button,
  Card,
  Tag,
  Modal,
  Typography,
  Divider,
  Spin,
  message,
} from "antd";
import axios from "axios";
import { PlusOutlined, MinusOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../hooks/usersApi";
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

export interface AddOnProduct extends Product {
  selectedQuantity: number;
}

interface AddOnCategory {
  id: string;
  title: string;
  apiType?: number;
  selectionText: string;
  items: AddOnProduct[];
  loading: boolean;
}

const OurMenu: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [mainDishes, setMainDishes] = useState<Product[]>([]);
  const [drinks, setDrinks] = useState<Product[]>([]);
  const [sideDishes, setSideDishes] = useState<Product[]>([]);
  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingDrinks, setLoadingDrinks] = useState(true);
  const [loadingSide, setLoadingSide] = useState(true);
  const [activeTab, setActiveTab] = useState("mainDishes");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMainProductForModal, setSelectedMainProductForModal] =
    useState<Product | null>(null);
  const initialModalAddonCategories: AddOnCategory[] = [
    {
      id: "modal_drinks",
      title: "Nước uống",
      selectionText: "Tùy chọn",
      apiType: 2,
      items: [],
      loading: true,
    },
    {
      id: "modal_sideDishes",
      title: "Món ăn kèm",
      selectionText: "Tùy chọn",
      apiType: 3,
      items: [],
      loading: true,
    },
    {
      id: "modal_soups",
      title: "Canh ăn kèm",
      selectionText: "Tùy chọn",
      apiType: 4,
      items: [],
      loading: true,
    },
  ];
  const [modalAddonCategories, setModalAddonCategories] = useState<
    AddOnCategory[]
  >(JSON.parse(JSON.stringify(initialModalAddonCategories)));
  const [modalTotalPrice, setModalTotalPrice] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mainResponse, drinksResponse, sideResponse] = await Promise.all([
          axios.get(
            "https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/1"
          ),
          axios.get(
            "https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/2"
          ),
          axios.get(
            "https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/3"
          ),
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
      } catch (error) {
        console.error("Lỗi khi fetch dữ liệu menu chính:", error);
        message.error("Không thể tải thực đơn. Vui lòng thử lại!");
      } finally {
        setLoadingMain(false);
        setLoadingDrinks(false);
        setLoadingSide(false);
      }
    };
    fetchData();
  }, []);

  const fetchModalCategoryItems = useCallback(
    async (categoryIndex: number) => {
      const categoryToFetch = modalAddonCategories[categoryIndex];
      if (!categoryToFetch || !categoryToFetch.apiType) {
        return;
      }
      let dataToUse: Product[] = [];
      if (categoryToFetch.apiType === 2 && drinks.length > 0) {
        dataToUse = drinks;
      } else if (categoryToFetch.apiType === 3 && sideDishes.length > 0) {
        dataToUse = sideDishes;
      } else {
        try {
          const response = await axios.get(
            `https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/${categoryToFetch.apiType}`
          );
          dataToUse = response.data.products;
        } catch (error) {
          console.error(
            `Lỗi khi fetch ${categoryToFetch.title} cho modal:`,
            error
          );
          setModalAddonCategories((prev) => {
            const newCategories = [...prev];
            if (newCategories[categoryIndex]) {
              newCategories[categoryIndex].loading = false;
              newCategories[categoryIndex].items = [];
            }
            return newCategories;
          });
          return;
        }
      }

      setModalAddonCategories((prev) => {
        const newCategories = JSON.parse(JSON.stringify(prev));
        if (newCategories[categoryIndex]) {
          newCategories[categoryIndex].items = dataToUse.map((p) => ({
            ...p,
            price: p.price,
            selectedQuantity: 0,
          }));
          newCategories[categoryIndex].loading = false;
        }
        return newCategories;
      });
    },
    [drinks, sideDishes, modalAddonCategories]
  );

  useEffect(() => {
    if (isModalVisible && selectedMainProductForModal) {
      const freshCategories = JSON.parse(
        JSON.stringify(initialModalAddonCategories)
      );
      setModalAddonCategories(freshCategories);
      setModalTotalPrice(parseFloat(selectedMainProductForModal.price));
    }
  }, [isModalVisible, selectedMainProductForModal]);

  useEffect(() => {
    if (isModalVisible && selectedMainProductForModal) {
      modalAddonCategories.forEach((cat, index) => {
        if (cat.loading || (cat.items.length === 0 && cat.apiType)) {
          fetchModalCategoryItems(index);
        }
      });
    }
  }, [
    isModalVisible,
    selectedMainProductForModal,
    modalAddonCategories,
    fetchModalCategoryItems,
  ]);

  useEffect(() => {
    if (!selectedMainProductForModal) return;
    let currentTotal = parseFloat(selectedMainProductForModal.price);
    modalAddonCategories.forEach((category) => {
      category.items.forEach((item) => {
        currentTotal += item.selectedQuantity * parseFloat(item.price);
      });
    });
    setModalTotalPrice(currentTotal);
  }, [modalAddonCategories, selectedMainProductForModal]);

  const handleOpenModal = (product: Product) => {
    setSelectedMainProductForModal(product);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedMainProductForModal(null);
  };

  const handleModalQuantityChange = (
    categoryIndex: number,
    itemIndex: number,
    change: number
  ) => {
    setModalAddonCategories((prevCategories) => {
      const newCategories = JSON.parse(JSON.stringify(prevCategories));
      const item = newCategories[categoryIndex].items[itemIndex];
      let newItemQuantity = item.selectedQuantity + change;
      if (newItemQuantity < 0) newItemQuantity = 0;
      if (newItemQuantity > 10) newItemQuantity = 10;
      item.selectedQuantity = newItemQuantity;
      return newCategories;
    });
  };

  const handleAddToCartFromModal = () => {
    if (!selectedMainProductForModal || !user?.id) {
      message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    const selectedAddonsForCart = modalAddonCategories.flatMap((cat) =>
      cat.items
        .filter((item) => item.selectedQuantity > 0)
        .map((item) => ({
          productId: item.productId,
          productTypeName: item.ProductType?.name || "Không xác định",
          productName: item.name,
          quantity: item.selectedQuantity,
          price: parseFloat(item.price),
        }))
    );

    const cartItem = {
      userId: user.id,
      productId: selectedMainProductForModal.productId,
      productName: selectedMainProductForModal.name,
      addOns: selectedAddonsForCart,
      quantity: 1,
      price: parseFloat(selectedMainProductForModal.price),
      totalPrice: modalTotalPrice,
    };

    addToCart(cartItem);
    message.success(
      `${selectedMainProductForModal.name} và các món kèm đã được thêm vào giỏ!`
    );
    handleCloseModal();
  };

  const itemsToDisplay =
    activeTab === "mainDishes"
      ? mainDishes
      : activeTab === "sideDishes"
      ? sideDishes
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
    <div style={{ padding: "20px 0 50px 0", background: "#fff7e6" }}>
      <Title
        level={2}
        style={{
          color: "#f97316",
          textAlign: "center",
          marginBottom: "40px",
          fontWeight: "700",
          fontSize: "40px",
        }}
      >
        ------------------------------THỰC ĐƠN CỦA CHÚNG
        TÔI------------------------------
      </Title>

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
      </div>

      <Row
        gutter={[24, 32]}
        justify="center"
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        {(activeTab === "mainDishes" && loadingMain) ||
        (activeTab === "drinks" && loadingDrinks) ||
        (activeTab === "sideDishes" && loadingSide) ? (
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
                              message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
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
                            message.success(`${item.name} đã được thêm vào giỏ hàng!`);
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

      {selectedMainProductForModal && (
        <Modal
          centered
          open={isModalVisible}
          onCancel={handleCloseModal}
          footer={null}
          width={600}
          bodyStyle={{ padding: 0, backgroundColor: "#F8F0E5" }}
          closable={false}
          destroyOnClose
        >
          <div style={{ padding: "20px" }}>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCloseModal}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 10,
                border: "none",
                background: "transparent",
                fontSize: "18px",
                color: "#777",
              }}
            />
            <Row gutter={16} align="middle" style={{ marginBottom: "20px" }}>
              <Col>
                <img
                  src={selectedMainProductForModal.image}
                  alt={selectedMainProductForModal.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "8px",
                  }}
                />
              </Col>
              <Col flex="auto">
                <Title level={4} style={{ margin: 0, color: "#333" }}>
                  {selectedMainProductForModal.name}
                </Title>
                {selectedMainProductForModal.description && (
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    {selectedMainProductForModal.description.length > 60
                      ? selectedMainProductForModal.description.slice(0, 60) +
                        "..."
                      : selectedMainProductForModal.description}
                  </Text>
                )}
              </Col>
              <Col>
                <Tag
                  color="#f97316"
                  style={{
                    fontSize: "16px",
                    padding: "6px 12px",
                    fontWeight: "bold",
                  }}
                >
                  {parseFloat(
                    selectedMainProductForModal.price
                  ).toLocaleString()}
                  đ
                </Tag>
              </Col>
            </Row>
            <Divider style={{ margin: "0 0 20px 0" }} />
            <div
              style={{
                maxHeight: "calc(100vh - 420px)",
                overflowY: "auto",
                paddingRight: "10px",
              }}
            >
              {modalAddonCategories.map((category, catIndex) => (
                <div key={category.id} style={{ marginBottom: "24px" }}>
                  <Title
                    level={5}
                    style={{
                      marginBottom: "4px",
                      color: "#4A4A4A",
                      fontWeight: "bold",
                      marginTop: "6px",
                    }}
                  >
                    {" "}
                    {category.title}{" "}
                    <Text
                      type="secondary"
                      style={{
                        marginLeft: "8px",
                        fontSize: "13px",
                        fontWeight: "normal",
                      }}
                    >
                      ({category.selectionText})
                    </Text>{" "}
                  </Title>
                  <Divider style={{ margin: "8px 0 12px 0" }} />
                  {category.loading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                      <Spin
                        tip={`Đang tải ${category.title.toLowerCase()}...`}
                      />
                    </div>
                  ) : category.items.length === 0 ? (
                    <Text>Không có lựa chọn nào cho mục này.</Text>
                  ) : (
                    category.items.map((item, itemIndex) => (
                      <Row
                        key={item.productId}
                        justify="space-between"
                        align="middle"
                        style={{
                          marginBottom: "12px",
                          padding: "8px",
                          background: "#fff",
                          borderRadius: "6px",
                        }}
                      >
                        <Col>
                          {" "}
                          <Text style={{ fontSize: "15px", color: "#333" }}>
                            {item.name}
                          </Text>{" "}
                          <br />{" "}
                          <Text
                            style={{
                              fontSize: "14px",
                              color: "#f97316",
                              fontWeight: 500,
                            }}
                          >
                            {" "}
                            + {parseFloat(item.price).toLocaleString()}đ{" "}
                          </Text>{" "}
                        </Col>
                        <Col>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              border: "1px solid #d9d9d9",
                              borderRadius: "6px",
                              borderColor: "#f97316",
                            }}
                          >
                            <Button
                              icon={<MinusOutlined />}
                              onClick={() =>
                                handleModalQuantityChange(
                                  catIndex,
                                  itemIndex,
                                  -1
                                )
                              }
                              type="text"
                              style={{
                                borderRight: "1px solid #d9d9d9",
                                padding: "0 10px",
                                height: "30px",
                                outline: "none",
                                borderColor: "#d97706",

                              }}
                              disabled={item.selectedQuantity === 0}
                            />
                            <Text
                              style={{
                                padding: "0 12px",
                                fontSize: "14px",
                                height: "30px",
                                lineHeight: "30px",
                                minWidth: "20px",
                                textAlign: "center",
                              }}
                            >
                              {item.selectedQuantity}
                            </Text>
                            <Button
                              icon={<PlusOutlined />}
                              onClick={() =>
                                handleModalQuantityChange(
                                  catIndex,
                                  itemIndex,
                                  1
                                )
                              }
                              type="text"
                              style={{
                                borderLeft: "1px solid #d9d9d9",
                                borderRadius: "0 4px 4px 0",
                                padding: "0 10px",
                                height: "30px",
                                outline: "none",
                                borderColor: "#d97706",
                              }}
                              disabled={item.selectedQuantity >= 10}
                            />
                          </div>
                        </Col>
                      </Row>
                    ))
                  )}
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              padding: "16px 20px",
              borderTop: "1px solid #e8e8e8",
              background: "#fff",
              position: "sticky",
              bottom: 0,
              zIndex: 1,
            }}
          >
            <Button
              type="primary"
              block
              style={{
                backgroundColor: "#6A994E",
                borderColor: "#6A994E",
                height: "48px",
                fontSize: "16px",
                fontWeight: "bold",
              }}
              onClick={handleAddToCartFromModal}
            >
              {" "}
              {modalTotalPrice.toLocaleString()}đ - Thêm vào giỏ hàng{" "}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OurMenu;
