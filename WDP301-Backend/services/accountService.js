const User = require("../models/user");
const httpErrors = require("http-errors");
const bcrypt = require("bcrypt");

const createUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.fullName || !userData.email || !userData.password || !userData.role) {
      throw httpErrors.BadRequest("Full name, email, password, and role are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw httpErrors.BadRequest("Invalid email format");
    }

    // Validate role
    const validRoles = ["Admin", "User", "Staff", "Shipper"];
    if (!validRoles.includes(userData.role)) {
      throw httpErrors.BadRequest("Invalid role");
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw httpErrors.BadRequest("Email already exists");
    }

    // Hash password
    userData.password = await bcrypt.hash(userData.password, 10);

    // Ensure isActive is true
    userData.isActive = true;

    // Create user in database
    const user = await User.create(userData);
    return user;
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      throw httpErrors.BadRequest(error.message);
    }
    console.error("Error in createUser:", error);
    throw httpErrors.InternalServerError("Failed to create user: " + error.message);
  }
};

const getAllUsers = async () => {
  try {
    const users = await User.findAll({
      where: {
        role: ["User", "Shipper", "Staff"],
      },
      attributes: [
        "id",
        "fullName",
        "email",
        "phone_number",
        "isActive",
        "date_of_birth",
        "note",
        "isBan",
        "member_point",
        "member_rank",
        "role",
      ],
    });
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw httpErrors.InternalServerError("Failed to retrieve users: " + error.message);
  }
};

const getUserById = async (userId) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw httpErrors.BadRequest("Invalid user ID");
    }

    const user = await User.findByPk(userId, {
      attributes: [
        "id",
        "fullName",
        "email",
        "phone_number",
        "isActive",
        "date_of_birth",
        "note",
        "isBan",
        "member_point",
        "member_rank",
        "role",
      ],
    });

    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    if (error.status === 400 || error.status === 404) {
      throw error;
    }
    throw httpErrors.InternalServerError("Failed to retrieve user: " + error.message);
  }
};

const updateUser = async (userId, userData) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw httpErrors.BadRequest("Invalid user ID");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    // Validate email format if provided
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw httpErrors.BadRequest("Invalid email format");
      }
      // Check if new email is already used by another user
      const existingUser = await User.findOne({
        where: { email: userData.email, id: { [User.sequelize.Op.ne]: userId } },
      });
      if (existingUser) {
        throw httpErrors.BadRequest("Email already exists");
      }
    }

    // Validate role if provided
    if (userData.role) {
      const validRoles = ["Admin", "User", "Staff", "Shipper"];
      if (!validRoles.includes(userData.role)) {
        throw httpErrors.BadRequest("Invalid role");
      }
    }

    // Hash password if provided
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Update user
    await user.update(userData);
    return user;
  } catch (error) {
    console.error("Error in updateUser:", error);
    if (error.status === 400 || error.status === 404) {
      throw error;
    }
    throw httpErrors.InternalServerError("Failed to update user: " + error.message);
  }
};

const deactivateUser = async (userId) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw httpErrors.BadRequest("Invalid user ID");
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw httpErrors.NotFound("User not found");
    }

    // Set isActive to false
    await user.update({ isActive: false });
  } catch (error) {
    console.error("Error in deactivateUser:", error);
    if (error.status === 400 || error.status === 404) {
      throw error;
    }
    throw httpErrors.InternalServerError("Failed to deactivate user: " + error.message);
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deactivateUser };
