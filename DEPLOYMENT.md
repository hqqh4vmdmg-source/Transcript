# Deployment Guide

## AWS Deployment

This guide covers deploying the Transcript Generator application to AWS.

### Prerequisites

- AWS Account
- AWS CLI configured
- Domain name (optional, for custom domain)

### Components

1. **Front-End**: S3 + CloudFront
2. **Back-End**: EC2
3. **Database**: RDS (PostgreSQL)

### Step 1: Database Setup (RDS)

1. **Create RDS PostgreSQL Instance**
   ```bash
   aws rds create-db-instance \
     --db-instance-identifier transcript-db \
     --db-instance-class db.t3.micro \
     --engine postgres \
     --master-username admin \
     --master-user-password your-password \
     --allocated-storage 20
   ```

2. **Configure Security Group**
   - Allow inbound PostgreSQL traffic (port 5432) from EC2 security group

3. **Run Database Schema**
   ```bash
   psql -h your-rds-endpoint -U admin -d postgres -f database/schema.sql
   ```

### Step 2: Back-End Setup (EC2)

1. **Launch EC2 Instance**
   - AMI: Amazon Linux 2
   - Instance Type: t2.micro (or larger)
   - Configure security group to allow HTTP (80), HTTPS (443), and SSH (22)

2. **Connect and Install Dependencies**
   ```bash
   # SSH into instance
   ssh -i your-key.pem ec2-user@your-instance-ip

   # Update system
   sudo yum update -y

   # Install Node.js
   curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs

   # Install Git
   sudo yum install -y git

   # Install PM2
   sudo npm install -g pm2
   ```

3. **Clone and Configure Application**
   ```bash
   # Clone repository
   git clone https://github.com/playpalqc/Transcript-Generator.git
   cd Transcript-Generator/server

   # Install dependencies
   npm install

   # Create .env file
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   PORT=5000
   NODE_ENV=production
   DB_HOST=your-rds-endpoint
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=admin
   DB_PASSWORD=your-password
   JWT_SECRET=your-production-secret
   JWT_EXPIRES_IN=1h
   CLIENT_URL=https://your-domain.com
   ```

5. **Start Application with PM2**
   ```bash
   pm2 start server.js --name transcript-api
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx as Reverse Proxy**
   ```bash
   sudo yum install -y nginx
   
   # Configure nginx
   sudo nano /etc/nginx/conf.d/transcript.conf
   ```

   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   ```

### Step 3: Front-End Setup (S3 + CloudFront)

1. **Build React Application**
   ```bash
   cd client
   npm run build
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://transcript-generator-frontend
   ```

3. **Configure Bucket for Static Website Hosting**
   ```bash
   aws s3 website s3://transcript-generator-frontend \
     --index-document index.html \
     --error-document index.html
   ```

4. **Upload Build Files**
   ```bash
   aws s3 sync build/ s3://transcript-generator-frontend
   ```

5. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::transcript-generator-frontend/*"
       }
     ]
   }
   ```

6. **Create CloudFront Distribution**
   - Origin: S3 bucket
   - Enable HTTPS
   - Configure custom domain (optional)
   - Set default root object: index.html

### Step 4: SSL Certificate (Certificate Manager)

1. **Request Certificate**
   ```bash
   aws acm request-certificate \
     --domain-name your-domain.com \
     --subject-alternative-names www.your-domain.com \
     --validation-method DNS
   ```

2. **Validate Certificate**
   - Add DNS records as provided by ACM
   - Wait for validation

3. **Attach to CloudFront and Load Balancer**

### Step 5: Monitoring and Logging

1. **CloudWatch Setup**
   - Configure CloudWatch for EC2 instance monitoring
   - Set up alarms for CPU, memory, disk usage
   - Configure log groups for application logs

2. **Application Logs**
   ```bash
   # View PM2 logs
   pm2 logs transcript-api
   
   # View nginx logs
   sudo tail -f /var/log/nginx/access.log
   sudo tail -f /var/log/nginx/error.log
   ```

### Step 6: Backup and Recovery

1. **Database Backups**
   - Configure automated RDS snapshots
   - Set backup retention period

2. **Application Backups**
   - Use AMI snapshots for EC2 instance
   - Store backups in S3

### Maintenance

1. **Updating Application**
   ```bash
   cd Transcript-Generator
   git pull origin main
   cd server
   npm install
   pm2 restart transcript-api
   ```

2. **Monitoring**
   - Check CloudWatch metrics regularly
   - Review application logs
   - Monitor database performance

### Security Checklist

- ✓ Enable AWS WAF for CloudFront
- ✓ Configure security groups properly
- ✓ Enable HTTPS only
- ✓ Rotate database credentials regularly
- ✓ Enable RDS encryption
- ✓ Configure S3 bucket encryption
- ✓ Set up AWS Secrets Manager for sensitive data
- ✓ Enable CloudTrail for audit logging
- ✓ Configure DDoS protection

### Estimated Costs

- EC2 t2.micro: ~$8-10/month
- RDS db.t3.micro: ~$15-20/month
- S3 + CloudFront: ~$1-5/month (depending on traffic)
- Total: ~$25-35/month

### Troubleshooting

**Issue**: Application won't start
- Check PM2 logs: `pm2 logs`
- Verify environment variables
- Check database connectivity

**Issue**: Database connection failed
- Verify security group rules
- Check RDS endpoint
- Verify credentials

**Issue**: CloudFront not serving latest version
- Invalidate CloudFront cache
- Check S3 bucket permissions

## Alternative: Docker Deployment

For containerized deployment, see `DOCKER.md`.

## Alternative: Heroku Deployment

For quick deployment to Heroku, see `HEROKU.md`.
