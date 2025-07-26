import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Users } from "lucide-react";
import {
  Button,
  Card,
  Image,
  Space,
  Typography,
  Rate,
} from "antd";
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
  comment: string;
  rating: number;
  isFeedback: boolean;
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
  ProductRecipes: ProductRecipe[];
  ProductType: ProductType;
  Store: Store;
}

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [showAddOnModal, setShowAddOnModal] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();

  const averageRating =
    feedbacks.length > 0
      ? (
          feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        ).toFixed(1)
      : "0.0";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}products/${productId}`
        );
        setProduct(res.data.product);
      } catch (err) {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}feedback/${productId}`
        );
        setFeedbacks(res.data.feedbacks);
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      }
    };

    fetchProduct();
    fetchFeedbacks();
  }, [productId]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product) return;
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}products/type/${product.productTypeId}`
        );
        // Exclude the current product
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
                }
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
                  value={parseFloat(averageRating)}
                  style={{ color: "#fadb14" }}
                />
                <Text type="secondary">({averageRating})</Text>
              </Space>
              <Space>
                <Users size={16} />
                <Text type="secondary">{feedbacks.length} đánh giá</Text>
              </Space>
            </Space>
          </Space>

          {/* Thông tin sản phẩm */}
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Space direction="vertical" size="small">
              <Text
                style={{
                  width: "60px",
                  backgroundColor: "#f1f5f9",
                  height: "20px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {product.ProductType.name}
              </Text>
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

            {/* Giá */}
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
                <Text delete type="secondary">
                  {formatPrice((parseFloat(product.price) * 1.2).toString())}
                </Text>
              </Space>
            </Card>

            {/* Nguyên liệu */}
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
                          {recipe.quantity} phần
                        </Text>
                        <Text
                          type="secondary"
                          style={{ display: "block", fontSize: 12 }}
                        >
                          Còn {recipe.Material.quantity} trong kho
                        </Text>
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            </Card>

            {/* Actions */}
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
              <Space
                style={{
                  width: "100%",
                  display: "flex",
                  gap: 16,
                  justifyContent: "space-between",
                }}
              >
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
                    width: "280px",
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
                    width: "280px",
                    transition: "border-color 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.borderColor = "#f35732")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.borderColor = "#dbeafe")
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.outline = "none")}
                >
                  Yêu thích ♡
                </Button>
              </Space>
            </Space>

            {/* Thông tin giao hàng */}
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
                      <Text strong>{feedback.User.fullName}</Text>
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

        {/* Related Products Section */}
        <div style={{ marginTop: 48 }}>
          <Title level={2} style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
            <span  role="img" aria-label="chef">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 256 256"
              >
                <path
                  fill="#f76d1b"
                  d="M240 112a56.06 56.06 0 0 0-56-56c-1.77 0-3.54.1-5.29.26a56 56 0 0 0-101.42 0C75.54 56.1 73.77 56 72 56a56 56 0 0 0-24 106.59V208a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16v-45.41A56.09 56.09 0 0 0 240 112m-48 96H64v-40.58a55.5 55.5 0 0 0 8 .58h112a55.5 55.5 0 0 0 8-.58Zm-8-56h-13.75l5.51-22.06a8 8 0 0 0-15.52-3.88L153.75 152H136v-24a8 8 0 0 0-16 0v24h-17.75l-6.49-25.94a8 8 0 1 0-15.52 3.88L85.75 152H72a40 40 0 0 1 0-80h.58a55 55 0 0 0-.58 8a8 8 0 0 0 16 0a40 40 0 0 1 80 0a8 8 0 0 0 16 0a55 55 0 0 0-.58-8h.58a40 40 0 0 1 0 80"
                  stroke-width="6.5"
                  stroke="#f76d1b"
                />
              </svg>
            </span>
            Các món liên quan
          </Title>
          <div
            style={{
              display: "flex",
              gap: 24,
              overflowX: "auto",
              paddingBottom: 16,
            }}
          >
            {relatedProducts.length === 0 && (
              <Text type="secondary">Không có món liên quan</Text>
            )}
            {relatedProducts.map((item) => (
              <Card
                key={item.productId}
                hoverable
                style={{
                  minWidth: 260,
                  maxWidth: 280,
                  borderRadius: 16,
                  flex: "0 0 auto",
                  background: "#fff",
                }}
                cover={
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                  />
                }
                bodyStyle={{ padding: 16 }}
              >
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    padding: 0,
                    fontWeight: 700,
                    fontSize: 18,
                    minHeight: 40,
                  }}
                >
                  {item.name}
                </Title>
                <Text
                  type="secondary"
                  style={{
                    fontSize: 14,
                    minHeight: 40,
                    display: "block",
                    margin: "0",
                  }}
                >
                  {item.description}
                </Text>
                {/* <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    margin: "8px 0",
                  }}
                >
                  <Rate
                    disabled
                    defaultValue={4}
                    style={{ color: "#fadb14", fontSize: 18 }}
                  />
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    (4.0)
                  </Text>
                </div> */}
                <Text strong style={{ color: "#ea580c", fontSize: 18 }}>
                  {formatPrice(item.price)}
                </Text>
                <Button
                  type="primary"
                  style={{
                    marginTop: 12,
                    background: "#ff7a1a",
                    border: "none",
                    fontWeight: 700,
                    borderRadius: 8,
                    width: "100%",
                  }}
                  onClick={() =>
                    (window.location.href = `/product/${item.productId}`)
                  }
                >
                  Xem chi tiết
                </Button>
              </Card>
            ))}
          </div>
        </div>
        <AddOnModal open={showAddOnModal} onClose={() => setShowAddOnModal(false)} product={product} />
      </div>
    </div>
  );
};

export default ProductDetail;
