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
const Promotion = require("../models/promotion");
const { uploadFileToFirebase } = require("../config/firebase");
const { createCanvas } = require("canvas");
const JsBarcode = require("jsbarcode");

// Current date for date_of_birth validation
const currentDate = new Date("2025-05-26T10:53:00+07:00");

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
  async registerUser({ fullName, email, phone_number, password, date_of_birth }) {
    // Validate fullName
    if (!fullName) {
      throw "Full name cannot be blank";
    }
    if (fullName.trim() === "") {
      throw "Full name cannot be blank";
    }
    if (fullName.length < 2) {
      throw "Full name must be at least 2 characters";
    }
    if (fullName.length > 20) {
      throw "Full name cannot exceed 20 characters";
    }

    // Validate email
    if (!email) {
      throw "Email cannot be blank";
    }
    if (email.length > 100) {
      throw "Email cannot exceed 100 characters";
    }
    if (!validator.isEmail(email)) {
      throw "Email format is invalid";
    }

    // Validate phone_number
    if (!phone_number) {
      throw "Phone number cannot be blank";
    }
    if (phone_number.length > 12) {
      throw "Phone number cannot exceed 12 characters";
    }
    const phoneStr = phone_number.toString().replace(/\D/g, "");
    if (isNaN(phoneStr) || phoneStr.length < 10 || phoneStr.length > 11) {
      throw "Phone number must be 10 or 11 digits";
    }

    // Validate password
    if (!password) {
      throw "Password cannot be blank";
    }
    if (password.length < 6) {
      throw "Password must be at least 6 characters";
    }
    if (password.length > 250) {
      throw "Password cannot exceed 250 characters";
    }

    // Validate date_of_birth if provided
    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      if (isNaN(dob)) {
        throw "Date of birth format is invalid";
      }
      if (dob > currentDate) {
        throw "Date of birth must not be in the future";
      }
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { phone_number }] },
    });
    if (existingUser) {
      if (existingUser.email === email) {
        throw "Email already exists";
      }
      if (existingUser.phone_number === phone_number) {
        throw "Phone number already exists";
      }
    }

    const transaction = await User.sequelize.transaction();

    let user;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed password:", hashedPassword);
      user = await User.create(
        { fullName, email, phone_number, password: hashedPassword, isActive: false, date_of_birth },
        { transaction }
      );
      console.log("User created with ID:", user.id);
      await Information.create({ userId: user.id, address: null }, { transaction });
      console.log("Information record created for user ID:", user.id);

      // Generate barcode for WELCOME promotion
      const promotionCode = `WELCOME_${user.id}`;
      let barcodeUrl = null;
      try {
        console.log(`Generating barcode for code: ${promotionCode}`);
        const canvas = createCanvas(300, 100);
        JsBarcode(canvas, promotionCode, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
        });
        const buffer = canvas.toBuffer("image/png");
        console.log(`Generated buffer: type=image/png, length=${buffer.length}, isBuffer=${Buffer.isBuffer(buffer)}`);
        const fileName = `barcodes/${promotionCode}_${Date.now()}.png`;
        barcodeUrl = await uploadFileToFirebase(buffer, fileName, "image/png");
        console.log(`Barcode uploaded: ${barcodeUrl}`);
      } catch (barcodeError) {
        console.error("Error generating or uploading barcode:", barcodeError.message, barcodeError.stack);
      }

      // Create a "WELCOME" promotion for the new user
      await Promotion.create(
        {
          promotionTypeId: 7,
          name: "WELCOME",
          code: promotionCode,
          description: "Welcome promotion for new users",
          barcode: barcodeUrl,
          startDate: new Date("2025-06-22"),
          endDate: new Date("2026-12-31"),
          minOrderAmount: 0,
          discountAmount: 15000,
          maxNumberOfUses: 1,
          createBy: 1,
          forUser: user.id,
          isUsedBySpecificUser: false,
          NumberCurrentUses: 0,
          isActive: true,
        },
        { transaction }
      );
      console.log(`WELCOME promotion created for user ID: ${user.id}`);

      await transaction.commit();
      console.log("Transaction committed successfully");
    } catch (error) {
      console.error("Transaction error in registerUser:", error.message, error.stack);
      if (error.name === "SequelizeValidationError") {
        console.error(
          "Validation errors:",
          error.errors.map((e) => e.message)
        );
      }
      await transaction.rollback();
      console.log("Transaction rolled back successfully");
      throw "Server error";
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
      console.error("Error in OTP or email sending:", error.message, error.stack);
      console.log("Proceeding despite OTP/email failure; user can resend OTP later");
    }

    return {
      status: 201,
      message: "Registration successful, please check your email for OTP",
    };
  },

  async verifyOtp(email, otp) {
    if (!email) {
      throw "Email cannot be blank";
    }
    if (!otp) {
      throw "OTP cannot be blank";
    }
    if (!validator.isEmail(email)) {
      throw "Email format is invalid";
    }
    if (otp.length !== 6) {
      throw "OTP must be 6 digits";
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw "User not found";
    }

    const storedOtp = await redisClient.get(`otp:${email}`);
    if (storedOtp !== otp) {
      throw "Invalid or expired OTP";
    }

    await user.update({ isActive: true });
    await redisClient.del(`otp:${email}`);
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
