# MySQL Configuration Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=your-aws-mysql-endpoint.amazonaws.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=s3learn
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5050
NODE_ENV=production
```

## AWS RDS MySQL Setup

1. **Create RDS Instance:**
   - Go to AWS RDS Console
   - Create a new MySQL database instance
   - Choose appropriate instance class and storage
   - Set up security groups to allow connections from your application

2. **Database Configuration:**
   - Database name: `s3learn`
   - Username: (your choice)
   - Password: (strong password)
   - Port: 3306 (default MySQL port)

3. **Security Group:**
   - Allow inbound connections on port 3306
   - Source: Your application's IP or security group

4. **Connection Details:**
   - Note down the endpoint URL
   - Update the `DB_HOST` in your `.env` file

## Installation Steps

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS MySQL credentials
   ```

3. Initialize the database:
   ```bash
   node init-db.js
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Database Schema

The database schema has been updated to use MySQL syntax with:
- Proper data types (INT, VARCHAR, TEXT, etc.)
- AUTO_INCREMENT for primary keys
- ENUM for role constraints
- TIMESTAMP for date/time fields
- Foreign key constraints with CASCADE options
