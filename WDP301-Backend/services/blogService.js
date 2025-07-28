const { Sequelize } = require("sequelize");
const Blog = require("../models/blog");
const User = require("../models/user");
const { uploadImageToFirebase } = require("../config/firebase");
const axios = require("axios");
const Op = Sequelize.Op;

const getAllBlogs = async () => {
  return await Blog.findAll({
    include: [{ model: User, as: "Author", attributes: ["id", "fullName", "email"] }],
    order: [["createdAt", "DESC"]],
  });
};

const getActiveBlogs = async () => {
  return await Blog.findAll({
    where: { isActive: true },
    include: [{ model: User, as: "Author", attributes: ["id", "fullName", "email"] }],
    order: [["createdAt", "DESC"]],
  });
};

const getBlogById = async (blogId) => {
  const blog = await Blog.findByPk(blogId, {
    include: [{ model: User, as: "Author", attributes: ["id", "fullName", "email"] }],
  });

  if (!blog) {
    throw new Error("Blog not found");
  }

  return blog;
};

const createBlog = async (blogData, userId) => {
  const { title, content, image } = blogData;

  if (!title || title.length > 255) {
    throw new Error("Title is required and must be under 255 characters");
  }
  if (!content) {
    throw new Error("Content is required");
  }

  const blog = await Blog.create({
    title,
    content,
    authorId: userId,
    image,
    isActive: true,
  });

  return await getBlogById(blog.id);
};

const updateBlog = async (blogId, updateData, userId) => {
  const blog = await Blog.findByPk(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  const { title, content, image, isActive } = updateData;

  if (title && title.length > 255) {
    throw new Error("Title must be under 255 characters");
  }

  await blog.update({
    title: title || blog.title,
    content: content || blog.content,
    image: image !== undefined ? image : blog.image,
    isActive: isActive !== undefined ? isActive : blog.isActive,
  });

  return await getBlogById(blogId);
};

const deleteBlog = async (blogId, userId) => {
  const blog = await Blog.findByPk(blogId);
  if (!blog) {
    throw new Error("Blog not found");
  }

  await blog.update({ isActive: false });
  return { message: "Blog deactivated successfully" };
};

module.exports = {
  getAllBlogs,
  getActiveBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
