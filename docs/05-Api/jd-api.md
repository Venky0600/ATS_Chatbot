# Job Description API

## 1. Purpose

The Job Description API manages job descriptions used by the Resume ↔ Job Description matching system.

It allows authenticated users to:

* Create job descriptions from text.
* Upload job description files.
* Parse and structure job descriptions.
* View saved job descriptions.
* Retrieve a specific job description.
* Delete job descriptions.
* Reuse saved job descriptions for multiple resume analyses.

All job description resources are private to the authenticated user unless future sharing functionality is explicitly introduced.

---

## 2. Base URL

All endpoints are versioned under:

```text
/api/v1
```

Job Description endpoints use:

```text
/api/v1/job-descriptions
```

Example:

```text
POST https://api.example.com/api/v1/job-descriptions
```

Production communication must use HTTPS.

---

## 3. Authentication

All Job Description endpoints require authentication.

The client must send the authenticated user's access token:

```http
Authorization: Bearer <access_token>
```

The backend must:

1. Validate the token.
2. Resolve the authenticated user.
3. Attach the user identity to the request.
4. Enforce ownership for all Job Description resources.

A user must never be able to access or modify another user's Job Description by changing an ID in the request.

---

# 4. Endpoint Summary

| Method | Endpoint                   | Purpose                            |
| ------ | -------------------------- | ---------------------------------- |
| POST   | `/job-descriptions`        | Create a Job Description from text |
| POST   | `/job-descriptions/upload` | Upload a Job Description file      |
| GET    | `/job-descriptions`        | List user's Job Descriptions       |
| GET    | `/job-descriptions/:id`    | Get a specific Job Description     |
| DELETE | `/job-descriptions/:id`    | Delete a Job Description           |

---

# 5. Create Job Description

## Endpoint

```http
POST /api/v1/job-descriptions
```

Creates a Job Description from user-provided text.

## Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Request Body

```json
{
  "title": "Flutter Developer",
  "company": "Example Technologies",
  "rawText": "We are looking for a Flutter Developer with experience in Dart, Firebase, REST APIs and MongoDB.",
  "sourceUrl": "https://example.com/jobs/flutter-developer"
}
```

### Fields

| Field       | Type   | Required | Description                  |
| ----------- | ------ | -------: | ---------------------------- |
| `title`     | String |      Yes | Job title                    |
| `company`   | String |       No | Company name                 |
| `rawText`   | String |      Yes | Complete Job Description     |
| `sourceUrl` | String |       No | Original Job Description URL |

---

# 6. Job Description Processing

After creation, the backend should process the Job Description.

Processing pipeline:

```text
Raw Job Description
        ↓
Validation
        ↓
Text Cleaning
        ↓
Job Description Parser
        ↓
Skill Extraction
        ↓
Keyword Extraction
        ↓
Experience Extraction
        ↓
Education Extraction
        ↓
Role Requirement Extraction
        ↓
Structured Job Description
        ↓
MongoDB
```

The parsing process should identify information such as:

* Required skills.
* Preferred skills.
* Programming languages.
* Frameworks.
* Databases.
* Cloud technologies.
* Tools.
* Years of experience.
* Education requirements.
* Responsibilities.
* Certifications.
* Keywords.
* Role title.
* Seniority level.

---

# 7. Create Job Description Response

## HTTP 201 Created

```json
{
  "success": true,
  "data": {
    "jobDescription": {
      "id": "66f123456789",
      "title": "Flutter Developer",
      "company": "Example Technologies",
      "status": "processed",
      "createdAt": "2026-09-10T10:00:00.000Z"
    }
  },
  "message": "Job description created successfully"
}
```

Possible statuses:

```text
processing
processed
failed
```

---

# 8. Upload Job Description File

## Endpoint

```http
POST /api/v1/job-descriptions/upload
```

Used when the user has a Job Description stored as a file.

## Headers

```http
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

## Multipart Field

```text
file
```

Example supported files:

```text
job-description.pdf
job-description.docx
job-description.txt
```

Allowed formats should be configurable.

Recommended initial formats:

```text
PDF
DOCX
TXT
```

---

# 9. File Upload Validation

The backend must validate:

### File extension

```text
.pdf
.docx
.txt
```

### MIME type

The server must validate the actual file type rather than trusting only the file extension.

### File size

A configurable maximum upload size must be enforced.

Example:

```text
MAX_JD_FILE_SIZE_MB=10
```

### Content validation

The backend should reject:

* Empty files.
* Files with no extractable text.
* Corrupted documents.
* Unsupported formats.
* Suspicious files.

---

# 10. Uploaded File Processing

```text
File Upload
     ↓
Authentication
     ↓
Authorization
     ↓
File Validation
     ↓
Secure Storage
     ↓
Text Extraction
     ↓
JD Parser
     ↓
Structured JD
     ↓
