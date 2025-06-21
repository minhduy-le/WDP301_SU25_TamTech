const Product = require("./product");
const ProductType = require("./productType");
const Store = require("./store");
const Material = require("./material");
const ProductRecipe = require("./ProductRecipe");
const User = require("./user");
const Order = require("./order");
const OrderItem = require("./orderItem");
const PaymentMethod = require("./paymentMethod");
const OrderStatus = require("./orderStatus");
const Feedback = require("./feedback");
const FeedbackResponse = require("./FeedbackResponse");
const ChatRoom = require("./chatRoom");
const ChatRoomUser = require("./ChatRoomUser");
const Message = require("./message");
const Promotion = require("./promotion");
const PromotionType = require("./promotionType");
const Schedule = require("./schedule");
const ScheduleShipper = require("./ScheduleShipper");

// Define relationships for existing models
Product.belongsTo(ProductType, { foreignKey: "productTypeId", as: "ProductType" });
Product.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Product.hasMany(ProductRecipe, { foreignKey: "productId", as: "ProductRecipes" });

Store.hasMany(Product, { foreignKey: "storeId", as: "Products" });
Store.hasMany(Material, { foreignKey: "storeId", as: "Materials" });

Material.belongsTo(Store, { foreignKey: "storeId", as: "Store" });
Material.hasMany(ProductRecipe, { foreignKey: "materialId", as: "ProductRecipes" });

ProductRecipe.belongsTo(Product, { foreignKey: "productId", as: "Product" });
ProductRecipe.belongsTo(Material, { foreignKey: "materialId", as: "Material" });

// Define relationships for new models
Order.belongsTo(User, { foreignKey: "userId", as: "User" });
Order.belongsTo(PaymentMethod, { foreignKey: "payment_method_id", as: "PaymentMethod" });
Order.belongsTo(OrderStatus, { foreignKey: "status_id", as: "OrderStatus" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "OrderItems" });
Order.hasMany(Feedback, { foreignKey: "orderId", as: "Feedbacks" });

User.hasMany(Order, { foreignKey: "userId", as: "Orders" });
User.hasMany(Feedback, { foreignKey: "userId", as: "Feedbacks" });

OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "Order" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "Product" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "OrderItems" });

Feedback.belongsTo(Order, { foreignKey: "orderId", as: "Order" });
Feedback.belongsTo(User, { foreignKey: "userId", as: "User" });
Feedback.hasMany(FeedbackResponse, { foreignKey: "feedbackId", as: "FeedbackResponses" });

FeedbackResponse.belongsTo(Feedback, { foreignKey: "feedbackId", as: "Feedback" });
FeedbackResponse.belongsTo(User, { foreignKey: "repliedBy", as: "RepliedBy" });
User.hasMany(FeedbackResponse, { foreignKey: "repliedBy", as: "FeedbackResponses" });

// Define relationships for chat-related models
ChatRoom.hasMany(ChatRoomUser, { foreignKey: "chatRoomId", as: "ChatRoomUsers" });
ChatRoom.hasMany(Message, { foreignKey: "chatRoomId", as: "Messages" });

ChatRoomUser.belongsTo(ChatRoom, { foreignKey: "chatRoomId", as: "ChatRoom" });
ChatRoomUser.belongsTo(User, { foreignKey: "userId", as: "User" });

User.hasMany(ChatRoomUser, { foreignKey: "userId", as: "ChatRoomUsers" });
User.hasMany(Message, { foreignKey: "senderId", as: "SentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "ReceivedMessages" });

Message.belongsTo(ChatRoom, { foreignKey: "chatRoomId", as: "ChatRoom" });
Message.belongsTo(User, { foreignKey: "senderId", as: "Sender" });
Message.belongsTo(User, { foreignKey: "receiverId", as: "Receiver" });

// Define relationships for Promotion and PromotionType
Promotion.belongsTo(PromotionType, { foreignKey: "promotionTypeId", as: "PromotionType" });
PromotionType.hasMany(Promotion, { foreignKey: "promotionTypeId", as: "Promotions" });

// Define relationship for Promotion and User (createBy)
Promotion.belongsTo(User, { foreignKey: "createBy", as: "Creator" });
User.hasMany(Promotion, { foreignKey: "createBy", as: "CreatedPromotions" });

// Define relationships for Schedule and ScheduleShipper
Schedule.hasMany(ScheduleShipper, { foreignKey: "scheduleId", as: "ScheduleShippers" });
ScheduleShipper.belongsTo(Schedule, { foreignKey: "scheduleId", as: "Schedule" });
ScheduleShipper.belongsTo(User, { foreignKey: "shipperId", as: "Shipper" });
User.hasMany(ScheduleShipper, { foreignKey: "shipperId", as: "ScheduleShippers" });

module.exports = {
  Product,
  ProductType,
  Store,
  Material,
  ProductRecipe,
  User,
  Order,
  OrderItem,
  PaymentMethod,
  OrderStatus,
  Feedback,
  FeedbackResponse,
  ChatRoom,
  ChatRoomUser,
  Message,
  Promotion,
  PromotionType,
  Schedule,
  ScheduleShipper,
};
