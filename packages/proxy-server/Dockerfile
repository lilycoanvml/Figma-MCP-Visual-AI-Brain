# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY server.js ./

# Expose port (Cloud Run will set PORT env variable)
EXPOSE 8080

# Set default PORT for Cloud Run
ENV PORT=8080

# Start the server
CMD ["node", "server.js"]
