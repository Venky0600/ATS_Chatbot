# Backend Architecture

## 1. Purpose

This document defines the architecture of the Node.js backend.

The backend is responsible for authentication, authorization, data management, file processing, analysis orchestration, AI integration, matching, ATS analysis, and course recommendations.

---

## 2. Technology Stack

Recommended stack:

```text
Node.js
Express.js
MongoDB
Mongoose
JWT / Session Authentication
Multer
PDF/DOCX Parsers
LLM Provider SDK
Embedding Provider
```

The architecture must keep external AI providers behind service interfaces so providers can be changed without rewriting the application.

---

## 3. Backend Architecture Pattern

The backend follows:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository / Model
  ↓
MongoDB
```

For AI operations:

```text
Controller
   ↓
Analysis Service
   ↓
AI Orchestrator
   ├── Resume Parser
   ├── JD Parser
   ├── Matching Engine
   ├── ATS Engine
   ├── Skill Gap Engine
   ├── LLM Service
   └── Recommendation Service
```

---

## 4. Project Structure

Recommended structure:

```text
src/
│
├── app.js
├── server.js
│
├── config/
│   ├── database.js
│   ├── environment.js
│   └── storage.js
│
├── routes/
│   ├── auth.routes.js
│   ├── resume.routes.js
│   ├── jd.routes.js
│   ├── analysis.routes.js
│   ├── recommendation.routes.js
│   └── user.routes.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── resume.controller.js
│   ├── jd.controller.js
│   ├── analysis.controller.js
│   └── recommendation.controller.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   ├── upload.middleware.js
│   └── validation.middleware.js
│
├── models/
│   ├── user.model.js
│   ├── resume.model.js
│   ├── jobDescription.model.js
│   ├── analysis.model.js
│   └── course.model.js
│
├── repositories/
│   ├── user.repository.js
│   ├── resume.repository.js
│   ├── jd.repository.js
│   └── analysis.repository.js
│
├── services/
│   ├── auth/
│   ├── resume/
│   ├── jd/
│   ├── analysis/
│   ├── matching/
│   ├── ats/
│   ├── ai/
│   └── recommendations/
│
├── parsers/
│   ├── pdf.parser.js
│   ├── docx.parser.js
│   └── text.parser.js
│
├── validators/
│   ├── auth.validator.js
│   ├── resume.validator.js
│   ├── jd.validator.js
│   └── analysis.validator.js
│
└── utils/
    ├── logger.js
    ├── errors.js
    └── response.js
```

---

## 5. Application Entry Point

`server.js` is responsible for starting the HTTP server.

`app.js` is responsible for configuring:

* Express.
* Middleware.
* Routes.
* Error handling.
* Security middleware.

This separation makes testing easier.

---

## 6. API Versioning

All APIs should use versioning.

Example:

```text
/api/v1/auth
/api/v1/resumes
/api/v1/job-descriptions
/api/v1/analyses
/api/v1/recommendations
```

Future versions can then be introduced without immediately breaking existing clients.

---

## 7. Authentication

Authentication providers:

```text
Google
Discord
```

The backend should:

1. Receive authentication information.
2. Verify the provider response.
3. Find or create the user.
4. Create the application's authenticated session.
5. Return the required session information.

The application must not trust arbitrary user IDs sent from Flutter.

---

## 8. Authorization

Every protected resource must belong to the authenticated user.

Example:

```text
Authenticated User
       ↓
Request resumeId
       ↓
Check resume.userId === authenticatedUser.id
       ↓
Allow / Deny
```

A user must never be able to access another user's:

* Resume.
* JD.
* Analysis.
* Recommendations.
* Uploaded files.

---

## 9. Resume Service

Responsibilities:

```text
Upload
Validate
Store
Extract Text
Parse
Normalize
Save
Retrieve
Delete
```

Pipeline:

```text
Resume Upload
      ↓
File Validation
      ↓
Storage
      ↓
