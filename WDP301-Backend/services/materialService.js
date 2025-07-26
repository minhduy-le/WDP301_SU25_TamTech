const Material = require("../models/material");
const Product = require("../models/product");
const Store = require("../models/store");
const ProductRecipe = require("../models/ProductRecipe");
const { createCanvas } = require("canvas");
const JsBarcode = require("jsbarcode");
const { uploadFileToFirebase } = require("../config/firebase");

const createMaterial = async (materialData) => {
  try {
    if (!materialData.name || materialData.quantity === undefined) {
      throw "Name and quantity are required";
    }

    if (materialData.name.trim() === "") {
      throw "Name cannot be blank";
    }

    const quantity = parseInt(materialData.quantity);
    if (isNaN(quantity) || quantity <= 0 || quantity >= 10000) {
      throw "Quantity must be greater than 0 and less than 10000";
    }

    const storeId = 1;

    const store = await Store.findByPk(storeId);
    if (!store) {
      throw "Invalid storeId: Store with ID 1 does not exist";
    }

    const canvas = createCanvas();
    const barcodeValue = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    JsBarcode(canvas, barcodeValue, {
      format: "CODE128",
      displayValue: true,
      fontSize: 12,
      width: 2,
      height: 50,
    });

    const stream = canvas.createPNGStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    const barcodeUrl = await uploadFileToFirebase(fileBuffer, `${barcodeValue}.png`, "image/png");

    const finalMaterialData = {
      ...materialData,
      quantity: quantity,
      storeId: storeId,
      barcode: barcodeUrl,
    };

    const material = await Material.create(finalMaterialData);
    return material;
  } catch (error) {
    throw error.message || error;
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

const increaseMaterialQuantity = async (materialId) => {
  try {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw "Material not found";
    }

    // Increase quantity by 100
    const newQuantity = material.quantity + 100;
    if (newQuantity >= 10000) {
      throw "Quantity cannot exceed 10000";
    }

    // Update quantity
    material.quantity = newQuantity;
    await material.save();
    return {
      materialId: material.materialId,
      quantity: material.quantity,
    };
  } catch (error) {
    throw error.message || error;
  }
};

const updateMaterial = async (materialId, materialData) => {
  try {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw "Material not found";
    }

    if (materialData.name && materialData.name.trim() === "") {
      throw "Name cannot be blank";
    }

    if (materialData.quantity !== undefined) {
      const quantity = parseInt(materialData.quantity);
      if (isNaN(quantity) || quantity <= 0 || quantity >= 10000) {
        throw "Quantity must be greater than 0 and less than 10000";
      }
      material.quantity = quantity;
    }

    if (materialData.name) {
      material.name = materialData.name;
    }

    await material.save();
    return {
      materialId: material.materialId,
      name: material.name,
      quantity: material.quantity,
      storeId: material.storeId,
      barcode: material.barcode,
    };
  } catch (error) {
    throw error.message || error;
  }
};

const deleteMaterial = async (materialId) => {
  try {
    const material = await Material.findByPk(materialId);
    if (!material) {
      throw "Material not found";
    }

    const productRecipes = await ProductRecipe.findAll({
      where: {
        materialId: materialId,
      },
      include: [
        {
          model: Product,
          as: "Product",
          where: { isActive: true },
          attributes: ["productId"],
        },
      ],
    });

    if (productRecipes.length > 0) {
      throw "Cannot delete material as it is referenced by active product recipes";
    }

    material.isActive = false;
    await material.save();
    return {
      materialId: material.materialId,
      isActive: material.isActive,
    };
  } catch (error) {
    throw error.message || error;
  }
};

module.exports = { createMaterial, getAllMaterials, increaseMaterialQuantity, updateMaterial, deleteMaterial };
