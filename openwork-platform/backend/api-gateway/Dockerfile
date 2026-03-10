FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose the API port
EXPOSE 8000

# Start the server
CMD ["node", "server.js"]
