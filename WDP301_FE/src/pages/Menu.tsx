// import { Card, Button, Row, Col, Modal, Typography } from "antd";
// import "../style/Menu.css";
// import { useState } from "react";
// import { useGetProductByTypeId } from "../hooks/productsApi";

// const { Text } = Typography;

// const Menu = () => {
//   const [productTypeId, setProductTypeId] = useState<number>(1);
//   const {
//     data: products,
//     isLoading,
//     isError,
//   } = useGetProductByTypeId(productTypeId);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [quantity, setQuantity] = useState(1);
//   const [sideDishQuantities, setSideDishQuantities] = useState({
//     rongBien: 1,
//     chuaNamBo: 0,
//     biDo: 0,
//   });
//   const [drinkQuantities, setDrinkQuantities] = useState({
//     suoi: 1,
//     cocaCola: 0,
//     pepsi: 0,
//   });
//   const [addOnQuantities, setAddOnQuantities] = useState({
//     comThem: 0,
//     chaTrungHap: 0,
//     suonNuong: 0,
//   });

//   const showModal = () => {
//     setIsModalVisible(true);
//   };

//   const handleModalClose = () => {
//     setIsModalVisible(false);
//     setQuantity(1);
//     setSideDishQuantities({ rongBien: 1, chuaNamBo: 0, biDo: 0 });
//     setDrinkQuantities({ suoi: 1, cocaCola: 0, pepsi: 0 });
//     setAddOnQuantities({ comThem: 0, chaTrungHap: 0, suonNuong: 0 });
//   };

//   const handleAddToCart = () => {
//     // Logic to add to cart can go here
//     setIsModalVisible(false);
//     setQuantity(1);
//     setSideDishQuantities({ rongBien: 1, chuaNamBo: 0, biDo: 0 });
//     setDrinkQuantities({ suoi: 1, cocaCola: 0, pepsi: 0 });
//     setAddOnQuantities({ comThem: 0, chaTrungHap: 0, suonNuong: 0 });
//   };

//   const handleQuantityChange = (change: number) => {
//     const newQuantity = quantity + change;
//     if (newQuantity >= 1) {
//       setQuantity(newQuantity);
//     }
//   };

//   const handleSideDishQuantityChange = (type: string, change: number) => {
//     setSideDishQuantities((prev) => {
//       const newValue = prev[type as keyof typeof sideDishQuantities] + change;
//       return {
//         ...prev,
//         [type]: newValue >= 0 ? newValue : 0,
//       };
//     });
//   };

//   const handleDrinkQuantityChange = (type: string, change: number) => {
//     setDrinkQuantities((prev) => {
//       const newValue = prev[type as keyof typeof drinkQuantities] + change;
//       return {
//         ...prev,
//         [type]: newValue >= 0 ? newValue : 0,
//       };
//     });
//   };

//   const handleAddOnQuantityChange = (type: string, change: number) => {
//     setAddOnQuantities((prev) => {
//       const newValue = prev[type as keyof typeof addOnQuantities] + change;
//       return {
//         ...prev,
//         [type]: newValue >= 0 ? newValue : 0,
//       };
//     });
//   };

//   const handleCategoryClick = (productTypeId: number) => {
//     setProductTypeId(productTypeId);
//   };

