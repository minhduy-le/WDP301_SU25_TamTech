const User = require("../models/user");
const httpErrors = require("http-errors");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");

// Current date for date_of_birth validation
const currentDate = new Date("2025-05-26T10:28:00+07:00");

const createUser = async (userData) => {
  try {
    // Validate each required field individually
    if (!userData.fullName || userData.fullName.trim() === "") {
      throw "Full name cannot be blank";
    }
    if (!userData.email || userData.email.trim() === "") {
      throw "Email cannot be blank";
    }
    if (!userData.password || userData.password.trim() === "") {
      throw "Password cannot be blank";
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw "Invalid email format";
    }

    // Validate role if provided
    if (userData.role) {
      if (userData.role.trim() === "") {
        throw "Role cannot be blank";
      }
      const validRoles = ["Admin", "User", "Staff", "Shipper", "Manager"];
      if (!validRoles.includes(userData.role)) {
        throw "Invalid role";
      }
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ where: { email: userData.email } });
    if (existingUserByEmail) {
      throw "Email already exists";
    }

    // Validate phone_number
    if (userData.phone_number) {
      const phoneStr = userData.phone_number.toString().replace(/\D/g, ""); // Remove non-digits
      if (isNaN(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
        throw "Phone number must be 10 or 11 digits";
      }
    }

    // Validate date_of_birth
    if (userData.date_of_birth) {
      const dob = new Date(userData.date_of_birth);
      if (isNaN(dob) || dob > currentDate) {
        throw "Date of birth must not be in the future";
      }
    }

    // Check if phone number already exists
    if (userData.phone_number) {
      const existingUserByPhone = await User.findOne({ where: { phone_number: userData.phone_number } });
      if (existingUserByPhone) {
        throw "Phone number is already exist";
      }
    }

    // Hash password
    userData.password = await bcrypt.hash(userData.password, 10);

    // Set default values for fields not provided by frontend
    userData.isActive = true;
    userData.isBan = false;
    userData.member_point = 0;
    userData.member_rank = 0;
    if (!userData.role) {
      userData.role = "User"; // Default role if not provided
    }

    // Create user in database
    const user = await User.create(userData);
    return user;
  } catch (error) {
    console.error("Error in createUser:", error);
    throw error;
  }
};

const getAllUsers = async (loggedInUserId) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "fullName", "email", "phone_number", "date_of_birth", "note", "role", "isActive"],
      where: {
        id: { [Op.ne]: loggedInUserId }, // Exclude the logged-in user
      },
    });
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw "Internal server error";
  }
};

const getUserByPhoneNumber = async (phoneNumber) => {
  try {
    // Log input
    console.log(`[DEBUG] getUserByPhoneNumber: Received phoneNumber: ${phoneNumber}`);

    // Validate phone number input
    if (!phoneNumber || typeof phoneNumber !== "string") {
      console.log(`[DEBUG] getUserByPhoneNumber: Invalid input - phoneNumber is ${phoneNumber}`);
      throw "Phone number is required and must be a string";
    }

    // Validate phone number format
    const phoneStr = phoneNumber.replace(/\D/g, ""); // Remove non-digits
    console.log(`[DEBUG] getUserByPhoneNumber: Sanitized phone number: ${phoneStr}`);
    if (isNaN(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
      console.log(`[DEBUG] getUserByPhoneNumber: Invalid phone number format - length: ${phoneStr.length}`);
      throw "Invalid phone number format (must be 10 or 11 digits)";
    }

    // Check user without role filter for debugging
    const userWithoutRoleFilter = await User.findOne({
      attributes: ["id", "fullName", "email", "phone_number", "role"],
      where: { phone_number: phoneNumber },
    });
    console.log(`[DEBUG] getUserByPhoneNumber: User without role filter: ${JSON.stringify(userWithoutRoleFilter)}`);

    // Query with role filter
    const user = await User.findOne({
      attributes: ["id", "fullName", "email", "phone_number", "date_of_birth", "note", "role", "isActive"],
      where: {
        phone_number: phoneNumber,
        role: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("role")), { [Op.ne]: "user" }), // Case-insensitive
      },
    });

    console.log(`[DEBUG] getUserByPhoneNumber: User with role filter: ${JSON.stringify(user)}`);

    if (!user) {
      console.log(
        `[DEBUG] getUserByPhoneNumber: No user found or user has 'User' role for phoneNumber: ${phoneNumber}`
      );
      throw "User not found or has User role";
    }

    console.log(`[DEBUG] getUserByPhoneNumber: Returning user with role: ${user.role}`);
    return user;
  } catch (error) {
    console.error(`[ERROR] getUserByPhoneNumber: ${error.message || error}`);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw "Invalid user ID";
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "fullName", "email", "phone_number", "date_of_birth", "note", "role", "isActive"],
      where: {
        role: {
          [Op.ne]: "Admin", // Exclude users with Admin role
        },
      },
    });

    if (!user) {
      throw "User not found or is an Admin";
    }

    return user;
  } catch (error) {
    console.error("Error in getUserById:", error);
    throw error;
  }
};

const updateUser = async (userId, userData) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw "Invalid user ID";
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw "User not found";
    }

    // Validate email format if provided
    if (userData.email) {
      if (userData.email.trim() === "") {
        throw "Email cannot be blank";
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw "Invalid email format";
      }
      const existingUser = await User.findOne({
        where: { email: userData.email, id: { [Op.ne]: userId } },
      });
      if (existingUser) {
        throw "Email already exists";
      }
    }

    // Validate phone_number if provided
    if (userData.phone_number) {
      const phoneStr = userData.phone_number.toString().replace(/\D/g, ""); // Remove non-digits
      if (isNaN(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
        throw "Phone number must be 10 or 11 digits";
      }
      const existingUserByPhone = await User.findOne({
        where: { phone_number: userData.phone_number, id: { [Op.ne]: userId } },
      });
      if (existingUserByPhone) {
        throw "Phone number is already exist";
      }
    }

    // Validate date_of_birth if provided
    if (userData.date_of_birth) {
      const dob = new Date(userData.date_of_birth);
      if (isNaN(dob) || dob > currentDate) {
        throw "Date of birth must not be in the future";
      }
    }

    // Hash password if provided
    if (userData.password) {
      if (userData.password.trim() === "") {
        throw "Password cannot be blank";
      }
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    // Update user
    await user.update(userData);
    return user;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw error;
  }
};

const deactivateUser = async (userId) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw "Invalid user ID";
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw "User not found";
    }

    await user.update({ isActive: false });
  } catch (error) {
    console.error("Error in deactivateUser:", error);
    throw error;
  }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deactivateUser, getUserByPhoneNumber };
