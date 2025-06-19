const User = require("../models/user");
const httpErrors = require("http-errors");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

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
        id: { [Op.ne]: loggedInUserId } // Exclude the logged-in user
      },
    });
    return users;
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    throw "Internal server error";
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

module.exports = { createUser, getAllUsers, getUserById, updateUser, deactivateUser };
