const { GoogleGenerativeAI } = require("@google/generative-ai");
const ChatMessageAI = require("../models/ChatMessageAI");
const Product = require("../models/product");
const Material = require("../models/material");
const ProductRecipe = require("../models/ProductRecipe");
const User = require("../models/user");

const genAI = new GoogleGenerativeAI("AIzaSyAEFmFzAX6E6QzhwcAtm2qSjRkzhhqA7-c");

async function createChatMessageAI({ message, senderId }) {
  try {
    // Fetch product-related data for context
    const products = await Product.findAll({
      include: [
        {
          model: ProductRecipe,
          as: "ProductRecipes",
          include: [
            {
              model: Material,
              as: "Material",
            },
          ],
        },
      ],
    });

    // Construct system prompt to focus on product-related information
    const systemPrompt = `
You are an AI assistant for an e-commerce platform. Answer questions based solely on the provided product data. Do not provide information outside of the product, material, or recipe context. If the question is unrelated to products, respond with: "I can only assist with product-related questions. Please ask about products, materials, or recipes."

Product Data:
${JSON.stringify(
  products.map((p) => ({
    id: p.productId,
    name: p.name,
    description: p.description,
    price: p.price,
    materials: p.ProductRecipes.map((pr) => ({
      materialId: pr.Material.materialId,
      materialName: pr.Material.name,
      quantity: pr.quantity,
    })),
  })),
  null,
  2
)}

User Question: ${message}

Please provide a helpful response based on the product information above.`;

    console.log("System Prompt Length:", systemPrompt.length);
    console.log("User Message:", message, "Length:", message.length);

    // Call Gemini API with the correct format
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Use the correct format - just pass the combined prompt as text
    const result = await model.generateContent(systemPrompt);

    console.log("Gemini API Response:", result);

    const responseFromAI = result.response.text();

    // Save the message and AI response to the database
    const chatMessage = await ChatMessageAI.create({
      message,
      senderId,
      responseFromAI,
    });

    return chatMessage;
  } catch (error) {
    console.error("Error in createChatMessageAI:", error);
    throw error;
  }
}

async function getChatMessagesByUser(userId) {
  return ChatMessageAI.findAll({
    where: { senderId: userId },
    order: [["createdAt", "ASC"]],
    include: [{ model: User, as: "Sender" }],
  });
}

module.exports = {
  createChatMessageAI,
  getChatMessagesByUser,
};
