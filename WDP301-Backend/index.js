const express = require("express");
const sequelize = require("./config/database");
const setupSwagger = require("./config/swagger");
const cors = require("cors");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const productTypeRoutes = require("./routes/productTypeRoutes");
const productRoutes = require("./routes/productRoutes");
const branchRoutes = require("./routes/branchRoutes");

const app = express();
const port = 3000;

app.use(express.json());

app.use(cors());

setupSwagger(app);

app.use("/api/auth", userRoutes);
app.use("/api/product-types", productTypeRoutes);
app.use("/api/products", productRoutes);
app.use("/api/branches", branchRoutes);

app.get("/", (req, res) => {
  res.send("Hello from WDP301-Backend!");
});

// Test kết nối và đồng bộ database
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API docs available at http://localhost:${port}/api-docs`);
});
