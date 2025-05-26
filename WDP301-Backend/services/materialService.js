const Material = require("../models/material");
const Store = require("../models/store");

const createMaterial = async (materialData) => {
  try {
    // Validate required fields
    if (!materialData.name || materialData.quantity === undefined) {
      throw "Name and quantity are required";
    }

    // Validate name is not blank
    if (materialData.name.trim() === "") {
      throw "Name cannot be blank";
    }

    // Validate quantity
    const quantity = parseInt(materialData.quantity);
    if (isNaN(quantity) || quantity <= 0 || quantity >= 10000) {
      throw "Quantity must be greater than 0 and less than 10000";
    }

    // Hardcode storeId to 1
    const storeId = 1;

    // Check if storeId exists
    const store = await Store.findByPk(storeId);
    if (!store) {
      throw "Invalid storeId: Store with ID 1 does not exist";
    }

    // Create material with hardcoded storeId
    const finalMaterialData = {
      ...materialData,
      quantity: quantity,
      storeId: storeId,
    };

    // Create material in database
    const material = await Material.create(finalMaterialData);
    return material;
  } catch (error) {
    throw error.message || error; // Ensure a plain string is thrown
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
    throw "Internal server error";
  }
};

module.exports = { createMaterial, getAllMaterials };
