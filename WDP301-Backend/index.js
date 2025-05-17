const express = require("express");
const sequelize = require("./config/database");
const setupSwagger = require("./config/swagger");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");
const productTypeRoutes = require("./routes/productTypeRoutes");

const app = express();
const port = 3000;

app.use(express.json());

setupSwagger(app);

app.use("/api/auth", userRoutes);
app.use("/api/product-types", productTypeRoutes);

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
