const Material = require("../models/material");
const Store = require("../models/store");
const httpErrors = require("http-errors");

const createMaterial = async (materialData) => {
  try {
    // Validate required fields
    if (!materialData.name || materialData.quantity === undefined) {
      throw httpErrors.BadRequest("Name and quantity are required");
    }

    // Hardcode storeId to 1
    const storeId = 1;

    // Check if storeId exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      throw httpErrors.BadRequest("Invalid storeId: Store with ID 1 does not exist");
    }

    // Create material with hardcoded storeId
    const finalMaterialData = {
      ...materialData,
      storeId: storeId,
    };

    // Create material in database
    const material = await Material.create(finalMaterialData);
    return material;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    if (error.name === "SequelizeForeignKeyConstraintError") {
      throw httpErrors.BadRequest("Invalid storeId");
    }
    throw httpErrors.InternalServerError("Failed to create material");
  }
};

const getAllMaterials = async () => {
  try {
    const materials = await Material.findAll({
      include: [
        {
          model: Store,
          as: "Store",
          attributes: ["storeId", "name", "address"],
        },
      ],
    });
    return materials;
  } catch (error) {
    throw httpErrors.InternalServerError("Failed to retrieve materials");
  }
};

module.exports = { createMaterial, getAllMaterials };
