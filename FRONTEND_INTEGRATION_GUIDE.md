# Frontend Integration Guide - Single Request Application Submission

## 🎯 Single Request Approach

The backend is designed to handle **complete application submission in one atomic request**. This prevents dirty data issues when users cancel or navigate away during multi-step forms.

## 📝 Complete Application Submission

### Endpoint
```
POST /api/applications/submit
Content-Type: multipart/form-data
```

### ✅ Benefits of Single Request:
- **Atomic Operations**: All data is saved together or none at all
- **No Dirty Data**: No partial applications in the database
- **Better UX**: Users can save drafts locally, submit when complete
- **Data Integrity**: Database transactions ensure consistency

---

## 🚀 Frontend Implementation Example

### JavaScript/React Example

```javascript
// Complete application submission function
const submitCompleteApplication = async (formData, files) => {
  const submitData = new FormData();
  
  // 1. Job Information
  submitData.append('jobTitle', formData.jobTitle);
  submitData.append('educationStatus', formData.educationStatus); // Required: 'higher-qualification', 'above-intermediate-qualification', 'preparatory', 'primary', 'illiterate', 'no-qualification'
  submitData.append('comments', formData.comments || '');
  
  // 2. Personal Information (as JSON string)
  submitData.append('personalInfo', JSON.stringify({
    name: formData.personalInfo.name,
    dateOfBirth: formData.personalInfo.dateOfBirth,
    age: formData.personalInfo.age,
    governorate: formData.personalInfo.governorate,
    area: formData.personalInfo.area,
    gender: formData.personalInfo.gender,
    address: formData.personalInfo.address,
    nationalId: formData.personalInfo.nationalId,
    nationality: formData.personalInfo.nationality,
    whatsappNumber: formData.personalInfo.whatsappNumber,
    mobileNumber: formData.personalInfo.mobileNumber,
    email: formData.personalInfo.email,
    emergencyNumber: formData.personalInfo.emergencyNumber,
    militaryServiceStatus: formData.personalInfo.militaryServiceStatus,
    socialStatus: formData.personalInfo.socialStatus,
    hasVehicle: formData.personalInfo.hasVehicle,
    drivingLicense: formData.personalInfo.drivingLicense
  }));
  
  // 3. Work Experience (as JSON string)
  submitData.append('experiences', JSON.stringify(formData.experiences));
  
  // 4. Current Job (as JSON string)
  submitData.append('currentJob', JSON.stringify(formData.currentJob));
  
  // 5. Skills (as JSON string)
  submitData.append('skills', JSON.stringify({
    predefined: formData.skills.predefined,
    custom: formData.skills.custom
  }));
  
  // 6. Languages (as JSON string)
  submitData.append('languages', JSON.stringify({
    english: formData.languages.english,
    additional: formData.languages.additional
  }));
  
  // 7. Company Relationships (as JSON string)
  submitData.append('companyRelationships', JSON.stringify(formData.companyRelationships));
  
  // 8. Education (as JSON string)
  submitData.append('education', JSON.stringify(formData.education));
  
  // 9. Files
  if (files.cv) {
    submitData.append('cv', files.cv);
  }
  if (files.profileImage) {
    submitData.append('profileImage', files.profileImage);
  }
  
  try {
    const response = await fetch('/api/applications/submit', {
      method: 'POST',
      body: submitData
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Application submitted successfully!', result.data);
      // Handle success (redirect, show success message, etc.)
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Application submission failed:', error);
    throw error;
  }
};
```

---

## 📋 Complete Form Data Structure

