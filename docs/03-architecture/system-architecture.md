# System Architecture

## 1. Purpose

This document defines the high-level system architecture of the AI Resume and Job Description Matching Platform.

The platform allows users to:

* Sign in using Google or Discord.
* Upload a resume.
* Enter or upload a Job Description (JD).
* Compare the resume against the JD.
* Calculate an explainable job-match score.
* Perform ATS-style analysis.
* Identify matched and missing skills.
* Identify experience and project gaps.
* Suggest truthful resume improvements.
* Recommend skills and learning courses.
* View previous analyses.

The architecture is designed to be modular, secure, scalable, and suitable for future AI features.

---

## 2. Architecture Overview

The system follows a client-server architecture.

```text
┌───────────────────────────────┐
│        Flutter Mobile App     │
│                               │
│  Authentication               │
│  Resume Management            │
│  JD Management                │
│  Analysis Dashboard           │
│  Skill Gaps                   │
│  Course Recommendations       │
│  Analysis History             │
└───────────────┬───────────────┘
                │ HTTPS / REST API
                ▼
┌────────────────────────────────────┐
│       Node.js + Express Backend     │
│                                    │
│  Authentication                    │
│  Resume Service                    │
│  JD Service                        │
│  Analysis Service                  │
│  Matching Engine                   │
│  ATS Engine                        │
│  AI Services                       │
│  Recommendation Service            │
└───────────────┬────────────────────┘
                │
       ┌────────┴─────────┐
       ▼                  ▼
┌───────────────┐  ┌─────────────────┐
│   MongoDB     │  │  File Storage   │
│               │  │                 │
│ Users         │  │ Resume files    │
│ Resumes       │  │ JD files        │
│ JDs           │  │ Processed docs  │
│ Analyses      │  │                 │
│ Courses       │  └─────────────────┘
└───────────────┘
                │
                ▼
┌────────────────────────────────────┐
│             AI Layer               │
│                                    │
│ Document Parser                    │
│ Resume Parser                      │
│ JD Parser                          │
│ Embedding Service                  │
│ Semantic Matching                  │
│ LLM Reasoning                      │
│ Resume Improvement                 │
│ Course Recommendation              │
└────────────────────────────────────┘
```

---

## 3. Major System Components

### 3.1 Flutter Mobile Application

The Flutter application is the primary user interface.

Responsibilities:

* Authentication UI.
* Resume upload.
* Resume preview and management.
* Job Description input.
* JD upload.
* Analysis initiation.
* Analysis result visualization.
* Skill-gap visualization.
* Resume improvement suggestions.
* Course recommendations.
* Analysis history.
* User profile and settings.

The mobile application must not directly communicate with MongoDB or the LLM provider.

All protected operations must go through the backend API.

---

## 4. Node.js Backend

The Node.js backend acts as the main application server.

Responsibilities:

* Authentication verification.
* User authorization.
* Resume processing.
* JD processing.
* File handling.
* Database operations.
* Analysis orchestration.
* Matching calculations.
* ATS calculations.
* AI service communication.
* Course recommendation generation.
* API validation.
* Error handling.
* Logging and monitoring.

The backend is the security and business-logic boundary of the system.

---

## 5. Authentication Architecture

The platform supports:

* Google authentication.
* Discord authentication.

Authentication flow:

```text
User
 ↓
Flutter App
 ↓
Google / Discord
 ↓
Authentication Result
 ↓
Backend
 ↓
Verify Identity
 ↓
Create / Find User
 ↓
Issue Application Session
 ↓
Flutter
```

The backend must never blindly trust client-provided user identity information.

---

## 6. Database

MongoDB is used as the primary application database.

Main collections:

```text
users
resumes
jobDescriptions
analyses
courses
```

The database stores structured application data and analysis results.

Large binary files should not be stored directly inside normal MongoDB documents unless a specific storage strategy such as GridFS is intentionally selected.

A dedicated object/file storage service is recommended for production.

---

## 7. File Storage

Resume and JD files may include:

* PDF
* DOCX
* TXT

The file-processing pipeline is:

```text
Upload
 ↓
Validate file type
 ↓
Validate file size
 ↓
Store file
 ↓
Extract text
 ↓
Parse document
 ↓
Normalize content
 ↓
Store structured representation
```

The original file should remain associated with the user and corresponding document record.

---

## 8. AI Architecture

The AI system is divided into multiple responsibilities instead of allowing one LLM call to perform the entire analysis.

