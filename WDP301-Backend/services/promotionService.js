const Promotion = require("../models/promotion");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

class PromotionService {
  async createPromotion(data) {
    const promotion = await Promotion.create({
      ...data,
      NumberCurrentUses: 0,
      isActive: true,
    });
    return promotion;
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
}

module.exports = new PromotionService();
