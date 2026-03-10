FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for Vite)
RUN npm install

# Copy application code
COPY . .

# Expose the dev server port
EXPOSE 5174

# Start Vite dev server, bind to 0.0.0.0 so it's accessible outside the container
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5174"]
