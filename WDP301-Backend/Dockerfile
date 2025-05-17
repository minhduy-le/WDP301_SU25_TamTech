# Use the official Node.js 18 image as the base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if exists)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code, including templates and images
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to start the app
CMD ["npm", "start"]