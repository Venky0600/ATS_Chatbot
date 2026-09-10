# Functional Requirements

## 1. Overview

This document defines the functional requirements of the AI Resume & Job Description Matcher application.

Functional requirements describe what the system must do from the user's perspective and how the different components should behave.

---

# 2. Authentication Requirements

## FR-001: Google Authentication

The system shall allow users to authenticate using their Google account.

The system shall:

* Redirect the user to Google authentication.
* Verify the authentication response.
* Create or identify the corresponding application user.
* Create an authenticated session.
* Redirect the authenticated user to the application dashboard.

---

## FR-002: Discord Authentication

The system shall allow users to authenticate using their Discord account.

The system shall:

* Authenticate the user through Discord.
* Verify the authentication response.
* Create or identify the corresponding application user.
* Create an authenticated session.
* Redirect the authenticated user to the dashboard.

---

## FR-003: Session Management

The system shall maintain an authenticated session for the user.

Protected APIs shall require valid authentication.

---

# 3. Resume Requirements

## FR-004: Resume Upload

The system shall allow authenticated users to upload resumes.

Initially supported formats:

* PDF
* DOCX

---

## FR-005: Resume Validation

The system shall validate uploaded files.

Validation shall include:

* File type
* File size
* File integrity
* Text extraction capability

Invalid files shall be rejected with a clear error message.

---

## FR-006: Resume Text Extraction

The backend shall extract readable text from the uploaded resume.

The extracted text shall be processed for structured analysis.

---

## FR-007: Resume Information Extraction

The system shall identify relevant resume information such as:

* Name
* Skills
* Technical skills
* Soft skills
* Education
* Experience
* Internships
* Projects
* Certifications
* Achievements

The extracted information shall be stored in structured form.

---

## FR-008: Resume Management

Authenticated users shall be able to:

* View uploaded resumes.
* Select a resume for analysis.
* Delete resumes.
* View resume metadata.

---

# 4. Job Description Requirements

## FR-009: Job Description Input

The system shall allow users to enter or paste a Job Description.

---

## FR-010: Job Description Validation

The system shall validate the Job Description before analysis.

The system shall reject:

* Empty JD
* Extremely short invalid input
* Unsupported content

---

## FR-011: Job Description Parsing

The system shall extract structured information from the Job Description.

The extracted information may include:

* Job title
* Company name
* Required skills
* Preferred skills
* Experience requirements
* Education requirements
* Responsibilities
* Technologies
* Tools
* Certifications
* Soft skills
* Important keywords

---

## FR-012: Job Description Management

Authenticated users shall be able to store and access their previous Job Descriptions.

---

# 5. Resume-JD Analysis Requirements

## FR-013: Start Analysis

The user shall be able to select a resume and provide a Job Description and start an analysis.

---

## FR-014: Resume-JD Comparison

The system shall compare the selected resume against the selected Job Description.

The comparison shall consider:

* Skills
* Keywords
* Experience
* Education
* Projects
* Technologies
* Responsibilities
* Certifications where relevant

---

## FR-015: Skill Matching

The system shall identify:

* Exact skill matches
* Related skill matches
* Partial matches
* Missing skills

The system should support semantic matching for related terminology.

---

## FR-016: Keyword Matching

The system shall compare important Job Description keywords with the resume.

The system shall identify:

* Present keywords
* Missing keywords
* Weak keyword coverage

---

# 6. Scoring Requirements

## FR-017: Overall Match Score

The system shall calculate an overall Resume-JD Match Score.

The score shall be represented as a percentage from 0 to 100.

---

## FR-018: Component Scores

The system shall calculate supporting scores such as:

* Skill Match Score
* Keyword Match Score
* Experience Match Score
* Education Match Score
* Project Relevance Score

---

## FR-019: Explainable Score

The system shall provide an explanation for the major factors contributing to the overall score.

The score must not be an arbitrary number generated only by an LLM.

