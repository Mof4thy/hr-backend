# HR Management System - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

The system uses **HTTP-Only cookies** for secure authentication. Two methods are supported:

### Method 1: HTTP-Only Cookies (Recommended - More Secure)
- Login sets an HTTP-Only cookie automatically
- Browser sends cookie with each request
- No manual token handling required
- Protected against XSS attacks

### Method 2: Authorization Header (Backward Compatibility)
```
Authorization: Bearer <your_jwt_token>

```
**Note:** HTTP-Only cookies take precedence if both are present.
---

## 🔐 Authentication Endpoints

admin / Admin@123 (Admin role)
hr_manager / Hr@123 (HR role)


### 1. HR User Login  
**POST** `/auth/login`

**Description:** Authenticate HR user and get access token

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin@123",
  "rememberMe": false  // optional, default: false
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "email": "admin@company.com",
      "fullName": "System Administrator",
      "role": "Admin"
    }
  }
}
```

**HTTP-Only Cookie Set:**
```
Set-Cookie: authToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400
```

**Cookie Attributes:**
- `HttpOnly`: Prevents JavaScript access (XSS protection)
- `SameSite=Lax`: CSRF protection
- `Secure`: Only sent over HTTPS in production
- `Max-Age=86400`: 24-hour expiration

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid credentials",
  "error": "INVALID_CREDENTIALS"
}
```

---

### 2. HR User Logout
**POST** `/auth/logout`

**Description:** Logout user and clear HTTP-Only cookie

**Request Body:** None required

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookie Cleared:**
```
Set-Cookie: authToken=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0
```

---

### 3. Get Current User Profile
**GET** `/auth/profile`

**Authentication:** HTTP-Only cookie (automatic) or `Authorization: Bearer <token>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "userId": 1,
      "username": "admin",
      "email": "admin@company.com",
      "fullName": "System Administrator",
      "role": "Admin",
      "isActive": true,
      "lastLoginAt": "2025-09-17T10:30:00.000Z"
    }
  }
}
```

---

### 4. Change Password
**PUT** `/auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "error": "INVALID_CURRENT_PASSWORD"
}
```

---

## 👥 HR User Management (Admin Only)
### 5. Create HR User
**POST** `/auth/hr-users`

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "username": "new_recruiter",
  "email": "recruiter@company.com",
  "fullName": "New Recruiter",
  "password": "SecurePassword123!",
  "role": "Admin"  // Admin, HR
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "HR user created successfully",
  "data": {
    "user": {
      "userId": 4,
      "username": "new_recruiter",
      "email": "recruiter@company.com",
      "fullName": "New Recruiter",
      "role": "Recruiter",
      "isActive": true
    }
  }
}
```
---

### 6. Get All HR Users
**GET** `/auth/hr-users`

**Headers:** `Authorization: Bearer <admin_token>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "userId": 1,
        "username": "admin",
        "email": "admin@company.com",
        "fullName": "System Administrator",
        "role": "Admin",
        "isActive": true,
        "createdAt": "2025-09-17T08:00:00.000Z"
      },
      {
        "userId": 2,
        "username": "hr_manager",
        "email": "hr.manager@company.com",
        "fullName": "HR Manager",
        "role": "HR",
        "isActive": true,
        "createdAt": "2025-09-17T08:00:00.000Z"
      }
    ]
  }
}
```

---

### 7. Update HR User
**PUT** `/auth/hr-users/:id`

**Headers:** `Authorization: Bearer <admin_token>`

**URL Parameters:**
- `id` (integer) - HR User ID

**Request Body:**
```json
{
  "email": "updated@company.com",
  "fullName": "Updated Name",
  "role": "HR",
  "isActive": false
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "HR user updated successfully",
  "data": {
    "user": {
      "userId": 2,
      "username": "hr_manager",
      "email": "updated@company.com",
      "fullName": "Updated Name",
      "role": "HR",
      "isActive": false
    }
  }
}
```

---

### 8. Delete HR User
**DELETE** `/auth/hr-users/:id`


**Headers:** `Authorization: Bearer <admin_token>`

**URL Parameters:**
- `id` (integer) - HR User ID to delete

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "HR user deleted successfully",
  "data": {
    "deletedUser": {
      "userId": 3,
      "username": "recruiter1",
      "email": "recruiter1@company.com",
      "fullName": "Recruiter One",
      "role": "Recruiter"
    }
  }
}
```

