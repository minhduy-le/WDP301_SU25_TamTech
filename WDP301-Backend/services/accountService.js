const User = require("../models/user");
const httpErrors = require("http-errors");
const bcrypt = require("bcrypt");
const { Op, Sequelize } = require("sequelize");

const currentDate = new Date();

const createUser = async (userData) => {
  try {
    if (!userData.fullName || userData.fullName.trim() === "") {
      throw "Full name cannot be blank";
    }
    if (!userData.email || userData.email.trim() === "") {
      throw "Email cannot be blank";
    }
    if (!userData.password || userData.password.trim() === "") {
      throw "Password cannot be blank";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw "Invalid email format";
    }

    if (userData.role) {
      if (userData.role.trim() === "") {
        throw "Role cannot be blank";
      }
      const validRoles = ["Admin", "User", "Staff", "Shipper", "Manager"];
      if (!validRoles.includes(userData.role)) {
        throw "Invalid role";
      }
    }

    const existingUserByEmail = await User.findOne({ where: { email: userData.email } });
    if (existingUserByEmail) {
      throw "Email already exists";
    }

    if (userData.phone_number) {
      const phoneStr = userData.phone_number.toString().replace(/\D/g, "");
      if (isNaN(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
        throw "Phone number must be 10 or 11 digits";
      }
    }

    if (userData.date_of_birth) {
      const dob = new Date(userData.date_of_birth);
      if (isNaN(dob) || dob > currentDate) {
        throw "Date of birth must not be in the future";
      }
    }

    if (userData.phone_number) {
      const existingUserByPhone = await User.findOne({ where: { phone_number: userData.phone_number } });
      if (existingUserByPhone) {
        throw "Phone number is already exist";
      }
    }

    userData.password = await bcrypt.hash(userData.password, 10);

    userData.isActive = true;
    userData.isBan = false;
    userData.member_point = 0;
    userData.member_rank = 0;
    if (!userData.role) {
      userData.role = "User";
    }

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
        id: { [Op.ne]: loggedInUserId },
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
    console.log(`[DEBUG] getUserByPhoneNumber: Received phoneNumber: ${phoneNumber}`);

    if (!phoneNumber || typeof phoneNumber !== "string") {
      console.log(`[DEBUG] getUserByPhoneNumber: Invalid input - phoneNumber is ${phoneNumber}`);
      throw "Phone number is required and must be a string";
    }

    const phoneStr = phoneNumber.replace(/\D/g, "");
    console.log(`[DEBUG] getUserByPhoneNumber: Sanitized phone number: ${phoneStr}`);
    if (isNaN(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
      console.log(`[DEBUG] getUserByPhoneNumber: Invalid phone number format - length: ${phoneStr.length}`);
      throw "Invalid phone number format (must be 10 or 11 digits)";
    }

    const user = await User.findOne({
      attributes: ["id", "fullName", "email", "phone_number", "date_of_birth", "note", "role", "isActive"],
      where: { phone_number: phoneNumber },
    });

    console.log(`[DEBUG] getUserByPhoneNumber: User: ${JSON.stringify(user)}`);

    if (!user) {
      console.log(`[DEBUG] getUserByPhoneNumber: No user found`);
      throw httpErrors(404, "User not found");
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
          [Op.ne]: "Admin",
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

    if (userData.phone_number) {
      const phoneStr = userData.phone_number.toString().replace(/\D/g, "");
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

    if (userData.date_of_birth) {
      const dob = new Date(userData.date_of_birth);
      if (isNaN(dob) || dob > currentDate) {
        throw "Date of birth must not be in the future";
      }
    }

    if (userData.password) {
      if (userData.password.trim() === "") {
        throw "Password cannot be blank";
      }
      userData.password = await bcrypt.hash(userData.password, 10);
    }

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

    if (user.role === "Admin") {
      throw "Cannot deactivate Admin users";
    }

    await user.update({ isActive: false });
  } catch (error) {
    console.error("Error in deactivateUser:", error);
    throw error;
  }
};

const activateUser = async (userId) => {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw "Invalid user ID";
    }

    const user = await User.findByPk(userId);
    if (!user) {
      throw "User not found";
    }

    if (user.isActive) {
      throw "User is already active";
    }

    await user.update({ isActive: true });
    return user;
  } catch (error) {
    console.error("Error in activateUser:", error);
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deactivateUser,
  getUserByPhoneNumber,
  activateUser,
};
