const PromotionType = require("../models/promotionType"); // Remove destructuring
const sequelize = require("../config/database");

if (!PromotionType || typeof PromotionType.findAll !== "function") {
  console.error("PromotionType model is not properly initialized");
  throw new Error("Model initialization failed");
}

const createPromotionType = async (req, res) => {
  console.log("createPromotionType called at:", new Date().toISOString());
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const { name } = req.body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    console.log("Invalid name:", name);
    return res.status(400).send("Name is required and must be a non-empty string");
  }

  const transaction = await sequelize.transaction();
  try {
    const existingPromotionType = await PromotionType.findOne({
      where: { name: name.trim() },
      transaction,
    });
    if (existingPromotionType) {
      console.log("Promotion type name already exists:", name);
      await transaction.rollback();
      return res.status(400).send("Promotion type name must be unique");
    }

    const promotionType = await PromotionType.create(
      {
        name: name.trim(),
      },
      { transaction }
    );
    console.log("Promotion type created:", promotionType.promotionTypeId);

    await transaction.commit();
    res.status(201).json({
      message: "Promotion type created successfully",
      promotionTypeId: promotionType.promotionTypeId,
      name: promotionType.name,
    });
  } catch (error) {
    console.error("Error in createPromotionType:", error.message, error.stack);
    await transaction.rollback();
    // Handle unique constraint violation from database
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send("Promotion type name must be unique");
    }
    return res.status(500).send("Failed to create promotion type");
  }
};

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
  createPromotionType,
};
