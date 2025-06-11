import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Modal,
  Row,
  Col,
  Typography,
  Divider,
  Spin,
  Button,
  Tag,
  message,
} from "antd";
import axios from "axios";
import { PlusOutlined, MinusOutlined, CloseOutlined } from "@ant-design/icons";
import { useCartStore } from "../../store/cart.store";
import { useAuthStore } from "../../hooks/usersApi";
import { useProductTypes } from "../../hooks/productTypesApi";
import { useGetProductByTypeId } from "../../hooks/productsApi";
import { type UseQueryResult } from "@tanstack/react-query";

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

const useAddOnProducts = () => {
  const { data: productTypes } = useProductTypes();

  const query2 = useGetProductByTypeId(2);
  const query3 = useGetProductByTypeId(3);
  const query4 = useGetProductByTypeId(4);
  const queries = useMemo(
    () => [
      { typeId: 2, query: query2 },
      { typeId: 3, query: query3 },
      { typeId: 4, query: query4 },
    ],
    [query2, query3, query4],
  );
  const addOnProductQueries = useMemo(() => {
    if (!productTypes) return [] as { typeId: number; query: UseQueryResult<any[], Error> }[];
    return productTypes
      .filter((type) => type.productTypeId !== 1)
      .map((type) => {
        const matchingQuery = queries.find((q) => q.typeId === type.productTypeId);
        return matchingQuery as { typeId: number; query: UseQueryResult<any[], Error> };
      })
      .filter(Boolean);
  }, [productTypes, queries]);

  return addOnProductQueries;
};

interface AddOnModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const AddOnModal: React.FC<AddOnModalProps> = ({ open, onClose, product }) => {
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const { data: productTypes } = useProductTypes();
  const addOnProductQueries = useAddOnProducts();

  const [modalAddonCategories, setModalAddonCategories] = useState<AddOnCategory[]>([]);
  const [modalTotalPrice, setModalTotalPrice] = useState<number>(0);

  useEffect(() => {
    if (productTypes && open) {
      setModalAddonCategories((prevCategories) => {
        const categories: AddOnCategory[] = productTypes
          .filter((type) => type.productTypeId !== 1)
          .map((type) => {
            const matchingQuery = addOnProductQueries.find(
              (q) => q.typeId === type.productTypeId,
            );
            const prevCat = prevCategories.find(
              (cat) => cat.id === `modal_type_${type.productTypeId}`,
            );
            const items =
              matchingQuery?.query.data?.map((item) => {
                const prevItem = prevCat?.items.find(
                  (p) => p.productId === item.productId,
                );
                return {
                  ...item,
                  selectedQuantity: prevItem?.selectedQuantity ?? 0,
                };
              }) || [];
            return {
              id: `modal_type_${type.productTypeId}`,
              title: type.name,
              selectionText: "Tùy chọn",
              apiType: type.productTypeId,
              items,
              loading: matchingQuery?.query.isLoading || false,
            } as AddOnCategory;
          });
        return categories;
      });
    }
  }, [productTypes, addOnProductQueries, open]);

  const fetchModalCategoryItems = useCallback(
    async (categoryIndex: number) => {
      const categoryToFetch = modalAddonCategories[categoryIndex];
      if (!categoryToFetch || !categoryToFetch.apiType) return;
      try {
        const response = await axios.get(
          `https://wdp-301-0fd32c261026.herokuapp.com/api/products/type/${categoryToFetch.apiType}`,
        );
        const dataToUse = response.data.products as Product[];
        setModalAddonCategories((prev) => {
          const newCategories = JSON.parse(JSON.stringify(prev));
          if (newCategories[categoryIndex]) {
            const prevItems = newCategories[categoryIndex].items || [];
            newCategories[categoryIndex].items = dataToUse.map((p) => {
              const prevItem = prevItems.find(
                (item: any) => item.productId === p.productId,
              );
              return {
                ...p,
                price: p.price,
                selectedQuantity: prevItem?.selectedQuantity ?? 0,
              };
            });
            newCategories[categoryIndex].loading = false;
          }
          return newCategories;
        });
      } catch (error) {
        console.error(`Lỗi khi fetch ${categoryToFetch.title} cho modal:`, error);
        setModalAddonCategories((prev) => {
          const newCategories = [...prev];
          if (newCategories[categoryIndex]) {
            newCategories[categoryIndex].loading = false;
            newCategories[categoryIndex].items = [];
          }
          return newCategories;
        });
      }
    },
    [modalAddonCategories],
  );

