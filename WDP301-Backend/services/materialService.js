const Material = require("../models/material");
const Store = require("../models/store");
const { createCanvas } = require("canvas");
const JsBarcode = require("jsbarcode");
const { uploadFileToFirebase } = require("../config/firebase");

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

    // Generate barcode
    const canvas = createCanvas();
    const barcodeValue = `MAT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    JsBarcode(canvas, barcodeValue, {
      format: "CODE128",
      displayValue: true,
      fontSize: 12,
      width: 2,
      height: 50,
    });

    // Convert canvas to buffer
    const stream = canvas.createPNGStream();
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);

    // Upload barcode to Firebase Storage
    const barcodeUrl = await uploadFileToFirebase(fileBuffer, `${barcodeValue}.png`, "image/png");

    // Create material with barcode URL
    const finalMaterialData = {
      ...materialData,
      quantity: quantity,
      storeId: storeId,
      barcode: barcodeUrl,
    };

    // Create material in database
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

module.exports = { createMaterial, getAllMaterials };