### Required Data Object
```javascript
const completeApplicationData = {
  // Job Information (Required)
  jobTitle: "Software Developer",
  comments: "I am very interested in this position and would love to contribute to your team.", // Optional
  
  // Personal Information (Required)
  personalInfo: {
    name: "John Doe",
    dateOfBirth: "1990-01-15",
    age: 34,
    governorate: "Cairo",
    area: "Maadi",
    gender: "ذكر", // "ذكر" or "أنثى"
    address: "123 Main Street, City, State",
    nationalId: "12345678901234",
    nationality: "Egyptian",
    whatsappNumber: "+201234567890",
    mobileNumber: "+201234567890",
    email: "john.doe@example.com", // Optional
    emergencyNumber: "+0987654321",
    militaryServiceStatus: "Completed", // Only for males: "Completed", "Exempt", "Pending"
    socialStatus: "Single", // "Single", "Married", "Divorced", "Widowed (male)", "Widowed (female)"
    hasVehicle: true,
    drivingLicense: "Class B"
  },
  
  // Work Experience (Optional - Array)
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
  ],
  
  // Current Job (Optional)
  currentJob: {
    isCurrentlyEmployed: true,
    company: "Current Company",
    role: "Senior Developer", 
    salary: "70000"
  },
  
  // Skills (Optional)
  skills: {
    predefined: {
      word: "excellent",      // "weak", "good", "very_good", "excellent"
      excel: "good",
      powerpoint: "very_good"
    },
    custom: [
      {
        name: "JavaScript",
        level: "excellent"     // "weak", "good", "very_good", "excellent"
      },
      {
        name: "React",
        level: "very_good"
      }
    ]
  },
  
  // Languages (Optional)
  languages: {
    english: "fluent",        // "beginner", "intermediate", "advanced", "fluent", "native"
    additional: [
      {
        name: "Spanish",
        level: "intermediate"  // "beginner", "intermediate", "advanced", "fluent", "native"
      },
      {
        name: "French", 
        level: "beginner"
      }
    ]
  },
  
  // Company Relationships (Optional)
  companyRelationships: {
    hasRelationship: true,
    contactName: "Jane Smith",
    contactPosition: "HR Manager"
  },
  
  // Education (Optional - Array)
  education: [
    {
      institution: "University of Technology",
      department: "Computer Science",
      grade: "Bachelor's Degree",
      fromDate: "2016",
      toDate: "2020"
    }
  ]
};

// Files (Optional)
const applicationFiles = {
  cv: fileInputCV.files[0],           // PDF/DOC file
  profileImage: fileInputImage.files[0] // JPG/PNG/GIF file
};
```

---

## 🔄 Frontend Form Management Strategy

### 1. Local State Management
```javascript
// Keep all form data in local state
const [applicationData, setApplicationData] = useState(initialFormData);
const [applicationFiles, setApplicationFiles] = useState({});
const [isSubmitting, setIsSubmitting] = useState(false);

// Update form data as user   
const updateFormData = (section, field, value) => {
  setApplicationData(prev => ({
    ...prev,
    [section]: {
      ...prev[section],
      [field]: value
    }
  }));
};
```

### 2. Local Storage for Draft Saving
```javascript
// Save draft to localStorage
const saveDraft = () => {
  localStorage.setItem('applicationDraft', JSON.stringify(applicationData));
};

// Load draft from localStorage
const loadDraft = () => {
  const draft = localStorage.getItem('applicationDraft');
  if (draft) {
    setApplicationData(JSON.parse(draft));
  }
};

// Auto-save every 30 seconds
useEffect(() => {
  const interval = setInterval(saveDraft, 30000);
  return () => clearInterval(interval);
}, [applicationData]);
```

