# AI Architecture

## 1. Purpose

This document defines the AI architecture of the Resume and Job Description Matching Platform.

The AI system is responsible for understanding resumes and job descriptions, identifying relationships between them, explaining matches and gaps, generating truthful improvement suggestions, and creating personalized learning recommendations.

The platform must not rely on a single LLM prompt for the entire analysis.

A hybrid architecture is used:

```text
Deterministic Rules
        +
Structured Parsing
        +
Semantic Matching
        +
LLM Reasoning
        =
Explainable AI Analysis
```

---

## 2. AI Design Principles

The AI system must follow these principles:

1. Evidence before inference.
2. Deterministic scoring where possible.
3. LLM for reasoning and explanation.
4. No fabricated candidate information.
5. Structured JSON outputs.
6. Traceable analysis.
7. Independent AI modules.
8. Provider abstraction.
9. Confidence-aware results.
10. Human-readable explanations.

---

## 3. Complete AI Pipeline

```text id="g7x3pq"
Resume File
     │
     ▼
Document Text Extraction
     │
     ▼
Resume Parser
     │
     ▼
Structured Resume
     │
     ▼
Skill Normalization
     │
     │
     │                 Job Description
     │                       │
     │                       ▼
     │                 JD Text Extraction
     │                       │
     │                       ▼
     │                   JD Parser
     │                       │
     │                       ▼
     │                  Structured JD
     │                       │
     └──────────────┬────────┘
                    ▼
             Matching Engine
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
       Exact     Semantic   Evidence
       Match      Match     Analysis
          │         │         │
          └─────────┼─────────┘
                    ▼
              Score Engine
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
      ATS Engine         Skill Gap Engine
          │                   │
          └─────────┬─────────┘
                    ▼
             LLM Explanation
                    │
                    ▼
          Resume Improvements
                    │
                    ▼
          Course Recommendation
                    │
                    ▼
             Final Analysis
```

---

## 4. Document Processing Layer

The first stage converts uploaded files into usable text.

Supported formats:

```text
PDF
DOCX
TXT
```

Pipeline:

```text
File
 ↓
File Validation
 ↓
Text Extraction
 ↓
Text Cleaning
 ↓
Page / Section Preservation
```

The system should preserve page information whenever possible.

This allows the final analysis to reference evidence such as:

```text
Resume Page 1 → Skills
Resume Page 2 → Projects
```

---

## 5. Resume Understanding

The resume parser converts extracted text into structured data.

Example:

```json id="kjq3s8"
{
  "summary": "...",
  "skills": [],
  "experience": [],
  "education": [],
  "projects": [],
  "certifications": [],
  "achievements": []
}
```

Each important field should retain evidence.

Example:

```json id="y8c1q2"
{
  "skill": "Flutter",
  "source": {
    "section": "Skills",
    "text": "Flutter, Dart, Firebase"
  }
}
```

This evidence is important for trustworthy analysis.

---

## 6. Job Description Understanding

The JD parser extracts:

```text
Job Title
Company
Required Skills
Preferred Skills
Responsibilities
Experience Requirements
Education Requirements
Certifications
Tools
Technologies
Domain Requirements
```

Example:

```json id="m4r7cz"
{
  "title": "Flutter Developer",
  "requiredSkills": [
    "Flutter",
    "Dart",
    "REST APIs"
  ],
  "preferredSkills": [
    "Firebase"
  ],
  "responsibilities": [
    "Develop mobile applications",
    "Integrate APIs"
  ]
}
```

---

## 7. Skill Normalization

Different terms can represent the same skill.

Examples:

```text id="y6f5de"
Node       → Node.js
ReactJS    → React.js
Mongo      → MongoDB
Postgres   → PostgreSQL
JS         → JavaScript
TS         → TypeScript
```

Normalization should use a controlled skill dictionary.

The dictionary may contain:

```text
canonicalName
aliases
category
parentSkill
relatedSkills
```

Example:

```json id="2s7r6w"
{
  "canonicalName": "JavaScript",
  "aliases": [
    "JS",
    "ECMAScript"
  ],
  "category": "Programming Language"
}
```

---

## 8. Exact Matching

Exact matching identifies direct occurrences.

Example:

```text id="a9p3n4"
Resume:
Flutter, Dart, Firebase

JD:
Flutter, Dart, Firebase, React
```

