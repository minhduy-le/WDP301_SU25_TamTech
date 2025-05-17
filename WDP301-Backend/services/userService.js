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

// Redis client setup
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});
redisClient.connect().catch(console.error);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template
const emailTemplate = fs.readFileSync(path.join(__dirname, "../templates/otpEmail.html"), "utf-8");
const forgotPasswordTemplate = fs.readFileSync(path.join(__dirname, "../templates/forgotPasswordEmail.html"), "utf-8");

const userService = {
  async registerUser({ fullName, email, phone_number, password }) {
    // Validation
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

    // Check for existing user
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { phone_number }],
      },
    });
    if (existingUser) {
      throw new Error("Email or phone number already exists");
    }

    // Start transaction
    const transaction = await User.sequelize.transaction();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create(
        {
          fullName,
          email,
          phone_number,
          password: hashedPassword,
          isActive: false,
        },
        { transaction }
      );

      // Create information record
      await Information.create(
        {
          userId: user.id,
          address: null,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await redisClient.setEx(`otp:${email}`, 600, otp); // 10 minutes expiry

      // Prepare email
      const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(email)}&otp=${otp}`;
      let emailHtml = emailTemplate
        .replace("{fullName}", fullName)
        .replace("{otp}", otp)
        .replace(
          "Xác thực ngay",
          `<a href="${verificationUrl}" style="background-color: #FDE3CF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực ngay</a>`
        );

      // Send email
      await transporter.sendMail({
        from: '"Tấm Tech" <' + process.env.EMAIL_USER + ">",
        to: email,
        subject: "Xác thực tài khoản Tấm Tech",
        html: emailHtml,
        attachments: [
          {
            filename: "logo.png",
            path: path.join(__dirname, "../images/logo.png"),
            cid: "logo@tamtech",
          },
        ],
      });

      return user;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async verifyOtp(email, otp) {
    // Validation
    if (!email || !otp || !validator.isEmail(email) || otp.length !== 6) {
      throw new Error("Invalid input");
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Verify OTP
    const storedOtp = await redisClient.get(`otp:${email}`);
    if (storedOtp !== otp) {
      throw new Error("Invalid or expired OTP");
    }

    // Activate user
    await user.update({ isActive: true });

    // Clean up OTP
    await redisClient.del(`otp:${email}`);
  },

  async loginUser(email, password) {
    // Validation
    if (!email || !password || !validator.isEmail(email) || password.length < 6 || password.length > 250) {
      throw new Error("Invalid input");
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if account is activated and not banned
    if (!user.isActive) {
      throw new Error("Account not activated");
    }
    if (user.isBan) {
      throw new Error("Account is banned");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, role: user.role || "user" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Return user details and token
    return {
      fullName: user.fullName,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role || "user",
      token,
    };
  },

  async resendOtp(email) {
    // Validation
    if (!email || !validator.isEmail(email) || email.length > 100) {
      throw new Error("Invalid input");
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Check if account is already activated
    if (user.isActive) {
      throw new Error("Account already activated");
    }

    // Generate and store new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.setEx(`otp:${email}`, 600, otp); // 10 minutes expiry

    // Prepare email
    const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(email)}&otp=${otp}`;
    let emailHtml = emailTemplate
      .replace("{fullName}", user.fullName)
      .replace("{otp}", otp)
      .replace(
        "Xác thực ngay",
        `<a href="${verificationUrl}" style="background-color: #FDE3CF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực ngay</a>`
      );

    // Send email
    await transporter.sendMail({
      from: '"Tấm Tech" <' + process.env.EMAIL_USER + ">",
      to: email,
      subject: "Xác thực tài khoản Tấm Tech",
      html: emailHtml,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../images/logo.png"),
          cid: "logo@tamtech",
        },
      ],
    });
  },

  async forgotPassword(email) {
    // Validation
    if (!email || !validator.isEmail(email)) {
      throw new Error("Invalid input");
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "10m" });
    await redisClient.setEx(`reset:${email}`, 600, resetToken); // 10 minutes expiry

    // Prepare email
    const resetUrl = `http://localhost:3000/verify?token=${encodeURIComponent(resetToken)}`;
    let emailHtml = forgotPasswordTemplate.replace("{fullName}", user.fullName).replace("{resetUrl}", resetUrl);

    // Send email
    await transporter.sendMail({
      from: '"Tấm Tech" <' + process.env.EMAIL_USER + ">",
      to: email,
      subject: "Đặt lại mật khẩu Tấm Tech",
      html: emailHtml,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../images/logo.png"),
          cid: "logo@tamtech",
        },
      ],
    });
  },

  async resetPassword(password, userId) {
    // Validation
    if (!password || password.length < 6 || password.length > 250) {
      throw new Error("Invalid input");
    }

    // Find user by userId
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    // Verify reset token (using email derived from user)
    const storedToken = await redisClient.get(`reset:${user.email}`);
    if (!storedToken) {
      throw new Error("Token mismatch");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await user.update({ password: hashedPassword });

    // Clean up token
    await redisClient.del(`reset:${user.email}`);
  },
};

module.exports = userService;
