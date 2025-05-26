import { Card, Button, Row, Col, Modal, Typography } from "antd";
import "../style/Menu.css";
import { useState } from "react";
import { useGetProductById, useGetProductByTypeId } from "../hooks/productsApi";
import { type ProductDto } from "../hooks/productsApi";
import { useProductTypes } from "../hooks/productTypesApi";
import { type UseQueryResult } from "@tanstack/react-query";
import { useAuthStore } from "../hooks/usersApi";
import { useCartStore } from "../store/cart.store";

const { Text } = Typography;

const useAddOnProducts = () => {
  const { data: productTypes } = useProductTypes();

  const query2 = useGetProductByTypeId(2);
  const query3 = useGetProductByTypeId(3);
  const query4 = useGetProductByTypeId(4);
  const query5 = useGetProductByTypeId(5);
  const query6 = useGetProductByTypeId(6);
  const query7 = useGetProductByTypeId(7);
  const query8 = useGetProductByTypeId(8);
  const query9 = useGetProductByTypeId(9);
  const query10 = useGetProductByTypeId(10);

  const queries: {
    typeId: number;
    query: UseQueryResult<ProductDto[], Error>;
  }[] = [
    { typeId: 2, query: query2 },
    { typeId: 3, query: query3 },
    { typeId: 4, query: query4 },
    { typeId: 5, query: query5 },
    { typeId: 6, query: query6 },
    { typeId: 7, query: query7 },
    { typeId: 8, query: query8 },
    { typeId: 9, query: query9 },
    { typeId: 10, query: query10 },
  ];

  const addOnProductQueries: {
    typeId: number;
    query: UseQueryResult<ProductDto[], Error>;
  }[] = [];
  if (productTypes) {
    productTypes
      .filter((type) => type.productTypeId !== 1)
      .forEach((type) => {
        const matchingQuery = queries.find(
          (q) => q.typeId === type.productTypeId
        );
        if (matchingQuery) {
          addOnProductQueries.push(matchingQuery);
        }
      });
  }

  return addOnProductQueries;
};

