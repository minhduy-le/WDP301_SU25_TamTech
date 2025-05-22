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

const updateUserProfile = async (userId, updateData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const { fullName, email, phone_number, date_of_birth } = updateData;

  await user.update({
    fullName: fullName || user.fullName,
    email: email || user.email,
    phone_number: phone_number !== undefined ? phone_number : user.phone_number,
    date_of_birth: date_of_birth !== undefined ? date_of_birth : user.date_of_birth,
  });

  return await getUserProfile(userId); // Trả về profile đã cập nhật
};

module.exports = { getUserProfile, updateUserProfile };
