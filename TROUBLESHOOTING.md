# Troubleshooting Guide

## Database Connection Issues

### 1. Connection Timeout Error
**Error**: `ETIMEDOUT` or `Could not connect to MySQL database`

**Solutions**:
1. **Check your .env file**:
   ```bash
   # Make sure .env file is in the backend directory
   cat backend/.env
   ```

2. **Verify AWS RDS settings**:
   - Check if RDS instance is running
   - Verify security groups allow connections on port 3306
   - Confirm the endpoint URL is correct

3. **Test connection with retry script**:
   ```bash
   cd backend
   npm run init-db-retry
   ```

### 2. Invalid Configuration Options
**Error**: `Ignoring invalid configuration option passed to Connection`

**Solution**: This is fixed in the updated database.js file. The warnings are harmless but can be ignored.

### 3. Environment Variables Not Loading
**Error**: Database connection fails with default values

**Solutions**:
1. **Check .env file location**: Must be in `backend/.env`
2. **Verify .env file format**:
   ```env
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_NAME=s3learn
   DB_PORT=3306
   JWT_SECRET=your-secret-key
   PORT=5050
   NODE_ENV=production
   ```
3. **Test environment loading**:
   ```bash
   cd backend
   node -e "require('dotenv').config(); console.log(process.env.DB_HOST)"
   ```

## AWS RDS Setup

### 1. Create RDS MySQL Instance
1. Go to AWS RDS Console
2. Click "Create database"
3. Choose "MySQL"
4. Select "Free tier" or appropriate instance class
5. Set database name: `s3learn`
6. Set master username and password
7. Configure security groups to allow port 3306

### 2. Security Group Configuration
```json
{
  "Type": "MySQL/Aurora",
  "Protocol": "TCP",
  "Port": 3306,
  "Source": "0.0.0.0/0" // For testing only - restrict in production
}
```

### 3. Get Connection Details
After creating RDS instance:
1. Go to RDS Console → Databases
2. Click on your database
3. Copy the "Endpoint" URL
4. Note the port (usually 3306)

## Local Testing

### 1. Test Database Connection
```bash
cd backend
node -e "
const { testConnection } = require('./config/database');
testConnection().then(connected => {
  console.log('Connected:', connected);
  process.exit(connected ? 0 : 1);
});
"
```

### 2. Initialize Database
```bash
cd backend
npm run init-db-retry
```

### 3. Start Application
```bash
cd backend
npm start
```

## Docker Testing

### 1. Build and Test Locally
```bash
# Build the image
docker build -t s3learn-backend ./backend

# Run with environment variables
docker run -p 5050:5050 \
  -e DB_HOST=your-rds-endpoint.amazonaws.com \
  -e DB_USER=your-username \
  -e DB_PASSWORD=your-password \
  -e DB_NAME=s3learn \
  -e DB_PORT=3306 \
  -e JWT_SECRET=your-secret \
  s3learn-backend
```

### 2. Test with Docker Compose
```bash
# Create .env file in root directory
echo "DB_HOST=your-rds-endpoint.amazonaws.com" > .env
echo "DB_USER=your-username" >> .env
echo "DB_PASSWORD=your-password" >> .env
echo "DB_NAME=s3learn" >> .env
echo "DB_PORT=3306" >> .env
echo "JWT_SECRET=your-secret" >> .env

# Run with docker-compose
docker-compose up
```

## Common Issues and Solutions

### 1. "Database not found" Error
- Check if database name is correct in .env
- Verify RDS instance is running
- Check if database exists in RDS

### 2. "Access denied" Error
- Verify username and password
- Check if user has proper permissions
- Ensure security groups allow connection

### 3. "Connection refused" Error
- Check if RDS instance is in "Available" state
- Verify security group settings
- Check if port 3306 is open

### 4. Environment Variables Not Working
- Ensure .env file is in correct location
- Check file permissions
- Verify .env file format (no spaces around =)

## Production Deployment

### 1. Use AWS Secrets Manager
Instead of .env file, use AWS Secrets Manager for production:

```bash
# Create secrets
aws secretsmanager create-secret --name s3learn/db-host --secret-string "your-rds-endpoint"
aws secretsmanager create-secret --name s3learn/db-user --secret-string "your-username"
aws secretsmanager create-secret --name s3learn/db-password --secret-string "your-password"
aws secretsmanager create-secret --name s3learn/db-name --secret-string "s3learn"
aws secretsmanager create-secret --name s3learn/jwt-secret --secret-string "your-jwt-secret"
```

### 2. ECS Task Definition
Use the task definition provided in `aws-ecs-deployment.md` with secrets from AWS Secrets Manager.

## Debugging Commands

### 1. Check Environment Variables
```bash
cd backend
node -e "require('dotenv').config(); console.log('DB_HOST:', process.env.DB_HOST); console.log('DB_USER:', process.env.DB_USER);"
```

### 2. Test MySQL Connection
```bash
# Install mysql client
brew install mysql-client  # macOS
# or
sudo apt-get install mysql-client  # Ubuntu

# Test connection
mysql -h your-rds-endpoint.amazonaws.com -u your-username -p -P 3306
```

### 3. Check Application Logs
```bash
cd backend
npm start 2>&1 | tee app.log
```

## Getting Help

If you're still having issues:

1. Check the application logs
2. Verify all environment variables
3. Test database connection independently
4. Check AWS RDS status and security groups
5. Review the AWS ECS deployment guide

Remember to replace placeholder values with your actual AWS RDS credentials!
