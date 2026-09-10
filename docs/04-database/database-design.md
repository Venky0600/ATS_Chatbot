# Database Design

## 1. Purpose

This document defines the database architecture for the AI Resume and Job Description Matching Platform.

MongoDB is used as the primary database because the platform handles structured data with flexible AI-generated analysis results.

The database must support:

* User accounts.
* Authentication providers.
* Resumes.
* Job descriptions.
* Resume parsing results.
* JD parsing results.
* Job-match analyses.
* Skill gaps.
* Resume improvements.
* Course recommendations.
* Analysis history.

---

## 2. Database Technology

```text
Database:
MongoDB

ODM:
Mongoose

Primary Data Format:
JSON / BSON
```

MongoDB should be accessed only through the Node.js backend.

Flutter must never connect directly to MongoDB.

---

## 3. High-Level Data Model

```text
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       ├───────────────┐
       │               │
       ▼               ▼
┌─────────────┐  ┌──────────────────┐
│   Resumes   │  │ Job Descriptions  │
└──────┬──────┘  └────────┬─────────┘
       │                  │
       └────────┬─────────┘
                ▼
         ┌─────────────┐
         │  Analyses   │
         └──────┬──────┘
                │
       ┌────────┼───────────┐
       ▼        ▼           ▼
   Skill Gaps  Improvements Recommendations
```

---

## 4. Core Collections

The initial database contains:

```text
users
resumes
jobDescriptions
analyses
courses
```

Additional collections may be introduced later for:

```text
refreshTokens
aiUsage
courseProviders
auditLogs
notifications
```

---

## 5. Users Collection

Purpose:

Stores application user accounts.

Example:

