import React, { useState } from "react";
import { Row, Col, Card, Button, Spin } from "antd";
import { useBestSellerProducts } from "../../hooks/productsApi";
import AddOnModal from "./AddOnModal";
import { useNavigate } from "react-router-dom";

interface Product {
  productId: number;
  name: string;
  image: string;
  description?: string;
  price: string;
  quantity?: number;
  isFavorite?: boolean;
  ProductType?: { name?: string };
  originalPrice: number;
  sold: number;
  averageRating?: number;
}

const BestSellers: React.FC = () => {
  const { data, isLoading, isError } = useBestSellerProducts();
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = (data || [])
    .map((item: any) => ({
      productId: item.productId,
      name: item.name,
      image: item.image,
      description: item.description,
      price: item.price.toString(),
      quantity: 1,
      isFavorite: false,
      ProductType: item.ProductType,
      originalPrice: Number(item.price) + 24000,
      sold: 1000,
      averageRating: item.averageRating || 0,
    }))
    .slice(0, 3);

  const handleOpenModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
  };

  if (isLoading)
    return (
      <Spin
        size="large"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      />
    );
  if (isError) return <div>Lỗi khi tải sản phẩm bán chạy!</div>;

  return (
    <section style={{ padding: "20px 0 120px 0", background: "linear-gradient(to bottom, #f97316, #fff7e6)" }}>
      <h2
        style={{
          fontSize: "40px",
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: "30px",
          color: "#fff7e6",
          letterSpacing: "1px",
          marginTop: "0px",
          fontFamily: "'Montserrat', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        MÓN ĂN NỔI BẬT
        <svg
          style={{ verticalAlign: "sub" }}
          xmlns="http://www.w3.org/2000/svg"
          width="65"
          height="65"
          viewBox="0 0 64 64"
        >
          <path
            fill="#efe6db"
            d="M21.606 17.794s1.719-1.396 1.282-3.142c-.437-1.744-2.918-3.395-2.918-3.395s-1.44 2.512-1.003 4.257c.436 1.745 2.639 2.28 2.639 2.28"
          />
          <path
            fill="#efe6db"
            d="M48.668 3.548c-2.501 1.641-2.044 5.021-2.044 5.021l.091.04c-2.308 1.161-4.425 2.665-6.333 4.373c-.383.345-.749.706-1.115 1.067c.442-.623.784-1.416.693-2.341c-.228-2.315-3.098-4.853-3.098-4.853s-2.331 2.986-2.104 5.3c.226 2.315 2.953 3.374 2.953 3.374s.172-.105.419-.301a38 38 0 0 0-2.414 2.902c.085-.413.103-.857.006-1.325c-.494-2.388-3.767-4.746-3.767-4.746s-2.09 3.336-1.596 5.721c.454 2.188 2.965 3.068 3.383 3.201a51 51 0 0 0-2.101 3.672a3.6 3.6 0 0 0-.243-1.586c-.753-1.879-3.205-3.469-4.369-4.139c1.326-.822 2.37-2.189 2.37-2.189s-2.681-1.35-4.542-.941s-2.432 2.475-2.432 2.475s1.49 1.61 3.351 1.201c.122-.026.24-.08.358-.121c-.073.227-.152.495-.232.795c-.945-.262-2.716-.635-3.974-.195c-.832.292-1.331.903-1.637 1.477c1.014-2.126 2.296-4.142 3.9-5.962c.472.076 2.807.359 4.156-1.158c1.509-1.693 1.403-5.206 1.403-5.206s-3.703.533-5.211 2.227s-.439 4.123-.439 4.123l.077.013c-1.467 1.3-2.718 2.821-3.771 4.453c-.216.339-.418.685-.615 1.032c.202-.553.299-1.216.026-1.901c-.667-1.679-3.351-3.022-3.351-3.022s-1.09 2.663-.421 4.342c.668 1.679 2.923 1.95 2.923 1.95s.109-.117.253-.313q-.666 1.3-1.188 2.656a2.5 2.5 0 0 0-.27-1.019c-.881-1.682-3.822-2.816-3.822-2.816s-.838 2.877.044 4.56c.824 1.574 2.936 1.725 3.207 1.737a38 38 0 0 0-.777 3.155a2.8 2.8 0 0 0-.518-1.158c-1.281-1.665-4.682-2.387-4.682-2.387s-.34 3.253.939 4.918c1.197 1.555 3.522 1.358 3.827 1.325a51 51 0 0 0-.363 3.657c-.009.181-.006.36-.014.54a3.13 3.13 0 0 0-.85-1.633c-1.576-1.594-5.248-1.938-5.248-1.938s.091 3.459 1.667 5.053s4.24.918 4.24.918s.073-.2.143-.517c-.01 1.128.003 2.255.056 3.379c.107 1.932.273 3.857.55 5.771a69 69 0 0 0 1.036 5.698q.131.556.268 1.108a42 42 0 0 1-2.465-3.193c-1.692-2.461-3.092-5.08-4.08-7.832a29 29 0 0 1-1.697-8.542c-.132-2.92.186-5.864.777-8.804a23.9 23.9 0 0 0-1.989 8.81c-.112 3.039.391 6.11 1.431 9.003c1.041 2.896 2.605 5.611 4.563 8.021a30.4 30.4 0 0 0 3.199 3.393q.306.27.618.533c.279 1.039.583 2.069.94 3.087a98 98 0 0 1-.512-2.727c.853.702 1.741 1.36 2.703 1.921a36 36 0 0 1-1.901-1.887a27 27 0 0 1 1.133-3.468a28 28 0 0 1 1.545-3.273a23.4 23.4 0 0 1 3.343-4.579c-.086.523-.19 1.043-.263 1.567a87 87 0 0 0-.675 6.31c-.538 1.583-.996 3.196-1.182 4.843c.302-.958.656-1.894 1.046-2.815c-.1 2.205-.146 4.414-.021 6.617q.307-3.728.829-7.423c.064-.476.144-.949.214-1.424a50 50 0 0 1 2.564-4.604a53.5 53.5 0 0 1 6.646-8.458c.184-.191.38-.372.564-.561c1.573-.505 3.2-.903 4.868-1.224a22 22 0 0 0-3.802.168a62 62 0 0 1 6.625-5.51c2.979-2.147 6.164-4.055 9.465-5.839a48.7 48.7 0 0 0-10.175 4.917a46.5 46.5 0 0 0-8.606 6.973c-.435.115-.87.225-1.298.368a19 19 0 0 0-4.635 2.288c.14-.57.264-1.143.416-1.71q.447-1.73.959-3.444c.639.364 3.148 1.637 5.451.506c2.663-1.311 4.373-5.501 4.373-5.501s-4.649-1.069-7.313.238a4.2 4.2 0 0 0-1.272.959a66 66 0 0 1 1.631-4.22c.235.189 2.636 2.042 5.161 1.151c2.659-.938 4.777-4.684 4.777-4.684s-4.225-1.507-6.884-.569a4.13 4.13 0 0 0-1.786 1.242a52 52 0 0 1 2.25-4.232c-.073.173-.106.278-.106.278s1.931 2.257 4.477 1.794c2.544-.463 5.061-3.531 5.061-3.531s-3.559-1.96-6.103-1.497c-1.086.198-1.867.815-2.41 1.458c2.006-2.28 4.299-4.347 6.91-6.077c.562.244 3.382 1.345 5.625-.126C54.858 6.85 56 2.422 56 2.422s-4.828-.515-7.332 1.126M22.032 33.499c.125.225.273.422.431.608c-1.06.08-3.574.387-4.894 1.535c-.333.289-.57.618-.74.958c.058-1.155.168-2.305.305-3.452c.112.051 2.356 1.05 4.088-.122c.161-.108.311-.238.454-.375c.096.297.209.584.356.848m-.605-4.84c-1.001.096-2.118.328-2.904.859a3.03 3.03 0 0 0-1.05 1.241c.189-1.158.446-2.303.74-3.438c-.007.068-.009.112-.009.112s1.638 1.097 3.301.619a16 16 0 0 0-.078.607m10.108 12.159c-1.929 2.228-3.63 4.629-5.016 7.182a35 35 0 0 0-.997 1.997c.158-.926.317-1.851.493-2.772q.329-1.648.687-3.286a21.7 21.7 0 0 1 4.833-3.121m-6.461 2.527a18.5 18.5 0 0 0-4.442 6.229a19.3 19.3 0 0 0-1.178 3.558c-.258 1.209-.44 2.438-.398 3.664q-.495-.525-.967-1.063c-.104-.64-.213-1.279-.305-1.921a108 108 0 0 1-.685-5.698c-.164-1.905-.305-3.809-.346-5.714a76 76 0 0 1-.028-2.742c.552.15 2.693.62 4.164-.658c1.317-1.146 1.833-3.465 1.999-4.452c1.637 1.445 4.117 1.454 4.117 1.454s.164-.227.366-.6a79 79 0 0 0-1.155 4.246c-.256 1.11-.49 2.226-.71 3.342c-.141.121-.295.229-.432.355m3.041-10.289c.064-.736-.037-1.537-.471-2.313c-.931-1.664-3.22-2.927-4.648-3.587c1.183-1.13 1.929-2.82 1.929-2.82s-3.07-.787-4.861.041c-.768.353-1.207.961-1.472 1.544c.044-.148.075-.299.12-.445a32 32 0 0 1 1.315-3.453c-.136.388-.177.673-.177.673s1.696 1.421 3.485.795c.875-.305 1.662-1.06 2.24-1.754c-.159 1.108-.174 2.321.222 3.306c.924 2.302 3.846 2.811 4.293 2.876a68 68 0 0 0-1.763 4.466c-.076.22-.138.448-.212.671"
          />
          <path
            fill="#efe6db"
            d="M42.649 10.704s2.659-1.2 2.744-3.523C45.479 4.856 42.972 2 42.972 2s-2.713 2.686-2.798 5.011c-.087 2.323 2.475 3.693 2.475 3.693m.855.859s1.282 2.492 3.761 2.573c2.477.081 5.524-2.271 5.524-2.271s-2.866-2.544-5.344-2.623c-2.478-.081-3.941 2.321-3.941 2.321"
          />
        </svg>
      </h2>
      <Row gutter={[32, 32]} justify="center">
        {products.map((product: any) => (
          <Col key={product.productId} xs={24} sm={12} md={8} lg={7}>
            <Card
              style={{
                borderRadius: 24,
                overflow: "hidden",
                background: "#fff7e6",
                boxShadow: "0 4px 24px #0001",
                border: "none",
              }}
              cover={
                <div style={{ position: "relative" }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: 200,
                      objectFit: "cover",
                      borderTopLeftRadius: 24,
                      borderTopRightRadius: 24,
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      background: "#fff",
                      color: "#f7b731",
                      fontWeight: 600,
                      borderRadius: 15,
                      padding: "1px 10px",
                      fontSize: 15,
                      fontFamily: "'Montserrat', sans-serif",
                      boxShadow: "0 2px 8px #0002",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="#f7b731">
                          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
                        </svg>
                     {product.averageRating}
                  </span>
                </div>
              }
              bodyStyle={{ padding: 24 }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 22,
                  marginBottom: 8,
                  cursor: "pointer",
                  fontFamily: "'Montserrat', sans-serif",
                }}
                onClick={() => navigate(`/product/${product.productId}`)}
              >
                {product.name.toUpperCase()}
              </div>
              <div
                style={{
                  color: "#444",
                  marginBottom: 16,
                  fontSize: 16,
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {product.description}
              </div>
              
              
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 17,
                      marginRight: 12,
                      background: "#f97316",
                      borderRadius: 5,
                      padding: "2px 12px",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {parseFloat(product.price).toLocaleString()}đ
                  </div>
                  <div
                    style={{
                      color: "#888888",
                      textDecoration: "line-through",
                      fontSize: 15,
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    {product.originalPrice.toLocaleString()}đ
                  </div>
                </div>
                <Button
                  type="primary"
                  style={{
                    background: "#ff7a1a",
                    border: "none",
                    fontWeight: 700,
                    borderRadius: 8,
                    width: 90,
                    outline: "none",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "#fb923c";
                    (e.currentTarget as HTMLElement).style.transform =
                      "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "#f97316";
                    (e.currentTarget as HTMLElement).style.transform =
                      "scale(1)";
                  }}
                  onClick={() => handleOpenModal(product)}
                >
                  Thêm
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      <AddOnModal
        open={isModalVisible}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </section>
  );
};

export default BestSellers;