### 3. Form Validation Before Submission
```javascript
const validateApplication = (data) => {
  const errors = {};
  
  // Required fields validation
  if (!data.jobTitle) errors.jobTitle = 'Job title is required';
  if (!data.personalInfo?.name) errors.name = 'Name is required';
  if (!data.personalInfo?.phoneNumber) errors.phone = 'Phone number is required';
  
  // Email validation if provided
  if (data.personalInfo?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.personalInfo.email)) {
      errors.email = 'Invalid email format';
    }
  }
  
  return errors;
};

const handleSubmit = async () => {
  const validationErrors = validateApplication(applicationData);
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    await submitCompleteApplication(applicationData, applicationFiles);
    
    // Clear draft after successful submission
    localStorage.removeItem('applicationDraft');
    
    // Show success message or redirect
    showSuccessMessage('Application submitted successfully!');
    
  } catch (error) {
    showErrorMessage('Failed to submit application. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## 🛡️ Error Handling

### Backend Response Handling
```javascript
const handleSubmissionResponse = async (response) => {
  const result = await response.json();
  
  if (!response.ok) {
    switch (response.status) {
      case 400:
        throw new Error('Invalid application data: ' + result.message);
      case 413:
        throw new Error('Files too large. Please reduce file sizes.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error('Submission failed: ' + result.message);
    }
  }
  
  return result;
};
```

---

## 📱 Multi-Step Form with Single Submission

### Step Navigation Without Saving
```javascript
const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialData);
  
  // Navigation between steps (no API calls)
  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  
  // Only submit when user clicks final submit
  const handleFinalSubmit = async () => {
    await submitCompleteApplication(formData, files);
  };
  
  return (
    <div>
      {currentStep === 1 && <PersonalInfoStep data={formData} onChange={setFormData} />}
      {currentStep === 2 && <ExperienceStep data={formData} onChange={setFormData} />}
      {currentStep === 3 && <SkillsStep data={formData} onChange={setFormData} />}
      {currentStep === 4 && <ReviewStep data={formData} onSubmit={handleFinalSubmit} />}
      
      <div>
        {currentStep > 1 && <button onClick={prevStep}>Previous</button>}
        {currentStep < 4 && <button onClick={nextStep}>Next</button>}
        {currentStep === 4 && <button onClick={handleFinalSubmit}>Submit Application</button>}
      </div>
    </div>
  );
};
```

---

## ✅ Key Benefits Summary

1. **Atomic Transactions**: Database ensures all-or-nothing saves
2. **No Dirty Data**: No partial applications stored
3. **Better Performance**: Single request vs multiple API calls
4. **Offline Capability**: Users can complete forms offline, submit when online
5. **Better UX**: Users can review everything before final submission
6. **Data Integrity**: Referential integrity maintained across all tables

---

## 🔧 Testing the Submission

### Using Postman or cURL
```bash
curl -X POST http://localhost:5000/api/applications/submit \
  -F 'jobTitle=Software Developer' \
  -F 'personalInfo={"name":"John Doe","phoneNumber":"+1234567890"}' \
  -F 'experiences=[{"company":"Tech Corp","role":"Developer"}]' \
  -F 'cv=@/path/to/resume.pdf' \
  -F 'profileImage=@/path/to/photo.jpg'
```

Your backend is already optimized for single-request submissions with full transaction support! 🚀

---

## 📋 Valid Values Reference

### Education Status Values
```javascript
const educationStatusOptions = [
  'higher-qualification',           // مؤهل عالي
  'above-intermediate-qualification', // مؤهل فوق متوسط
  'preparatory',                   // إعدادية
  'primary',                       // ابتدائية
  'illiterate',                    // محو أمية
  'no-qualification'               // بدون مؤهل
];
```

### Area/District Options
```javascript
const areaOptions = [
  'وسط البلد',
  'المعادي',
  'مصر الجديدة',
  'الزمالك',
  'المهندسين',
  'الدقي',
  'الجيزة',
  'شبرا',
  'مدينة نصر',
  'التجمع الخامس',
  'الشيخ زايد',
  'أكتوبر',
  'العبور',
  'القاهرة الجديدة',
  'أخرى'
];
```

### Gender Values
```javascript
const genderOptions = [
  'ذكر',  // Male
  'أنثى'  // Female
];
```

### Military Service Status (Males Only)
```javascript
const militaryServiceOptions = [
  'Completed',
  'Exempt',
  'Pending'
];
```

### Social Status
```javascript
const socialStatusOptions = [
  'Single',
  'Married',
  'Divorced',
  'Widowed (male)',   // For males
  'Widowed (female)'  // For females
];
```
