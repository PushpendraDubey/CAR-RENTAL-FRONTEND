# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app

# Copy from build stage
COPY --from=build /app .

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode === 200) process.exit(0); else process.exit(1);})"

# Run the application
CMD ["npm", "start"]