const ProductType = require("../models/productType");

const productTypeService = {
  async createProductType(name) {
    // Validate input
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      throw new Error("Name is required, must be a non-empty string, and max length is 100");
    }

    try {
      const productType = await ProductType.create({
        name: name.trim(), // Remove leading/trailing whitespace
      });
      return productType;
    } catch (error) {
      console.error("Error creating ProductType:", error.message);
      throw new Error("Failed to create product type");
    }
  },
};

module.exports = { productTypeService };