**Response (Error - 400 - Self Delete):**
```json
{
  "success": false,
  "message": "You cannot delete your own account"
}
```

**Response (Error - 400 - Last Admin):**
```json
{
  "success": false,
  "message": "Cannot delete the last admin user"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "message": "HR user not found"
}
```

---

## 📝 Application Management

### 9. Submit Application (Public) - Single Request Submission
**POST** `/applications/submit`

**Content-Type:** `multipart/form-data`

**⚡ Single Request Approach:**
- Submit complete application in one atomic request
- Prevents dirty data from partial submissions
- Uses database transactions for data integrity
- All data saved together or none at all

**Form Data:**
```javascript
// Job Information
jobTitle: "Software Developer",
comments: "I am very interested in this position and would love to contribute to your team."

// Personal Information (nested object)
personalInfo: {
  name: "John Doe",
  dateOfBirth: "1990-01-15",
  age: 34,
  governorate: "Cairo",
  area: "Maadi",
  gender: "ذكر",
  address: "123 Main Street, City, State",
  nationalId: "12345678901234",
  nationality: "Egyptian",
  whatsappNumber: "+201234567890",
  mobileNumber: "+201234567890",
  email: "john.doe@example.com",
  emergencyNumber: "+0987654321",
  militaryServiceStatus: "Completed",
  socialStatus: "Single",
  hasVehicle: true,
  drivingLicense: "Class B"
}

// Work Experience (array)
experiences: [
  {
    company: "Tech Corp",
    location: "New York",
    role: "Junior Developer",
    salary: "50000",
    fromDate: "2020-01-01",
    toDate: "2023-12-31"
  },
  {
    company: "StartupXYZ",
    location: "California",
    role: "Frontend Developer",
    salary: "60000",
    fromDate: "2018-06-01",
    toDate: "2019-12-31"
  }
]

// Current Job
currentJob: {
  isCurrentlyEmployed: true,
  company: "Current Company",
  role: "Senior Developer",
  salary: "70000"
}

// Skills
skills: {
  predefined: {
    word: "excellent",        // weak, good, very_good, excellent
    excel: "good",
    powerpoint: "very_good"
  },
  custom: [
    {
      name: "JavaScript",
      level: "excellent"       // weak, good, very_good, excellent
    },
    {
      name: "React",
      level: "very_good"
    }
  ]
}

// Languages
languages: {
  english: "fluent",          // beginner, intermediate, advanced, fluent, native
  additional: [
    {
      name: "Spanish",
      level: "intermediate"    // beginner, intermediate, advanced, fluent, native
    },
    {
      name: "French",
      level: "beginner"
    }
  ]
}

// Company Relationships
companyRelationships: {
  hasRelationship: true,
  contactName: "Jane Smith",
  contactPosition: "HR Manager"
}

// Education (array)
education: [
  {
    institution: "University of Technology",
    department: "Computer Science",
    grade: "Bachelor's Degree",
    fromDate: "2016",
    toDate: "2020"
  }
]

// Files
cv: <file>                    // PDF/DOC file
profileImage: <file>          // JPG/PNG/GIF file
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "applicationId": 1,
    "status": "pending"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Failed to submit application"
}
```

---

### 10. Get All Applications (HR Only)
**GET** `/applications`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page
- `search` (string) - Search in applicant names
- `status` (string) - Filter by status: `pending`, `reviewed`, `accepted`, `rejected`, `accepted_for_interview`, `accepted_to_join`
- `jobTitle` (string) - Filter by job title
- `fromDate` (date) - Filter applications from date (YYYY-MM-DD)
- `toDate` (date) - Filter applications to date (YYYY-MM-DD)
- `sortBy` (string, default: createdAt) - Sort by: `createdAt`, `updatedAt`, `jobTitle`, `status`
- `sortOrder` (string, default: DESC) - Sort order: `ASC`, `DESC`