---

# 7. ATS Requirements

## FR-020: ATS Compatibility Score

The system shall calculate a separate ATS Compatibility Score.

The ATS score shall not be treated as the same metric as the Resume-JD Match Score.

---

## FR-021: ATS Analysis

The system shall identify potential ATS-related issues including:

* Missing relevant keywords
* Weak keyword coverage
* Job title alignment
* Section structure
* Resume readability
* Relevant terminology
* Formatting concerns where detectable

---

# 8. Skill Gap Requirements

## FR-022: Skill Gap Identification

The system shall identify skills required by the Job Description that are:

* Missing
* Weak
* Partially matched

---

## FR-023: Skill Gap Priority

Each important skill gap shall have a priority.

Priority levels:

* HIGH
* MEDIUM
* LOW

Priority should be determined based on the importance of the skill to the Job Description.

---

# 9. Resume Improvement Requirements

## FR-024: Resume Improvement Suggestions

The system shall provide suggestions for improving the resume based on the selected Job Description.

Suggestions may include:

* Improving bullet points
* Improving project descriptions
* Improving experience descriptions
* Highlighting relevant existing skills
* Improving keyword usage
* Improving clarity and impact

---

## FR-025: Truthful Improvements

The system shall not invent candidate information.

The system must not generate suggestions that falsely claim:

* Skills
* Experience
* Projects
* Certifications
* Achievements
* Responsibilities

The system may recommend learning a missing skill, but it must clearly identify it as a skill gap.

---

# 10. Course Recommendation Requirements

## FR-026: Learning Recommendation

The system shall recommend learning resources based on important skill gaps.

---

## FR-027: Learning Priority

The system shall prioritize learning recommendations.

Example:

```text
React.js
Priority: HIGH
Reason: Required by the Job Description

Docker
Priority: HIGH
Reason: Required by the Job Description

AWS
Priority: MEDIUM
Reason: Preferred skill in the Job Description
```

---

## FR-028: Learning Path

Where appropriate, the system shall generate a logical learning sequence.

Example:

```text
JavaScript
    ↓
React Fundamentals
    ↓
React Hooks
    ↓
API Integration
    ↓
React Project
```

---

# 11. Analysis Report Requirements

## FR-029: Final Analysis Report

The system shall display a structured analysis report containing:

* Overall Match Score
* ATS Compatibility Score
* Component scores
* Matched requirements
* Missing requirements
* Weak areas
* Skill gaps
* Resume improvements
* Learning recommendations

---

## FR-030: Analysis Evidence

Where possible, important matching results should reference the relevant resume content or JD requirement that supports the result.

This improves transparency and explainability.

---

# 12. Analysis History Requirements

## FR-031: Save Analysis

The system shall save completed analyses for authenticated users.

---

## FR-032: View Analysis History

Users shall be able to view their previous analyses.

History should display:

* Resume name
* Job title
* Company name if available
* Match score
* ATS score
* Analysis date

---

## FR-033: View Previous Analysis

Users shall be able to open a previous analysis and view its complete report.

---

# 13. Error Handling Requirements

## FR-034: File Processing Error

If resume processing fails, the system shall show a meaningful error message.

---

## FR-035: AI Processing Error

If the AI service fails, the backend shall handle the failure gracefully.

The application should not crash or expose internal errors to the user.

---

## FR-036: Network Error

The Flutter application shall display an appropriate message when the backend is unavailable or a network request fails.

---

# 14. Data Isolation Requirements

## FR-037: User Data Isolation

A user shall only be able to access their own:

* Resumes
* Job Descriptions
* Analyses
* Recommendations

The backend shall verify ownership for protected resources.

---

# 15. Future Functional Requirements

Future versions may include:

* Resume builder
* Cover letter generation
* Interview preparation
* Mock interviews
* Job recommendations
* Job application tracking
* Multiple resume comparison
* Multiple JD comparison
* Web application
