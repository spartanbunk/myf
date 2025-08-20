FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY client/package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy application files
COPY client/ .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD ["npm", "run", "dev"]