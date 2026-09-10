# Resume API

## 1. Purpose

The Resume API manages resumes uploaded by authenticated users.

It provides functionality for:

* Resume upload.
* File validation.
* Secure file storage.
* Text extraction.
* Resume parsing.
* Structured resume data.
* Resume listing.
* Resume retrieval.
* Resume deletion.
* Resume processing status.

The Resume API provides the Resume data required by the Analysis Engine.

---

# 2. Base URL

All Resume endpoints are versioned under:

```text
/api/v1
```

Resume endpoints use:

```text
/api/v1/resumes
```

---

# 3. Authentication

All Resume endpoints require authentication.

Request:

```http
Authorization: Bearer <access_token>
```

The backend must identify the authenticated user before processing the request.

Every Resume must belong to exactly one user.

---

# 4. Endpoint Summary

| Method | Endpoint              | Purpose               |
| ------ | --------------------- | --------------------- |
| POST   | `/resumes`            | Upload a Resume       |
| GET    | `/resumes`            | List user's Resumes   |
| GET    | `/resumes/:id`        | Get Resume details    |
| GET    | `/resumes/:id/status` | Get processing status |
| DELETE | `/resumes/:id`        | Delete a Resume       |

---

# 5. Supported File Formats

Initial supported formats:

```text
PDF
DOCX
TXT
```

The backend must validate both:

* File extension.
* Actual MIME/content type.

The extension alone must never be considered sufficient validation.

---

# 6. Upload Resume

## Endpoint

```http
POST /api/v1/resumes
```

## Content Type

```http
multipart/form-data
```

## Headers

```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

## Multipart Field

```text
file
```

Example:

```text
file = resume.pdf
```

---

# 7. Upload Flow

```text
Flutter
   ↓
Select Resume
   ↓
Multipart Upload
   ↓
Authentication
   ↓
Ownership/User Resolution
   ↓
File Validation
   ↓
Secure File Storage
   ↓
Create Resume Record
   ↓
Text Extraction
   ↓
Resume Parser
   ↓
Skill/Experience Extraction
   ↓
Structured Resume Data
   ↓
MongoDB
```

---

# 8. File Validation

The backend must validate:

### Extension

```text
.pdf
.docx
.txt
```

### MIME Type

The server should verify the actual MIME type.

### File Size

A configurable maximum should be enforced.

Example:

```env
MAX_RESUME_FILE_SIZE_MB=10
```

### File Content

The backend should reject:

* Empty files.
* Corrupted files.
* Files with no extractable text.
* Unsupported file formats.
* Suspicious or malformed content.

---

# 9. Upload Response

Because document processing may take time, the API should return an asynchronous processing response.

## HTTP 202 Accepted

```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "66f111111111",
      "fileName": "resume.pdf",
      "fileType": "application/pdf",
      "status": "processing",
      "progress": 0
    }
  },
  "message": "Resume uploaded and processing started"
}
```

---

# 10. Resume Processing States

The Resume entity should support:

```text
uploaded
processing
processed
failed
```

Optional internal processing stages:

```text
validating
extracting_text
parsing
normalizing
saving
```

---

# 11. Resume Processing Pipeline

```text
Resume File
    ↓
File Validation
    ↓
Text Extraction
    ↓
Text Cleaning
    ↓
Resume Parser
    ↓
Structured Resume
    ↓
Skill Normalization
    ↓
Experience Extraction
    ↓
Education Extraction
    ↓
Project Extraction
    ↓
Certification Extraction
    ↓
Keyword Extraction
    ↓