**Example Request:**
```
GET /api/applications?page=1&limit=10&status=pending&search=John&sortBy=createdAt&sortOrder=DESC
```

**Note:** By default, this endpoint excludes applications with status `accepted_to_join`. To include them, explicitly filter by `status=accepted_to_join` or use the dedicated `/applications/accepted-to-join` endpoint.

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": 1,
        "jobTitle": "Software Developer",
        "comments": "I am very interested in this position and would love to contribute to your team.",
        "status": "pending",
        "submittedAt": "2025-09-17T10:30:00.000Z",
        "createdAt": "2025-09-17T10:30:00.000Z",
        "updatedAt": "2025-09-17T10:30:00.000Z",
        "cvPath": "uploads/cv/cv-1695804600000-123456789.pdf",
        "personalInfo": {
          "name": "John Doe",
          "whatsappNumber": "+201234567890",
          "profileImagePath": "uploads/images/profileImage-1695804600000-123456789.jpg",
          "age": 34,
          "governorate": "Cairo",
          "area": "Maadi",
          "gender": "ذكر"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCount": 50,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 11. Get Application Details (HR Only)
**GET** `/applications/:id`

**Authentication:** HTTP-Only cookie (automatic) or `Authorization: Bearer <token>`

**URL Parameters:**
- `id` (integer) - Application ID

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "application": {
      "applicationId": 1,
      "jobTitle": "Software Developer",
      "comments": "I am very interested in this position and would love to contribute to your team.",
      "cvPath": "uploads/cv/cv-1695804600000-123456789.pdf",
      "status": "pending",
      "submittedAt": "2025-09-17T10:30:00.000Z",
      "createdAt": "2025-09-17T10:30:00.000Z",
      "updatedAt": "2025-09-17T10:30:00.000Z",
      "personalInfo": {
        "name": "John Doe",
        "dateOfBirth": "1990-01-15",
        "age": 34,
        "governorate": "Cairo",
        "area": "Maadi",
        "gender": "ذكر",
        "address": "123 Main Street, City, State",
        "nationalId": "12345678901234",
        "nationality": "Egyptian",
        "whatsappNumber": "+201234567890",
        "mobileNumber": "+201234567890",
        "email": "john.doe@example.com",
        "emergencyNumber": "+0987654321",
        "militaryServiceStatus": "Completed",
        "socialStatus": "Single",
        "hasVehicle": true,
        "drivingLicense": "Class B",
        "profileImagePath": "uploads/images/profileImage-1695804600000-123456789.jpg"
      },
      "experiences": [
        {
          "experienceId": 1,
          "company": "Tech Corp",
          "location": "New York",
          "role": "Junior Developer",
          "salary": "50000",
          "fromDate": "2020-01-01",
          "toDate": "2023-12-31"
        }
      ],
      "currentJob": {
        "isCurrentlyEmployed": true,
        "company": "Current Company",
        "role": "Senior Developer",
        "salary": "70000"
      },
      "predefinedSkills": {
        "word": "excellent",
        "excel": "good",
        "powerpoint": "very_good"
      },
      "customSkills": [
        {
          "name": "JavaScript",
          "level": "excellent"
        }
      ],
      "languages": {
        "english": "fluent"
      },
      "additionalLanguages": [
        {
          "name": "Spanish",
          "level": "intermediate"
        }
      ],
      "companyRelationships": {
        "hasRelationship": true,
        "contactName": "Jane Smith",
        "contactPosition": "HR Manager"
      },
      "education": [
        {
          "institution": "University of Technology",
          "department": "Computer Science",
          "grade": "Bachelor's Degree",
          "fromDate": "2016",
          "toDate": "2020"
        }
      ]
    }
  }
}
```

---

### 12. Get Accepted to Join Applications (HR Only)
**GET** `/applications/accepted_to_join`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (integer, default: 1) - Page number
- `limit` (integer, default: 10, max: 100) - Items per page
- `search` (string) - Search in applicant names
- `jobTitle` (string) - Filter by job title

**Example Request:**
```
GET /api/applications/accepted_to_join?page=1&limit=10&search=John
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": 1,
        "jobTitle": "Software Developer",
        "comments": "I am very interested in this position and would love to contribute to your team.",
        "status": "accepted_to_join",
        "submittedAt": "2025-09-17T10:30:00.000Z",
        "createdAt": "2025-09-17T10:30:00.000Z",
        "updatedAt": "2025-09-17T12:45:00.000Z",
        "cvPath": "uploads/cv/cv-1695804600000-123456789.pdf",
        "personalInfo": {
          "name": "John Doe",
          "whatsappNumber": "+1234567890",
          "profileImagePath": "uploads/images/profileImage-1695804600000-123456789.jpg"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalCount": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

**Note:** This endpoint only returns applications with status `accepted_to_join`. These applications are excluded from the main `/applications` endpoint by default.

---

### 13. Update Application Status (HR Only)
**PUT** `/applications/:id/status`

**Headers:** `Authorization: Bearer <token>`

**URL Parameters:**
- `id` (integer) - Application ID

**Request Body:**
```json
{
  "status": "reviewed",  // pending, reviewed, accepted, rejected, accepted_for_interview, accepted_to_join
  "note": "Initial review completed"  // optional
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": { 
    "applicationId": 1,
    "status": "reviewed"
  }
}
```

---

### 14. Get Application Statistics (HR Only)
**GET** `/applications/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalApplications": 150,
    "byStatus": {
      "pending": 45,
      "reviewed": 60,
      "accepted": 25,
      "rejected": 20,
      "accepted_for_interview": 8,
      "accepted_to_join": 12
    }
  }
}
```

---

## 🌐 General Endpoints

### 15. Health Check
**GET** `/health`

**Response (Success - 200):**
```json
{
  "status": "OK",
  "uptime": 3600,
  "timestamp": "2025-09-17T12:00:00.000Z",
  "environment": "development"
}
```

### 16. Root Endpoint
**GET** `/`

**Response (Success - 200):**
```json
{
  "message": "HR Management System Backend API",
  "version": "1.0.0",
  "status": "Running",
  "timestamp": "2025-09-17T12:00:00.000Z",
  "endpoints": {
    "auth": "/api/auth",
    "applications": "/api/applications",
    "health": "/health"
  }
}
```

---

## 📁 File Access

### 17. Access Uploaded Files
**GET** `/uploads/cv/:filename`
**GET** `/uploads/images/:filename`

**Example:**
```
GET http://localhost:5000/uploads/cv/cv-1695804600000-123456789.pdf
GET http://localhost:5000/uploads/images/profileImage-1695804600000-123456789.jpg
```

---

## 🔧 Status Codes & Error Handling

### HTTP Status Codes Used:
- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Authentication required/failed)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Resource already exists)
- `413` - Payload Too Large (File too large)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

