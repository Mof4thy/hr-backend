# HR Management System - Simple Backend

A simplified Node.js backend API for managing HR recruitment processes with basic Express features.

## 🚀 Features

### Applicant Side (Public)
- Submit job applications with personal info, experience, education, and skills
- Upload CV (PDF/DOC) and profile image (JPG/PNG)
- All data stored in a single Applications table

### HR Side (Protected)
- JWT-based authentication for HR users
- View all applications with search and filters
- View detailed application information
- Update application status (Submitted → In Review → Interview → Hired/Rejected)
- Application statistics dashboard

## 📊 Database Structure (Multi-Table)

### Core Tables
- **Applications** - Main application record with job title, CV path, and status
- **PersonalInfo** - Complete personal information including profile image
- **Experiences** - Work experience history (multiple records per application)
- **CurrentJob** - Current employment status and details
- **Education** - Educational background (multiple records per application)

### Skills & Languages
- **PredefinedSkills** - Word, Excel, PowerPoint skill levels
- **CustomSkills** - Additional skills with levels (multiple records)
- **Languages** - English proficiency level
- **AdditionalLanguages** - Other languages with levels (multiple records)

### Additional Info
- **CompanyRelationships** - Internal company connections
- **HRUsers** - HR staff authentication with roles (Admin, HR, Recruiter)

## 🛠️ Setup

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Database Setup**
   ```bash
   # Run migrations
   npm run db:migrate

   node test-db.js
   
   # Seed HR users (admin/Admin@123, hr_manager/Hr@123, recruiter1/Recruiter@123)
   npm run db:seed
   ```

4. **Start Server**
   ```bash
   npm run dev    # Development
   npm start      # Production
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - HR user login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/change-password` - Change password (all users)

### HR User Management (Admin only)
- `     POST /api/auth/hr-users` - Create new HR user
- `GET /api/auth/hr-users` - Get all HR users
- `PUT /api/auth/hr-users/:id` - Update HR user

### Applications
- `POST /api/applications/submit` - Submit new application (Public)
- `GET /api/applications` - Get all applications (HR only)
- `GET /api/applications/:id` - Get application details (HR only)
- `PUT /api/applications/:id/status` - Update application status (HR only)
- `GET /api/applications/stats` - Get application statistics (HR only)

## 📝 Example Usage

### Submit Application
```bash
curl -X POST http://localhost:5000/api/applications/submit \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitle": "Software Developer",
    "personalInfo": {
      "name": "John Doe",
      "phoneNumber": "+1234567890",
      "address": "123 Main St"
    },
    "experiences": [
      {
        "company": "Tech Corp",
        "role": "Developer",
        "fromDate": "2020",
        "toDate": "2023"
      }
    ],
    "skills": {
      "predefined": {
        "word": "good",
        "excel": "very_good"
      },
      "custom": [
        {"name": "JavaScript", "level": "excellent"}
      ]
    }
  }' \
  --form cv=@path/to/cv.pdf \
  --form profileImage=@path/to/photo.jpg
```

### HR Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin@123"}'
```

### Get Applications (HR)
```bash
curl -X GET http://localhost:5000/api/applications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔧 Tech Stack
- **Node.js** with Express
- **Sequelize** ORM with SQL Server
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

## 📁 Project Structure
```
hr-backend/
├── controllers/          # Route handlers
├── middleware/          # Authentication middleware
├── models/             # Sequelize models (Application, HRUser)
├── routes/             # API routes
├── migrations/         # Database migrations
├── seeders/           # Database seeders
├── uploads/           # File storage
│   ├── cv/           # CV files
│   └── images/       # Profile images
├── app.js            # Express app setup
└── server.js         # Server startup
```

## 🎯 Default HR Users
- **admin** / Admin@123 (Admin role)
- **hr_manager** / Hr@123 (HR role)  
- **recruiter1** / Recruiter@123 (Recruiter role)

## 🚀 Next Steps
1. Set up your SQL Server database
2. Configure your .env file
3. Run migrations and seeders
4. Test the API endpoints
5. Build your frontend to consume these APIs