MongoDB
```

---

# 12. Resume Structured Data

A processed Resume should contain structured information.

Example:

```json
{
  "personal": {
    "name": "Example User",
    "email": "user@example.com"
  },
  "summary": "Flutter developer with experience building mobile applications.",
  "skills": [
    "Flutter",
    "Dart",
    "Firebase",
    "Node.js",
    "MongoDB"
  ],
  "experience": [
    {
      "company": "Example Company",
      "role": "Flutter Developer Intern",
      "startDate": "2025-05",
      "endDate": "2026-06",
      "description": "Developed Flutter applications and integrated backend APIs."
    }
  ],
  "education": [
    {
      "degree": "Bachelor's Degree",
      "field": "Electronics and Communication Engineering"
    }
  ],
  "projects": [
    {
      "name": "Example Project",
      "technologies": [
        "Flutter",
        "Firebase"
      ],
      "description": "Mobile application project."
    }
  ],
  "certifications": []
}
```

The parser must preserve the distinction between information explicitly present in the Resume and information inferred by processing.

---

# 13. Evidence Preservation

Important parsed information should maintain evidence where practical.

Example:

```json
{
  "skill": "Flutter",
  "source": {
    "section": "Skills",
    "text": "Flutter, Dart, Firebase"
  }
}
```

Evidence allows the Matching Engine to explain why a skill was considered matched.

---

# 14. Get Resume Status

## Endpoint

```http
GET /api/v1/resumes/:id/status
```

Example:

```http
GET /api/v1/resumes/66f111111111/status
```

## Response

```json
{
  "success": true,
  "data": {
    "id": "66f111111111",
    "status": "processing",
    "progress": 60
  }
}
```

When completed:

```json
{
  "success": true,
  "data": {
    "id": "66f111111111",
    "status": "processed",
    "progress": 100
  }
}
```

---

# 15. List Resumes

## Endpoint

```http
GET /api/v1/resumes
```

## Query Parameters

```text
?page=1&limit=20
```

Example:

```http
GET /api/v1/resumes?page=1&limit=20
```

## Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "66f111111111",
        "fileName": "resume.pdf",
        "status": "processed",
        "createdAt": "2026-09-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

The list endpoint should return lightweight Resume metadata.

It should not return the complete extracted text for every Resume.

---

# 16. Get Resume

## Endpoint

```http
GET /api/v1/resumes/:id
```

Example:

```http
GET /api/v1/resumes/66f111111111
```

## Response

```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "66f111111111",
      "fileName": "resume.pdf",
      "fileType": "application/pdf",
      "status": "processed",
      "parsedData": {
        "skills": [
          "Flutter",
          "Dart",
          "Firebase",
          "Node.js",
          "MongoDB"
        ],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": []
      },
      "createdAt": "2026-09-10T10:00:00.000Z",
      "updatedAt": "2026-09-10T10:02:00.000Z"
    }
  }
}
```

---

# 17. Extracted Text

Extracted text should not automatically be returned in every API response.

Reasons:

* Resume text can be large.
* Resume data may contain personal information.
* It increases response size.
* Most Flutter screens only require structured Resume data.

If raw extracted text is required in the future, it should use an explicitly authorized endpoint or parameter.

---

# 18. Delete Resume

## Endpoint

```http
DELETE /api/v1/resumes/:id
```

Example:

```http
DELETE /api/v1/resumes/66f111111111
```

## Response

```json
{
  "success": true,
  "data": null,
  "message": "Resume deleted successfully"
}
```

Deletion should remove or schedule removal of:

* Resume database record.
* Stored Resume file.
* Extracted text.
* Derived data that is no longer required.

Any existing Analysis records referencing the Resume must follow the application's defined retention policy.

---

# 19. Ownership Verification

Every Resume query must include the authenticated user's ID.

Correct:

```text
findOne({
    _id: resumeId,
    userId: authenticatedUserId
})
```

Incorrect:

```text
findOne({
    _id: resumeId
})
```

without a separate ownership check.

This prevents one user from accessing another user's Resume.

---

# 20. Secure File Storage

Resume files must not be stored as publicly accessible files.

Recommended architecture:

```text
Flutter
   ↓
Node.js API
   ↓
File Validation
   ↓
Private Object Storage
   ↓