```json
{
  "_id": "ObjectId",
  "name": "Venky",
  "email": "user@example.com",
  "profileImage": "https://...",
  "authProviders": [
    {
      "provider": "google",
      "providerUserId": "provider-id"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Important fields:

```text
_id
name
email
profileImage
authProviders
createdAt
updatedAt
```

The user's email should have a uniqueness constraint where appropriate.

---

## 6. Resume Collection

Purpose:

Stores uploaded resume metadata and parsed resume information.

Example:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "fileName": "resume.pdf",
  "fileType": "application/pdf",
  "fileUrl": "storage-url",
  "status": "ready",
  "extractedText": "...",
  "parsedData": {
    "summary": "...",
    "skills": [],
    "experience": [],
    "education": [],
    "projects": [],
    "certifications": [],
    "achievements": []
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 7. Resume Status

Recommended statuses:

```text
uploaded
extracting
parsing
normalizing
ready
failed
deleted
```

The status allows the frontend to display processing progress.

---

## 8. Job Description Collection

Purpose:

Stores job descriptions and their structured representation.

Example:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "title": "Flutter Developer",
  "company": "Example Company",
  "sourceType": "text",
  "rawText": "...",
  "parsedData": {
    "requiredSkills": [],
    "preferredSkills": [],
    "responsibilities": [],
    "experienceRequirements": [],
    "educationRequirements": []
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 9. Analysis Collection

Purpose:

Stores the result of comparing a resume against a JD.

Example:

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "resumeId": "ObjectId",
  "jobDescriptionId": "ObjectId",
  "status": "completed",
  "scores": {
    "overall": 78,
    "ats": 84,
    "skillMatch": 82,
    "experienceMatch": 70,
    "keywordMatch": 80,
    "educationMatch": 90,
    "projectRelevance": 75,
    "roleAlignment": 72
  },
  "matchedSkills": [],
  "missingSkills": [],
  "partialSkills": [],
  "weakAreas": [],
  "improvements": [],
  "recommendations": [],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 10. Analysis Status

```text
pending
processing
completed
failed
```

Optional progress:

```json
{
  "status": "processing",
  "progress": 65
}
```

---

## 11. Match Evidence

Important matching results should retain evidence.

Example:

```json
{
  "skill": "Flutter",
  "status": "matched",
  "matchType": "exact",
  "confidence": "high",
  "resumeEvidence": {
    "section": "Skills",
    "text": "Flutter, Dart, Firebase"
  },
  "jdEvidence": {
    "section": "Required Skills",
    "text": "Strong Flutter experience"
  }
}
```

This enables explainable results.

---

## 12. Missing Skill Model

Example:

```json
{
  "skill": "React.js",
  "status": "missing",
  "priority": "high",
  "reason": "Required by the job description but not demonstrated in the resume."
}
```

The system must distinguish:

```text
matched
partial
missing
unclear
```

---

## 13. Resume Improvement Model

Example:

```json
{
  "section": "Projects",
  "original": "Worked on Flutter projects.",
  "suggested": "Developed cross-platform Flutter applications with backend API integration.",
  "reason": "Makes the existing technical work more specific.",
  "evidenceBased": true
}
```

The backend must ensure the suggestion does not introduce unsupported facts.

---

## 14. Recommendation Model

Example:

```json
{
  "skill": "React.js",
  "priority": "high",
  "reason": "Required by the target role.",
  "learningPath": [
    "JavaScript fundamentals",
    "React fundamentals",
    "Hooks",
    "API integration",
    "Build a React project"
  ],
  "courses": []
}
```

---

## 15. Courses Collection

Purpose:

Stores reusable course/resource information.

Example:

```json
{
  "_id": "ObjectId",
  "title": "React Fundamentals",
  "provider": "Example Provider",
  "url": "https://example.com/course",
  "skills": [
    "React.js"
  ],
  "level": "beginner",
  "description": "...",
  "rating": 4.7,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Course URLs must be validated before being displayed to users.

---

## 16. Relationships

MongoDB uses references for major entities.

```text
User
  │
  ├── Resume
  │
  ├── Job Description
  │
  └── Analysis
         │
         ├── Resume
         └── Job Description
```

Example:

```text
resumes.userId → users._id

jobDescriptions.userId → users._id

analyses.userId → users._id

analyses.resumeId → resumes._id

analyses.jobDescriptionId → jobDescriptions._id
```

---

## 17. Ownership Rules

Every user-owned resource must contain `userId`.

Examples:

```text
Resume.userId
JobDescription.userId
Analysis.userId
```

Before returning a resource:

```text
authenticatedUserId === resource.userId
```

must be verified.

---

## 18. Document Versioning

Future versions should support resume and JD versions.

Example:

```json
{
  "resumeId": "ObjectId",
  "version": 2
}
```

This prevents old analysis results from becoming ambiguous after a resume is updated.

---

## 19. Data Retention

The product should define:

* How long resumes are stored.
* How long uploaded JD files are stored.
* How long analysis results are retained.
* Whether users can permanently delete their data.
* What happens to analyses when their source resume is deleted.

Recommended behavior:

```text
User deletes Resume
       ↓
Mark Resume deleted
       ↓
Remove associated file
       ↓
Keep or delete analyses according to retention policy
```

The exact retention policy should be configurable.

---

## 20. Sensitive Data

Potentially sensitive information includes:

* Email.
* Resume contents.
* Employment history.
* Education history.
* Contact information.

Access to this information must be restricted to the authenticated owner.

---

## 21. Database Validation

The backend should validate:

* ObjectId values.
* Required fields.
* Enum values.
* Array structures.
* Score ranges.
* Status values.

Score values should remain within:

```text
0 ≤ score ≤ 100
```

---

## 22. Database Consistency

The backend should prevent invalid relationships.

For example:

An analysis cannot be created if:

```text
resumeId does not exist
```

or:

```text
jobDescriptionId does not exist
```

or:

```text
resource belongs to another user
```

---

## 23. Performance Considerations

The database should:

* Use indexes for frequent queries.
* Avoid unnecessary large documents.
* Paginate history results.
* Store only required analysis data.
* Avoid repeatedly parsing the same resume.
* Cache reusable structured data where appropriate.

---

## 24. Future Collections

Potential future collections:

```text
notifications
subscriptions
payments
savedJobs
jobApplications
interviewSessions
aiUsage
auditLogs
skillTaxonomy
courseProviders
```

These should be introduced only when the corresponding feature is implemented.

---

## 25. Database Design Principles

1. User-owned data must be isolated.
2. Relationships must be explicit.
3. Large files should use external storage.
4. AI results should be structured.
5. Evidence should be preserved.
6. Frequently queried fields must be indexed.
7. Historical results should remain reproducible.
8. Sensitive data must be protected.
9. Schema changes must be version-controlled.
10. Database access must remain backend-only.
