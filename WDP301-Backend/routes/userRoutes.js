const express = require("express");
const router = express.Router();
const userService = require("../services/userService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone_number
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *               phone_number:
 *                 type: string
 *                 maxLength: 12
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 250
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Optional, must not be in the future
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: Registration successful, please check your email for OTP
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 fullNameBlank: { value: "Full name cannot be blank" }
 *                 fullNameMinLength: { value: "Full name must be at least 2 characters" }
 *                 fullNameMaxLength: { value: "Full name cannot exceed 20 characters" }
 *                 emailBlank: { value: "Email cannot be blank" }
 *                 emailMaxLength: { value: "Email cannot exceed 100 characters" }
 *                 emailFormat: { value: "Email format is invalid" }
 *                 phoneBlank: { value: "Phone number cannot be blank" }
 *                 phoneMaxLength: { value: "Phone number cannot exceed 12 characters" }
 *                 phoneDigits: { value: "Phone number must be 10 or 11 digits" }
 *                 passwordBlank: { value: "Password cannot be blank" }
 *                 passwordMinLength: { value: "Password must be at least 6 characters" }
 *                 passwordMaxLength: { value: "Password cannot exceed 250 characters" }
 *                 dobFormat: { value: "Date of birth format is invalid" }
 *                 dobFuture: { value: "Date of birth must not be in the future" }
 *       409:
 *         description: Email or phone number already exists
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               examples:
 *                 email: { value: "Email already exists" }
 *                 phone: { value: "Phone number already exists" }
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { fullName, email, phone_number, password, date_of_birth } = req.body;
    const result = await userService.registerUser({ fullName, email, phone_number, password, date_of_birth });
    res.status(result.status).json({ status: result.status, message: result.message });
  } catch (error) {
    console.error("Error in /register route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "Email already exists" || error === "Phone number already exists") {
        res.status(409).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and activate user account
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Invalid input or OTP
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid or expired OTP
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    await userService.verifyOtp(email, otp);
    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    console.error("Error in /verify-otp route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 250
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid input
 *       401:
 *         description: Invalid credentials or account not activated
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid credentials
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Server error
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /login route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else if (error === "Invalid credentials" || error === "Account not activated") {
        res.status(401).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to user email
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *       400:
 *         description: Invalid input or account already activated
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Account already activated
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Server error
 */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    await userService.resendOtp(email);
    res.status(200).json({ message: "OTP resent successfully, please check your email" });
  } catch (error) {
    console.error("Error in /resend-otp route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 maxLength: 100
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid input
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.status(200).json({ message: "Password reset email sent, please check your email" });
  } catch (error) {
    console.error("Error in /forgot-password route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 250
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid input or token mismatch
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Token mismatch
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Server error
 */
router.post("/reset-password", verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    await userService.resetPassword(password, req.userId);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in /reset-password route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 250
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 250
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input or incorrect old password
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Incorrect old password
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: User not found
 *       500:
 *         description: Server error
 */
router.post("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(oldPassword, newPassword, req.userId);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in /change-password route:", error, error.stack);
    if (typeof error === "string") {
      if (error === "User not found") {
        res.status(404).send(error);
      } else if (error === "Incorrect old password") {
        res.status(400).send(error);
      } else {
        res.status(400).send(error);
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     summary: Log in or register a user using Google OAuth
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Google ID token
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 fullName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *                 role:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid Google token or email
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid Google token
 *       401:
 *         description: Account is banned
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Account is banned
 *       500:
 *         description: Server error
 */
router.post("/google-login", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const result = await userService.googleLogin(idToken);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in /google-login route:", error.message, error.stack);
    if (typeof error === "string") {
      if (error === "Account is banned") {
        res.status(401).send(error);
      } else {
        res.status(400).send(error);
      }
    } else if (error.message && typeof error.message === "string") {
      if (error.message.includes("Network error") || error.message.includes("Firebase API key")) {
        res.status(503).send(error.message);
      } else {
        res.status(500).send("Failed to process Google login");
      }
    } else {
      res.status(500).send("Server error");
    }
  }
});

module.exports = router;
