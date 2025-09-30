FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage with Nginx
FROM nginx:stable-alpine

# Remove default nginx configuration
RUN rm /etc/nginx/nginx.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nginx_group && \
    adduser -S nginx_user -u 1001 -G nginx_group

# Set proper permissions
RUN chown -R nginx_user:nginx_group /usr/share/nginx/html && \
    chown -R nginx_user:nginx_group /var/cache/nginx && \
    chown -R nginx_user:nginx_group /var/log/nginx && \
    chown -R nginx_user:nginx_group /etc/nginx/conf.d

# Make sure nginx can write to required directories
RUN touch /var/run/nginx.pid && \
    chown -R nginx_user:nginx_group /var/run/nginx.pid

# Switch to non-root user
USER nginx_user

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]