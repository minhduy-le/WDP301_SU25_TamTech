const Promotion = require("../models/promotion");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const { createCanvas } = require("canvas");
const JsBarcode = require("jsbarcode");
const { uploadFileToFirebase } = require("../config/firebase");

class PromotionService {
  async createPromotion(data) {
    const canvas = createCanvas(300, 100);
    try {
      console.log(`Generating barcode for code: ${data.code}`);
      JsBarcode(canvas, data.code, {
        format: "CODE128",
        width: 2,
        height: 80,
        displayValue: true,
        fontSize: 14,
      });

      const svgBuffer = canvas.toBuffer("image/png");
      console.log(`Generated buffer: type=image/png, length=${svgBuffer.length}`);

      const fileName = `barcodes/${data.code}_${Date.now()}.png`;
      const barcodeUrl = await uploadFileToFirebase(svgBuffer, fileName, "image/png");

      const promotion = await Promotion.create({
        ...data,
        NumberCurrentUses: 0,
        isActive: true,
        barcode: barcodeUrl,
      });
      console.log(`Promotion created with barcode URL: ${barcodeUrl}`);
      return promotion;
    } catch (error) {
      console.error("Error generating or uploading barcode:", error.message, error.stack);
      const promotion = await Promotion.create({
        ...data,
        NumberCurrentUses: 0,
        isActive: true,
        barcode: null,
      });
      console.log(`Promotion created without barcode due to error: ${promotion.promotionId}`);
      return promotion;
    }
  }

  async getAllPromotions() {
    await this.updatePromotionsStatus();
    return Promotion.findAll({
      order: [["createdAt", "DESC"]],
    });
  }

  async getActivePromotions() {
    await this.updatePromotionsStatus();
    return Promotion.findAll({
      where: { isActive: true },
    });
  }

  async getPromotionById(id) {
    await this.updatePromotionsStatus();
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    return promotion;
  }

  async updatePromotion(id, data) {
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    await promotion.update(data);
    await this.updatePromotionsStatus();
    return promotion;
  }

  async deactivatePromotion(id) {
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    await promotion.update({ isActive: false });
  }

  async updatePromotionsStatus() {
    const now = new Date();
    await Promotion.update(
      { isActive: false },
      {
        where: {
          [Op.or]: [
            { endDate: { [Op.lt]: now } },
            { NumberCurrentUses: { [Op.gte]: sequelize.col("maxNumberOfUses") } },
          ],
          isActive: true,
        },
      }
    );
  }

  async incrementUsage(id) {
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    if (!promotion.isActive) {
      throw new Error("Promotion is not active");
    }
    await promotion.increment("NumberCurrentUses");
    await this.updatePromotionsStatus();
    return promotion;
  }

  async checkNameExists(name, excludeId = null) {
    const whereClause = { name, isActive: true };
    if (excludeId) {
      whereClause.promotionId = { [Op.ne]: excludeId };
    }
    const existing = await Promotion.findOne({ where: whereClause });
    return !!existing;
  }

  async checkCodeExists(code, excludeId = null) {
    const whereClause = { code };
    if (excludeId) {
      whereClause.promotionId = { [Op.ne]: excludeId };
    }
    const existing = await Promotion.findOne({ where: whereClause });
    return !!existing;
  }

  async getPromotionByCode(code) {
    await this.updatePromotionsStatus();
    const promotion = await Promotion.findOne({
      where: { code, isActive: true },
    });
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    return promotion;
  }

  async getPromotionsByUserId(userId) {
    await this.updatePromotionsStatus();
    const promotions = await Promotion.findAll({
      where: {
        forUser: userId,
        isActive: true,
      },
      order: [["createdAt", "DESC"]],
    });
    if (!promotions || promotions.length === 0) {
      throw new Error("No promotions found for this user");
    }
    return promotions;
  }

  async reactivatePromotion(id) {
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    if (promotion.isActive) {
      throw new Error("Promotion is already active");
    }
    const now = new Date();
    if (new Date(promotion.endDate) < now) {
      throw new Error("Cannot reactivate an expired promotion");
    }
    if (promotion.NumberCurrentUses >= promotion.maxNumberOfUses) {
      throw new Error("Cannot reactivate a promotion that has reached its maximum uses");
    }
    await promotion.update({ isActive: true });
    return promotion;
  }
}

module.exports = new PromotionService();
