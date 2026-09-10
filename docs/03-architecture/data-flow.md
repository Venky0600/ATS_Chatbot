# Data Flow

## 1. Purpose

This document describes how data moves through the Resume and Job Description Matching Platform.

The main flow is:

```text
User
 ↓
Flutter App
 ↓
Node.js API
 ↓
Processing Services
 ↓
MongoDB / File Storage / AI Services
 ↓
Analysis Result
 ↓
Flutter App
```

---

## 2. Authentication Flow

```text id="0o4q4p"
User
 ↓
Flutter Login Screen
 ↓
Google / Discord
 ↓
Authentication Provider
 ↓
Authentication Response
 ↓
Node.js Backend
 ↓
Verify Identity
 ↓
Find/Create User
 ↓
Create Application Session
 ↓
Flutter
 ↓
Authenticated Home
```

The backend must verify authentication information before creating an authenticated application session.

---

## 3. User Creation Flow

```text id="3g0z6p"
Authentication Provider
        ↓
Verified Identity
        ↓
Backend
        ↓
Search users
        ↓
Existing?
   ┌────┴────┐
  Yes        No
   │          │
   │      Create User
   │          │
   └────┬─────┘
        ↓
Return Session
```

---

## 4. Resume Upload Flow

```text id="5u6qbe"
Flutter
  ↓
Select Resume
  ↓
Validate Basic File Information
  ↓
POST /api/v1/resumes
  ↓
Backend Authentication
  ↓
Authorization
  ↓
File Validation
  ↓
File Storage
  ↓
Text Extraction
  ↓
Resume Parsing
  ↓
Skill Normalization
  ↓
Structured Resume
  ↓
MongoDB
  ↓
Resume Ready
  ↓
Flutter
```

---

## 5. Resume Processing States

A resume can move through:

```text id="8d6jzq"
UPLOADED
   ↓
EXTRACTING
   ↓
PARSING
   ↓
NORMALIZING
   ↓
READY
```

Failure:

```text
PROCESSING
   ↓
FAILED
```

The database should store the current processing status.

---

## 6. JD Submission Flow

A JD can be entered as text or uploaded as a file.

### Text Flow

```text id="k2o5xw"
Flutter
  ↓
JD Text
  ↓
POST /api/v1/job-descriptions
  ↓
Validate
  ↓
Parse
  ↓
Normalize
  ↓
MongoDB
  ↓
JD Ready
```

### File Flow

```text id="1w5s3f"
Flutter
  ↓
JD File
  ↓
Backend
  ↓
File Validation
  ↓
Storage
  ↓
Text Extraction
  ↓
JD Parser
  ↓
Normalization
  ↓
MongoDB
```

---

## 7. Analysis Creation Flow

The user selects:

```text
Resume
+
Job Description
```

Then starts analysis.

```text id="t9w2k1"
Flutter
  ↓
Select Resume
  ↓
Select JD
  ↓
Start Analysis
  ↓
POST /api/v1/analyses
  ↓
Authenticate User
  ↓
Verify Resume Ownership
  ↓
Verify JD Ownership
  ↓
Create Analysis Record
  ↓
Start Processing
```

---

## 8. Analysis Processing Flow

```text id="q5v9m1"
Analysis
   ↓
Load Structured Resume
   ↓
Load Structured JD
   ↓
Skill Normalization
   ↓
Exact Matching
   ↓
Normalized Matching
   ↓
Semantic Matching
   ↓
Evidence Generation
   ↓
Score Calculation
   ↓
ATS Analysis
   ↓
Skill Gap Analysis
   ↓
LLM Explanation
   ↓
Resume Improvements
   ↓
Learning Recommendations
   ↓
Final Result
   ↓
MongoDB
```

---

## 9. Detailed Matching Flow

```text id="p7w4n2"
JD Requirement
       ↓
Normalize Requirement
       ↓
Search Resume Evidence
       ↓
Exact Match?
   ┌───┴───┐
  Yes      No
   │        │
Matched   Semantic Search
            ↓
        Similarity High?
          ┌──┴──┐
         Yes    No
          │      │
       Partial   Missing
```

The actual status should consider evidence and requirement importance rather than similarity alone.

---

## 10. Score Calculation Flow

```text id="z4k8m7"
Matching Results
      ↓
Skill Score
      ↓
Experience Score
      ↓
Keyword Score
      ↓
Education Score
      ↓
Project Score
      ↓
Role Alignment Score
      ↓
Weighted Calculation
      ↓
Overall Match Score
```

