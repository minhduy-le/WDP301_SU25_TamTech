import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button, Card, Image, Space, Typography, Rate } from "antd";
import AddOnModal from "../components/home/AddOnModal";
import { useCartStore } from "../store/cart.store";
import { useAuthStore } from "../hooks/usersApi";

interface Material {
  materialId: number;
  name: string;
  quantity: number;
  storeId: number;
}

interface ProductRecipe {
  productRecipeId: number;
  productId: number;
  materialId: number;
  quantity: number;
  Material: Material;
}

interface ProductType {
  productTypeId: number;
  name: string;
}

interface Store {
  storeId: number;
  name: string;
  address: string;
}

interface User {
  id: number;
  fullName: string;
}

interface Feedback {
  id: number;
  productId: number;
  userId: number;
  orderId: number;
  comment: string;
  rating: number;
  isResponsed: boolean;
  createdAt: string;
  updatedAt: string;
  User: User;
}

interface Product {
  productId: number;
  name: string;
  description: string;
  price: string;
  image: string;
  createAt: string;
  productTypeId: number;
  createBy: string;
  storeId: number;
  isActive: boolean;
  averageRating: number;
  ProductRecipes: ProductRecipe[];
  ProductType: ProductType;
  Store: Store;
  Feedbacks: Feedback[];
}

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (relatedProducts.length <= 4) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const maxSlides = Math.ceil(relatedProducts.length / 4) - 1;
        return prev >= maxSlides ? 0 : prev + 1;
      });
    }, 4000); 

    return () => clearInterval(interval);
  }, [relatedProducts.length]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}products/${productId}`
        );
        setProduct(res.data.product);
        // Set feedbacks from product data if available
        if (res.data.product.Feedbacks) {
          setFeedbacks(res.data.product.Feedbacks);
        }
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    setProduct(null);
    setFeedbacks([]);
    setRelatedProducts([]);
    setCurrentSlide(0);
    setShowAddOnModal(false);

    fetchProduct();
  }, [productId]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}products/type/${
            product.productTypeId
          }`
        );
        setRelatedProducts(
          res.data.products.filter(
            (p: Product) => p.productId !== product.productId
          )
        );
      } catch (err) {
        setRelatedProducts([]);
      }
    };
    if (product) fetchRelatedProducts();
  }, [product]);

  const handleOrderNow = () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    if (!product) return;
    const cartItem = {
      userId: user.id,
      productId: product.productId,
      productName: product.name,
      addOns: [],
      quantity: 1,
      price: parseFloat(product.price),
      totalPrice: parseFloat(product.price),
    };
    addToCart(cartItem);
    navigate("/checkout", { state: { selectedItems: [cartItem] } });
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Không tìm thấy sản phẩm</div>;

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(parseFloat(price));
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlides = Math.ceil(relatedProducts.length / 4) - 1;
      return prev <= 0 ? maxSlides : prev - 1;
    });
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => {
      const maxSlides = Math.ceil(relatedProducts.length / 4) - 1;
      return prev >= maxSlides ? 0 : prev + 1;
    });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "32px 16px",
        background: "linear-gradient(to right, #fff9ed, #fffbeb)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            gridTemplateColumns: "1fr",
            gap: 48,
            marginBottom: 48,
          }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Image
              src={product.image}
              alt={product.name}
              height={450}
              width={570}
              style={{ objectFit: "cover", borderRadius: "30px" }}
              preview={{
                style: {
                  borderRadius: "30px",
                },
              }}
            />

            <Space
              direction="horizontal"
              style={{ width: "100%", justifyContent: "space-between" }}
            >
              <Space>
                <Rate
                  disabled
                  allowHalf
                  value={Number(product?.averageRating) || 0}
                  style={{ color: "#fadb14" }}
                />
                <Text type="secondary">
                  ({Number(product?.averageRating)?.toFixed(1)})
                </Text>
              </Space>
              <Space>
                <Users size={16} />
                <Text type="secondary">{feedbacks.length} đánh giá</Text>
              </Space>
            </Space>
          </Space>

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Space direction="vertical" size="small">
              <Title
                level={2}
                style={{
                  fontSize: 50,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {product.name}
              </Title>
              <Paragraph type="secondary" style={{ fontSize: 18, margin: 0 }}>
                {product.description}
              </Paragraph>
            </Space>

            <Card
              style={{ borderColor: "#fed7aa", backgroundColor: "#fef0cc" }}
            >
              <Space align="baseline">
                <Title
                  level={3}
                  style={{
                    color: "#ea580c",
                    margin: 0,
                    fontSize: 35,
                    fontWeight: 700,
                  }}
                >
                  {formatPrice(product.price)}
                </Title>
              </Space>
            </Card>

            <Card style={{ borderStyle: "dashed", borderColor: "#fb923c" }}>
              <Title level={4} style={{ margin: "0 0 20px 0" }}>
                Nguyên liệu chính
              </Title>
              <Space direction="vertical" style={{ width: "100%" }}>
                {product.ProductRecipes.map((recipe) => (
                  <Card
                    key={recipe.productRecipeId}
                    style={{
                      backgroundColor: "#eefdf4",
                      borderColor: "#dcfce7",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Space>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            backgroundColor: "#22c55e",
                            borderRadius: "50%",
                          }}
                        />
                        <Text strong>{recipe.Material.name}</Text>
                      </Space>
                      <div style={{ textAlign: "right" }}>
                        <Text strong style={{ color: "#16a34a", fontSize: 12 }}>
                          {recipe.quantity}g
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            </Card>

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <Button
                type="primary"
                size="large"
                block
                style={{
                  background: "linear-gradient(to right, #f97316, #f25138)",
                  borderColor: "#f97316",
                  fontWeight: 500,
                  height: 41,
                  outline: "none",
                }}
                onClick={handleOrderNow}
              >
                Đặt món ngay - {formatPrice(product.price)}
              </Button>

              <Button
                size="large"
                block
                style={{
                  background: "#fff",
                  color: "#111",
                  border: "2px solid #dbeafe",
                  borderRadius: 10,
                  fontWeight: 600,
                  boxShadow: "none",
                  width: "100%",
                  transition: "border-color 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.borderColor = "#f35732")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.borderColor = "#dbeafe")
                }
                onMouseEnter={(e) => (e.currentTarget.style.outline = "none")}
                onClick={() => setShowAddOnModal(true)}
              >
                Thêm vào giỏ
              </Button>
            </Space>

            <Card style={{ borderColor: "#bfdbfe" }}>
              <Space>
                <Clock size={20} style={{ color: "#2563eb" }} />
                <div>
                  <Text strong style={{ color: "#1e3a8a" }}>
                    Thời gian chuẩn bị
                  </Text>
                  <Text
                    type="secondary"
                    style={{ display: "block", fontSize: 12 }}
                  >
                    15-20 phút
                  </Text>
                </div>
              </Space>
            </Card>
          </Space>
        </div>
  <Card style={{ marginTop: 48, borderColor: "#bfdbfe" }}>
          <Title
            level={3}
            style={{ marginBottom: 24, margin: "0 20px 10px 0" }}
          >
            Đánh giá từ khách hàng
          </Title>
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {feedbacks.map((feedback) => (
              <Card key={feedback.id} style={{ backgroundColor: "#f8fafc" }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Space>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(feedback.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </Text>
                    </Space>
                  </Space>
                  <Rate
                    disabled
                    defaultValue={feedback.rating}
                    style={{ color: "#fadb14" }}
                  />
                  <Paragraph style={{ margin: "8px 0 0 0" }}>
                    {feedback.comment}
                  </Paragraph>
                </Space>
              </Card>
            ))}
            {feedbacks.length === 0 && (
              <Text
                type="secondary"
                style={{ textAlign: "center", display: "block" }}
              >
                Chưa có đánh giá nào cho sản phẩm này
              </Text>
            )}
          </Space>
        </Card>

        {relatedProducts.length > 0 &&
          (relatedProducts.length >= 4 || relatedProducts.length % 4 === 0) && (
            <div style={{ marginTop: 48 }}>
              <Title
                level={2}
                style={{
                  marginBottom: 24,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span role="img" aria-label="chef">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 256 256"
                  >
                    <path
                      fill="#f76d1b"
                      d="M240 112a56.06 56.06 0 0 0-56-56c-1.77 0-3.54.1-5.29.26a56 56 0 0 0-101.42 0C75.54 56.1 73.77 56 72 56a56 56 0 0 0-24 106.59V208a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-45.41A56.09 56.09 0 0 0 240 112m-48 96H64v-40.58a55.5 55.5 0 0 0 8 .58h112a55.5 55.5 0 0 0 8-.58Zm-8-56h-13.75l5.51-22.06a8 8 0 0 0-15.52-3.88L153.75 152H136v-24a8 8 0 0 0-16 0v24h-17.75l-6.49-25.94a8 8 0 1 0-15.52 3.88L85.75 152H72a40 40 0 0 1 0-80h.58a55 55 0 0 0-.58 8a8 8 0 0 0 16 0a40 40 0 0 1 80 0a8 8 0 0 0 16 0a55 55 0 0 0-.58-8h.58a40 40 0 0 1 0 80"
                      strokeWidth="6.5"
                      stroke="#f76d1b"
                    />
                  </svg>
                </span>
                Các món liên quan
              </Title>

              <div style={{ position: "relative" }}>
                {relatedProducts.length > 4 &&
                  Math.ceil(relatedProducts.length / 4) > 1 && (
                    <>
                      <Button
                        type="text"
                        icon={<ChevronLeft size={24} />}
                        onClick={handlePrevSlide}
                        style={{
                          position: "absolute",
                          left: -20,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 10,
                          background: "#fff",
                          border: "2px solid #f97316",
                          borderRadius: "50%",
                          width: 48,
                          outline: "none",
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f97316";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.color = "#f97316";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1)";
                        }}
                      />
                      <Button
                        type="text"
                        icon={<ChevronRight size={24} />}
                        onClick={handleNextSlide}
                        style={{
                          position: "absolute",
                          right: -20,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 10,
                          background: "#fff",
                          border: "2px solid #f97316",
                          borderRadius: "50%",
                          outline: "none",
                          width: 48,
                          height: 48,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f97316";
                          e.currentTarget.style.color = "#fff";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#fff";
                          e.currentTarget.style.color = "#f97316";
                          e.currentTarget.style.transform =
                            "translateY(-50%) scale(1)";
                        }}
                      />
                    </>
                  )}

                <div
                  style={{
                    overflow: "hidden",
                    borderRadius: 16,
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      transition: "transform 0.5s ease-in-out",
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}
                  >
                    {Array.from({
                      length: Math.ceil(relatedProducts.length / 4),
                    }).map((_, slideIndex) => (
                      <div
                        key={slideIndex}
                        style={{
                          minWidth: "100%",
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 24,
                          padding: "0 8px",
                        }}
                      >
                        {relatedProducts
                          .slice(slideIndex * 4, slideIndex * 4 + 4)
                          .map((item) => (
                            <Card
                              key={item.productId}
                              hoverable
                              style={{
                                borderRadius: 16,
                                overflow: "hidden",
                                border: "1px solid #f3f4f6",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                                position: "relative",
                              }}
                              bodyStyle={{ padding: 0 }}
                              onClick={() =>
                                navigate(`/product/${item.productId}`)
                              }
                            >
                              <div style={{ position: "relative" }}>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  style={{
                                    width: "100%",
                                    height: 200,
                                    objectFit: "cover",
                                    transition: "transform 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1.05)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1)";
                                  }}
                                />
                                <div
                                  style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    background: "#fff",
                                    borderRadius: 20,
                                    padding: "2px 10px 2px 6px",
                                    display: "flex",
                                    alignItems: "center",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: "#f59e42",
                                    zIndex: 2,
                                  }}
                                >
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="#f59e42"
                                    style={{ marginRight: 4 }}
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  {Number(item.averageRating).toFixed(1)}
                                </div>
                              </div>
                              <div style={{ padding: 20 }}>
                                <Title
                                  level={4}
                                  style={{
                                    margin: "0 0 12px 0",
                                    fontSize: 18,
                                    fontWeight: 700,
                                    lineHeight: 1.3,
                                    height: 48,
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    color: "#1f2937",
                                  }}
                                >
                                  {item.name}
                                </Title>
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: 14,
                                    lineHeight: 1.4,
                                    height: 40,
                                    overflow: "hidden",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    marginBottom: 16,
                                    color: "#6b7280",
                                  }}
                                >
                                  {item.description}
                                </Text>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginTop: "auto",
                                  }}
                                >
                                  <Text
                                    strong
                                    style={{
                                      color: "#ea580c",
                                      fontSize: 20,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {formatPrice(item.price)}
                                  </Text>
                                  <Button
                                    type="primary"
                                    size="small"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #f97316, #ea580c)",
                                      border: "none",
                                      borderRadius: 8,
                                      fontWeight: 600,
                                      height: 36,
                                      boxShadow:
                                        "0 2px 4px rgba(249, 115, 22, 0.3)",
                                      transition: "all 0.2s ease",
                                      outline: "none",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform =
                                        "translateY(-1px)";
                                      e.currentTarget.style.boxShadow =
                                        "0 4px 8px rgba(249, 115, 22, 0.4)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform =
                                        "translateY(0)";
                                      e.currentTarget.style.boxShadow =
                                        "0 2px 4px rgba(249, 115, 22, 0.3)";
                                    }}
                                  >
                                    Xem chi tiết
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    ))}
                  </div>
                </div>

                {relatedProducts.length > 4 &&
                  Math.ceil(relatedProducts.length / 4) > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 8,
                        marginTop: 24,
                      }}
                    >
                      {Array.from({
                        length: Math.ceil(relatedProducts.length / 4),
                      }).map((_, index) => (
                        <div
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            backgroundColor:
                              currentSlide === index ? "#f97316" : "#e5e7eb",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (currentSlide !== index) {
                              e.currentTarget.style.backgroundColor = "#fbbf24";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentSlide !== index) {
                              e.currentTarget.style.backgroundColor = "#e5e7eb";
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
              </div>
            </div>
          )}

        <AddOnModal
          open={showAddOnModal}
          onClose={() => setShowAddOnModal(false)}
          product={product}
        />
      </div>
    </div>
  );
};

export default ProductDetail;
