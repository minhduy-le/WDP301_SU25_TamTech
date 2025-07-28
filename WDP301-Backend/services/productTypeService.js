const ProductType = require("../models/productType");
const Product = require("../models/product");

const productTypeService = {
  async createProductType(name) {
    if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
      throw new Error("Name is required, must be a non-empty string, and max length is 100");
    }

    try {
      const productType = await ProductType.create({
        name: name.trim(),
      });
      return productType;
    } catch (error) {
      console.error("Error creating ProductType:", error.message);
      throw new Error("Failed to create product type");
    }
  },

  async getProductTypes() {
    try {
      const productTypes = await ProductType.findAll({
        attributes: ["productTypeId", "name", "isActive"],
      });
      return productTypes;
    } catch (error) {
      console.error("Error fetching ProductTypes:", error.message);
      throw new Error("Failed to fetch product types");
    }
  },

  async updateProductType(productTypeId, name) {
    try {
      const productType = await ProductType.findByPk(productTypeId);
      if (!productType) {
        throw new Error("Product type not found");
      }

      if (!name || typeof name !== "string" || name.trim().length === 0 || name.length > 100) {
        throw new Error("Name is required, must be a non-empty string, and max length is 100");
      }

      productType.name = name.trim();
      await productType.save();
      return {
        productTypeId: productType.productTypeId,
        name: productType.name,
      };
    } catch (error) {
      console.error("Error updating ProductType:", error.message);
      throw error.message || "Failed to update product type";
    }
  },

  async deleteProductType(productTypeId) {
    try {
      const productType = await ProductType.findByPk(productTypeId);
      if (!productType) {
        throw new Error("Product type not found");
      }

      const products = await Product.findAll({
        where: {
          productTypeId: productTypeId,
          isActive: true,
        },
        attributes: ["productId"],
      });

      if (products.length > 0) {
        throw new Error("Cannot delete product type as it is referenced by active products");
      }

      productType.isActive = false;
      await productType.save();
      return {
        productTypeId: productType.productTypeId,
        isActive: productType.isActive,
      };
    } catch (error) {
      console.error("Error deleting ProductType:", error.message);
      throw error.message || "Failed to delete product type";
    }
  },

  async reactivateProductType(productTypeId) {
    try {
      const productType = await ProductType.findByPk(productTypeId);
      if (!productType) {
        throw new Error("Product type not found");
      }
      if (productType.isActive) {
        throw new Error("Product type is already active");
      }
      await productType.update({ isActive: true });
      return {
        productTypeId: productType.productTypeId,
        name: productType.name,
        isActive: productType.isActive,
      };
    } catch (error) {
      console.error("Error reactivating ProductType:", error.message);
      throw error.message || "Failed to reactivate product type";
    }
  },
};

module.exports = { productTypeService };
