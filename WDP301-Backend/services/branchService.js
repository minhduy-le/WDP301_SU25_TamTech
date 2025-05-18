const Branch = require("../models/branch");
const httpErrors = require("http-errors");

const createBranch = async (branchData) => {
  try {
    // Validate required fields
    if (!branchData.name || !branchData.address || !branchData.provinnce || !branchData.district) {
      throw httpErrors.BadRequest("Name, address, province, and district are required");
    }

    // Create branch in database
    const branch = await Branch.create(branchData);
    return branch;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    throw httpErrors.InternalServerError("Failed to create branch");
  }
};

module.exports = { createBranch };