//   return (
//     <div className="menu-container">
//       <div className="menu-header">
//         <h1 className="menu-title">Thức đơn Tâm Tấc</h1>
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
//           {/* <div className="category-item active">. Cơm Tấm</div>
//           <div className="category-item">. Món Gọi Thêm</div>
//           <div className="category-item">. Nước Giải Khát</div> */}
//           <div
//             className={`category-item ${productTypeId === 1 ? "active" : ""}`}
//             onClick={() => handleCategoryClick(1)}
//           >
//             . Cơm Tấm
//           </div>
//           <div
//             className={`category-item ${productTypeId === 2 ? "active" : ""}`}
//             onClick={() => handleCategoryClick(2)}
//           >
//             . Món Gọi Thêm
//           </div>
//           <div
//             className={`category-item ${productTypeId === 3 ? "active" : ""}`}
//             onClick={() => handleCategoryClick(3)}
//           >
//             . Nước Giải Khát
//           </div>
//         </div>
//         {/* <div className="menu-items">
//           <Row gutter={[24, 16]}>
//             <Col span={11} className="menu-column">
//               <Card className="menu-card">
//                 <div className="card-image-container">
//                   <img
//                     src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                     alt="Combo"
//                     className="card-image"
//                   />
//                   <div className="card-rating">
//                     <span className="card-rating-star">★</span>
//                     <span>1000+</span>
//                   </div>
//                 </div>
//                 <div className="card-content">
//                   <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
//                   <p className="card-description">
//                     - Cơm: sườn nướng, bì, chả trứng
//                     <br />
//                     - Canh rau củ
//                     <br />- Nước ngọt tự chọn
//                   </p>
//                   <div className="card-price-container">
//                     <div className="card-price">99.000đ</div>
//                     <Button className="add-button" onClick={showModal}>
//                       Thêm
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col span={11} className="menu-column">
//               <Card className="menu-card">
//                 <div className="card-image-container">
//                   <img
//                     src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                     alt="Combo"
//                     className="card-image"
//                   />
//                   <div className="card-rating">
//                     <span className="card-rating-star">★</span>
//                     <span>1000+</span>
//                   </div>
//                 </div>
//                 <div className="card-content">
//                   <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
//                   <p className="card-description">
//                     - Cơm: sườn nướng, bì, chả trứng
//                     <br />
//                     - Canh rau củ
//                     <br />- Nước ngọt tự chọn
//                   </p>
//                   <div className="card-price-container">
//                     <div className="card-price">99.000đ</div>
//                     <Button className="add-button" onClick={showModal}>
//                       Thêm
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col span={11} className="menu-column">
//               <Card className="menu-card">
//                 <div className="card-image-container">
//                   <img
//                     src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                     alt="Combo"
//                     className="card-image"
//                   />
//                   <div className="card-rating">
//                     <span className="card-rating-star">★</span>
//                     <span>1000+</span>
//                   </div>
//                 </div>
//                 <div className="card-content">
//                   <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
//                   <p className="card-description">
//                     - Cơm: sườn nướng, bì, chả trứng
//                     <br />
//                     - Canh rau củ
//                     <br />- Nước ngọt tự chọn
//                   </p>
//                   <div className="card-price-container">
//                     <div className="card-price">1000đ</div>
//                     <Button className="add-button" onClick={showModal}>
//                       Thêm
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col span={11} className="menu-column">
//               <Card className="menu-card">
//                 <div className="card-image-container">
//                   <img
//                     src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                     alt="Combo"
//                     className="card-image"
//                   />
//                   <div className="card-rating">
//                     <span className="card-rating-star">★</span>
//                     <span>1000+</span>
//                   </div>
//                 </div>
//                 <div className="card-content">
//                   <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
//                   <p className="card-description">
//                     - Cơm: sườn nướng, bì, chả trứng
//                     <br />
//                     - Canh rau củ
//                     <br />- Nước ngọt tự chọn
//                   </p>
//                   <div className="card-price-container">
//                     <div className="card-price">1000đ</div>
//                     <Button className="add-button" onClick={showModal}>
//                       Thêm
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col span={11} className="menu-column">
//               <Card className="menu-card">
//                 <div className="card-image-container">
//                   <img
//                     src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                     alt="Combo"
//                     className="card-image"
//                   />
//                   <div className="card-rating">
//                     <span className="card-rating-star">★</span>
//                     <span>1000+</span>
//                   </div>
//                 </div>
//                 <div className="card-content">
//                   <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
//                   <p className="card-description">
//                     - Cơm: sườn nướng, bì, chả trứng
//                     <br />
//                     - Canh rau củ
//                     <br />- Nước ngọt tự chọn
//                   </p>
//                   <div className="card-price-container">
//                     <div className="card-price">99.000đ</div>
//                     <Button className="add-button" onClick={showModal}>
//                       Thêm
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col span={11} className="menu-column">
//               <Card className="menu-card">
//                 <div className="card-image-container">
//                   <img
//                     src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                     alt="Combo"
//                     className="card-image"
//                   />
//                   <div className="card-rating">
//                     <span className="card-rating-star">★</span>
//                     <span>1000+</span>
//                   </div>
//                 </div>
//                 <div className="card-content">
//                   <h3 className="card-title">COMBO - SƯỜN BÌ CHẢ</h3>
//                   <p className="card-description">
//                     - Cơm: sườn nướng, bì, chả trứng
//                     <br />
//                     - Canh rau củ
//                     <br />- Nước ngọt tự chọn
//                   </p>
//                   <div className="card-price-container">
//                     <div className="card-price">1000đ</div>
//                     <Button className="add-button" onClick={showModal}>
//                       Thêm
//                     </Button>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col className="button-show-more">
//               {" "}
//               <Button className="custom-button">
//                 Hiển Thị Thêm XX Sản Phẩm
//               </Button>
//             </Col>
//           </Row>
//         </div> */}
//         <div className="menu-items">
//           {isLoading ? (
//             <div>Loading...</div>
//           ) : isError ? (
//             <div>Error loading products. Please try again later.</div>
//           ) : products && products.length > 0 ? (
//             <Row gutter={[24, 16]}>
//               {products.map((product) => (
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
//                         <Button className="add-button" onClick={showModal}>
//                           Thêm
//                         </Button>
//                       </div>
//                     </div>
//                   </Card>
//                 </Col>
//               ))}
//               <Col className="button-show-more">
//                 <Button className="custom-button">
//                   Hiển Thị Thêm {products.length} Sản Phẩm
//                 </Button>
//               </Col>
//             </Row>
//           ) : (
//             <div>No products available for this category.</div>
//           )}
//         </div>
//         {/* <div className="menu-items">
//           {isLoading ? (
//             <div>Loading...</div>
//           ) : isError ? (
//             <div>Error loading products. Please try again later.</div>
//           ) : products && products.length > 0 ? (
//             <Row gutter={[24, 16]}>
//               {products.map((product) => (
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
//                           // onClick={() => showModal(product)}
//                           onClick={showModal}
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
//                   Hiển Thị Thêm {products.length} Sản Phẩm
//                 </Button>
//               </Col>
//             </Row>
//           ) : (
//             <div>No products available for this category.</div>
//           )}
//         </div> */}
//       </div>