Text Extraction
      ↓
Resume Parser
      ↓
Structured Resume
      ↓
MongoDB
```

---

## 10. Resume Parser

The parser converts unstructured resume text into structured information.

Example:

```json
{
  "name": "Candidate Name",
  "summary": "...",
  "skills": [
    "Flutter",
    "Dart",
    "Firebase"
  ],
  "experience": [],
  "education": [],
  "projects": [],
  "certifications": []
}
```

The parser must distinguish between:

* Explicitly stated skills.
* Skills inferred from projects.
* Skills inferred from experience.

Inferences should not be treated as explicit claims without evidence.

---

## 11. Job Description Service

Responsibilities:

* Create JD.
* Accept JD text.
* Upload JD document.
* Extract text.
* Parse JD.
* Normalize requirements.
* Store structured JD.

Example:

```json
{
  "title": "Software Engineer",
  "requiredSkills": [
    "JavaScript",
    "React",
    "Node.js"
  ],
  "preferredSkills": [
    "Docker"
  ],
  "experienceRequirements": [],
  "educationRequirements": [],
  "responsibilities": []
}
```

---

## 12. Analysis Service

The analysis service orchestrates the complete comparison.

```text
Create Analysis
      ↓
Load Resume
      ↓
Load JD
      ↓
Validate Ownership
      ↓
Normalize Data
      ↓
Run Matching
      ↓
Run ATS
      ↓
Calculate Skill Gaps
      ↓
Generate Improvements
      ↓
Generate Recommendations
      ↓
Save Result
      ↓
Return Analysis
```

---

## 13. Matching Service

The matching service performs:

* Exact keyword matching.
* Normalized matching.
* Skill matching.
* Experience matching.
* Project relevance.
* Role alignment.
* Semantic matching.

Example:

```text
Resume Skill:
ReactJS

JD Skill:
React.js
```

Normalization can identify these as equivalent.

---

## 14. Embedding Service

The embedding service converts text into vectors.

Example:

```text
"REST API development"
        ↓
Embedding
        ↓
Vector
```

The system can compare vector similarity between:

```text
Resume Evidence
        ↕
JD Requirement
```

Embeddings should support semantic matching but should not replace deterministic evidence checks.

---

## 15. LLM Service

The backend should use a provider abstraction.

Example:

```text
LLMService
   ↓
Provider Adapter
   ├── Provider A
   ├── Provider B
   └── Provider C
```

This allows the system to change providers without changing the rest of the application.

The LLM is primarily responsible for:

* Explanations.
* Resume improvement wording.
* Gap explanations.
* Learning-path generation.
* Course recommendation reasoning.

---

## 16. ATS Service

The ATS service evaluates resume compatibility.

Potential checks:

```text
File readability
Section structure
Contact information
Keyword coverage
Skill visibility
Experience formatting
Education formatting
Section headings
Date consistency
Potential parsing problems
```

The ATS score should be explainable.

Example:

```text
ATS Score: 84

Good:
✓ Clear section headings
✓ Skills are easy to identify
✓ Experience uses readable formatting

Needs improvement:
⚠ Some JD keywords are missing
⚠ Some project descriptions are too short
```

---

## 17. Skill Gap Service

The service compares:

```text
JD Required Skills
        ↓
Resume Demonstrated Skills
        ↓
Skill Gap
```

Each missing skill should have:

```json
{
  "skill": "React.js",
  "priority": "high",
  "reason": "Required by the JD but not demonstrated in the resume"
}
```

The system must not tell users to falsely add missing skills to their resume.

---

## 18. Resume Improvement Service

Improvements must be evidence-based.

Example:

Current:

```text
Worked on Flutter projects.
```

Possible improvement:

```text
Developed cross-platform Flutter applications and integrated backend services.
```

Only information supported by the candidate's actual resume should be used.

The service must reject or avoid fabricated:

* Experience.
* Certifications.
* Technologies.
* Job titles.
* Achievements.
* Metrics.

---

## 19. Recommendation Service

The recommendation service converts skill gaps into learning recommendations.

Example:

```text
Missing Skill
     ↓