Resume Metadata → MongoDB
```

The database should store a secure file reference such as:

```json
{
  "fileUrl": "<private-storage-reference>"
}
```

The actual storage implementation may use an object-storage provider.

---

# 21. File Security

The system should protect against:

* Path traversal.
* Malicious filenames.
* MIME spoofing.
* Oversized files.
* Malformed documents.
* Malicious document content.
* Public file exposure.

Uploaded files should be renamed using server-generated identifiers.

Example:

```text
user_resume_66f111111111.pdf
```

or preferably an opaque generated storage key.

Original filenames should only be stored as metadata.

---

# 22. Resume Parser Failure

If extraction or parsing fails:

```json
{
  "success": true,
  "data": {
    "resume": {
      "id": "66f111111111",
      "status": "failed",
      "progress": 100
    }
  }
}
```

Internal logs may contain the technical failure reason.

The client should receive a safe user-facing message.

---

# 23. Error Responses

### Invalid File Type

```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "The uploaded Resume format is not supported",
    "details": []
  }
}
```

### File Too Large

```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "The uploaded Resume exceeds the maximum allowed size",
    "details": []
  }
}
```

### Resume Not Found

```json
{
  "success": false,
  "error": {
    "code": "RESUME_NOT_FOUND",
    "message": "Resume not found",
    "details": []
  }
}
```

### Parsing Failed

```json
{
  "success": false,
  "error": {
    "code": "RESUME_PARSING_FAILED",
    "message": "Unable to process the uploaded Resume",
    "details": []
  }
}
```

---

# 24. HTTP Status Codes

| Status | Meaning                        |
| -----: | ------------------------------ |
|    202 | Upload accepted for processing |
|    200 | Request successful             |
|    400 | Invalid request                |
|    401 | Authentication required        |
|    403 | Access denied                  |
|    404 | Resume not found               |
|    413 | File too large                 |
|    415 | Unsupported file type          |
|    422 | Resume processing failed       |
|    429 | Rate limit exceeded            |
|    500 | Internal server error          |

---

# 25. Resume API and Analysis API

A Resume must be successfully processed before it can be used for analysis.

Recommended flow:

```text
Upload Resume
      ↓
status = processing
      ↓
Wait for processing
      ↓
status = processed
      ↓
Select Resume
      ↓
Select Job Description
      ↓
Create Analysis
```

The Analysis API should reject a Resume whose status is not:

```text
processed
```

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESUME_NOT_READY",
    "message": "Resume processing is not complete",
    "details": []
  }
}
```

---

# 26. Resume Privacy

Resume information can contain personal information such as:

* Name.
* Email.
* Phone number.
* Address.
* Employment history.
* Education.
* Skills.
* Certifications.

Therefore the API should:

* Require authentication.
* Enforce ownership.
* Use HTTPS.
* Avoid unnecessary logging.
* Avoid exposing files publicly.
* Secure database access.
* Secure file storage.
* Provide deletion functionality.
* Follow the application's retention policy.

---

# 27. Rate Limiting

Resume upload should be rate-limited to prevent:

* Storage abuse.
* Processing abuse.
* Parser resource exhaustion.
* Excessive AI usage.

Example configuration:

```env
RESUME_UPLOAD_RATE_LIMIT_PER_HOUR=20
```

Actual limits should be configurable.

---

# 28. Backend Architecture

Recommended flow:

```text
Route
  ↓
Authentication Middleware
  ↓
Upload Middleware
  ↓
File Validation
  ↓
Resume Controller
  ↓
Resume Service
  ├── File Service
  ├── Text Extraction Service
  ├── Resume Parser
  └── Normalization Service
  ↓
Resume Repository
  ↓
MongoDB
```

The controller should remain thin and should not contain parsing or AI business logic.

---

# 29. Recommended Resume Model

Conceptual structure:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "fileUrl": "<private-storage-reference>",
  "status": "processed",
  "progress": 100,
  "extractedText": "<private>",
  "parsedData": {
    "personal": {},
    "summary": "",
    "skills": [],
    "experience": [],
    "education": [],
    "projects": [],
    "certifications": []
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

# 30. Future Extensions

Possible future Resume features:

* Multiple Resume versions.
* Resume editing.
* Resume optimization.
* Resume templates.
* Resume export.
* Resume comparison.
* Resume version history.
* AI-powered Resume rewriting.
* Resume quality scoring.
* Resume duplicate detection.
* Resume embedding/vector search.
* Automatic skill taxonomy mapping.
