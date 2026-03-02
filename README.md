# Transcript Generator

A comprehensive web application for generating professional high school and college transcripts. Built with React, Node.js, Express, and PostgreSQL.

## Features

- **Dual Mode Support**: Toggle between high school and college transcript modes
- **User Authentication**: Secure JWT-based authentication system
- **Professional Templates**: Well-designed transcript templates for both modes
- **PDF Generation**: Download transcripts as professional PDF documents
- **Secure Storage**: Encrypted data storage with PostgreSQL
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Course Management**: Add, edit, and manage course information
- **User-Friendly Interface**: Intuitive forms and navigation

## Technology Stack

### Front-End
- React.js 18.2.0
- React Router DOM for routing
- Axios for HTTP requests
- CSS3 for styling

### Back-End
- Node.js with Express.js
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing
- Puppeteer for PDF generation
- express-validator for input validation

## Project Structure

```
Transcript-Generator/
├── client/                  # React front-end
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── services/       # API service layers
│       ├── context/        # React context (Auth)
│       ├── App.js
│       └── index.js
├── server/                 # Node.js back-end
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── services/         # Business logic services
│   ├── middleware/       # Custom middleware
│   ├── app.js
│   └── server.js
└── database/              # Database schema
    └── schema.sql
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/playpalqc/Transcript-Generator.git
   cd Transcript-Generator
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install

   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Set up the database**
   ```bash
   # Create a PostgreSQL database
   createdb transcript_generator

   # Run the schema
   psql transcript_generator < database/schema.sql
   ```

4. **Configure environment variables**
   ```bash
   # In the server directory, create a .env file
   cd server
   cp .env.example .env
   
   # Edit .env with your configuration
   # Update database credentials, JWT secret, etc.
   ```

5. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   
   # Or run separately:
   # Terminal 1 - Start server
   cd server && npm run dev
   
   # Terminal 2 - Start client
   cd client && npm start
   ```

6. **Access the application**
   - Front-end: http://localhost:3000
   - Back-end API: http://localhost:5000

## Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=transcript_generator
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1h

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `POST /api/auth/logout` - Logout user (protected)

### Transcripts
- `POST /api/transcripts` - Create a new transcript (protected)
- `GET /api/transcripts` - Get all user transcripts (protected)
- `GET /api/transcripts/:id` - Get specific transcript (protected)
- `PUT /api/transcripts/:id` - Update transcript (protected)
- `DELETE /api/transcripts/:id` - Delete transcript (protected)
- `GET /api/transcripts/:id/pdf` - Download transcript as PDF (protected)

## Usage

1. **Register an Account**
   - Navigate to the Register page
   - Fill in username, email, and password
   - Submit to create your account

2. **Login**
   - Use your credentials to login
   - You'll be redirected to the transcript generator

3. **Generate a Transcript**
   - Toggle between High School and College mode
   - Fill in school and student information
   - Add courses with details (code, name, semester, credits, grade, teacher/professor)
   - Click "Create Transcript" to save
   - Download as PDF when ready

4. **Manage Transcripts**
   - View all your saved transcripts
   - Edit or delete as needed
   - Download PDFs anytime

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration

## Development

### Running Tests
```bash
# Server tests
cd server
npm test

# Client tests
cd client
npm test
```

### Building for Production
```bash
# Build client
cd client
npm run build

# The build folder will contain the production-ready files
```

## Deployment

### AWS Deployment (Recommended)

1. **Front-End (S3 + CloudFront)**
   - Build the React app
   - Upload to S3 bucket
   - Configure CloudFront for CDN

2. **Back-End (EC2)**
   - Set up EC2 instance
   - Install Node.js and PostgreSQL
   - Clone repository and configure
   - Use PM2 for process management
   - Set up SSL with Certificate Manager

3. **Database (RDS)**
   - Create PostgreSQL RDS instance
   - Run schema migration
   - Update environment variables

## License

MIT License - see LICENSE file for details

## Support

For support, email support@transcriptgenerator.com or visit our contact page.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- React team for the amazing framework
- Express.js for the robust backend framework
- PostgreSQL for reliable data storage
- Puppeteer for PDF generation capabilities