  useEffect(() => {
    if (open && product) {
      const freshCategories = JSON.parse(JSON.stringify(modalAddonCategories));
      setModalAddonCategories(freshCategories);
      setModalTotalPrice(parseFloat(product.price));
    }
  }, [open, product]);

  useEffect(() => {
    if (open && product) {
      modalAddonCategories.forEach((cat, index) => {
        if (cat.loading || (cat.items.length === 0 && cat.apiType)) {
          fetchModalCategoryItems(index);
        }
      });
    }
  }, [open, product, fetchModalCategoryItems]);

  useEffect(() => {
    if (!product) return;
    let currentTotal = parseFloat(product.price);
    modalAddonCategories.forEach((category) => {
      category.items.forEach((item) => {
        currentTotal += item.selectedQuantity * parseFloat(item.price);
      });
    });
    setModalTotalPrice(currentTotal);
  }, [modalAddonCategories, product]);

  const handleModalQuantityChange = (
    categoryIndex: number,
    itemIndex: number,
    change: number,
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
    if (!product || !user?.id) {
      message.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    const selectedAddonsForCart = modalAddonCategories.flatMap((cat) =>
      cat.items
        .filter((item) => item.selectedQuantity > 0)
        .map((item) => ({
          productId: item.productId,
          productTypeName: item.name,
          quantity: item.selectedQuantity,
          price: parseFloat(item.price),
        })),
    );

    const cartItem = {
      userId: user.id,
      productId: product.productId,
      productName: product.name,
      addOns: selectedAddonsForCart,
      quantity: 1,
      price: parseFloat(product.price),
      totalPrice: modalTotalPrice,
    };

    addToCart(cartItem);
    message.success(`${product.name} và các món kèm đã được thêm vào giỏ!`);
    onClose();
  };

  return product ? (
    <Modal
      centered
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      bodyStyle={{ padding: 0, backgroundColor: "#F8F0E5" }}
      closable={false}
      destroyOnClose
    >
      <div style={{ padding: "20px" }}>
        <Button
          icon={<CloseOutlined />}
          onClick={onClose}
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
              src={product.image}
              alt={product.name}
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
              {product.name}
            </Title>
            {product.description && (
              <Text type="secondary" style={{ fontSize: "13px" }}>
                {product.description.length > 60
                  ? `${product.description.slice(0, 60)}...`
                  : product.description}
              </Text>
            )}
          </Col>
          <Col>
            <Tag
              color="#f97316"
              style={{ fontSize: "16px", padding: "6px 12px", fontWeight: "bold" }}
            >
              {parseFloat(product.price).toLocaleString()}đ
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
                {category.title}
                <Text
                  type="secondary"
                  style={{ marginLeft: "8px", fontSize: "13px", fontWeight: "normal" }}
                >
                  ({category.selectionText})
                </Text>
              </Title>
              <Divider style={{ margin: "8px 0 12px 0" }} />
              {category.loading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>
                  <Spin tip={`Đang tải ${category.title.toLowerCase()}...`} />
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
                      <Text style={{ fontSize: "15px", color: "#333" }}>{item.name}</Text>
                      <br />
                      <Text style={{ fontSize: "14px", color: "#f97316", fontWeight: 500 }}>
                        + {parseFloat(item.price).toLocaleString()}đ
                      </Text>
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
                          onClick={() => handleModalQuantityChange(catIndex, itemIndex, -1)}
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
                          onClick={() => handleModalQuantityChange(catIndex, itemIndex, 1)}
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
            outline: "none",
          }}
          onClick={handleAddToCartFromModal}
        >
          {modalTotalPrice.toLocaleString()}đ - Thêm vào giỏ hàng
        </Button>
      </div>
    </Modal>
  ) : null;
};

export default AddOnModal;
