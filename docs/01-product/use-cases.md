# Use Cases

## 1. Overview

The application allows users to compare their resume with a specific Job Description and receive actionable feedback.

The primary actor is:

**Job Seeker**

---

# 2. Use Case: User Authentication

## Actor

Job Seeker

## Description

The user authenticates with the application using a supported authentication provider.

## Supported Providers

* Google
* Discord

## Flow

```text
User opens application
        ↓
Login Screen
        ↓
Select Authentication Provider
        ↓
Authenticate
        ↓
Backend verifies authentication
        ↓
User session created
        ↓
Dashboard
```

---

# 3. Use Case: Upload Resume

## Actor

Job Seeker

## Description

The user uploads a resume for analysis.

## Supported Formats

* PDF
* DOCX

## Flow

```text
Dashboard
   ↓
Upload Resume
   ↓
Select File
   ↓
Validate File
   ↓
Upload to Backend
   ↓
Extract Resume Text
   ↓
Parse Resume
   ↓
Store Resume Data
```

---

# 4. Use Case: Enter Job Description

## Actor

Job Seeker

## Description

The user provides the Job Description against which the resume should be analyzed.

## Initial Input Method

* Text input

## Future Input Method

* JD document upload

## Flow

```text
Enter Job Description
        ↓
Validate Input
        ↓
Send to Backend
        ↓
Parse JD
        ↓
Extract Requirements
```

---

# 5. Use Case: Analyze Resume Against JD

## Actor

Job Seeker

## Description

The user requests an analysis of their resume against a specific Job Description.

## Flow

```text
Select Resume
      +
Select / Enter JD
      ↓
Click Analyze
      ↓
Backend validates inputs
      ↓
Resume + JD processing
      ↓
Matching Engine
      ↓
ATS Engine
      ↓
AI Analysis
      ↓
Skill Gap Analysis
      ↓
Resume Improvement Analysis
      ↓
Course Recommendation
      ↓
Final Report
```

---

# 6. Use Case: View Match Score

## Actor

Job Seeker

## Description

The user views the overall compatibility between their resume and the Job Description.

The report should contain:

* Overall Match Score
* Skill Match
* Keyword Match
* Experience Match
* Education Match
* Project Relevance

---

# 7. Use Case: View Matched Requirements

## Actor

Job Seeker

## Description

The system identifies requirements from the JD that are supported by the resume.

Example:

```text
JD Requirement       Resume Evidence
-------------------------------------
Flutter              ✓ Matched
Firebase             ✓ Matched
MongoDB               ✓ Matched
REST API              ✓ Matched
Docker                ✗ Missing
```

---

# 8. Use Case: View Missing Requirements

## Actor

Job Seeker

## Description

The system identifies important JD requirements that are not sufficiently represented in the resume.

Missing requirements should be classified as:

* Missing
* Weak
* Partially Matched

---

# 9. Use Case: ATS Analysis

## Actor

Job Seeker

## Description

The system evaluates the resume's ATS compatibility for the selected JD.

The report may include:

* ATS score
* Missing keywords
* Keyword coverage
* Job title alignment
* Section quality
* Formatting concerns
* Relevant terminology

ATS score must be separate from the overall Resume-JD Match Score.

---

# 10. Use Case: Skill Gap Analysis

## Actor

Job Seeker

## Description

The system identifies skills required by the JD that are missing or weak in the resume.

Example:

```text
Skill       Status              Priority
------------------------------------------
React.js    Missing             HIGH
Docker      Missing             HIGH
AWS         Missing             MEDIUM
Testing     Partially Matched   MEDIUM
```

---

# 11. Use Case: Resume Improvement

## Actor

Job Seeker

## Description

The system suggests improvements to resume content based on the selected JD.

The system can suggest:

* Better wording
* Stronger bullet points
* Relevant existing keywords
* Better project descriptions
* Better experience descriptions

The system must not invent candidate information.

---

# 12. Use Case: Course Recommendation

## Actor

Job Seeker

## Description

The system recommends learning resources based on the user's skill gaps.

Example:

```text
Missing Skill: React.js

Reason:
Required by the selected Job Description.

Priority:
HIGH

Learning Path:
1. JavaScript
2. React Fundamentals
3. React Hooks
4. API Integration
5. React Project
```

---

# 13. Use Case: View Analysis History

## Actor

Job Seeker

## Description

The user can view previous Resume-JD analyses.

History may contain:

* Resume name
* Job title
* Company name if available
* Match score
* ATS score
* Analysis date

---

# 14. Use Case: Delete Resume

## Actor

Job Seeker

## Description

The user can delete a previously uploaded resume.

The system should remove or securely mark the corresponding data according to the application's data-retention policy.

---

# 15. Use Case: Data Privacy

## Actor

Job Seeker

## Description

The system must ensure that one user cannot access another user's resumes, Job Descriptions, or analysis results.

Every protected resource must be associated with the authenticated user's identity.

---

# 16. End-to-End Use Case

The complete primary use case is:

```text
User Login
    ↓
Upload Resume
    ↓
Enter Job Description
    ↓
Analyze
    ↓
Resume Parsing
    ↓
JD Parsing
    ↓
Requirement Extraction
    ↓
Resume-JD Matching
    ↓
Overall Score
    ↓
ATS Analysis
    ↓
Matched Requirements
    ↓
Missing Requirements
    ↓
Skill Gap Analysis
    ↓
Resume Improvement
    ↓
Learning Recommendations
    ↓
Final Action Plan
```

The final objective is to help the user make their resume more relevant to the selected Job Description while maintaining factual accuracy.
