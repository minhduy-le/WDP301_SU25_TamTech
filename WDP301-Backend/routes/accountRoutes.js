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
 *               - role
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
 *         description: User created successfully with isActive set to true
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
 *                     isActive:
 *                       type: boolean
 *                       description: Set to true by default
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *                     isBan:
 *                       type: boolean
 *                     member_point:
 *                       type: integer
 *                     member_rank:
 *                       type: integer
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input
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
      isActive: true, // Ensure isActive is set to true
    };

    const newUser = await accountService.createUser(userData);
    res.status(201).json({
      status: 201,
      message: "User created successfully",
      data: newUser,
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
 * /api/accounts:
 *   get:
 *     summary: Get all user accounts with role User, Shipper, or Staff
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with role User, Shipper, or Staff
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
 *                       isActive:
 *                         type: boolean
 *                       date_of_birth:
 *                         type: string
 *                         format: date
 *                       note:
 *                         type: string
 *                       isBan:
 *                         type: boolean
 *                       member_point:
 *                         type: integer
 *                       member_rank:
 *                         type: integer
 *                       role:
 *                         type: string
 *                         enum: [User, Shipper, Staff]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const users = await accountService.getAllUsers();
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
 *                     isActive:
 *                       type: boolean
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *                     isBan:
 *                       type: boolean
 *                     member_point:
 *                       type: integer
 *                     member_rank:
 *                       type: integer
 *                     role:
 *                       type: string
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
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal server error",
    });
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
 *               isActive:
 *                 type: boolean
 *                 description: Whether the user is active
 *               isBan:
 *                 type: boolean
 *                 description: Whether the user is banned
 *               member_point:
 *                 type: integer
 *                 description: Member points of the user
 *               member_rank:
 *                 type: integer
 *                 description: Member rank of the user
 *               role:
 *                 type: string
 *                 enum: [Admin, User, Staff, Shipper]
 *                 description: Role of the user
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
 *                     isActive:
 *                       type: boolean
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                     note:
 *                       type: string
 *                     isBan:
 *                       type: boolean
 *                     member_point:
 *                       type: integer
 *                     member_rank:
 *                       type: integer
 *                     role:
 *                       type: string
 *       400:
 *         description: Invalid input
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
      isActive: req.body.isActive,
      isBan: req.body.isBan,
      member_point: req.body.member_point,
      member_rank: req.body.member_rank,
      role: req.body.role,
    };
    const updatedUser = await accountService.updateUser(userId, userData);
    res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: updatedUser,
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
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message || "Internal server error",
    });
  }
});

module.exports = router;
