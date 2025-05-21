// services/profileService.js
const User = require("../models/user");

const getUserProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ["id", "fullName", "email", "phone_number", "isActive", "role", "date_of_birth", "member_point"],
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};



module.exports = { getUserProfile };
