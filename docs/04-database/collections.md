# MongoDB Collections

## 1. Purpose

This document defines the detailed schema of the MongoDB collections used by the application.

The initial MVP uses five primary collections:

```text
users
resumes
jobDescriptions
analyses
courses
```

---

# 2. Users

Collection:

```text
users
```

Schema:

```javascript
{
  _id: ObjectId,

  name: String,

  email: String,

  profileImage: String,

  authProviders: [
    {
      provider: String,
      providerUserId: String
    }
  ],

  createdAt: Date,

  updatedAt: Date
}
```

### Provider Values

```text
google
discord
```

### Example

```json
{
  "_id": "ObjectId",
  "name": "Venky",
  "email": "user@example.com",
  "profileImage": "https://example.com/profile.jpg",
  "authProviders": [
    {
      "provider": "google",
      "providerUserId": "google-user-id"
    }
  ],
  "createdAt": "2026-09-01T10:00:00Z",
  "updatedAt": "2026-09-01T10:00:00Z"
}
```

---

# 3. Resumes

Collection:

```text
resumes
```

Schema:

```javascript
{
  _id: ObjectId,

  userId: ObjectId,

  fileName: String,

  fileType: String,

  fileUrl: String,

  status: String,

  extractedText: String,

  parsedData: {
    summary: String,

    skills: [
      {
        name: String,
        normalizedName: String,
        evidence: String
      }
    ],

    experience: [
      {
        company: String,
        role: String,
        startDate: Date,
        endDate: Date,
        description: String,
        technologies: [String]
      }
    ],

    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        grade: String
      }
    ],

    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        url: String
      }
    ],

    certifications: [
      {
        name: String,
        issuer: String,
        date: Date
      }
    ],

    achievements: [
      {
        title: String,
        description: String
      }
    ]
  },

  createdAt: Date,

  updatedAt: Date
}
```

### Status Values

```text
uploaded
extracting
parsing
normalizing
ready
failed
deleted
```

---

# 4. Job Descriptions

Collection:

```text
jobDescriptions
```

Schema:

```javascript
{
  _id: ObjectId,

  userId: ObjectId,

  title: String,

  company: String,

  sourceType: String,

  sourceUrl: String,

  rawText: String,

  parsedData: {

    requiredSkills: [
      {
        name: String,
        normalizedName: String,
        importance: String,
        evidence: String
      }
    ],

    preferredSkills: [
      {
        name: String,
        normalizedName: String,
        importance: String,
        evidence: String
      }
    ],

    responsibilities: [
      {
        text: String,
        importance: String
      }
    ],

    experienceRequirements: [
      {
        description: String,
        minimumYears: Number,
        maximumYears: Number
      }
    ],

    educationRequirements: [
      {
        degree: String,
        field: String,
        required: Boolean
      }
    ],

    certifications: [String],

    tools: [String],

    technologies: [String]
  },

  createdAt: Date,

  updatedAt: Date
}
```

### Source Type Values

```text
text
file
url
```

---

# 5. Analyses

Collection:

```text
analyses
```

Schema:

```javascript
{
  _id: ObjectId,

  userId: ObjectId,

  resumeId: ObjectId,

  jobDescriptionId: ObjectId,

  status: String,

  progress: Number,

  scores: {

    overall: Number,

    ats: Number,

    skillMatch: Number,

    experienceMatch: Number,

    keywordMatch: Number,

    educationMatch: Number,

    projectRelevance: Number,

    roleAlignment: Number
  },

  matchedSkills: [
    {
      skill: String,
      normalizedSkill: String,
      matchType: String,
      confidence: String,

      resumeEvidence: {
        section: String,
        text: String
      },

      jdEvidence: {
        section: String,
        text: String
      }
    }
  ],

  partialSkills: [
    {
      skill: String,
      reason: String,
      confidence: String
    }
  ],

  missingSkills: [
    {
      skill: String,
      priority: String,
      reason: String
    }
  ],

  weakAreas: [
    {
      area: String,
      reason: String,
      severity: String
    }
  ],

  improvements: [
    {
      section: String,
      original: String,
      suggested: String,
      reason: String,
      evidenceBased: Boolean
    }
  ],

  atsAnalysis: {
    strengths: [String],
    issues: [String],
    suggestions: [String]
  },

  recommendations: [
    {
      skill: String,
      priority: String,
      reason: String,

      learningPath: [String],

      courses: [
        {
          courseId: ObjectId,
          relevance: Number
        }
      ]
    }
  ],

  aiMetadata: {
    provider: String,
    model: String,
    processingTimeMs: Number
  },

  createdAt: Date,

  updatedAt: Date
}
```

### Analysis Status

```text
pending
processing
completed
failed
```

---

# 6. Courses

Collection:

```text
courses
```

Schema:

```javascript
{
  _id: ObjectId,

  title: String,

  provider: String,

  url: String,

  description: String,

  skills: [String],

  level: String,

  duration: String,

  rating: Number,

  language: String,

  isActive: Boolean,

  createdAt: Date,

  updatedAt: Date
}
```

### Level Values

```text
beginner
intermediate
advanced
```

---

# 7. Relationship Map

```text
users
  │
  ├───────────────┐
  │               │
  ▼               ▼
resumes     jobDescriptions
  │               │
  └───────┬───────┘
          ▼
       analyses
          │
          ▼
      courses
```

---

# 8. Required References

### Resume

```text
resumes.userId
→ users._id
```

### Job Description

```text
jobDescriptions.userId
→ users._id
```

### Analysis

```text
analyses.userId
→ users._id

analyses.resumeId
→ resumes._id

analyses.jobDescriptionId
→ jobDescriptions._id
```

### Recommendation

```text
analyses.recommendations.courses.courseId
→ courses._id
```

---

# 9. Score Validation

All score fields must satisfy:

```text
0 <= score <= 100
```

Example:

```javascript
{
  overall: 78,
  ats: 84,
  skillMatch: 82
}
```

Invalid:

```javascript
{
  overall: 150
}
```

---

# 10. Evidence Structure

Important AI findings should contain evidence.

Example:

```json
{
  "skill": "Flutter",
  "matchType": "exact",
  "confidence": "high",
  "resumeEvidence": {
    "section": "Skills",
    "text": "Flutter, Dart, Firebase"
  },
  "jdEvidence": {
    "section": "Required Skills",
    "text": "Experience with Flutter"
  }
}
```

This makes the analysis explainable.

---

# 11. User Ownership

Every user-owned document must contain:

```text
userId
```

The backend must verify ownership before:

```text
READ
UPDATE
DELETE
```

operations.

---

# 12. Schema Evolution

Schema changes must be handled carefully.

When adding a field:

```text
Existing documents
        ↓
Migration / Default Value
        ↓
New schema
```

Breaking changes should use versioning or controlled migration.

---

# 13. Optional Future Collections

Future features may introduce:

```text
skillTaxonomy
courseProviders
aiUsage
auditLogs
jobApplications
savedJobs
notifications
subscriptions
payments
```

These collections should not be created until required by a feature.

---

# 14. Collection Design Principles

1. Keep user ownership explicit.
2. Keep analysis results structured.
3. Preserve important evidence.
4. Avoid storing unnecessary duplicated data.
5. Use references for major entities.
6. Validate score ranges.
7. Use timestamps consistently.
8. Keep AI metadata separate.
9. Design for future versioning.
10. Protect user data through backend authorization.
