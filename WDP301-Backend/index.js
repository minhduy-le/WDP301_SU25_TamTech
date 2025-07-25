const express = require("express");
const http = require("http");
const sequelize = require("./config/database");
const setupSwagger = require("./config/swagger");
const initializeSocket = require("./config/socket");
const cors = require("cors");
require("dotenv").config();

// Import routes
const userRoutes = require("./routes/userRoutes");
const productTypeRoutes = require("./routes/productTypeRoutes");
const storeRoutes = require("./routes/storeRoutes");
const materialRoutes = require("./routes/materialRoutes");
const productRoutes = require("./routes/productRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const orderRoutes = require("./routes/orderRoutes");
const accountRoutes = require("./routes/accountRoutes");
const profileRoutes = require("./routes/profileRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const shipperRoutes = require("./routes/shipperRoutes");
const chatRoutes = require("./routes/chatRoutes");
const districtsRoutes = require("./routes/districtsRoutes");
const promotionTypeRoutes = require("./routes/promotionTypeRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatMessageAIRoutes = require("./routes/chatMessageAIRoutes");
const blogRoutes = require("./routes/blogRoutes");
const bankRoutes = require("./routes/bankRoutes");
const orderRoutesPosApp = require("./routes/orderRoutesPosApp");

// Import associations to ensure relationships are set up
require("./models/associations");

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app); // Create HTTP server
const port = process.env.PORT || 3000;

// Initialize Socket.IO
const io = initializeSocket(server);
app.set("io", io); // <-- THÊM DÒNG NÀY

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "*", // Cho phép tất cả các nguồn gốc
    credentials: true, // Cho phép gửi cookie/credentials nếu cần
  })
);

setupSwagger(app);

// Define routes
app.use("/api/auth", userRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/products", productRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/shippers", shipperRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/location", districtsRoutes);
app.use("/api/promotion-types", promotionTypeRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/schedules", shipperRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat-message-ai", chatMessageAIRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/pos-orders", orderRoutesPosApp);

app.get("/", (req, res) => {
  res.send("Hello from WDP301-Backend!");
});

// Test database connection and synchronization
sequelize
  .authenticate()
  .then(() => {
    console.log("Kết nối MySQL thành công!");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Đồng bộ database thành công!");
  })
  .catch((err) => {
    console.error("Lỗi:", err);
  });

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
});
