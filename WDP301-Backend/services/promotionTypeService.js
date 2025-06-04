const PromotionType = require("../models/promotionType"); // Remove destructuring
const sequelize = require("../config/database");

if (!PromotionType || typeof PromotionType.findAll !== "function") {
  console.error("PromotionType model is not properly initialized");
  throw new Error("Model initialization failed");
}

const getPromotionTypes = async (req, res) => {
  console.log("getPromotionTypes called at:", new Date().toISOString());

  try {
    const promotionTypes = await PromotionType.findAll({
      attributes: ["promotionTypeId", "name"],
    });

    console.log("Fetched promotion types:", promotionTypes.length);
    res.status(200).json(promotionTypes);
  } catch (error) {
    console.error("Error in getPromotionTypes:", error.message, error.stack);
    res.status(500).send("Failed to retrieve promotion types");
  }
};

module.exports = {
  getPromotionTypes,
};
