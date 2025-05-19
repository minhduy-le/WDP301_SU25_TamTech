const Store = require("../models/store");
const httpErrors = require("http-errors");

const createStore = async (storeData) => {
  try {
    // Validate required fields
    if (!storeData.name || !storeData.address) {
      throw httpErrors.BadRequest("Name and address are required");
    }

    // Create store in database
    const store = await Store.create(storeData);
    return store;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    throw httpErrors.InternalServerError("Failed to create store");
  }
};

module.exports = { createStore };