//       <Modal
//         visible={isModalVisible}
//         onCancel={handleModalClose}
//         footer={null}
//         className="menu-modal"
//         centered
//         width={550}
//       >
//         <div className="modal-content">
//           <Row>
//             <Col span={8}>
//               <div className="modal-image-container">
//                 <img
//                   src="https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
//                   alt="Combo"
//                   className="modal-image"
//                 />
//               </div>
//             </Col>
//             <Col span={16} style={{ paddingLeft: 34 }}>
//               <Text className="modal-title">COMBO - SƯỜN BÌ CHẢ</Text>
//               <ul className="modal-description-list">
//                 <li className="modal-description-item">
//                   Cơm: Sườn nướng, bì, chả trứng
//                 </li>
//                 <li className="modal-description-item">Canh rau củ</li>
//                 <li className="modal-description-item">Nước ngọt tự chọn</li>
//               </ul>
//             </Col>
//           </Row>
//           <div className="modal-quantity">
//             <Text className="modal-price">99.000đ</Text>
//             <Text className="modal-price-first">123.000đ</Text>
//             <div className="quantity-selector">
//               <Button
//                 className="quantity-button minus-button"
//                 onClick={() => handleQuantityChange(-1)}
//                 disabled={quantity === 1}
//               >
//                 −
//               </Button>
//               <Text className="quantity-number">{quantity}</Text>
//               <Button
//                 className="quantity-button plus-button"
//                 onClick={() => handleQuantityChange(1)}
//               >
//                 +
//               </Button>
//             </div>
//           </div>
//           <div className="modal-add-ons">
//             <Text className="add-ons-title">Canh ăn kèm - chọn 1</Text>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Canh rong biển</Text>
//                 <Text className="add-on-price">+ 0đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleSideDishQuantityChange("rongBien", -1)}
//                   disabled={sideDishQuantities.rongBien === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {sideDishQuantities.rongBien}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleSideDishQuantityChange("rongBien", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Canh chua Nam Bộ</Text>
//                 <Text className="add-on-price">+ 0đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleSideDishQuantityChange("chuaNamBo", -1)}
//                   disabled={sideDishQuantities.chuaNamBo === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {sideDishQuantities.chuaNamBo}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleSideDishQuantityChange("chuaNamBo", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Canh bí đỏ</Text>
//                 <Text className="add-on-price">+ 0đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleSideDishQuantityChange("biDo", -1)}
//                   disabled={sideDishQuantities.biDo === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {sideDishQuantities.biDo}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleSideDishQuantityChange("biDo", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <Text className="add-ons-title">Nước ngọt - chọn 1</Text>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Nước suối</Text>
//                 <Text className="add-on-price">+ 0đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleDrinkQuantityChange("suoi", -1)}
//                   disabled={drinkQuantities.suoi === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">{drinkQuantities.suoi}</Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleDrinkQuantityChange("suoi", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Coca Cola</Text>
//                 <Text className="add-on-price">+ 0đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleDrinkQuantityChange("cocaCola", -1)}
//                   disabled={drinkQuantities.cocaCola === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {drinkQuantities.cocaCola}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleDrinkQuantityChange("cocaCola", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Pepsi</Text>
//                 <Text className="add-on-price">+ 0đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleDrinkQuantityChange("pepsi", -1)}
//                   disabled={drinkQuantities.pepsi === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">{drinkQuantities.pepsi}</Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleDrinkQuantityChange("pepsi", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <Text className="add-ons-title">Thức ăn dùng thêm</Text>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Cơm thêm</Text>
//                 <Text className="add-on-price">+ 2.000đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleAddOnQuantityChange("comThem", -1)}
//                   disabled={addOnQuantities.comThem === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {addOnQuantities.comThem}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleAddOnQuantityChange("comThem", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Chả trứng hấp</Text>
//                 <Text className="add-on-price">+ 12.000đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleAddOnQuantityChange("chaTrungHap", -1)}
//                   disabled={addOnQuantities.chaTrungHap === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {addOnQuantities.chaTrungHap}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleAddOnQuantityChange("chaTrungHap", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//             <div className="add-on-item">
//               <div className="add-on-text-with-price">
//                 <Text className="add-on-text">Sườn nướng</Text>
//                 <Text className="add-on-price">+ 20.000đ</Text>
//               </div>
//               <div className="quantity-selector">
//                 <Button
//                   className="quantity-button minus-button"
//                   onClick={() => handleAddOnQuantityChange("suonNuong", -1)}
//                   disabled={addOnQuantities.suonNuong === 0}
//                 >
//                   −
//                 </Button>
//                 <Text className="quantity-number">
//                   {addOnQuantities.suonNuong}
//                 </Text>
//                 <Button
//                   className="quantity-button plus-button"
//                   onClick={() => handleAddOnQuantityChange("suonNuong", 1)}
//                 >
//                   +
//                 </Button>
//               </div>
//             </div>
//           </div>
//           <div className="modal-buttons">
//             <Button className="add-to-cart-button" onClick={handleAddToCart}>
//               103.000đ - Thêm vào giỏ hàng
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Menu;
import { Card, Button, Row, Col, Modal, Typography } from "antd";
import "../style/Menu.css";
import { useState } from "react";
import { useGetProductByTypeId } from "../hooks/productsApi";
import { type ProductDto } from "../hooks/productsApi";