### Common Error Response Format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

---

## 🔑 Default HR Users

| Username | Password | Role | Email |
|----------|----------|------|-------|
| admin | Admin@123 | Admin | admin@company.com |
| hr_manager | Hr@123 | HR | hr.manager@company.com |
| recruiter1 | Recruiter@123 | Recruiter | recruiter1@company.com |

---

## 📋 Validation Rules

### Application Status Values:
- `pending` (default)
- `reviewed`
- `accepted`
- `rejected`
- `accepted_for_interview`
- `accepted_to_join`

### Skill Levels:
- `weak`
- `good`
- `very_good`
- `excellent`

### Language Levels:
- `beginner`
- `intermediate`
- `advanced`
- `fluent`
- `native`

### HR User Roles:
- `Admin` - Full system access
- `HR` - Application management
- `Recruiter` - Application management

### File Upload Limits:
- **CV Files:** PDF, DOC, DOCX (max 2MB)
- **Profile Images:** JPG, JPEG, PNG, GIF (max 5MB)

---

## 🚀 Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes per IP
- **General API endpoints:** 100 requests per 15 minutes per IP

---

## 📡 CORS Configuration

- **Allowed Origins:** `http://localhost:3000` (configurable via FRONTEND_URL)
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Credentials:** Supported

---

This documentation covers all available endpoints in your HR Management System backend. The system is ready for frontend integration!
