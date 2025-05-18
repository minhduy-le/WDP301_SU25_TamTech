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
 *     responses:
 *       201:
 *         description: Registration successful, OTP sent to email
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email or phone number already exists
 *       500:
 *         description: Server error
 */
router.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone_number, password } = req.body;
    await userService.registerUser({ fullName, email, phone_number, password });
    res.status(201).json({ message: "Registration successful, please check your email for OTP" });
  } catch (error) {
    if (error.message === "Invalid input") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Email or phone number already exists") {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    await userService.verifyOtp(email, otp);
    res.status(200).json({ message: "Account verified successfully" });
  } catch (error) {
    if (error.message === "Invalid input" || error.message === "Invalid or expired OTP") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
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
 *       401:
 *         description: Invalid credentials or account not activated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Invalid input") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Invalid credentials" || error.message === "Account not activated") {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    await userService.resendOtp(email);
    res.status(200).json({ message: "OTP resent successfully, please check your email" });
  } catch (error) {
    if (error.message === "Invalid input" || error.message === "Account already activated") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    await userService.forgotPassword(email);
    res.status(200).json({ message: "Password reset email sent, please check your email" });
  } catch (error) {
    if (error.message === "Invalid input") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
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
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/reset-password", verifyToken, async (req, res) => {
  try {
    const { password } = req.body;
    await userService.resetPassword(password, req.userId);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    if (error.message === "Invalid input" || error.message === "Token mismatch") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
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
 *       401:
 *         description: Account is banned
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
    if (error.message === "Invalid Google token" || error.message === "Invalid email from Google token") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Account is banned") {
      return res.status(401).json({ message: error.message });
    }
    if (error.message.includes("Network error") || error.message.includes("Firebase API key")) {
      return res.status(503).json({ message: error.message });
    }
    console.error("Error in /google-login route:", error.message, error.stack);
    res.status(500).json({ message: "Failed to process Google login: " + error.message });
  }
});

module.exports = router;
