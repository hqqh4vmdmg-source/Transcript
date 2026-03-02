# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Health Check

#### GET /health
Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

### Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**
- `username`: 3-50 characters
- `email`: Valid email format
- `password`: Minimum 6 characters

---

#### POST /auth/login
Login to an existing account.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

---

#### GET /auth/profile
Get the current user's profile. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### POST /auth/logout
Logout from the current session. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

### Transcript Endpoints

#### POST /transcripts
Create a new transcript. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "high_school",
  "data": {
    "schoolName": "Lincoln High School",
    "schoolAddress": "123 Main St, City, State 12345",
    "studentName": "Jane Smith",
    "studentId": "HS-2024-001",
    "dateOfBirth": "2006-05-15",
    "gradeLevel": "12th",
    "graduationDate": "2024-06-15",
    "cumulativeGPA": "3.85",
    "courses": [
      {
        "code": "MATH301",
        "name": "Calculus I",
        "semester_year": "Fall 2023",
        "credits": 4,
        "grade": "A",
        "teacher_professor": "Mr. Johnson"
      }
    ]
  }
}
```

**College Transcript Example:**
```json
{
  "type": "college",
  "data": {
    "schoolName": "State University",
    "schoolAddress": "456 College Ave, City, State 12345",
    "studentName": "Jane Smith",
    "studentId": "CU-2024-001",
    "dateOfBirth": "2002-05-15",
    "major": "Computer Science",
    "degree": "Bachelor",
    "expectedGraduation": "2024-05-15",
    "cumulativeGPA": "3.75",
    "courses": [
      {
        "code": "CS101",
        "name": "Introduction to Programming",
        "semester_year": "Fall 2023",
        "credits": 3,
        "grade": "A",
        "teacher_professor": "Dr. Williams"
      }
    ]
  }
}
```

**Response (201):**
```json
{
  "message": "Transcript created successfully",
  "transcript": {
    "id": 1,
    "user_id": 1,
    "type": "high_school",
    "data": { ... },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### GET /transcripts
Get all transcripts for the authenticated user. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "transcripts": [
    {
      "id": 1,
      "user_id": 1,
      "type": "high_school",
      "data": { ... },
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### GET /transcripts/:id
Get a specific transcript by ID. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "transcript": {
    "id": 1,
    "user_id": 1,
    "type": "high_school",
    "data": { ... },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  },
  "courses": [
    {
      "id": 1,
      "transcript_id": 1,
      "name": "Calculus I",
      "code": "MATH301",
      "semester_year": "Fall 2023",
      "credits": 4,
      "grade": "A",
      "teacher_professor": "Mr. Johnson"
    }
  ]
}
```

---

#### PUT /transcripts/:id
Update a transcript. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "high_school",
  "data": {
    "schoolName": "Updated School Name",
    "cumulativeGPA": "3.90"
  }
}
```

**Response (200):**
```json
{
  "message": "Transcript updated successfully",
  "transcript": {
    "id": 1,
    "user_id": 1,
    "type": "high_school",
    "data": { ... },
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  }
}
```

---

#### DELETE /transcripts/:id
Delete a transcript. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Transcript deleted successfully"
}
```

---

#### GET /transcripts/:id/pdf
Download a transcript as PDF. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `seal_id` (optional): ID of the official seal to include in the PDF

**Example:**
```
GET /transcripts/1/pdf?seal_id=2
```

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename=transcript-{id}.pdf
- Binary PDF data

---

### Official Seal Endpoints

#### POST /seals
Create a new official seal. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `seal_image` (file, required): Image file for the seal (PNG, JPG, SVG)
- `name` (string, required): Name of the seal
- `description` (string, optional): Description of the seal
- `seal_type` (string, required): Type of seal - one of: 'institutional', 'departmental', 'accreditation', 'registrar'
- `metadata` (JSON string, optional): Additional metadata
- `valid_until` (datetime, optional): Expiration date of the seal

**Response (201):**
```json
{
  "message": "Seal created successfully",
  "seal": {
    "id": 1,
    "name": "University Official Seal",
    "description": "Primary institutional seal",
    "seal_type": "institutional",
    "image_path": "/seals/seal_1234567890_abc123.png",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### GET /seals
Get all active seals. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Seals retrieved successfully",
  "count": 3,
  "seals": [
    {
      "id": 1,
      "name": "University Official Seal",
      "description": "Primary institutional seal",
      "seal_type": "institutional",
      "image_path": "/seals/seal_1234567890_abc123.png",
      "metadata": {},
      "valid_from": "2024-01-01T00:00:00.000Z",
      "valid_until": null,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### GET /seals/:id
Get a specific seal by ID. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Seal retrieved successfully",
  "seal": {
    "id": 1,
    "name": "University Official Seal",
    "description": "Primary institutional seal",
    "seal_type": "institutional",
    "image_path": "/seals/seal_1234567890_abc123.png",
    "metadata": {},
    "valid_from": "2024-01-01T00:00:00.000Z",
    "valid_until": null,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### GET /seals/type/:type
Get seals by type. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `type`: One of 'institutional', 'departmental', 'accreditation', 'registrar'

**Response (200):**
```json
{
  "message": "Seals retrieved successfully",
  "seal_type": "institutional",
  "count": 2,
  "seals": [...]
}
```

---

#### PUT /seals/:id
Update a seal. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `seal_image` (file, optional): New image file for the seal
- `name` (string, optional): Updated name
- `description` (string, optional): Updated description
- `is_active` (boolean, optional): Active status
- `valid_until` (datetime, optional): Updated expiration date

**Response (200):**
```json
{
  "message": "Seal updated successfully",
  "seal": {
    "id": 1,
    "name": "Updated Seal Name",
    "description": "Updated description",
    "seal_type": "institutional",
    "image_path": "/seals/seal_1234567890_abc123.png",
    "updated_at": "2024-01-02T00:00:00.000Z"
  }
}
```

---

#### DELETE /seals/:id
Delete a seal (soft delete). **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Seal deleted successfully"
}
```

---

#### GET /seals/verify/:verification_code
Verify a seal using its verification code. **[Public - No Authentication Required]**

**Parameters:**
- `verification_code`: The verification code from a transcript

**Response (200):**
```json
{
  "message": "Seal is valid",
  "verification": {
    "is_valid": true,
    "seal_name": "University Official Seal",
    "seal_type": "institutional",
    "transcript_id": 1,
    "transcript_type": "college",
    "used_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "error": "Invalid verification code",
  "is_valid": false
}
```

---

#### GET /seals/:id/stats
Get usage statistics for a seal. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Seal statistics retrieved successfully",
  "seal_id": 1,
  "seal_name": "University Official Seal",
  "statistics": {
    "total_uses": 45,
    "unique_transcripts": 42,
    "last_used": "2024-01-15T00:00:00.000Z"
  }
}
```

---

#### GET /seals/:id/download
Download seal image. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
- Content-Type: image/png (or appropriate image type)
- Binary image data

---

## Error Responses

### Validation Error (400)
```json
{
  "errors": [
    {
      "msg": "Email must be valid",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "message": "No token provided, authorization denied"
}
```

or

```json
{
  "message": "Token is not valid"
}
```

### Not Found (404)
```json
{
  "message": "Transcript not found"
}
```

### Server Error (500)
```json
{
  "message": "Server error creating transcript"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

## CORS

The API allows requests from the configured CLIENT_URL (default: http://localhost:3000).

## Data Types

### Transcript Types
- `high_school`
- `college`

### Grade Values
- Letter grades: A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F
- Special: P (Pass), W (Withdraw)

### Degree Types (College)
- Associate
- Bachelor
- Master
- Doctorate

### Seal Types
- `institutional`: Main university/school seal
- `departmental`: Department-specific seal
- `accreditation`: Accreditation body seal
- `registrar`: Registrar's office seal

## Security Features

### Seal Verification
Each transcript generated with an official seal includes:
1. **QR Code**: Scannable code linking to verification portal
2. **Verification Code**: Unique alphanumeric code for manual verification
3. **Seal Metadata**: Stored seal information including usage timestamp

### PDF Security
- Seals are embedded as base64 images
- QR codes provide instant verification
- Verification codes are unique per transcript
- Audit trail for all seal usage


---

### Generator Endpoints

#### POST /generator/seal
Generate an official seal programmatically. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sealType": "institutional",
  "institutionName": "State University",
  "year": "2024",
  "subtitle": "Excellence in Education"
}
```

**Seal Types:**
- `institutional` - Main university/school seal
- `departmental` - Department-specific seal
- `registrar` - Registrar's office seal
- `accreditation` - Accreditation body seal

**Response (201):**
```json
{
  "message": "Seal generated successfully",
  "seal": {
    "id": 1,
    "name": "State University institutional Seal",
    "seal_type": "institutional",
    "image_path": "/seals/institutional_1234567890_abc123.svg",
    "dataUrl": "data:image/svg+xml;base64,..."
  }
}
```

---

#### GET /generator/categories
Get available GPA categories for transcript generation. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Available categories retrieved successfully",
  "categories": [
    {
      "id": "failed",
      "name": "Failed Grades",
      "description": "Student with multiple failed courses and very low GPA",
      "expectedGPA": "< 1.0"
    },
    {
      "id": "2.5",
      "name": "2.5 GPA",
      "description": "Average student performance with mix of B and C grades",
      "expectedGPA": "~2.5"
    },
    {
      "id": "3.74",
      "name": "3.74 GPA",
      "description": "High-achieving student with excellent academic performance",
      "expectedGPA": "~3.74"
    }
  ]
}
```

---

#### POST /generator/category/:category
Generate transcript by category. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Parameters:**
- `category`: One of `failed`, `2.5`, or `3.74`

**Request Body:**
```json
{
  "type": "college"
}
```

**Type Options:**
- `college` - College/University transcript
- `high_school` - High School transcript

**Response (200):**
```json
{
  "message": "2.5 GPA category transcript generated successfully",
  "transcript": {
    "type": "college",
    "data": {
      "schoolName": "State University",
      "studentName": "John Smith",
      "studentId": "CU-2024-1234",
      "dateOfBirth": "2002-05-15",
      "major": "Computer Science",
      "degree": "Bachelor of Science",
      "expectedGraduation": "2025-05-15",
      "cumulativeGPA": "2.50",
      "courses": [
        {
          "code": "MATH201",
          "name": "Calculus I",
          "semester_year": "Fall 2023",
          "credits": 4,
          "grade": "C+",
          "teacher_professor": "Dr. Anderson"
        }
      ]
    },
    "stats": {
      "gpa": 2.5,
      "totalCredits": 28,
      "qualityPoints": 70.0,
      "category": "2.5 GPA",
      "description": "Average student performance with mix of B and C grades",
      "gradeDistribution": {
        "C+": 2,
        "B": 2,
        "C": 2,
        "B-": 2
      }
    }
  }
}
```

---

#### POST /generator/failed
Generate failed grades category transcript. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "college"
}
```

**Response (200):**
```json
{
  "message": "Failed grades category generated successfully",
  "transcript": {
    "type": "college",
    "data": { ... },
    "stats": {
      "gpa": 0.45,
      "category": "Failed Grades",
      "failedCourses": 3
    }
  }
}
```

---

#### POST /generator/2.5
Generate 2.5 GPA category transcript. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "college"
}
```

**Response (200):**
```json
{
  "message": "2.5 GPA category generated successfully",
  "transcript": {
    "type": "college",
    "data": { ... },
    "stats": {
      "gpa": 2.5,
      "category": "2.5 GPA"
    }
  }
}
```

---

#### POST /generator/3.74
Generate 3.74 GPA category transcript. **[Protected]**

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "college"
}
```

**Response (200):**
```json
{
  "message": "3.74 GPA category generated successfully",
  "transcript": {
    "type": "college",
    "data": { ... },
    "stats": {
      "gpa": 3.81,
      "category": "3.74 GPA",
      "honorsEligible": true
    }
  }
}
```

---

