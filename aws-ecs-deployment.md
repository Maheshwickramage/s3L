# AWS ECS Deployment Guide

## Prerequisites
1. AWS CLI configured
2. Docker installed locally
3. AWS RDS MySQL instance created
4. ECR repository created

## Step 1: Create RDS MySQL Instance

1. Go to AWS RDS Console
2. Create a new MySQL database instance
3. Choose appropriate instance class (e.g., db.t3.micro for testing)
4. Set up security groups to allow connections from ECS
5. Note down the endpoint URL

## Step 2: Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository --repository-name s3learn-backend

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
```

## Step 3: Build and Push Docker Image

```bash
# Build the image
docker build -t s3learn-backend ./backend

# Tag the image
docker tag s3learn-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/s3learn-backend:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/s3learn-backend:latest
```

## Step 4: Create ECS Task Definition

Create a file `task-definition.json`:

```json
{
  "family": "s3learn-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "s3learn-backend",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/s3learn-backend:latest",
      "portMappings": [
        {
          "containerPort": 5050,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "5050"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:s3learn/db-host"
        },
        {
          "name": "DB_USER",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:s3learn/db-user"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:s3learn/db-password"
        },
        {
          "name": "DB_NAME",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:s3learn/db-name"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:s3learn/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/s3learn-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Step 5: Create ECS Cluster and Service

```bash
# Create ECS cluster
aws ecs create-cluster --cluster-name s3learn-cluster

# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create service
aws ecs create-service \
  --cluster s3learn-cluster \
  --service-name s3learn-backend-service \
  --task-definition s3learn-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345],assignPublicIp=ENABLED}"
```

## Step 6: Set up Secrets Manager

```bash
# Create secrets
aws secretsmanager create-secret --name s3learn/db-host --secret-string "your-rds-endpoint"
aws secretsmanager create-secret --name s3learn/db-user --secret-string "your-username"
aws secretsmanager create-secret --name s3learn/db-password --secret-string "your-password"
aws secretsmanager create-secret --name s3learn/db-name --secret-string "s3learn"
aws secretsmanager create-secret --name s3learn/jwt-secret --secret-string "your-jwt-secret"
```

## Step 7: Initialize Database

After the service is running, you can initialize the database by running:

```bash
# Get the task ARN
TASK_ARN=$(aws ecs list-tasks --cluster s3learn-cluster --service-name s3learn-backend-service --query 'taskArns[0]' --output text)

# Execute init-db.js
aws ecs execute-command \
  --cluster s3learn-cluster \
  --task $TASK_ARN \
  --container s3learn-backend \
  --interactive \
  --command "node init-db.js"
```

## Environment Variables for Local Testing

Create a `.env` file in the backend directory:

```env
DB_HOST=your-aws-mysql-endpoint.amazonaws.com
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=s3learn
DB_PORT=3306
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5050
NODE_ENV=production
```

## Troubleshooting

1. **Connection Timeout**: Check security groups and VPC configuration
2. **Database Connection**: Verify RDS endpoint and credentials
3. **Task Health**: Check CloudWatch logs for errors
4. **Network**: Ensure ECS tasks can reach RDS instance