const { Text } = Typography;

const Menu = () => {
  const [productTypeId, setProductTypeId] = useState<number>(1);
  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductByTypeId(productTypeId);
  console.log("Products in Menu:", products); // Debug log
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [sideDishQuantities, setSideDishQuantities] = useState({
    rongBien: 1,
    chuaNamBo: 0,
    biDo: 0,
  });
  const [drinkQuantities, setDrinkQuantities] = useState({
    suoi: 1,
    cocaCola: 0,
    pepsi: 0,
  });
  const [addOnQuantities, setAddOnQuantities] = useState({
    comThem: 0,
    chaTrungHap: 0,
    suonNuong: 0,
  });

  const showModal = (product: ProductDto) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSideDishQuantities({ rongBien: 1, chuaNamBo: 0, biDo: 0 });
    setDrinkQuantities({ suoi: 1, cocaCola: 0, pepsi: 0 });
    setAddOnQuantities({ comThem: 0, chaTrungHap: 0, suonNuong: 0 });
  };

  const handleAddToCart = () => {
    setIsModalVisible(false);
    setSelectedProduct(null);
    setQuantity(1);
    setSideDishQuantities({ rongBien: 1, chuaNamBo: 0, biDo: 0 });
    setDrinkQuantities({ suoi: 1, cocaCola: 0, pepsi: 0 });
    setAddOnQuantities({ comThem: 0, chaTrungHap: 0, suonNuong: 0 });
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleSideDishQuantityChange = (type: string, change: number) => {
    setSideDishQuantities((prev) => {
      const newValue = prev[type as keyof typeof sideDishQuantities] + change;
      return {
        ...prev,
        [type]: newValue >= 0 ? newValue : 0,
      };
    });
  };

  const handleDrinkQuantityChange = (type: string, change: number) => {
    setDrinkQuantities((prev) => {
      const newValue = prev[type as keyof typeof drinkQuantities] + change;
      return {
        ...prev,
        [type]: newValue >= 0 ? newValue : 0,
      };
    });
  };

  const handleAddOnQuantityChange = (type: string, change: number) => {
    setAddOnQuantities((prev) => {
      const newValue = prev[type as keyof typeof addOnQuantities] + change;
      return {
        ...prev,
        [type]: newValue >= 0 ? newValue : 0,
      };
    });
  };

  const handleCategoryClick = (productTypeId: number) => {
    setProductTypeId(productTypeId);
  };

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
          <div
            className={`category-item ${productTypeId === 1 ? "active" : ""}`}
            onClick={() => handleCategoryClick(1)}
          >
            . Cơm Tấm
          </div>
          <div
            className={`category-item ${productTypeId === 2 ? "active" : ""}`}
            onClick={() => handleCategoryClick(2)}
          >
            . Món Gọi Thêm
          </div>
          <div
            className={`category-item ${productTypeId === 3 ? "active" : ""}`}
            onClick={() => handleCategoryClick(3)}
          >
            . Nước Giải Khát
          </div>
        </div>
        <div className="menu-items">
          {isLoading ? (
            <div>Loading...</div>
          ) : isError ? (
            <div>Error loading products. Please try again later.</div>
          ) : products && products.length > 0 ? (
            <Row gutter={[24, 16]}>
              {products.map((product) => (
                <Col span={11} className="menu-column" key={product.productId}>
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
                  Hiển Thị Thêm {products.length} Sản Phẩm
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
        width={550}
      >
        <div className="modal-content">
          <Row>
            <Col span={8}>
              <div className="modal-image-container">
                <img
                  src={
                    selectedProduct?.image ||
                    "https://vnn-imgs-f.vgcloud.vn/2022/01/27/11/nhung-mon-com-ngon-cua-tp-hcm-ai-di-xa-cung-thay-nho.jpg?width=0&s=C2ED8-pomyPWr5vbZiaQ0Q"
                  }
                  alt={selectedProduct?.name || "Combo"}
                  className="modal-image"
                />
              </div>
            </Col>
            <Col span={16} style={{ paddingLeft: 34 }}>
              <Text className="modal-title">
                {selectedProduct?.name.toUpperCase() || "COMBO - SƯỜN BÌ CHẢ"}
              </Text>
              <ul className="modal-description-list">
                <li className="modal-description-item">
                  {selectedProduct?.description ||
                    "Cơm: Sườn nướng, bì, chả trứng"}
                </li>
                <li className="modal-description-item">Canh rau củ</li>
                <li className="modal-description-item">Nước ngọt tự chọn</li>
              </ul>
            </Col>
          </Row>
          <div className="modal-quantity">
            <Text className="modal-price">
              {selectedProduct
                ? Number(selectedProduct.price).toLocaleString("vi-VN") + "đ"
                : "99.000đ"}
            </Text>
            <Text className="modal-price-first">
              {selectedProduct
                ? (
                    Number(selectedProduct.price) +
                    addOnQuantities.comThem * 2000 +
                    addOnQuantities.chaTrungHap * 12000 +
                    addOnQuantities.suonNuong * 20000
                  ).toLocaleString("vi-VN") + "đ"
                : "123.000đ"}
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
            <Text className="add-ons-title">Canh ăn kèm - chọn 1</Text>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Canh rong biển</Text>
                <Text className="add-on-price">+ 0đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleSideDishQuantityChange("rongBien", -1)}
                  disabled={sideDishQuantities.rongBien === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {sideDishQuantities.rongBien}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleSideDishQuantityChange("rongBien", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Canh chua Nam Bộ</Text>
                <Text className="add-on-price">+ 0đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleSideDishQuantityChange("chuaNamBo", -1)}
                  disabled={sideDishQuantities.chuaNamBo === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {sideDishQuantities.chuaNamBo}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleSideDishQuantityChange("chuaNamBo", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Canh bí đỏ</Text>
                <Text className="add-on-price">+ 0đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleSideDishQuantityChange("biDo", -1)}
                  disabled={sideDishQuantities.biDo === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {sideDishQuantities.biDo}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleSideDishQuantityChange("biDo", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <Text className="add-ons-title">Nước ngọt - chọn 1</Text>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Nước suối</Text>
                <Text className="add-on-price">+ 0đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleDrinkQuantityChange("suoi", -1)}
                  disabled={drinkQuantities.suoi === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">{drinkQuantities.suoi}</Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleDrinkQuantityChange("suoi", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Coca Cola</Text>
                <Text className="add-on-price">+ 0đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleDrinkQuantityChange("cocaCola", -1)}
                  disabled={drinkQuantities.cocaCola === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {drinkQuantities.cocaCola}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleDrinkQuantityChange("cocaCola", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Pepsi</Text>
                <Text className="add-on-price">+ 0đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleDrinkQuantityChange("pepsi", -1)}
                  disabled={drinkQuantities.pepsi === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">{drinkQuantities.pepsi}</Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleDrinkQuantityChange("pepsi", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <Text className="add-ons-title">Thức ăn dùng thêm</Text>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Cơm thêm</Text>
                <Text className="add-on-price">+ 2.000đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleAddOnQuantityChange("comThem", -1)}
                  disabled={addOnQuantities.comThem === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {addOnQuantities.comThem}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleAddOnQuantityChange("comThem", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Chả trứng hấp</Text>
                <Text className="add-on-price">+ 12.000đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleAddOnQuantityChange("chaTrungHap", -1)}
                  disabled={addOnQuantities.chaTrungHap === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {addOnQuantities.chaTrungHap}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleAddOnQuantityChange("chaTrungHap", 1)}
                >
                  +
                </Button>
              </div>
            </div>
            <div className="add-on-item">
              <div className="add-on-text-with-price">
                <Text className="add-on-text">Sườn nướng</Text>
                <Text className="add-on-price">+ 20.000đ</Text>
              </div>
              <div className="quantity-selector">
                <Button
                  className="quantity-button minus-button"
                  onClick={() => handleAddOnQuantityChange("suonNuong", -1)}
                  disabled={addOnQuantities.suonNuong === 0}
                >
                  −
                </Button>
                <Text className="quantity-number">
                  {addOnQuantities.suonNuong}
                </Text>
                <Button
                  className="quantity-button plus-button"
                  onClick={() => handleAddOnQuantityChange("suonNuong", 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
          <div className="modal-buttons">
            <Button className="add-to-cart-button" onClick={handleAddToCart}>
              {selectedProduct
                ? (
                    (Number(selectedProduct.price) +
                      addOnQuantities.comThem * 2000 +
                      addOnQuantities.chaTrungHap * 12000 +
                      addOnQuantities.suonNuong * 20000) *
                    quantity
                  ).toLocaleString("vi-VN") + "đ - Thêm vào giỏ hàng"
                : "103.000đ - Thêm vào giỏ hàng"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Menu;