Priority
     ↓
Prerequisites
     ↓
Learning Topics
     ↓
Courses / Resources
     ↓
Learning Path
```

Example:

```text
React.js
  ↓
JavaScript Fundamentals
  ↓
React Components
  ↓
Hooks
  ↓
API Integration
  ↓
React Project
```

---

## 20. Database Layer

MongoDB access should be isolated through models/repositories.

Controllers should not contain large database queries.

Preferred:

```text
Controller
   ↓
Service
   ↓
Repository
   ↓
Model
```

This keeps business logic testable and maintainable.

---

## 21. Error Handling

The backend should use centralized error handling.

Error categories:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Rate Limited
500 Internal Server Error
```

Responses should use a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESUME_NOT_FOUND",
    "message": "Resume not found"
  }
}
```

Internal implementation details must not be exposed to clients.

---

## 22. Validation

Every external input must be validated.

Validation is required for:

* Authentication input.
* File uploads.
* Resume IDs.
* JD IDs.
* Analysis requests.
* Pagination.
* Query parameters.

Never trust client-provided values.

---

## 23. File Upload Security

Uploaded files must be checked for:

* File extension.
* MIME type.
* File size.
* Empty files.
* Parsing errors.

The backend should define maximum file sizes.

Example:

```text
PDF: allowed
DOCX: allowed
TXT: allowed
EXE: rejected
JS: rejected
Unknown binary: rejected
```

Uploaded files should not be executed by the backend.

---

## 24. Rate Limiting

AI analysis endpoints should have stricter rate limits because they can consume significant resources.

Example:

```text
Normal API:
Higher request limit

AI Analysis:
Lower request limit
```

Limits should be configurable.

---

## 25. Analysis Idempotency

Repeated requests should not unnecessarily create duplicate expensive AI operations.

Where appropriate, the backend may identify duplicate combinations:

```text
resumeId + jobDescriptionId + resumeVersion + jdVersion
```

and reuse an existing completed analysis.

---

## 26. Logging

Backend logs should include:

```text
Request ID
User ID
Endpoint
HTTP status
Processing duration
Error code
```

Logs must not contain:

* Passwords.
* API keys.
* Authentication secrets.
* Full resume contents unless explicitly required for debugging and protected appropriately.

---

## 27. Environment Configuration

Example:

```text
NODE_ENV
PORT
MONGODB_URI
AUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
DISCORD_CLIENT_ID
DISCORD_CLIENT_SECRET
LLM_API_KEY
EMBEDDING_API_KEY
STORAGE_CONFIG
```

Secrets must never be committed to Git.

A `.env.example` file may document required variable names without real secret values.

---

## 28. Backend Testing

Testing should include:

### Unit Tests

* Score calculation.
* Skill normalization.
* Matching logic.
* Validators.
* Recommendation logic.

### Integration Tests

* Authentication.
* Resume upload.
* JD creation.
* Analysis creation.
* Analysis retrieval.

### Security Tests

* Unauthorized access.
* Cross-user resource access.
* Invalid file upload.
* Invalid IDs.
* Rate-limit behavior.

---

## 29. Backend Design Principles

The backend must follow:

1. Thin controllers.
2. Strong service boundaries.
3. Centralized validation.
4. Centralized error handling.
5. User ownership checks.
6. Provider abstraction.
7. Explainable AI.
8. Secure file handling.
9. Versioned APIs.
10. Testable business logic.

---

## 30. Future Backend Improvements

Future versions may introduce:

* Background workers.
* Redis caching.
* Job queues.
* WebSocket/SSE analysis progress.
* Multiple AI providers.
* AI usage tracking.
* Cost monitoring.
* Advanced recommendation ranking.
* Job recommendation APIs.
* Resume versioning.
* Analytics dashboards.
