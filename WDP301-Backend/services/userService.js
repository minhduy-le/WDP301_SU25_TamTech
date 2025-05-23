const { Sequelize, Op } = require("sequelize");
const User = require("../models/user");
const Information = require("../models/information");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const redis = require("redis");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { auth } = require("../config/firebase");

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || process.env.REDISCLOUD_URL || "redis://localhost:6379",
});
redisClient.connect().catch((err) => {
  console.error("Redis connection error:", err.message);
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/otpEmail.html"), "utf-8");
const forgotPasswordTemplate = fs.readFileSync(path.join(__dirname, "../templates/forgotPasswordEmail.html"), "utf-8");

const userService = {
  async registerUser({ fullName, email, phone_number, password }) {
    if (
      !fullName ||
      !email ||
      !phone_number ||
      !password ||
      fullName.length > 20 ||
      email.length > 100 ||
      phone_number.length > 12 ||
      password.length < 6 ||
      password.length > 250 ||
      !validator.isEmail(email)
    ) {
      throw new Error("Invalid input");
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone_number }] },
    });
    if (existingUser) {
      throw new Error("Email or phone number already exists");
    }

    const transaction = await User.sequelize.transaction();

    let user;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed password:", hashedPassword);
      user = await User.create(
        { fullName, email, phone_number, password: hashedPassword, isActive: false },
        { transaction }
      );
      console.log("User created with ID:", user.id);
      await Information.create({ userId: user.id, address: null }, { transaction });
      console.log("Information record created for user ID:", user.id);
      await transaction.commit();
      console.log("Transaction committed successfully");
    } catch (error) {
      console.error("Transaction error in registerUser:", error.message);
      await transaction.rollback();
      console.log("Transaction rolled back successfully");
      throw error;
    }

    // Handle OTP and email sending separately
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Generated OTP:", otp);
      await redisClient.setEx(`otp:${email}`, 600, otp);
      console.log("OTP stored in Redis for email:", email);

      const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(email)}&otp=${otp}`;
      let emailHtml = emailTemplate
        .replace("{fullName}", fullName)
        .replace("{otp}", otp)
        .replace(
          "Xác thực ngay",
          `<a href="${verificationUrl}" style="background-color: #FDE3CF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực ngay</a>`
        );

      await transporter.sendMail({
        from: '"Tấm Tech" <' + process.env.EMAIL_USER + ">",
        to: email,
        subject: "Xác thực tài khoản Tấm Tech",
        html: emailHtml,
        attachments: [{ filename: "logo.png", path: path.join(__dirname, "../images/logo.png"), cid: "logo@tamtech" }],
      });
      console.log("Email sent to:", email);
    } catch (error) {
      console.error("Error in OTP or email sending:", error.message);
      // Log the error, but don't roll back the database transaction
      // The user can resend the OTP using /api/auth/resend-otp
      console.log("Proceeding despite OTP/email failure; user can resend OTP later");
    }

    return user;
  },

  async verifyOtp(email, otp) {
    if (!email || !otp || !validator.isEmail(email) || otp.length !== 6) {
      throw new Error("Invalid input");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (storedOtp !== otp) {
      throw new Error("Invalid or expired OTP");
    }

    await user.update({ isActive: true });
    await redisClient.del(`otp:${email}`);
  },

  async loginUser(email, password) {
    if (!email || !password || !validator.isEmail(email) || password.length < 6 || password.length > 250) {
      throw new Error("Invalid input");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("Account not activated");
    }
    if (user.isBan) {
      throw new Error("Account is banned");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user.id, role: user.role || "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    return {
      id: user.id,
      fullName: user.fullName,
      email,
      phone_number: user.phone_number,
      role: user.role || "user",
      token,
    };
  },

  async googleLogin(idToken) {
    try {
      console.log("Full idToken received:", idToken); // Log toàn bộ idToken
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log("Decoded token:", decodedToken);
      const email = decodedToken.email;
      const name = decodedToken.name || email.split("@")[0]; // Lấy name từ idToken, nếu không có thì dùng email prefix

      if (!email || !validator.isEmail(email)) {
        throw new Error("Invalid email from Google token");
      }

      let user = await User.findOne({ where: { email } });

      if (user) {
        // Nếu email đã tồn tại, trả về thông tin tài khoản trong database
        if (user.isBan) {
          throw new Error("Account is banned");
        }

        const token = jwt.sign({ id: user.id, role: user.role || "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          phone_number: user.phone_number,
          role: user.role || "user",
          token,
        };
      } else {
        // Nếu email chưa tồn tại, tạo tài khoản mới với fullName từ name trong idToken
        const transaction = await User.sequelize.transaction();
        try {
          const hashedPassword = await bcrypt.hash("String@123", 10);
          user = await User.create(
            {
              fullName: name,
              email,
              phone_number: null,
              password: hashedPassword,
              isActive: true,
              role: "User",
            },
            { transaction }
          );

          await Information.create(
            {
              userId: user.id,
              address: null,
            },
            { transaction }
          );

          await transaction.commit();

          const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
          return {
            id: user.id,
            fullName: name,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role,
            token,
          };
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      }
    } catch (error) {
      console.error("Error in googleLogin:", {
        message: error.message,
        code: error.code,
        stack: error.stack,
        idTokenLength: idToken ? idToken.length : "undefined",
      });
      if (error.code === "auth/argument-error" || error.code === "auth/invalid-credential") {
        throw new Error("Invalid Google token");
      }
      if (error.code === "auth/network-request-failed") {
        throw new Error("Network error: Unable to connect to Firebase");
      }
      if (error.code === "auth/invalid-api-key") {
        throw new Error("Invalid Firebase API key");
      }
      throw new Error("Failed to verify Google token: " + error.message);
    }
  },

  async resendOtp(email) {
    if (!email || !validator.isEmail(email) || email.length > 100) {
      throw new Error("Invalid input");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.isActive) {
      throw new Error("Account already activated");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp);

    const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(email)}&otp=${otp}`;
    let emailHtml = emailTemplate
      .replace("{fullName}", user.fullName)
      .replace("{otp}", otp)
      .replace(
        "Xác thực ngay",
        `<a href="${verificationUrl}" style="background-color: #FDE3CF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực ngay</a>`
      );

    await transporter.sendMail({
      from: '"Tấm Tech" <' + process.env.EMAIL_USER + ">",
      to: email,
      subject: "Xác thực tài khoản Tấm Tech",
      html: emailHtml,
      attachments: [{ filename: "logo.png", path: path.join(__dirname, "../images/logo.png"), cid: "logo@tamtech" }],
    });
  },

  async forgotPassword(email) {
    if (!email || !validator.isEmail(email)) {
      throw new Error("Invalid input");
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "10m" });
    await redisClient.setEx(`reset:${email}`, 600, resetToken);

    const resetUrl = `http://localhost:3000/verify?token=${encodeURIComponent(resetToken)}`;
    let emailHtml = forgotPasswordTemplate.replace("{fullName}", user.fullName).replace("{resetUrl}", resetUrl);

    await transporter.sendMail({
      from: '"Tấm Tech" <' + process.env.EMAIL_USER + ">",
      to: email,
      subject: "Đặt lại mật khẩu Tấm Tech",
      html: emailHtml,
      attachments: [{ filename: "logo.png", path: path.join(__dirname, "../images/logo.png"), cid: "logo@tamtech" }],
    });
  },

  async resetPassword(password, userId) {
    if (!password || password.length < 6 || password.length > 250) {
      throw new Error("Invalid input");
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const storedToken = await redisClient.get(`reset:${user.email}`);
    if (!storedToken) {
      throw new Error("Token mismatch");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });
    await redisClient.del(`reset:${user.email}`);
  },

  async changePassword(oldPassword, newPassword, userId) {
    if (
      !oldPassword ||
      !newPassword ||
      oldPassword.length < 6 ||
      oldPassword.length > 250 ||
      newPassword.length < 6 ||
      newPassword.length > 250
    ) {
      throw new Error("Invalid input");
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect old password");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });
  },
};

module.exports = userService;