Example:

```text id="4k5n6p"
Skill Match       = 82
Experience Match  = 70
Keyword Match     = 80
Education Match   = 90
Project Match     = 75
Role Alignment    = 72
```

The backend calculates the final weighted score.

---

## 11. ATS Flow

```text id="6z3p4q"
Resume
  ↓
ATS Parser
  ↓
Section Analysis
  ↓
Formatting Analysis
  ↓
Keyword Analysis
  ↓
Readability Analysis
  ↓
ATS Score
  ↓
ATS Issues
  ↓
ATS Suggestions
```

ATS analysis is stored separately from the overall job-match score.

---

## 12. Skill Gap Flow

```text id="8m1q5r"
JD Skills
   ↓
Normalize
   ↓
Compare With Resume Skills
   ↓
Matched
Partial
Missing
   ↓
Prioritize Missing Skills
   ↓
Skill Gap Result
```

Example:

```text
Required:
Flutter ✓
Dart ✓
React ✗
Docker ✗
AWS ✗
```

---

## 13. Resume Improvement Flow

```text id="d5f8p2"
Resume Evidence
      +
JD Requirement
      ↓
Identify Weak Description
      ↓
LLM Improvement
      ↓
Validate Against Resume Evidence
      ↓
Improved Wording
```

The validation stage is important.

The system must not generate an improvement that introduces unsupported facts.

---

## 14. Course Recommendation Flow

```text id="n7k2v9"
Missing Skills
      ↓
Priority Calculation
      ↓
Prerequisite Detection
      ↓
Learning Path
      ↓
Course / Resource Search
      ↓
Relevance Ranking
      ↓
Recommendations
```

Example:

```text
Missing:
React.js

Learning Path:
JavaScript
 ↓
React
 ↓
Hooks
 ↓
API Integration
 ↓
Project
```

---

## 15. Final Analysis Flow

```text id="r4t6y1"
Resume + JD
      ↓
Matching Engine
      ↓
Score Engine
      ↓
ATS Engine
      ↓
Gap Engine
      ↓
LLM Explanation
      ↓
Recommendation Engine
      ↓
Final Analysis JSON
      ↓
MongoDB
      ↓
API Response
      ↓
Flutter
      ↓
Analysis Dashboard
```

---

## 16. Analysis Status Flow

```text id="s9k3w5"
PENDING
  ↓
PROCESSING
  ↓
COMPLETED
```

Failure:

```text
PENDING
  ↓
PROCESSING
  ↓
FAILED
```

Example database record:

```json id="b7m2c4"
{
  "status": "processing",
  "progress": 65
}
```

---

## 17. Analysis Retrieval Flow

```text id="y5h8q3"
Flutter
  ↓
GET /api/v1/analyses/:id
  ↓
Authenticate
  ↓
Verify Ownership
  ↓
Load Analysis
  ↓
Return Structured Result
  ↓
Flutter
```

---

## 18. History Flow

```text id="x4r7m2"
Flutter
  ↓
GET /api/v1/analyses
  ↓
Authenticate
  ↓
Filter by authenticated user
  ↓
Sort by createdAt
  ↓
Return Analysis Summaries
  ↓
Flutter History Screen
```

A user must only receive their own analysis records.

---

## 19. Delete Resume Flow

```text id="m8p3q6"
Flutter
  ↓
DELETE /api/v1/resumes/:id
  ↓
Authenticate
  ↓
Verify Ownership
  ↓
Delete / Mark Deleted
  ↓
Remove Associated File
  ↓
Update Database
  ↓
Return Success
```

Deletion behavior should be defined clearly in the privacy and data-retention policy.

---

## 20. Error Flow

```text id="c6v4n8"
Flutter Request
      ↓
Backend
      ↓
Validation
      ↓
Valid?
 ┌────┴────┐
No        Yes
 │          │
400       Service
            ↓
         Failure?
        ┌───┴───┐
       Yes      No
        │        │
       Error   Success
        │        │
        └───┬────┘
            ↓
       Standard API
          Response
            ↓
          Flutter
```

---

## 21. AI Failure Flow

```text id="e2s7w5"
AI Request
    ↓
Provider
    ↓
Success?
 ┌──┴──┐
Yes    No
 │      │
 │   Retry
 │      ↓
 │   Fallback
 │      ↓
 └──────┤
        ↓
   Valid Result?
     ┌──┴──┐
    Yes    No
     │      │
 Save    Failed State
```

