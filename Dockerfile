# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the app code
COPY . .

# Build the app
RUN npm run build

# Start the app
CMD ["node", "dist/main"]
