// const express = require("express");
// const router = express.Router();
// const userService = require("../services/userService");

// /**
//  * @swagger
//  * /api/auth/register:
//  *   post:
//  *     summary: Register a new user
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - fullName
//  *               - email
//  *               - phone_number
//  *               - password
//  *             properties:
//  *               fullName:
//  *                 type: string
//  *                 maxLength: 20
//  *               email:
//  *                 type: string
//  *                 format: email
//  *                 maxLength: 100
//  *               phone_number:
//  *                 type: string
//  *                 maxLength: 12
//  *               password:
//  *                 type: string
//  *                 minLength: 6
//  *                 maxLength: 250
//  *     responses:
//  *       201:
//  *         description: Registration successful, OTP sent to email
//  *       400:
//  *         description: Invalid input
//  *       409:
//  *         description: Email or phone number already exists
//  *       500:
//  *         description: Server error
//  */
// router.post("/register", async (req, res) => {
//   try {
//     const { fullName, email, phone_number, password } = req.body;
//     await userService.registerUser({ fullName, email, phone_number, password });
//     res.status(201).json({ message: "Registration successful, please check your email for OTP" });
//   } catch (error) {
//     if (error.message === "Invalid input") {
//       return res.status(400).json({ message: error.message });
//     }
//     if (error.message === "Email or phone number already exists") {
//       return res.status(409).json({ message: error.message });
//     }
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @swagger
//  * /api/auth/verify-otp:
//  *   post:
//  *     summary: Verify OTP and activate user account
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - otp
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 format: email
//  *               otp:
//  *                 type: string
//  *                 minLength: 6
//  *                 maxLength: 6
//  *     responses:
//  *       200:
//  *         description: Account verified successfully
//  *       400:
//  *         description: Invalid input or OTP
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Server error
//  */
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     await userService.verifyOtp(email, otp);
//     res.status(200).json({ message: "Account verified successfully" });
//   } catch (error) {
//     if (error.message === "Invalid input" || error.message === "Invalid or expired OTP") {
//       return res.status(400).json({ message: error.message });
//     }
//     if (error.message === "User not found") {
//       return res.status(404).json({ message: error.message });
//     }
//     res.status(500).json({ message: "Server error" });
//   }
// });

// /**
//  * @swagger
//  * /api/auth/login:
//  *   post:
//  *     summary: Log in a user
//  *     tags: [Users]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - email
//  *               - password
//  *             properties:
//  *               email:
//  *                 type: string
//  *                 format: email
//  *               password:
//  *                 type: string
//  *                 minLength: 6
//  *                 maxLength: 250
//  *     responses:
//  *       200:
//  *         description: Login successful
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 fullName:
//  *                   type: string
//  *                 email:
//  *                   type: string
//  *                 phone_number:
//  *                   type: string
//  *                 role:
//  *                   type: string
//  *                 token:
//  *                   type: string
//  *       400:
//  *         description: Invalid input
//  *       401:
//  *         description: Invalid credentials or account not activated
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Server error
//  */
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const result = await userService.loginUser(email, password);
//     res.status(200).json(result);
//   } catch (error) {
//     if (error.message === "Invalid input") {
//       return res.status(400).json({ message: error.message });
//     }
//     if (error.message === "User not found") {
//       return res.status(404).json({ message: error.message });
//     }
//     if (error.message === "Invalid credentials" || error.message === "Account not activated") {
//       return res.status(401).json({ message: error.message });
//     }
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const userService = require("../services/userService");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and activate user account
 *     tags: [Authentication]
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
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
 *         description: Invalid credentials, account not activated, or account banned
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
    if (
      error.message === "Invalid credentials" ||
      error.message === "Account not activated" ||
      error.message === "Account is banned"
    ) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