const Menu = () => {
  const [productTypeId, setProductTypeId] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const {
    data: mainProducts,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useGetProductByTypeId(productTypeId);
  const {
    data: productTypes,
    isLoading: isProductTypesLoading,
    isError: isProductTypesError,
  } = useProductTypes();
  const {
    data: productDetail,
    isLoading: isProductDetailLoading,
    isError: isProductDetailError,
  } = useGetProductById(String(selectedProductId || 0));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [addOnQuantities, setAddOnQuantities] = useState<
    Record<string, number>
  >({});

  const addOnProductQueries = useAddOnProducts();
  const { user } = useAuthStore();
  const { addToCart } = useCartStore();

  const getProductTypeName = (id: number) => {
    return (
      productTypes?.find((type) => type.productTypeId === id)?.name || "Unknown"
    );
  };

  const showModal = (product: ProductDto) => {
    setSelectedProductId(product.productId);
    setIsModalVisible(true);
    const initialQuantities: Record<string, number> = {};
    addOnProductQueries.forEach(({ typeId, query }) => {
      query.data?.forEach((index) => {
        initialQuantities[`${typeId}-${index}`] = 0;
      });
    });
    setAddOnQuantities(initialQuantities);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProductId(null);
    setQuantity(1);
    setAddOnQuantities({});
  };

  const handleAddToCart = () => {
    if (productDetail && user?.id) {
      // Create addOns array with proper type
      const addOnsWithPrices = addOnProductQueries
        .flatMap(({ typeId, query }) =>
          query.data?.map((item, index) => ({
            productId: item.productId,
            productTypeName: item.name,
            quantity: addOnQuantities[`${typeId}-${index}`] || 0,
            price: Number(item.price), // Include the price for each add-on
          }))
        )
        .filter(
          (
            addOn
          ): addOn is {
            productId: number;
            productTypeName: string;
            quantity: number;
            price: number;
          } => addOn !== undefined && addOn.quantity > 0
        );

      // Calculate total price for add-ons using their own prices
      const totalAddOnPrice = addOnsWithPrices.reduce(
        (sum, addOn) => sum + addOn.quantity * addOn.price,
        0
      );

      const totalPrice =
        Number(productDetail.price) * quantity + totalAddOnPrice;

      const cartItem = {
        userId: user.id,
        productId: productDetail.productId,
        productName: productDetail.name,
        addOns: addOnsWithPrices.map(
          ({ productId, productTypeName, quantity }) => ({
            productId,
            productTypeName,
            quantity,
          })
        ),
        quantity,
        totalPrice,
      };

      addToCart(cartItem);
      handleModalClose();
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddOnQuantityChange = (key: string, change: number) => {
    setAddOnQuantities((prev) => {
      const newValue = (prev[key] || 0) + change;
      return {
        ...prev,
        [key]: newValue >= 0 ? newValue : 0,
      };
    });
  };

  const handleCategoryClick = (productTypeId: number) => {
    setProductTypeId(productTypeId);
  };

  const totalPrice = productDetail
    ? Number(productDetail.price) * quantity +
      addOnProductQueries.reduce((sum, { typeId, query }) => {
        if (!query.data) return sum;
        return (
          sum +
          query.data.reduce((typeSum, item, index) => {
            const qty = addOnQuantities[`${typeId}-${index}`] || 0;
            return typeSum + qty * Number(item.price);
          }, 0)
        );
      }, 0)
    : 0;

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Thực đơn Tấm Tắc</h1>
        <div className="menu-subtitle">
          <div className="title-orange">Tấm Tắc </div>
          là chuỗi hệ thống cửa hàng cơm tấm với mong muốn mang đến cho sinh
          viên những bữa cơm tấm chất lượng với giá cả hợp lý, đảm bảo vệ sinh
          an toàn thực phẩm
        </div>
      </div>
      <div className="menu-sell">
        <div className="menu-categories">
          <div className="category-item father">Thực đơn</div>
          {isProductTypesLoading ? (
            <div>Loading categories...</div>
          ) : isProductTypesError ? (
            <div>Error loading categories. Please try again later.</div>
          ) : productTypes && productTypes.length > 0 ? (
            productTypes.map((type) => (
              <div
                key={type.productTypeId}
                className={`category-item ${
                  productTypeId === type.productTypeId ? "active" : ""
                }`}
                onClick={() => handleCategoryClick(type.productTypeId)}
              >
                . {type.name}
              </div>
            ))
          ) : (
            <div>No categories available.</div>
          )}
        </div>
        <div className="menu-items">
          {isProductsLoading ? (
            <div>Loading...</div>
          ) : isProductsError ? (
            <div>Error loading products. Please try again later.</div>
          ) : mainProducts && mainProducts.length > 0 ? (
            <Row gutter={[24, 16]} className="menu-card-row">
              {mainProducts.map((product) => (
                <Col span={8} className="menu-column" key={product.productId}>
                  <Card className="menu-card">
                    <div className="card-image-container">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="card-image"
                      />
                      <div className="card-rating">
                        <span className="card-rating-star">★</span>
                        <span>1000+</span>
                      </div>
                    </div>
                    <div className="card-content">
                      <h3 className="card-title">
                        {product.name.toUpperCase()}
                      </h3>
                      <p className="card-description">{product.description}</p>
                      <div className="card-price-container">
                        <div className="card-price">
                          {Number(product.price).toLocaleString("vi-VN")}đ
                        </div>
                        <Button
                          className="add-button"
                          onClick={() => showModal(product)}
                        >
                          Thêm
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
              <Col className="button-show-more">
                <Button className="custom-button">
                  Hiển Thị Thêm {mainProducts.length} Sản Phẩm
                </Button>
              </Col>
            </Row>
          ) : (
            <div>No products available for this category.</div>
          )}
        </div>
      </div>

      <Modal
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        className="menu-modal"
        centered
        width={650}
      >
        <div className="modal-content">
          {isProductDetailLoading ? (
            <div>Loading product details...</div>
          ) : isProductDetailError ? (
            <div>Error loading product details. Please try again later.</div>
          ) : productDetail ? (
            <>
              <Row>
                <Col span={8}>
                  <div className="modal-image-container">
                    <img
                      src={
                        productDetail.image ||
                        "https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                      }
                      alt={productDetail.name || "Combo"}
                      className="modal-image"
                    />
                  </div>
                </Col>
                <Col span={16} style={{ paddingLeft: 34 }}>
                  <Text className="modal-title">
                    {productDetail.name.toUpperCase()}
                  </Text>
                  <ul className="modal-description-list">
                    <li className="modal-description-item">
                      {productDetail.description}
                    </li>
                  </ul>
                </Col>
              </Row>
              <div className="modal-quantity">
                <Text className="modal-price">
                  {Number(productDetail.price).toLocaleString("vi-VN")}đ
                </Text>
                <Text className="modal-price-first">
                  {totalPrice.toLocaleString("vi-VN")}đ
                </Text>
                <div className="quantity-selector">
                  <Button
                    className="quantity-button minus-button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity === 1}
                  >
                    −
                  </Button>
                  <Text className="quantity-number">{quantity}</Text>
                  <Button
                    className="quantity-button plus-button"
                    onClick={() => handleQuantityChange(1)}
                  >
                    +
                  </Button>
                </div>
              </div>
              <div className="modal-add-ons">
                {addOnProductQueries.map(({ typeId, query }) => (
                  <div key={typeId}>
                    {query.isLoading ? (
                      <div>Loading {getProductTypeName(typeId)}...</div>
                    ) : query.isError ? (
                      <div>
                        Error loading {getProductTypeName(typeId)}. Please try
                        again later.
                      </div>
                    ) : query.data && query.data.length > 0 ? (
                      <>
                        <Text className="add-ons-title">
                          {getProductTypeName(typeId)} - chọn 1
                        </Text>
                        {query.data.map((item, index) => (
                          <div className="add-on-item" key={item.productId}>
                            <div className="add-on-text-with-price">
                              <Text className="add-on-text">{item.name}</Text>
                              <Text className="add-on-price">
                                + {Number(item.price).toLocaleString("vi-VN")}đ
                              </Text>
                            </div>
                            <div className="quantity-selector">
                              <Button
                                className="quantity-button minus-button"
                                onClick={() =>
                                  handleAddOnQuantityChange(
                                    `${typeId}-${index}`,
                                    -1
                                  )
                                }
                                disabled={
                                  addOnQuantities[`${typeId}-${index}`] === 0
                                }
                              >
                                −
                              </Button>
                              <Text className="quantity-number">
                                {addOnQuantities[`${typeId}-${index}`] || 0}
                              </Text>
                              <Button
                                className="quantity-button plus-button"
                                onClick={() =>
                                  handleAddOnQuantityChange(
                                    `${typeId}-${index}`,
                                    1
                                  )
                                }
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div>
                        No items available for {getProductTypeName(typeId)}.
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-buttons">
                <Button
                  className="add-to-cart-button"
                  onClick={handleAddToCart}
                >
                  {totalPrice.toLocaleString("vi-VN")}đ - Thêm vào giỏ hàng
                </Button>
              </div>
            </>
          ) : (
            <div>No product details available.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Menu;

// import { Card, Button, Row, Col, Modal, Typography } from "antd";
// import "../style/Menu.css";
// import { useState, useEffect } from "react";
// import { useGetProductById, useGetProductByTypeId } from "../hooks/productsApi";
// import { type ProductDto } from "../hooks/productsApi";
// import { useProductTypes } from "../hooks/productTypesApi";
// import { type UseQueryResult } from "@tanstack/react-query";

// const { Text } = Typography;

// // Custom hook to fetch products for all product types except productTypeId === 1
// const useAddOnProducts = () => {
//   const { data: productTypes } = useProductTypes();

//   // Predefine hook calls for each productTypeId at the top level
//   const query2 = useGetProductByTypeId(2); // For productTypeId 2 (e.g., Món Gọi Thêm)
//   const query3 = useGetProductByTypeId(3); // For productTypeId 3 (e.g., Nước Giải Khát)
//   // Add more queries if you have more productTypeId values (e.g., 4, 5, etc.)
//   // For example: const query4 = useGetProductByTypeId(4);

//   // Map the queries to an array, excluding productTypeId === 1
//   const addOnProductQueries: {
//     typeId: number;
//     query: UseQueryResult<ProductDto[], Error>;
//   }[] = [];

//   // Add each query to the array based on the productTypes data
//   if (productTypes) {
//     productTypes
//       .filter((type) => type.productTypeId !== 1)
//       .forEach((type) => {
//         if (type.productTypeId === 2) {
//           addOnProductQueries.push({ typeId: 2, query: query2 });
//         } else if (type.productTypeId === 3) {
//           addOnProductQueries.push({ typeId: 3, query: query3 });
//         }
//         // Add more conditions for additional productTypeId values
//         // Example: else if (type.productTypeId === 4) { addOnProductQueries.push({ typeId: 4, query: query4 }); }
//       });
//   }

//   return addOnProductQueries;
// };

// const Menu = () => {
//   const [productTypeId, setProductTypeId] = useState<number>(1);
//   const [selectedProductId, setSelectedProductId] = useState<number | null>(
//     null
//   );
//   const {
//     data: mainProducts,
//     isLoading: isProductsLoading,
//     isError: isProductsError,
//   } = useGetProductByTypeId(productTypeId);
//   const {
//     data: productTypes,
//     isLoading: isProductTypesLoading,
//     isError: isProductTypesError,
//   } = useProductTypes();
//   const {
//     data: productDetail,
//     isLoading: isProductDetailLoading,
//     isError: isProductDetailError,
//   } = useGetProductById(String(selectedProductId || 0));
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [quantity, setQuantity] = useState(1);

//   // State to hold quantities for all add-on products dynamically
//   const [addOnQuantities, setAddOnQuantities] = useState<
//     Record<string, number>
//   >({});

//   // Use the custom hook to fetch add-on products
//   const addOnProductQueries = useAddOnProducts();

//   // Get ProductType name for a given productTypeId
//   const getProductTypeName = (id: number) => {
//     return (
//       productTypes?.find((type) => type.productTypeId === id)?.name || "Unknown"
//     );
//   };

//   const showModal = (product: ProductDto) => {
//     setSelectedProductId(product.productId);
//     setIsModalVisible(true);
//     // Reset quantities when opening modal
//     const initialQuantities: Record<string, number> = {};
//     addOnProductQueries.forEach(({ typeId, query }) => {
//       query.data?.forEach((item, index) => {
//         initialQuantities[`${typeId}-${index}`] = 0;
//       });
//     });
//     setAddOnQuantities(initialQuantities);
//   };

//   const handleModalClose = () => {
//     setIsModalVisible(false);
//     setSelectedProductId(null);
//     setQuantity(1);
//     setAddOnQuantities({});
//   };

//   const handleAddToCart = () => {
//     setIsModalVisible(false);
//     setSelectedProductId(null);
//     setQuantity(1);
//     setAddOnQuantities({});
//   };

//   const handleQuantityChange = (change: number) => {
//     const newQuantity = quantity + change;
//     if (newQuantity >= 1) {
//       setQuantity(newQuantity);
//     }
//   };

//   const handleAddOnQuantityChange = (key: string, change: number) => {
//     setAddOnQuantities((prev) => {
//       const newValue = (prev[key] || 0) + change;
//       return {
//         ...prev,
//         [key]: newValue >= 0 ? newValue : 0,
//       };
//     });
//   };

//   const handleCategoryClick = (productTypeId: number) => {
//     setProductTypeId(productTypeId);
//   };

//   // Calculate total price including all add-ons
//   const totalPrice = productDetail
//     ? Number(productDetail.price) * quantity +
//       addOnProductQueries.reduce((sum, { typeId, query }) => {
//         if (!query.data) return sum;
//         return (
//           sum +
//           query.data.reduce((typeSum, item, index) => {
//             const qty = addOnQuantities[`${typeId}-${index}`] || 0;
//             return typeSum + qty * Number(item.price);
//           }, 0)
//         );
//       }, 0)
//     : 0;

//   // Debug log
//   useEffect(() => {
//     console.log("productDetail:", productDetail);
//     console.log("mainProducts for type", productTypeId, ":", mainProducts);
//     console.log("productTypes:", productTypes);
//     console.log("addOnProductQueries:", addOnProductQueries);
//     console.log("addOnQuantities:", addOnQuantities);
//   }, [
//     productDetail,
//     mainProducts,
//     productTypeId,
//     productTypes,
//     addOnQuantities,
//   ]);

//   return (
//     <div className="menu-container">
//       <div className="menu-header">
//         <h1 className="menu-title">Thực đơn Tấm Tắc</h1>
//         <div className="menu-subtitle">
//           <div className="title-orange">Tấm Tắc </div>
//           là chuỗi hệ thống cửa hàng cơm tấm với mong muốn mang đến cho sinh
//           viên những bữa cơm tấm chất lượng với giá cả hợp lý, đảm bảo vệ sinh
//           an toàn thực phẩm
//         </div>
//       </div>
//       <div className="menu-sell">
//         <div className="menu-categories">
//           <div className="category-item father">Thực đơn</div>
//           {isProductTypesLoading ? (
//             <div>Loading categories...</div>
//           ) : isProductTypesError ? (
//             <div>Error loading categories. Please try again later.</div>
//           ) : productTypes && productTypes.length > 0 ? (
//             productTypes.map((type) => (
//               <div
//                 key={type.productTypeId}
//                 className={`category-item ${
//                   productTypeId === type.productTypeId ? "active" : ""
//                 }`}
//                 onClick={() => handleCategoryClick(type.productTypeId)}
//               >
//                 . {type.name}
//               </div>
//             ))
//           ) : (
//             <div>No categories available.</div>
//           )}
//         </div>
//         <div className="menu-items">
//           {isProductsLoading ? (
//             <div>Loading...</div>
//           ) : isProductsError ? (
//             <div>Error loading products. Please try again later.</div>
//           ) : mainProducts && mainProducts.length > 0 ? (
//             <Row gutter={[24, 16]}>
//               {mainProducts.map((product) => (
//                 <Col span={11} className="menu-column" key={product.productId}>
//                   <Card className="menu-card">
//                     <div className="card-image-container">
//                       <img
//                         src={product.image}
//                         alt={product.name}
//                         className="card-image"
//                       />
//                       <div className="card-rating">
//                         <span className="card-rating-star">★</span>
//                         <span>1000+</span>
//                       </div>
//                     </div>
//                     <div className="card-content">
//                       <h3 className="card-title">
//                         {product.name.toUpperCase()}
//                       </h3>
//                       <p className="card-description">{product.description}</p>
//                       <div className="card-price-container">
//                         <div className="card-price">
//                           {Number(product.price).toLocaleString("vi-VN")}đ
//                         </div>
//                         <Button
//                           className="add-button"
//                           onClick={() => showModal(product)}
//                         >
//                           Thêm
//                         </Button>
//                       </div>
//                     </div>
//                   </Card>
//                 </Col>
//               ))}
//               <Col className="button-show-more">
//                 <Button className="custom-button">
//                   Hiển Thị Thêm {mainProducts.length} Sản Phẩm
//                 </Button>
//               </Col>
//             </Row>
//           ) : (
//             <div>No products available for this category.</div>
//           )}
//         </div>
//       </div>

//       <Modal
//         visible={isModalVisible}
//         onCancel={handleModalClose}
//         footer={null}
//         className="menu-modal"
//         centered
//         width={650}
//       >
//         <div className="modal-content">
//           {isProductDetailLoading ? (
//             <div>Loading product details...</div>
//           ) : isProductDetailError ? (
//             <div>Error loading product details. Please try again later.</div>
//           ) : productDetail ? (
//             <>
//               <Row>
//                 <Col span={8}>
//                   <div className="modal-image-container">
//                     <img
//                       src={
//                         productDetail.image ||
//                         "https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                       }
//                       alt={productDetail.name || "Combo"}
//                       className="modal-image"
//                     />
//                   </div>
//                 </Col>
//                 <Col span={16} style={{ paddingLeft: 34 }}>
//                   <Text className="modal-title">
//                     {productDetail.name.toUpperCase()}
//                   </Text>
//                   <ul className="modal-description-list">
//                     <li className="modal-description-item">
//                       {productDetail.description}
//                     </li>
//                   </ul>
//                 </Col>
//               </Row>
//               <div className="modal-quantity">
//                 <Text className="modal-price">
//                   {Number(productDetail.price).toLocaleString("vi-VN")}đ
//                 </Text>
//                 <Text className="modal-price-first">
//                   {totalPrice.toLocaleString("vi-VN")}đ
//                 </Text>
//                 <div className="quantity-selector">
//                   <Button
//                     className="quantity-button minus-button"
//                     onClick={() => handleQuantityChange(-1)}
//                     disabled={quantity === 1}
//                   >
//                     −
//                   </Button>
//                   <Text className="quantity-number">{quantity}</Text>
//                   <Button
//                     className="quantity-button plus-button"
//                     onClick={() => handleQuantityChange(1)}
//                   >
//                     +
//                   </Button>
//                 </div>
//               </div>
//               <div className="modal-add-ons">
//                 {/* Dynamically render sections for each product type except productTypeId === 1 */}
//                 {addOnProductQueries.map(({ typeId, query }) => (
//                   <div key={typeId}>
//                     {query.isLoading ? (
//                       <div>Loading {getProductTypeName(typeId)}...</div>
//                     ) : query.isError ? (
//                       <div>
//                         Error loading {getProductTypeName(typeId)}. Please try
//                         again later.
//                       </div>
//                     ) : query.data && query.data.length > 0 ? (
//                       <>
//                         <Text className="add-ons-title">
//                           {getProductTypeName(typeId)} - chọn 1
//                         </Text>
//                         {query.data.map((item, index) => (
//                           <div className="add-on-item" key={item.productId}>
//                             <div className="add-on-text-with-price">
//                               <Text className="add-on-text">{item.name}</Text>
//                               <Text className="add-on-price">
//                                 + {Number(item.price).toLocaleString("vi-VN")}đ
//                               </Text>
//                             </div>
//                             <div className="quantity-selector">
//                               <Button
//                                 className="quantity-button minus-button"
//                                 onClick={() =>
//                                   handleAddOnQuantityChange(
//                                     `${typeId}-${index}`,
//                                     -1
//                                   )
//                                 }
//                                 disabled={
//                                   addOnQuantities[`${typeId}-${index}`] === 0
//                                 }
//                               >
//                                 −
//                               </Button>
//                               <Text className="quantity-number">
//                                 {addOnQuantities[`${typeId}-${index}`] || 0}
//                               </Text>
//                               <Button
//                                 className="quantity-button plus-button"
//                                 onClick={() =>
//                                   handleAddOnQuantityChange(
//                                     `${typeId}-${index}`,
//                                     1
//                                   )
//                                 }
//                               >
//                                 +
//                               </Button>
//                             </div>
//                           </div>
//                         ))}
//                       </>
//                     ) : (
//                       <div>
//                         No items available for {getProductTypeName(typeId)}.
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               <div className="modal-buttons">
//                 <Button
//                   className="add-to-cart-button"
//                   onClick={handleAddToCart}
//                 >
//                   {totalPrice.toLocaleString("vi-VN")}đ - Thêm vào giỏ hàng
//                 </Button>
//               </div>
//             </>
//           ) : (
//             <div>No product details available.</div>
//           )}
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Menu;
