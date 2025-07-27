/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: User account management endpoints
 */
const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const accountService = require("../services/accountService");

/**
 * @swagger
 * /api/accounts:
 *   post:
 *     summary: Create a new user account
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *               password:
 *                 type: string
 *                 description: Password for the user account (will be hashed)
 *               phone_number:
 *                 type: string
 *                 description: Phone number of the user
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth of the user
 *               note:
 *                 type: string
 *                 description: Additional notes about the user
 *               role:
 *                 type: string
 *                 enum: [Admin, User, Staff, Shipper]
 *                 description: Role of the user
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Full name cannot be blank
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const userData = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      phone_number: req.body.phone_number,
      date_of_birth: req.body.date_of_birth,
      note: req.body.note,
      role: req.body.role,
    };

    const newUser = await accountService.createUser(userData);
    res.status(201).json({
      status: 201,
      message: "User created successfully",
      data: newUser,
    });
  } catch (error) {
    if (typeof error === "string") {
      res.status(400).send(error);
    } else {
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal server error",
      });
    }
  }
});

/**
 * @swagger
 * /api/accounts:
 *   get:
 *     summary: Get all user accounts (excluding the logged-in user)
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users excluding the logged-in user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fullName:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone_number:
 *                         type: string
 *                       date_of_birth:
 *                         type: string
 *                         format: date
 *                       note:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [Admin, User, Staff, Shipper, Manager]
 *                         description: Role of the user
 *                       isActive:
 *                         type: boolean
 *                         description: Indicates whether the user account is active
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const users = await accountService.getAllUsers(req.userId);
    res.status(200).json({
      status: 200,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

/**
 * @swagger
 * /api/accounts/phone/{phoneNumber}:
 *   get:
 *     summary: Get a user by phone number
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: phoneNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Phone number of the user
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [Admin, User, Staff, Shipper, Manager]
 *                       description: Role of the user
 *                     isActive:
 *                       type: boolean
 *                       description: Indicates whether the user account is active
 *       400:
 *         description: Invalid phone number
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid phone number format
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/phone/:phoneNumber", verifyToken, async (req, res, next) => {
  try {
    const phoneNumber = req.params.phoneNumber;
    const user = await accountService.getUserByPhoneNumber(phoneNumber);
    res.status(200).json({
      status: 200,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error(`[ERROR] GET /api/accounts/phone/:phoneNumber: ${error.message || error}`);
    if (typeof error === "string") {
      res.status(400).send(error);
    } else {
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal server error",
      });
    }
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [Admin, User, Staff, Shipper, Manager]
 *                       description: Role of the user
 *                     isActive:
 *                       type: boolean
 *                       description: Indicates whether the user account is active
 *       400:
 *         description: Invalid user ID
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await accountService.getUserById(userId);
    res.status(200).json({
      status: 200,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    if (typeof error === "string") {
      res.status(400).send(error);
    } else {
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal server error",
      });
    }
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 description: Full name of the user
 *               email:
 *                 type: string
 *                 description: Email address of the user
 *               password:
 *                 type: string
 *                 description: Password for the user account (will be hashed)
 *               phone_number:
 *                 type: string
 *                 description: Phone number of the user
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth of the user
 *               note:
 *                 type: string
 *                 description: Additional notes about the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone_number:
 *                       type: string
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *       400:
 *         description: Invalid input
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid email format
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const userData = {
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
      phone_number: req.body.phone_number,
      date_of_birth: req.body.date_of_birth,
      note: req.body.note,
    };
    const updatedUser = await accountService.updateUser(userId, userData);
    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    if (typeof error === "string") {
      res.status(400).send(error);
    } else {
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal server error",
      });
    }
  }
});

/**
 * @swagger
 * /api/accounts/{id}:
 *   delete:
 *     summary: Deactivate a user by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid user ID
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Invalid user ID
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    await accountService.deactivateUser(userId);
    res.status(200).json({
      status: 200,
      message: "User deactivated successfully",
    });
  } catch (error) {
    if (typeof error === "string") {
      res.status(400).send(error);
    } else {
      res.status(error.status || 500).json({
        status: error.status || 500,
        message: error.message || "Internal server error",
      });
    }
  }
});

module.exports = router;
