# AI Resume & Job Description Matcher

## 1. Product Overview

AI Resume & Job Description Matcher is a mobile application that helps job seekers understand how well their resume matches a specific Job Description (JD).

The user provides:

1. A Resume
2. A Job Description

The system analyzes both inputs and generates a detailed, explainable, and actionable report.

The report provides:

* Overall Resume-JD Match Score
* ATS Compatibility Score
* Matched Skills
* Missing Skills
* Keyword Gaps
* Experience Match
* Education Match
* Project Relevance
* Resume Weak Areas
* Resume Improvement Suggestions
* Skill Gap Analysis
* Recommended Learning Paths
* Recommended Courses

The application will use Flutter for the mobile frontend and Node.js for the backend.

MongoDB will be used as the primary database.

An AI/LLM layer will assist with semantic analysis, explanations, resume improvements, and learning recommendations.

---

## 2. Core Product Idea

The core idea is:

```text
Resume + Job Description
            ↓
      Resume Analysis
            ↓
       JD Analysis
            ↓
    Resume-JD Comparison
            ↓
      Match Calculation
            ↓
      ATS Analysis
            ↓
      Skill Gap Analysis
            ↓
   Resume Improvements
            ↓
 Course / Learning Recommendations
            ↓
       Final Report
```

The product should not only tell the user a percentage score.

It should explain:

* What already matches
* What is missing
* What is weak
* Why something is missing
* What should be improved
* What the user should learn next

---

## 3. Technology Stack

### Frontend

* Flutter
* Dart

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Authentication

* Google Authentication
* Discord Authentication

### AI

* LLM-based analysis
* Deterministic matching logic
* Semantic matching

### File Processing

* PDF parsing
* DOCX parsing

---

## 4. Main Features

### Authentication

Users can authenticate using supported social login providers.

### Resume Upload

Users can upload their resume.

Initial supported formats:

* PDF
* DOCX

### Job Description Input

Users can paste a Job Description into the application.

Future versions may support Job Description file uploads.

### Resume Parsing

The system extracts structured information from the resume.

### Job Description Parsing

The system identifies requirements and important information from the JD.

### Resume-JD Matching

The system compares the resume against the specific Job Description.

### ATS Analysis

The system evaluates the resume for ATS compatibility.

### Skill Gap Analysis

The system identifies missing or weak skills.

### Resume Improvement

The system provides suggestions for improving the resume for the specific JD.

### Course Recommendation

The system recommends learning resources based on identified skill gaps.

### Analysis History

Users can view previous resume-JD analyses.

---

## 5. Expected Final Result

The final result should be presented in a structured format.

Example:

```text
Overall Match Score
78%

ATS Compatibility
86%

Skill Match
82%

Experience Match
80%

Keyword Match
70%

Project Relevance
75%
```

The report should then show:

```text
MATCHED REQUIREMENTS
✓ Flutter
✓ Firebase
✓ Node.js
✓ MongoDB
✓ REST APIs


MISSING REQUIREMENTS
✗ React.js
✗ Docker
✗ AWS


WEAK AREAS
⚠ Deployment experience is not clearly mentioned.
⚠ Testing experience is not clearly described.


RESUME IMPROVEMENTS
→ Improve project descriptions.
→ Highlight relevant existing experience.
→ Use relevant JD terminology where truthful.


SKILLS TO LEARN
1. React.js - High Priority
2. Docker - High Priority
3. AWS - Medium Priority
```

---

## 6. Product Principle

The application must provide actionable insights rather than only generating a score.

The user should be able to understand exactly what they need to do after receiving the analysis.

The system must never invent experience, skills, projects, certifications, or achievements that are not supported by the user's resume.
