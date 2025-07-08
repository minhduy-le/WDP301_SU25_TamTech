const { Sequelize, Op } = require("sequelize");
const User = require("../models/user");
const Information = require("../models/information");
const VerifyOtp = require("../models/verifyOtp");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { auth } = require("../config/firebase");
const FcmToken = require("../models/fcmToken");

// Current date for date_of_birth validation
const currentDate = new Date("2025-05-26T10:53:00+07:00");

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
  async registerUser({ fullName, email, phone_number, password, date_of_birth }) {
    // Combined validation for efficiency
    const errors = [];
    if (!fullName || fullName.trim() === "" || fullName.length < 2 || fullName.length > 20) {
      errors.push("Full name must be between 2 and 20 characters");
    }
    if (!email || email.length > 100 || !validator.isEmail(email)) {
      errors.push("Email must be valid and not exceed 100 characters");
    }
    if (!phone_number || phone_number.length > 12 || !/^\d{10,11}$/.test(phone_number.replace(/\D/g, ""))) {
      errors.push("Phone number must be 10 or 11 digits");
    }
    if (!password || password.length < 6 || password.length > 250) {
      errors.push("Password must be between 6 and 250 characters");
    }
    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      if (isNaN(dob) || dob > currentDate) {
        errors.push("Date of birth must be valid and not in the future");
      }
    }
    if (errors.length > 0) {
      throw errors.join("; ");
    }

    // Check for existing user
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone_number }] },
      attributes: ["email", "phone_number"],
    });
    if (existingUser) {
      if (existingUser.email === email) {
        throw "Email already exists";
      }
      if (existingUser.phone_number === phone_number) {
        throw "Phone number already exists";
      }
    }

    // Perform database operations in a transaction
    const transaction = await User.sequelize.transaction();
    let user;
    let otp; // Declare otp here
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create(
        { fullName, email, phone_number, password: hashedPassword, isActive: false, date_of_birth },
        { transaction }
      );
      await Information.create({ userId: user.id, address: null }, { transaction });

      // Generate and store OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const createdAt = new Date();
      const expiredAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes from now
      await VerifyOtp.create({ otp, createdAt, expiredAt, email }, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error("Transaction error in registerUser:", error.message);
      throw "Server error";
    }

    // Handle email sending asynchronously
    const verificationUrl = `http://localhost:3000/verify?email=${encodeURIComponent(email)}&otp=${otp}`;
    const emailHtml = emailTemplate
      .replace("{fullName}", fullName)
      .replace("{otp}", otp)
      .replace(
        "Xác thực ngay",
        `<a href="${verificationUrl}" style="background-color: #FDE3CF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Xác thực ngay</a>`
      );

    // Non-blocking email operation
    transporter
      .sendMail({
        from: `"Tấm Tech" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Xác thực tài khoản Tấm Tech",
        html: emailHtml,
        attachments: [
          { filename: "logo.png", path: path.join(__dirname, "..", "images", "logo.png"), cid: "logo@tam" },
        ],
      })
      .catch((error) => console.error("Error error:", error.message));

    return {
      status: 201,
      message: "Registration successful, please check your email for OTP",
    };
  },

  async verifyOtp(email, otp) {
    if (!email) {
      throw "Email cannot be empty";
    }
    if (!otp) {
      throw "OTP cannot be empty";
    }
    if (!validator.isEmail(email)) {
      throw "Email must be invalid";
    }
    if (otp.length !== 6) {
      throw "Email must be 6 digits";
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw "User not found";
    }

    const otpRecord = await VerifyOtp.findOne({
      where: { email: email, otp },
    });
    if (!otpRecord) {
      throw "Invalid or expired OTP";
    }

    const currentTime = new Date();
    if (currentTime > otpRecord.expiredAt) {
      await otpRecord.destroy();
      throw "Invalid or expired OTP";
    }

    await user.update({ isActive: true });
    await otpRecord.destroy();
  },

  async loginUser(email, password) {
    if (!email) {
      throw "Email cannot be blank";
    }
    if (!password) {
      throw "Password cannot be blank";
    }
    if (!validator.isEmail(email)) {
      throw "Email format is invalid";
    }
    if (password.length < 6) {
      throw "Password must be at least 6 characters";
    }
    if (password.length > 250) {
      throw "Password cannot exceed 250 characters";
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw "User not found";
    }

    if (!user.isActive) {
      throw "Account not activated";
    }
    if (user.isBan) {
      throw "Account is banned";
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw "Invalid credentials";
    }

    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role || "user",
        date_of_birth: user.date_of_birth, //them date_of_birth
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token };
  },

  async loginUserWeb(email, password, fcmToken) {
    // Input validation
    if (!email) {
      throw "Email cannot be blank";
    }
    if (!password) {
      throw "Password cannot be blank";
    }
    if (!validator.isEmail(email)) {
      throw "Email format is invalid";
    }
    if (password.length < 6) {
      throw "Password must be at least 6 characters";
    }
    if (password.length > 250) {
      throw "Password cannot exceed 250 characters";
    }
    if (fcmToken && typeof fcmToken !== "string") {
      throw "FCM token must be a string";
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw "User not found";
    }

    // Check account status
    if (!user.isActive) {
      throw "Account not activated";
    }
    if (user.isBan) {
      throw "Account is banned";
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw "Invalid credentials";
    }

    // Handle FCM token if provided
    if (fcmToken && fcmToken.trim() !== "") {
      const existingToken = await FcmToken.findOne({
        where: { userId: user.id, fcmToken },
      });

      if (!existingToken) {
        await FcmToken.create({
          userId: user.id,
          fcmToken,
        });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role || "User",
        date_of_birth: user.date_of_birth,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { token };
  },

  async googleLogin(idToken) {
    try {
      console.log("Full idToken received:", idToken);
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log("Decoded token:", decodedToken);
      const email = decodedToken.email;
      const name = decodedToken.name || email.split("@")[0];

      if (!email || !validator.isEmail(email)) {
        throw "Invalid email from Google token";
      }

      let user = await User.findOne({ where: { email } });

      if (user) {
        if (user.isBan) {
          throw "Account is banned";
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
          throw "Server error";
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
        throw "Invalid Google token";
      }
      if (error.code === "auth/network-request-failed") {
        throw "Network error: Unable to connect to Firebase";
      }
      if (error.code === "auth/invalid-api-key") {
        throw "Invalid Firebase API key";
      }
      throw "Failed to verify Google token: " + error.message;
    }
  },

  async resendOtp(email) {
    if (!email) {
      throw "Email cannot be blank";
    }
    if (!validator.isEmail(email)) {
      throw "Email format is invalid";
    }
    if (email.length > 100) {
      throw "Email cannot exceed 100 characters";
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw "User not found";
    }

    if (user.isActive) {
      throw "Account already activated";
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const createdAt = new Date();
    const expiredAt = new Date(createdAt.getTime() + 10 * 60 * 1000); // 10 minutes from now
    await VerifyOtp.create({ otp, createdAt, expiredAt, email });

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
    if (!email) {
      throw "Email cannot be blank";
    }
    if (!validator.isEmail(email)) {
      throw "Email format is invalid";
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw "User not found";
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
    if (!password) {
      throw "Password cannot be blank";
    }
    if (password.length < 6) {
      throw "Password must be at least 6 characters";
    }
    if (password.length > 250) {
      throw "Password cannot exceed 250 characters";
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw "User not found";
    }

    const storedToken = await redisClient.get(`reset:${user.email}`);
    if (!storedToken) {
      throw "Token mismatch";
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashedPassword });
    await redisClient.del(`reset:${user.email}`);
  },

  async changePassword(oldPassword, newPassword, userId) {
    if (!oldPassword) {
      throw "Old password cannot be blank";
    }
    if (!newPassword) {
      throw "New password cannot be blank";
    }
    if (oldPassword.length < 6) {
      throw "Old password must be at least 6 characters";
    }
    if (oldPassword.length > 250) {
      throw "Old password cannot exceed 250 characters";
    }
    if (newPassword.length < 6) {
      throw "New password must be at least 6 characters";
    }
    if (newPassword.length > 250) {
      throw "New password cannot exceed 250 characters";
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      throw "User not found";
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw "Incorrect old password";
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedNewPassword });
  },
};

module.exports = userService;
