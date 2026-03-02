# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                     http://localhost:3000                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Header  │  │  Footer  │  │ HomePage │  │  About   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│  │  Login   │  │ Register │  │ Contact  │                    │
│  └──────────┘  └──────────┘  └──────────┘                    │
│                                                                 │
│  ┌───────────────────────────────────────┐                    │
│  │    TranscriptGenerator Component      │                    │
│  │  - High School Mode                   │                    │
│  │  - College Mode                       │                    │
│  │  - Course Management                  │                    │
│  │  - PDF Download                       │                    │
│  └───────────────────────────────────────┘                    │
│                                                                 │
│  ┌──────────────────┐  ┌───────────────────┐                 │
│  │  Auth Context    │  │  Services Layer   │                 │
│  │  - User State    │  │  - authService    │                 │
│  │  - Token Mgmt    │  │  - transcriptSvc  │                 │
│  └──────────────────┘  └───────────────────┘                 │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │ (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js/Express)                     │
│                     http://localhost:5000                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                   Express App                          │   │
│  │  - CORS Middleware                                     │   │
│  │  - JSON Parser                                         │   │
│  │  - Request Logger                                      │   │
│  │  - Error Handler                                       │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ Auth Routes  │  │ Transcript   │                          │
│  │ /api/auth/*  │  │ Routes       │                          │
│  │              │  │ /api/trans*  │                          │
│  └──────────────┘  └──────────────┘                          │
│         │                  │                                   │
│         ▼                  ▼                                   │
│  ┌──────────────┐  ┌──────────────┐                          │
│  │ Auth         │  │ Transcript   │                          │
│  │ Controller   │  │ Controller   │                          │
│  │ - register   │  │ - create     │                          │
│  │ - login      │  │ - read       │                          │
│  │ - profile    │  │ - update     │                          │
│  │ - logout     │  │ - delete     │                          │
│  └──────────────┘  └──────────────┘                          │
│         │                  │                                   │
│         ▼                  ▼                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ User Model   │  │ Transcript   │  │ PDF Service  │       │
│  │              │  │ Model        │  │ (Puppeteer)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         │                  │                                   │
│         └──────────────────┘                                   │
│                    │                                           │
│                    ▼                                           │
│         ┌──────────────────────┐                              │
│         │  Database Config     │                              │
│         │  (pg Pool)           │                              │
│         └──────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                         │
│                     localhost:5432                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ users        │  │ transcripts  │  │ courses      │        │
│  │              │  │              │  │              │        │
│  │ - id         │  │ - id         │  │ - id         │        │
│  │ - username   │  │ - user_id    │  │ - trans_id   │        │
│  │ - email      │  │ - type       │  │ - name       │        │
│  │ - pass_hash  │  │ - data       │  │ - code       │        │
│  │ - created_at │  │ - created_at │  │ - semester   │        │
│  │ - updated_at │  │ - updated_at │  │ - credits    │        │
│  │              │  │              │  │ - grade      │        │
│  │              │  │              │  │ - teacher    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│        │                   │                   │               │
│        └───────────────────┴───────────────────┘               │
│                   (Foreign Keys)                                │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### Authentication Flow

```
User Registration/Login
    │
    ├─> Client: User fills form
    │
    ├─> POST /api/auth/register or /api/auth/login
    │
    ├─> Server: Validate input
    │
    ├─> Server: Hash password (bcrypt)
    │
    ├─> Database: Create/Find user
    │
    ├─> Server: Generate JWT token
    │
    ├─> Client: Store token in localStorage
    │
    └─> Client: Update auth context
```

### Transcript Creation Flow

```
Create Transcript
    │
    ├─> Client: User fills transcript form
    │
    ├─> Client: Toggle high_school/college mode
    │
    ├─> Client: Add courses
    │
    ├─> POST /api/transcripts with JWT token
    │
    ├─> Server: Verify JWT token
    │
    ├─> Server: Validate data
    │
    ├─> Database: Create transcript record
    │
    ├─> Database: Create course records
    │
    ├─> Server: Return transcript data
    │
    └─> Client: Show success message
```

### PDF Generation Flow

```
Download PDF
    │
    ├─> Client: Click download button
    │
    ├─> GET /api/transcripts/:id/pdf with JWT
    │
    ├─> Server: Verify JWT token
    │
    ├─> Database: Fetch transcript & courses
    │
    ├─> Server: Load EJS template
    │
    ├─> PDF Service: Render HTML with Puppeteer
    │
    ├─> PDF Service: Generate PDF buffer
    │
    ├─> Server: Send PDF as response
    │
    └─> Client: Download PDF file
```

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── Router
│       ├── Header
│       │   ├── Navigation Links
│       │   ├── Auth Buttons
│       │   └── Toggle Switch (High School/College)
│       │
│       ├── Routes
│       │   ├── HomePage
│       │   │   ├── Hero Section
│       │   │   ├── Features Section
│       │   │   ├── Testimonials Section
│       │   │   └── CTA Section
│       │   │
│       │   ├── LoginPage
│       │   │   └── Login Form
│       │   │
│       │   ├── RegisterPage
│       │   │   └── Registration Form
│       │   │
│       │   ├── TranscriptPage (Protected)
│       │   │   └── TranscriptGenerator
│       │   │       ├── School Info Form
│       │   │       ├── Student Info Form
│       │   │       ├── Courses Form (Dynamic)
│       │   │       └── Submit Button
│       │   │
│       │   ├── AboutPage
│       │   │   └── Company Information
│       │   │
│       │   └── ContactPage
│       │       ├── Contact Info
│       │       └── Contact Form
│       │
│       └── Footer
│           ├── Quick Links
│           └── Social Media Icons
```

## Data Flow

### State Management

```
AuthContext (Global State)
├── user: { id, username, email }
├── token: JWT string
├── loading: boolean
├── isAuthenticated: boolean
└── Methods:
    ├── login(email, password)
    ├── register(username, email, password)
    └── logout()
```

### API Services

```
authService
├── register(username, email, password)
├── login(email, password)
├── logout(token)
└── getProfile(token)

transcriptService
├── createTranscript(token, type, data)
├── getTranscripts(token)
├── getTranscript(token, id)
├── updateTranscript(token, id, type, data)
├── deleteTranscript(token, id)
└── downloadPDF(token, id)
```

## Security Layers

```
┌─────────────────────────────────────┐
│   Client-Side Security              │
│   - Input validation                │
│   - XSS prevention                  │
│   - Token storage (localStorage)    │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Network Security                  │
│   - HTTPS (production)              │
│   - CORS configuration              │
│   - JWT token in headers            │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Server-Side Security              │
│   - JWT verification                │
│   - Input validation                │
│   - SQL injection prevention        │
│   - Password hashing (bcrypt)       │
└─────────────────────────────────────┘
              ▼
┌─────────────────────────────────────┐
│   Database Security                 │
│   - Parameterized queries           │
│   - Encrypted connections           │
│   - Access control                  │
└─────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Routing | React Router 6 | Client-side routing |
| State | Context API | Global state management |
| HTTP Client | Axios | API requests |
| Styling | CSS3 | Component styling |
| Backend | Express.js | Web framework |
| Runtime | Node.js | Server runtime |
| Database | PostgreSQL | Data persistence |
| ORM | pg (node-postgres) | Database driver |
| Auth | JWT | Token-based auth |
| Encryption | bcrypt | Password hashing |
| PDF | Puppeteer | PDF generation |
| Templates | EJS | HTML templates |
| Validation | express-validator | Input validation |
| Testing | Jest | Unit testing |
| Testing | Supertest | API testing |

## Deployment Architecture (AWS)

```
┌─────────────────────────────────────────────┐
│            CloudFront (CDN)                 │
│         SSL/TLS Termination                 │
└─────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐    ┌────────────────────┐
│   S3 Bucket   │    │   EC2 Instance     │
│  (Frontend)   │    │   (Backend)        │
│               │    │   + Nginx          │
│  React Build  │    │   + Node.js        │
│               │    │   + PM2            │
└───────────────┘    └────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  RDS Instance  │
                    │  (PostgreSQL)  │
                    │                │
                    └────────────────┘
```