Result:

```text id="e5k7r2"
Matched:
Flutter
Dart
Firebase

Missing:
React
```

Exact matching provides highly reliable evidence.

---

## 9. Normalized Matching

Normalized matching identifies equivalent terms.

Example:

```text id="d1e5z0"
Resume:
Node

JD:
Node.js
```

After normalization:

```text id="9m5kq2"
Node → Node.js
```

The skill can be treated as a match.

---

## 10. Semantic Matching

Semantic matching identifies related meaning.

Example:

```text id="p2x6w4"
Resume:
Built REST APIs for mobile applications.

JD:
Experience developing backend APIs.
```

Exact keyword overlap may be limited, but semantic similarity can identify a relationship.

Semantic matching should produce:

```text
similarityScore
matchedEvidence
requirement
confidence
```

Example:

```json id="q6y3r5"
{
  "requirement": "Backend API development",
  "resumeEvidence": "Built REST APIs for mobile applications",
  "similarity": 0.86,
  "confidence": "high"
}
```

Semantic similarity must not automatically mean the candidate fully satisfies the requirement.

---

## 11. Evidence Engine

Every important match should have evidence.

Example:

```json id="h5x1b8"
{
  "requirement": "Firebase",
  "status": "matched",
  "evidence": [
    {
      "source": "resume",
      "section": "Projects",
      "text": "Implemented Firebase authentication."
    }
  ]
}
```

Possible statuses:

```text
matched
partial
missing
unclear
```

This prevents the system from producing unsupported conclusions.

---

## 12. Matching Categories

The matching engine should evaluate:

### Skills

```text
Required skills
Preferred skills
Tools
Technologies
Programming languages
Frameworks
Databases
Cloud platforms
```

### Experience

```text
Years of experience
Relevant roles
Relevant responsibilities
Industry experience
```

### Education

```text
Degree
Field
Required education
Preferred education
```

### Projects

```text
Technology relevance
Domain relevance
Responsibilities
Project complexity
```

### Role Alignment

```text
Responsibilities
Job title relevance
Technical expectations
Domain relevance
```

---

## 13. Score Engine

The score engine converts matching evidence into numerical scores.

Initial configurable weights:

```text id="f2v4qa"
Skill Match          35%
Experience Match     20%
Keyword Match        15%
Education Match      10%
Project Relevance    10%
Role Alignment       10%
--------------------------------
Overall Match        100%
```

Example:

```text id="7d8h1n"
Skill Match:        82
Experience Match:   70
Keyword Match:      80
Education Match:    90
Project Relevance:  75
Role Alignment:     72
```

The weighted score produces the overall match score.

The weights should be configurable rather than hard-coded permanently.

---

## 14. Confidence

Every AI-derived conclusion should have a confidence level when appropriate.

```text
High
Medium
Low
```

Example:

```text id="s8x6h2"
High:
"Flutter is explicitly listed in the resume."

Medium:
"Mobile API development appears related to the JD requirement."

Low:
"The resume may indicate cloud deployment experience, but the evidence is insufficient."
```

Low-confidence findings should not be presented as confirmed facts.

---

## 15. ATS Engine

The ATS engine evaluates whether the resume is easy for automated systems to process.

Checks include:

```text
Section structure
Keyword visibility
Contact information
Experience formatting
Education formatting
Date consistency
Skill visibility
Section headings
Text readability
Potential parsing issues
```

Example:

```text id="q4b1e6"
ATS Score: 84

Positive:
✓ Standard headings
✓ Readable text
✓ Skills clearly listed

Issues:
⚠ Some important JD keywords are missing
⚠ Project descriptions could contain more relevant terminology
```

---

## 16. Skill Gap Engine

The skill gap engine compares JD requirements against demonstrated resume capabilities.

Example:

```text id="j6z1ka"
JD:
React
Docker
AWS
Flutter

Resume:
Flutter
Firebase
Node.js

Gap:
React
Docker
AWS
```

Each gap receives a priority.

```text
High
Medium
Low
```

Priority may consider:

* Required vs preferred status.
* Frequency in JD.
* Importance to responsibilities.
* Whether the skill is foundational.
* Whether the skill is already partially demonstrated.

---

## 17. Resume Improvement Engine

The system can suggest better wording for existing evidence.

Example:

Current:

```text
Worked on Flutter projects.
```