The system should avoid returning misleading partial AI results.

---

## 22. Data Ownership Flow

Every user-owned document should carry an ownership reference.

```text id="q9f3s2"
User
 │
 ├── Resumes
 │
 ├── Job Descriptions
 │
 └── Analyses
       │
       ├── Resume Reference
       └── JD Reference
```

Every protected query must enforce ownership.

---

## 23. Data Separation

The system should logically separate:

```text
User A
 ├── Resume A
 ├── JD A
 └── Analysis A

User B
 ├── Resume B
 ├── JD B
 └── Analysis B
```

User A must never retrieve User B's documents or analyses.

---

## 24. Data Storage Flow

```text
Flutter
   ↓
Backend
   ├───────────────┐
   ↓               ↓
MongoDB        File Storage
   │               │
   │          Original Files
   │
Structured Data
   │
   ├── User
   ├── Resume
   ├── JD
   ├── Analysis
   └── Courses
```

---

## 25. Recommended API Flow

### Authentication

```text
POST /api/v1/auth/google
POST /api/v1/auth/discord
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

### Resume

```text
POST   /api/v1/resumes
GET    /api/v1/resumes
GET    /api/v1/resumes/:id
DELETE /api/v1/resumes/:id
```

### Job Description

```text
POST   /api/v1/job-descriptions
GET    /api/v1/job-descriptions
GET    /api/v1/job-descriptions/:id
DELETE /api/v1/job-descriptions/:id
```

### Analysis

```text
POST   /api/v1/analyses
GET    /api/v1/analyses
GET    /api/v1/analyses/:id
DELETE /api/v1/analyses/:id
```

### Recommendations

```text
GET /api/v1/recommendations/:analysisId
```

---

## 26. End-to-End Example

A user wants to check their resume against a Flutter Developer JD.

### Step 1

User logs in with Google.

### Step 2

User uploads:

```text
resume.pdf
```

### Step 3

Backend extracts:

```text
Flutter
Dart
Firebase
Node.js
MongoDB
REST APIs
```

### Step 4

User enters the JD.

JD requires:

```text
Flutter
Dart
Firebase
React
Docker
AWS
REST APIs
```

### Step 5

Matching engine produces:

```text
Matched:
Flutter
Dart
Firebase
REST APIs

Missing:
React
Docker
AWS
```

### Step 6

Score engine calculates:

```text
Overall Match: 78%
ATS: 84%
```

### Step 7

Skill Gap Engine identifies:

```text
React → High
Docker → High
AWS → Medium
```

### Step 8

LLM generates explanations and truthful resume improvement suggestions.

### Step 9

Recommendation engine creates:

```text
JavaScript
 ↓
React
 ↓
Docker
 ↓
AWS Fundamentals
```

### Step 10

Final result is stored in MongoDB.

### Step 11

Flutter displays:

```text
78% Match

✓ What Matches
✗ What Is Missing
⚠ Weak Areas
📝 Resume Improvements
📚 What To Learn
```

---

## 27. Data Flow Principles

The application must follow:

1. Validate data before processing.
2. Authenticate before accessing protected resources.
3. Verify ownership before reading user data.
4. Extract documents before AI analysis.
5. Structure data before matching.
6. Match using deterministic and semantic methods.
7. Use LLMs primarily for reasoning and explanation.
8. Validate AI output.
9. Store analysis results.
10. Return structured responses to Flutter.

---

## 28. Final Data Flow

```text id="p8r2m6"
                  ┌──────────────┐
                  │    User      │
                  └──────┬───────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Flutter Mobile  │
                └────────┬────────┘
                         │
                       HTTPS
                         │
                         ▼
                ┌─────────────────┐
                │ Node.js Backend │
                └────────┬────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
     ┌─────────┐   ┌──────────┐   ┌──────────┐
     │ MongoDB │   │  Storage │   │ AI Layer │
     └─────────┘   └──────────┘   └─────┬────┘
                                        │
                           ┌────────────┼────────────┐
                           ▼            ▼            ▼
                       Matching       ATS       Recommendations
                           │            │            │
                           └────────────┼────────────┘
                                        ▼
                                  Final Analysis
                                        │
                                        ▼
                                     MongoDB
                                        │
                                        ▼
                                   Flutter App
```

This architecture provides a clear separation between the mobile application, backend, storage, deterministic matching logic, AI reasoning, and recommendation systems.
