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

  // Check if email already exists for another user
  if (email && email !== user.email) {
    const existingEmail = await User.findOne({
      where: { email, id: { [User.Sequelize.Op.ne]: userId } },
    });
    if (existingEmail) {
      throw new Error("Email already exists");
    }
  }

  // Check if phone number already exists for another user
  if (phone_number && phone_number !== user.phone_number) {
    const existingPhone = await User.findOne({
      where: { phone_number, id: { [User.Sequelize.Op.ne]: userId } },
    });
    if (existingPhone) {
      throw new Error("Phone number already exists");
    }
  }

  await user.update({
    fullName: fullName || user.fullName,
    email: email || user.email,
    phone_number: phone_number !== undefined ? phone_number : user.phone_number,
    date_of_birth: date_of_birth !== undefined ? date_of_birth : user.date_of_birth,
  });

  return await getUserProfile(userId); // Trả về profile đã cập nhật
};

module.exports = { getUserProfile, updateUserProfile };