Suggested:

```text
Developed cross-platform Flutter applications and integrated backend services.
```

The suggestion must only use information supported by the original resume.

The AI must not invent:

```text
Fake metrics
Fake clients
Fake users
Fake achievements
Fake technologies
Fake certifications
Fake job responsibilities
```

---

## 18. Learning Recommendation Engine

Missing skills are converted into learning recommendations.

Example:

```text id="z8y4kd"
Missing Skill:
React.js

Priority:
High

Learning Path:
JavaScript
 ↓
React Fundamentals
 ↓
Components
 ↓
Props and State
 ↓
Hooks
 ↓
API Integration
 ↓
React Project
```

---

## 19. Course Recommendation

Course recommendations should be based on:

```text
Missing skill
Current skill level
Prerequisites
Learning objective
Difficulty
Course quality
Course relevance
```

The system should avoid recommending random courses simply because they contain the skill name.

---

## 20. LLM Responsibilities

The LLM should primarily handle:

```text
Explanation
Summarization
Resume improvement wording
Skill-gap reasoning
Learning-path generation
Recommendation explanation
```

The LLM should not be the sole source of:

```text
User identity
Resume facts
Exact score calculation
Database state
Authorization
```

---

## 21. Structured LLM Output

LLM responses should be requested in a predefined schema.

Example:

```json id="g1v6z3"
{
  "summary": "",
  "matchedAreas": [],
  "missingAreas": [],
  "weakAreas": [],
  "improvements": [],
  "learningRecommendations": []
}
```

The backend validates the response before storing it.

Invalid output should be retried or safely rejected.

---

## 22. Prompt Design

Prompts should explicitly instruct the model:

```text
Use only the supplied resume and JD.
Do not invent candidate experience.
Do not assume missing skills.
Clearly distinguish matched, partial, missing, and uncertain information.
Return valid structured JSON.
Provide evidence for important conclusions.
```

---

## 23. LLM Provider Abstraction

The application should not tightly couple business logic to a single provider.

Example:

```text id="7r0g8p"
AI Service
    ↓
LLM Provider Interface
    ├── Provider A
    ├── Provider B
    └── Provider C
```

The provider can be changed through configuration.

---

## 24. Embedding Architecture

Embeddings may be generated for:

* Resume skill descriptions.
* Resume project descriptions.
* JD requirements.
* JD responsibilities.

Conceptual flow:

```text
Text
 ↓
Embedding Model
 ↓
Vector
 ↓
Similarity Search
 ↓
Semantic Match
```

If vector search is introduced, vectors should be associated with the correct user/document context.

---

## 25. AI Failure Handling

Possible failures:

```text
LLM timeout
Invalid JSON
Provider unavailable
Embedding failure
Parser failure
Token limit exceeded
Malformed document
```

The system should handle these gracefully.

Possible strategy:

```text
Primary Provider
      ↓
Failure?
      ↓
Fallback Provider
      ↓
Failure?
      ↓
Retry / Partial Result / Error
```

---

## 26. AI Cost Control

AI operations can be expensive.

The platform should:

* Avoid unnecessary repeated parsing.
* Cache structured resume data.
* Cache structured JD data.
* Reuse embeddings where possible.
* Avoid sending entire documents repeatedly.
* Use smaller models for simple extraction.
* Use stronger models for complex reasoning.
* Track AI usage.

---

## 27. Privacy

Resume and JD data may contain sensitive personal and professional information.

AI processing must:

* Send only required data.
* Avoid unnecessary logging.
* Protect stored documents.
* Restrict access by user.
* Follow the platform's privacy policy.
* Define document retention and deletion behavior.

---

## 28. AI Evaluation

The AI system should be evaluated using a test dataset containing:

```text
Resume
JD
Expected matches
Expected gaps
Expected score range
Expected explanations
```

Evaluation metrics may include:

```text
Skill match precision
Skill match recall
False-positive rate
False-negative rate
Score correlation
Hallucination rate
Recommendation relevance
JSON validity
```

---

## 29. AI Architecture Goal

The final system should answer:

```text
How well does this resume match this job?

Why did I receive this score?

Which requirements do I satisfy?

Which requirements am I missing?

Where is my resume weak?

How can I improve the wording?

What should I learn next?
```

The answer must be evidence-based, explainable, and actionable.
