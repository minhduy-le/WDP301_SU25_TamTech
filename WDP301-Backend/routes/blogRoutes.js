const express = require("express");
const router = express.Router();
const blogService = require("../services/blogService");
const verifyToken = require("../middlewares/verifyToken");

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of all blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       authorId:
 *                         type: integer
 *                       image:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       Author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *       500:
 *         description: Server error
 */
router.get("/", async (req, res) => {
  try {
    const blogs = await blogService.getAllBlogs();
    res.status(200).json({
      status: 200,
      message: "Blogs retrieved successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error retrieving blogs:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/blogs/active:
 *   get:
 *     summary: Get all active blogs
 *     tags: [Blogs]
 *     responses:
 *       200:
 *         description: List of active blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       content:
 *                         type: string
 *                       authorId:
 *                         type: integer
 *                       image:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       Author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           fullName:
 *                             type: string
 *                           email:
 *                             type: string
 *       500:
 *         description: Server error
 */
router.get("/active", async (req, res) => {
  try {
    const blogs = await blogService.getActiveBlogs();
    res.status(200).json({
      status: 200,
      message: "Active blogs retrieved successfully",
      blogs,
    });
  } catch (error) {
    console.error("Error retrieving active blogs:", error);
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 blog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     authorId:
 *                       type: integer
 *                     image:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     Author:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid blog ID
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId) || blogId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid blog ID",
      });
    }

    const blog = await blogService.getBlogById(blogId);
    res.status(200).json({
      status: 200,
      message: "Blog retrieved successfully",
      blog,
    });
  } catch (error) {
    console.error("Error retrieving blog:", error);
    if (error.message === "Blog not found") {
      return res.status(404).json({
        status: 404,
        message: "Blog not found",
      });
    }
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Blog Title
 *               content:
 *                 type: string
 *                 example: This is the blog content
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 blog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     authorId:
 *                       type: integer
 *                     image:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     Author:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const blog = await blogService.createBlog({ title, content, image }, req.userId);
    res.status(201).json({
      status: 201,
      message: "Blog created successfully",
      blog,
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    if (error.message.includes("required") || error.message.includes("characters")) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Update a blog by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Blog Title
 *               content:
 *                 type: string
 *                 example: Updated blog content
 *               image:
 *                 type: string
 *                 example: https://example.com/updated-image.jpg
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 blog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     content:
 *                       type: string
 *                     authorId:
 *                       type: integer
 *                     image:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     Author:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         fullName:
 *                           type: string
 *                         email:
 *                           type: string
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Unauthorized to update this blog
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId) || blogId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid blog ID",
      });
    }

    const { title, content, image, isActive } = req.body;
    const blog = await blogService.updateBlog(blogId, { title, content, image, isActive }, req.userId);
    res.status(200).json({
      status: 200,
      message: "Blog updated successfully",
      blog,
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    if (error.message === "Blog not found") {
      return res.status(404).json({
        status: 404,
        message: "Blog not found",
      });
    }
    if (error.message === "You can only update your own blogs") {
      return res.status(403).json({
        status: 403,
        message: error.message,
      });
    }
    if (error.message.includes("characters")) {
      return res.status(400).json({
        status: 400,
        message: error.message,
      });
    }
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Deactivate a blog by ID
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog deactivated successfully
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
 *         description: Invalid blog ID
 *       403:
 *         description: Unauthorized to deactivate this blog
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    if (isNaN(blogId) || blogId < 1) {
      return res.status(400).json({
        status: 400,
        message: "Invalid blog ID",
      });
    }

    const result = await blogService.deleteBlog(blogId, req.userId);
    res.status(200).json({
      status: 200,
      message: result.message,
    });
  } catch (error) {
    console.error("Error deactivating blog:", error);
    if (error.message === "Blog not found") {
      return res.status(404).json({
        status: 404,
        message: "Blog not found",
      });
    }
    if (error.message === "You can only delete your own blogs") {
      return res.status(403).json({
        status: 403,
        message: error.message,
      });
    }
    res.status(500).json({
      status: 500,
      message: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;