MongoDB
```

The original file should not be exposed through unrestricted public URLs.

---

# 11. List Job Descriptions

## Endpoint

```http
GET /api/v1/job-descriptions
```

Returns the authenticated user's Job Descriptions.

## Query Parameters

```text
?page=1&limit=20
```

Example:

```http
GET /api/v1/job-descriptions?page=1&limit=20
```

## Response

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "66f123456789",
        "title": "Flutter Developer",
        "company": "Example Technologies",
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

The list endpoint should return lightweight records rather than the complete raw Job Description.

---

# 12. Get Job Description

## Endpoint

```http
GET /api/v1/job-descriptions/:id
```

Example:

```http
GET /api/v1/job-descriptions/66f123456789
```

## Response

```json
{
  "success": true,
  "data": {
    "jobDescription": {
      "id": "66f123456789",
      "title": "Flutter Developer",
      "company": "Example Technologies",
      "sourceType": "text",
      "status": "processed",
      "parsedData": {
        "requiredSkills": [
          "Flutter",
          "Dart",
          "Firebase",
          "REST API"
        ],
        "preferredSkills": [
          "MongoDB",
          "Node.js"
        ],
        "experience": {
          "minimumYears": 1
        },
        "education": [
          "Bachelor's degree"
        ]
      },
      "createdAt": "2026-09-10T10:00:00.000Z",
      "updatedAt": "2026-09-10T10:00:00.000Z"
    }
  }
}
```

The API should avoid returning large extracted text by default.

If raw text access is required, it should be explicitly requested and authorized.

---

# 13. Delete Job Description

## Endpoint

```http
DELETE /api/v1/job-descriptions/:id
```

Example:

```http
DELETE /api/v1/job-descriptions/66f123456789
```

The backend must verify that the Job Description belongs to the authenticated user.

## Response

```json
{
  "success": true,
  "data": null,
  "message": "Job description deleted successfully"
}
```

---

# 14. Ownership Rules

Every Job Description query must include the authenticated user's ID.

Conceptually:

```text
findOne({
    _id: jobDescriptionId,
    userId: authenticatedUserId
})
```

Never perform:

```text
findOne({
    _id: jobDescriptionId
})
```

without an ownership check.

This prevents insecure direct object reference vulnerabilities.

---

# 15. Validation Rules

Recommended validation:

### Title

```text
Minimum: 2 characters
Maximum: 200 characters
```

### Company

```text
Maximum: 200 characters
```

### Raw Text

```text
Minimum: configurable
Maximum: configurable
```

The backend should normalize:

* Excessive whitespace.
* Invalid Unicode where appropriate.
* Duplicate line breaks.
* Unsupported control characters.

The original semantic content must not be changed during normalization.

---

# 16. Error Responses

### Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Job description text is required",
    "details": []
  }
}
```

### Not Found

```json
{
  "success": false,
  "error": {
    "code": "JOB_DESCRIPTION_NOT_FOUND",
    "message": "Job description not found",
    "details": []
  }
}
```

### Unsupported File

```json
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_FILE_TYPE",
    "message": "The uploaded file type is not supported",
    "details": []
  }
}
```

### Parsing Failure

```json
{
  "success": false,
  "error": {
    "code": "JD_PARSING_FAILED",
    "message": "Unable to extract a valid job description",
    "details": []
  }
}
```

---

# 17. HTTP Status Codes

| Status | Meaning                    |
| -----: | -------------------------- |
|    201 | Job Description created    |
|    200 | Request successful         |
|    400 | Invalid request            |
|    401 | Authentication required    |
|    403 | Access denied              |
|    404 | Job Description not found  |
|    413 | File too large             |
|    415 | Unsupported file type      |
|    422 | Parsing/processing failure |
|    429 | Rate limit exceeded        |
|    500 | Internal server error      |

---

# 18. Analysis Integration

A Job Description becomes an input to the Analysis API.

Example:

```text
Resume
   +
Job Description
   ↓
POST /api/v1/analyses
   ↓
Matching Engine
```

The analysis request must use the stored Job Description ID rather than sending the complete Job Description again.

Example:

```json
{
  "resumeId": "66f111111111",
  "jobDescriptionId": "66f123456789"
}
```

---

# 19. Security Requirements

The Job Description API must:

* Require authentication.
* Enforce resource ownership.
* Validate all input.
* Validate uploaded files.
* Prevent path traversal.
* Prevent unrestricted file access.
* Apply rate limiting where appropriate.
* Avoid logging sensitive Job Description content.
* Use HTTPS.
* Sanitize source URLs.
* Protect against oversized requests.

---

# 20. Implementation Pattern

Recommended backend flow:

```text
Route
  ↓
Authentication Middleware
  ↓
Validation Middleware
  ↓
Controller
  ↓
JobDescription Service
  ↓
Parser / File Service
  ↓
Repository
  ↓
MongoDB
```

The controller should remain thin.

Business logic should live inside services.

---

# 21. Future Extensions

Possible future features:

* Save jobs from URLs.
* Browser extension integration.
* Job board integrations.
* Job Description deduplication.
* Job Description tagging.
* Favorite jobs.
* Job application tracking.
* Shared Job Descriptions.
* Organization/team workspaces.
* JD version history.
