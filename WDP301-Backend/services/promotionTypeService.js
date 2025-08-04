const PromotionType = require("../models/promotionType");
const Promotion = require("../models/promotion");
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
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send("Promotion type name must be unique");
    }
    return res.status(500).send("Failed to create promotion type");
  }
};

const updatePromotionType = async (req, res) => {
  console.log("updatePromotionType called at:", new Date().toISOString());
  console.log("Request params:", req.params);
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  const { promotionTypeId } = req.params;
  const { name } = req.body;

  const parsedPromotionTypeId = parseInt(promotionTypeId, 10);
  if (isNaN(parsedPromotionTypeId)) {
    console.log("Invalid promotionTypeId format:", promotionTypeId);
    return res.status(400).send("Invalid promotion type ID");
  }

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    console.log("Invalid name:", name);
    return res.status(400).send("Name is required and must be a non-empty string");
  }

  const transaction = await sequelize.transaction();
  try {
    const promotionType = await PromotionType.findOne({
      where: { promotionTypeId: parsedPromotionTypeId },
      transaction,
    });

    if (!promotionType) {
      console.log("Promotion type not found for promotionTypeId:", parsedPromotionTypeId);
      await transaction.rollback();
      return res.status(404).send("Promotion type not found");
    }

    const existingPromotionType = await PromotionType.findOne({
      where: { name: name.trim() },
      transaction,
    });
    if (existingPromotionType && existingPromotionType.promotionTypeId !== parsedPromotionTypeId) {
      console.log("Promotion type name already exists:", name);
      await transaction.rollback();
      return res.status(400).send("Promotion type name must be unique");
    }

    promotionType.name = name.trim();
    await promotionType.save({ transaction });

    await transaction.commit();
    console.log("Promotion type updated for promotionTypeId:", parsedPromotionTypeId);

    res.status(200).json({
      message: "Promotion type updated successfully",
      promotionTypeId: promotionType.promotionTypeId,
      name: promotionType.name,
    });
  } catch (error) {
    console.error("Error in updatePromotionType:", error.message, error.stack);
    await transaction.rollback();
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).send("Promotion type name must be unique");
    }
    return res.status(500).send("Failed to update promotion type");
  }
};

const getPromotionTypes = async (req, res) => {
  console.log("getPromotionTypes called at:", new Date().toISOString());

  try {
    const promotionTypes = await PromotionType.findAll({
      attributes: ["promotionTypeId", "name", "isActive"],
    });

    console.log("Fetched promotion types:", promotionTypes.length);
    res.status(200).json(promotionTypes);
  } catch (error) {
    console.error("Error in getPromotionTypes:", error.message, error.stack);
    res.status(500).send("Failed to retrieve promotion types");
  }
};

const deletePromotionType = async (req, res) => {
  console.log("deletePromotionType called at:", new Date().toISOString());
  console.log("Request params:", req.params);

  const { promotionTypeId } = req.params;
  const parsedPromotionTypeId = parseInt(promotionTypeId, 10);

  if (isNaN(parsedPromotionTypeId)) {
    console.log("Invalid promotionTypeId format:", promotionTypeId);
    return res.status(400).send("Invalid promotion type ID");
  }

  const transaction = await sequelize.transaction();
  try {
    const promotionType = await PromotionType.findOne({
      where: { promotionTypeId: parsedPromotionTypeId },
      transaction,
    });

    if (!promotionType) {
      console.log("Promotion type not found for promotionTypeId:", parsedPromotionTypeId);
      await transaction.rollback();
      return res.status(404).send("Promotion type not found");
    }

    const promotionCount = await Promotion.count({
      where: { promotionTypeId: parsedPromotionTypeId },
      transaction,
    });

    if (promotionCount > 0) {
      console.log("Promotion type is used in existing promotions:", parsedPromotionTypeId);
      await transaction.rollback();
      return res.status(409).send("Cannot deactivate promotion type because it is used in existing promotions");
    }

    promotionType.isActive = false;
    await promotionType.save({ transaction });

    await transaction.commit();
    console.log("Promotion type deactivated for promotionTypeId:", parsedPromotionTypeId);

    res.status(200).json({
      message: "Promotion type deactivated successfully",
      promotionTypeId: promotionType.promotionTypeId,
    });
  } catch (error) {
    console.error("Error in deletePromotionType:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to deactivate promotion type");
  }
};

const reactivatePromotionType = async (req, res) => {
  console.log("reactivatePromotionType called at:", new Date().toISOString());
  console.log("Request params:", req.params);

  const { promotionTypeId } = req.params;
  const parsedPromotionTypeId = parseInt(promotionTypeId, 10);

  if (isNaN(parsedPromotionTypeId)) {
    console.log("Invalid promotionTypeId format:", promotionTypeId);
    return res.status(400).send("Invalid promotion type ID");
  }

  const transaction = await sequelize.transaction();
  try {
    const promotionType = await PromotionType.findOne({
      where: { promotionTypeId: parsedPromotionTypeId },
      transaction,
    });

    if (!promotionType) {
      console.log("Promotion type not found for promotionTypeId:", parsedPromotionTypeId);
      await transaction.rollback();
      return res.status(404).send("Promotion type not found");
    }

    if (promotionType.isActive) {
      console.log("Promotion type already active:", parsedPromotionTypeId);
      await transaction.rollback();
      return res.status(400).send("Promotion type is already active");
    }

    promotionType.isActive = true;
    await promotionType.save({ transaction });

    await transaction.commit();
    console.log("Promotion type reactivated for promotionTypeId:", parsedPromotionTypeId);

    res.status(200).json({
      message: "Promotion type reactivated successfully",
      promotionTypeId: promotionType.promotionTypeId,
    });
  } catch (error) {
    console.error("Error in reactivatePromotionType:", error.message, error.stack);
    await transaction.rollback();
    return res.status(500).send("Failed to reactivate promotion type");
  }
};

module.exports = {
  createPromotionType,
  updatePromotionType,
  getPromotionTypes,
  deletePromotionType,
  reactivatePromotionType,
};