```text
Resume
   ↓
Text Extraction
   ↓
Resume Structuring
   ↓
Skill Normalization
   ↓
        ┌─────────────────┐
JD ────►│ JD Structuring  │
        └────────┬────────┘
                 ↓
        Matching Engine
                 ↓
        ATS Engine
                 ↓
        Skill Gap Engine
                 ↓
        LLM Explanation
                 ↓
        Course Recommendation
                 ↓
        Final Analysis
```

This separation improves explainability and reduces hallucination risk.

---

## 9. Matching Architecture

The platform uses a hybrid matching system.

### Exact Matching

Detects direct matches.

Example:

```text
Resume: Flutter
JD: Flutter
```

Result:

```text
Exact Match
```

### Normalized Matching

Handles equivalent terminology.

Example:

```text
Resume: Node
JD: Node.js
```

Result:

```text
Normalized Match
```

### Semantic Matching

Detects related concepts.

Example:

```text
Resume:
REST API development

JD:
Experience building backend APIs
```

These concepts may be semantically related even though the exact words differ.

### LLM Explanation

The LLM explains why a match or gap exists.

The LLM should not independently determine the final score without evidence from the matching engine.

---

## 10. Score Architecture

The platform should expose multiple scores rather than one unexplained number.

Example:

```text
Overall Match Score
ATS Compatibility Score
Skill Match Score
Keyword Match Score
Experience Match Score
Education Match Score
Project Relevance Score
Role Alignment Score
```

The initial scoring model can be configured as:

```text
Skill Match          35%
Experience Match     20%
Keyword Match        15%
Education Match      10%
Project Relevance    10%
Role Alignment       10%
--------------------------------
Overall              100%
```

ATS compatibility remains a separate score because ATS formatting compatibility and job relevance are different concepts.

The weights must be configurable so they can be recalibrated after testing against real examples.

---

## 11. Analysis Processing

An analysis has a lifecycle.

```text
PENDING
   ↓
PROCESSING
   ↓
COMPLETED
```

Failure state:

```text
PROCESSING
   ↓
FAILED
```

Example analysis status:

```json
{
  "status": "processing",
  "progress": 60
}
```

This allows the Flutter application to show meaningful progress instead of appearing frozen during long AI operations.

---

## 12. Security Boundary

The architecture follows this rule:

```text
Flutter
   ↓
Authenticated API
   ↓
Authorization
   ↓
Business Logic
   ↓
Database / AI / Storage
```

The client must never have direct access to:

* MongoDB credentials.
* LLM API keys.
* File-storage credentials.
* Internal service credentials.

Secrets must remain on the backend.

---

## 13. Scalability

The initial MVP may process analysis through the backend service.

For higher traffic, analysis can be moved to background workers.

Future architecture:

```text
Flutter
   ↓
API Server
   ↓
Create Analysis Job
   ↓
Queue
   ↓
Worker
   ├── Resume Parser
   ├── JD Parser
   ├── Matching
   ├── ATS
   ├── AI
   └── Recommendations
   ↓
MongoDB
   ↓
Flutter retrieves result
```

This prevents long-running AI operations from blocking normal API requests.

---

## 14. Observability

The backend should record:

* API request logs.
* Authentication errors.
* File-processing errors.
* AI provider errors.
* Analysis duration.
* Analysis failures.
* Database errors.
* Recommendation failures.

Sensitive document content must not be unnecessarily written into application logs.

---

## 15. Deployment Architecture

Recommended production structure:

```text
Flutter App
    ↓
HTTPS
    ↓
Backend API
    ↓
MongoDB
    +
File Storage
    +
AI Providers
```

Environment-specific configuration:

```text
Development
Staging
Production
```

Secrets must be managed through environment variables or a secure secret-management system.

---

## 16. Architectural Principles

The system must follow these principles:

1. Backend-first security.
2. Modular AI services.
3. Explainable scoring.
4. Evidence-based AI responses.
5. No fabricated resume information.
6. User data isolation.
7. Provider abstraction.
8. Validated file processing.
9. API versioning.
10. Scalable analysis processing.

---

## 17. Future Extensions

The architecture should allow future features such as:

* Multiple resumes.
* Multiple JDs.
* Resume version comparison.
* Job application tracking.
* Interview preparation.
* Interview question generation.
* Cover-letter generation.
* LinkedIn profile analysis.
* Resume builder.
* Skill roadmap.
* Personalized learning plans.
* Job recommendation engine.
* Application success analytics.
