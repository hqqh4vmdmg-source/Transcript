# Quick Start Guide

This guide will help you get the Transcript Generator up and running in minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **Git** - [Download](https://git-scm.com/)

## Installation

### Option 1: Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/playpalqc/Transcript-Generator.git
   cd Transcript-Generator
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

   The script will:
   - Create the PostgreSQL database
   - Install all dependencies
   - Set up environment variables
   - Configure the application

3. **Start the application**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The API server runs on `http://localhost:5000`

### Option 2: Manual Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/playpalqc/Transcript-Generator.git
   cd Transcript-Generator
   ```

2. **Set up the database**
   ```bash
   # Create database
   createdb transcript_generator
   
   # Run schema
   psql transcript_generator < database/schema.sql
   ```

3. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Server dependencies
   cd server
   npm install
   cd ..
   
   # Client dependencies
   cd client
   npm install
   cd ..
   ```

4. **Configure environment**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your configuration
   nano .env
   cd ..
   ```

5. **Start the application**
   ```bash
   # Start both client and server
   npm run dev
   
   # Or start separately:
   # Terminal 1 - Server
   cd server && npm run dev
   
   # Terminal 2 - Client
   cd client && npm start
   ```

## First Steps

### 1. Register an Account

1. Navigate to `http://localhost:3000`
2. Click "Register" in the header
3. Fill in your details:
   - Username (3-50 characters)
   - Email address
   - Password (minimum 6 characters)
4. Click "Register"

### 2. Generate Your First Transcript

1. After registration, you'll be redirected to the transcript generator
2. Use the toggle in the header to switch between High School and College mode
3. Fill in the required information:
   - School details
   - Student information
   - Course details
4. Add multiple courses using the "Add Another Course" button
5. Click "Create Transcript"

### 3. Download as PDF

1. After creating a transcript, you can download it as a PDF
2. The PDF will have a professional format matching the selected mode

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

1. Verify PostgreSQL is running:
   ```bash
   # On macOS with Homebrew
   brew services list
   
   # On Linux
   systemctl status postgresql
   ```

2. Check your database credentials in `server/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=transcript_generator
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

### Port Already in Use

If port 3000 or 5000 is already in use:

1. **Find and kill the process:**
   ```bash
   # For port 3000
   lsof -ti:3000 | xargs kill -9
   
   # For port 5000
   lsof -ti:5000 | xargs kill -9
   ```

2. **Or change the port:**
   - Client: Set `PORT=3001` in client directory
   - Server: Change `PORT=5001` in `server/.env`

### Module Not Found Errors

If you see "Module not found" errors:

```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules server/node_modules
npm install
cd client && npm install
cd ../server && npm install
```

## Environment Variables

Key environment variables in `server/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transcript_generator
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# CORS
CLIENT_URL=http://localhost:3000
```

## Development Commands

```bash
# Start both client and server
npm run dev

# Start server only
npm run server

# Start client only
npm run client

# Run server tests
cd server && npm test

# Build client for production
cd client && npm run build
```

## Next Steps

- Read the full [README.md](README.md) for detailed information
- Check [API.md](API.md) for API documentation
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Getting Help

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Review the full documentation in README.md
3. Open an issue on GitHub
4. Contact support at support@transcriptgenerator.com

## Common Tasks

### Adding a New Course to a Transcript

1. In the transcript generator form, scroll to the "Courses" section
2. Click "Add Another Course"
3. Fill in the course details
4. Repeat as needed

### Switching Between High School and College Mode

1. Use the toggle switch in the header (only visible on transcript page)
2. The form will update to show relevant fields for the selected mode

### Viewing Your Transcripts

Currently, transcripts are created and can be downloaded as PDFs. A dashboard for viewing and managing saved transcripts can be implemented as a future enhancement.

## Features Overview

✅ User authentication (register/login)
✅ Toggle between high school and college modes
✅ Professional transcript templates
✅ PDF generation
✅ Course management
✅ Responsive design
✅ Secure data storage

Happy transcript generating! 🎓
