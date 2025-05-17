// const express = require("express");
// const sequelize = require("./config/database");
// const setupSwagger = require("./config/swagger");
// require("dotenv").config();

// const userRoutes = require("./routes/userRoutes");

// const app = express();
// const port = 3000;

// app.use(express.json());

// setupSwagger(app);

// app.use("/api/auth", userRoutes);

// app.get("/", (req, res) => {
//   res.send("Hello from WDP301-Backend!");
// });

// // Test kết nối và đồng bộ database
// sequelize
//   .authenticate()
//   .then(() => {
//     console.log("Kết nối MySQL thành công!");
//     return sequelize.sync({ alter: true });
//   })
//   .then(() => {
//     console.log("Đồng bộ database thành công!");
//   })
//   .catch((err) => {
//     console.error("Lỗi:", err);
//   });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
//   console.log(`API docs available at http://localhost:${port}/api-docs`);
// });

const express = require("express");
const sequelize = require("./config/database");
const setupSwagger = require("./config/swagger");
require("dotenv").config();

const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

setupSwagger(app);

app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello from WDP301-Backend!");
});

// Retry logic for database connection
async function initializeDatabase() {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      await sequelize.authenticate();
      console.log("Kết nối MySQL thành công!");
      await sequelize.sync({ alter: true });
      console.log("Đồng bộ database thành công!");
      break;
    } catch (error) {
      attempts++;
      console.error(`Lỗi kết nối MySQL (thử lại ${attempts}/${maxAttempts}):`, error.message);
      if (attempts === maxAttempts) {
        console.error("Không thể kết nối MySQL sau nhiều lần thử, thoát...");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds
    }
  }
}

// Start the server
initializeDatabase().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`API docs available at http://localhost:${port}/api-docs`);
  });
});
