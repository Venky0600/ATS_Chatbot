# Database Indexes

## 1. Purpose

This document defines MongoDB indexes required for application performance, uniqueness, and efficient user-scoped queries.

Indexes should be created based on actual query patterns and monitored in production.

---

# 2. Users Indexes

Collection:

```text
users
```

### Email Index

```javascript
{
  email: 1
}
```

Purpose:

* Fast user lookup.
* Authentication.
* Prevent duplicate accounts where appropriate.

Recommended:

```text
Unique: true
```

---

### Provider Index

For provider-based authentication:

```javascript
{
  "authProviders.provider": 1,
  "authProviders.providerUserId": 1
}
```

Purpose:

Fast lookup during Google or Discord authentication.

---

# 3. Resumes Indexes

Collection:

```text
resumes
```

### User Index

```javascript
{
  userId: 1
}
```

Purpose:

Retrieve all resumes belonging to a user.

Example:

```text
GET /api/v1/resumes
```

---

### User + Created Date

```javascript
{
  userId: 1,
  createdAt: -1
}
```

Purpose:

Efficiently retrieve recent resumes.

---

### User + Status

```javascript
{
  userId: 1,
  status: 1
}
```

Purpose:

Find resumes currently being processed or ready.

---

# 4. Job Description Indexes

Collection:

```text
jobDescriptions
```

### User Index

```javascript
{
  userId: 1
}
```

Purpose:

Retrieve a user's JDs.

---

### User + Created Date

```javascript
{
  userId: 1,
  createdAt: -1
}
```

Purpose:

Display recent JDs efficiently.

---

# 5. Analysis Indexes

Collection:

```text
analyses
```

### User Index

```javascript
{
  userId: 1
}
```

Purpose:

Retrieve analyses belonging to the authenticated user.

---

### User + Created Date

```javascript
{
  userId: 1,
  createdAt: -1
}
```

Purpose:

Analysis history sorted by newest first.

---

### Resume Index

```javascript
{
  resumeId: 1
}
```

Purpose:

Find analyses associated with a specific resume.

---

### Job Description Index

```javascript
{
  jobDescriptionId: 1
}
```

Purpose:

Find analyses associated with a specific JD.

---

### Resume + JD Index

```javascript
{
  resumeId: 1,
  jobDescriptionId: 1
}
```

Purpose:

Efficiently find analyses for a specific resume/JD combination.

---

# 6. Analysis Status Index

```javascript
{
  status: 1,
  createdAt: -1
}
```

Purpose:

Useful for background processing and monitoring pending/processing analyses.

---

# 7. Courses Indexes

Collection:

```text
courses
```

### Skills Index

```javascript
{
  skills: 1
}
```

Purpose:

Find courses associated with a missing skill.

Example:

```text
React.js
```

can find courses containing:

```text
React.js
```

---

### Level Index

```javascript
{
  level: 1
}
```

Purpose:

Filter courses by:

```text
beginner
intermediate
advanced
```

---

### Active Courses Index

```javascript
{
  isActive: 1
}
```

Purpose:

Exclude inactive courses from recommendations.

---

# 8. Compound Course Index

Recommended:

```javascript
{
  skills: 1,
  level: 1,
  isActive: 1
}
```

Purpose:

Efficiently find active courses for a skill and learning level.

---

# 9. Recommended Index Definitions

Example Mongoose indexes:

```javascript
userSchema.index(
  { email: 1 },
  { unique: true }
);
```

```javascript
resumeSchema.index({
  userId: 1,
  createdAt: -1
});
```

```javascript
jobDescriptionSchema.index({
  userId: 1,
  createdAt: -1
});
```

```javascript
analysisSchema.index({
  userId: 1,
  createdAt: -1
});
```

```javascript
analysisSchema.index({
  resumeId: 1,
  jobDescriptionId: 1
});
```

```javascript
courseSchema.index({
  skills: 1,
  level: 1,
  isActive: 1
});
```

---

# 10. User Data Isolation

Indexes improve performance, but they do not provide authorization.

This is important.

Incorrect:

```javascript
Analysis.findById(analysisId)
```

The backend must also verify ownership.

Preferred:

```javascript
Analysis.findOne({
  _id: analysisId,
  userId: authenticatedUserId
})
```

The same principle applies to:

```text
resumes
jobDescriptions
analyses
```

---

# 11. Pagination

History APIs should use pagination.

Example:

```text
GET /api/v1/analyses?page=1&limit=20
```

The index:

```javascript
{
  userId: 1,
  createdAt: -1
}
```

supports this query pattern efficiently.

---

# 12. Index Selection Principles

Do not create indexes for every field.

Each index:

* Uses storage.
* Increases write overhead.
* Requires maintenance.

Indexes should exist for frequently used queries.

---

# 13. Query Examples

### Get User Resumes

```javascript
Resume.find({
  userId
})
.sort({
  createdAt: -1
});
```

Supported by:

```javascript
{
  userId: 1,
  createdAt: -1
}
```

---

### Get User Analysis History

```javascript
Analysis.find({
  userId
})
.sort({
  createdAt: -1
})
.limit(20);
```

Supported by:

```javascript
{
  userId: 1,
  createdAt: -1
}
```

---

### Find Existing Resume/JD Analysis

```javascript
Analysis.findOne({
  userId,
  resumeId,
  jobDescriptionId,
  status: "completed"
});
```

A compound index can support the main lookup:

```javascript
{
  userId: 1,
  resumeId: 1,
  jobDescriptionId: 1
}
```

---

# 14. Future Vector Search

If semantic matching uses MongoDB Vector Search, vector indexes may be introduced later.

Potential vector data:

```text
resume evidence embeddings
JD requirement embeddings
skill embeddings
course embeddings
```

Conceptual structure:

```text
Text
 ↓
Embedding Model
 ↓
Vector
 ↓
MongoDB Vector Search Index
 ↓
Semantic Similarity
```

Vector indexes must be designed according to the selected embedding model and MongoDB deployment configuration.

---

# 15. Index Monitoring

Production monitoring should examine:

* Query execution time.
* Index usage.
* Collection size.
* Slow queries.
* Write performance.
* Unused indexes.

Indexes should be reviewed as the application grows.

---

# 16. Database Performance Goal

The database should efficiently support:

```text
User lookup
Resume listing
JD listing
Analysis history
Analysis retrieval
Resume/JD analysis lookup
Course search
Skill-based recommendations
```

while maintaining strict user-level data isolation.
