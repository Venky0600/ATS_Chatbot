# Frontend Architecture

## 1. Purpose

This document defines the architecture of the Flutter mobile application.

The frontend is responsible for user interaction, presentation, local state management, API communication, authentication flow, file selection, and displaying AI-generated analysis results.

Business-critical processing must remain on the backend.

---

## 2. Technology Stack

Recommended frontend stack:

```text
Flutter
Dart
Riverpod
Dio
GoRouter
Secure Storage
JSON Serialization
```

Recommended responsibilities:

| Technology         | Responsibility        |
| ------------------ | --------------------- |
| Flutter            | UI framework          |
| Dart               | Application language  |
| Riverpod           | State management      |
| Dio                | HTTP communication    |
| GoRouter           | Navigation            |
| Secure Storage     | Token/session storage |
| JSON Serialization | API model conversion  |

---

## 3. Architecture Pattern

The application follows a feature-first layered architecture.

```text
Presentation
     ↓
Domain
     ↓
Data
     ↓
API / Storage
```

Each feature should be independently organized.

---

## 4. Project Structure

Recommended structure:

```text
lib/
│
├── main.dart
│
├── core/
│   ├── config/
│   ├── constants/
│   ├── error/
│   ├── network/
│   ├── storage/
│   ├── theme/
│   ├── utils/
│   └── widgets/
│
├── routing/
│   └── app_router.dart
│
└── features/
    │
    ├── auth/
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │
    ├── resume/
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │
    ├── job_description/
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │
    ├── analysis/
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │
    ├── recommendations/
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │
    ├── history/
    │   ├── data/
    │   ├── domain/
    │   └── presentation/
    │
    └── profile/
        ├── data/
        ├── domain/
        └── presentation/
```

---

## 5. Core Layer

The `core` layer contains functionality shared across multiple features.

### Config

Contains:

* API base URL.
* Environment configuration.
* Application configuration.

Example:

```text
core/config/
├── app_config.dart
└── environment.dart
```

---

### Constants

Contains:

* API paths.
* Application constants.
* File limits.
* Validation constants.

---

### Network

Contains:

* HTTP client.
* Interceptors.
* Authentication headers.
* API error conversion.

Example:

```text
core/network/
├── api_client.dart
├── api_endpoints.dart
├── auth_interceptor.dart
└── network_exception.dart
```

---

### Storage

Responsible for secure local data.

Examples:

* Authentication token.
* Refresh token if applicable.
* User preferences.

Sensitive information must use secure storage rather than plain local storage.

---

## 6. Authentication Feature

Responsibilities:

* Google login.
* Discord login.
* Session handling.
* Logout.
* Authentication state.

Suggested structure:

```text
features/auth/
├── data/
│   ├── auth_repository_impl.dart
│   └── auth_remote_data_source.dart
│
├── domain/
│   ├── auth_repository.dart
│   └── auth_user.dart
│
└── presentation/
    ├── login_screen.dart
    ├── auth_controller.dart
    └── widgets/
```

---

## 7. Resume Feature

Responsibilities:

* Select resume.
* Upload resume.
* View uploaded resumes.
* Delete resume.
* View parsed resume information.
* Select resume for analysis.

Supported files:

```text
PDF
DOCX
TXT
```

Example UI flow:

```text
Resume Screen
     ↓
Select File
     ↓
Upload
     ↓
Processing
     ↓
Resume Parsed
     ↓
Resume Ready
```

---

## 8. Job Description Feature

The user can provide a JD through:

* Text input.
* File upload.

Example flow:

```text
JD Screen
   ↓
Enter / Upload JD
   ↓
Validate
   ↓
Save
   ↓
Parse
   ↓
Ready for Analysis
```

The application should allow the user to review the JD before starting analysis.

---

## 9. Analysis Feature

This is the primary feature of the product.

Responsibilities:

* Select resume.
* Select JD.
* Start analysis.
* Display analysis progress.
* Display final result.
* Display detailed matching information.

Possible screen structure:

```text
Analysis
│
├── Overall Score
├── ATS Score
├── Skill Match
├── Experience Match
├── Keyword Match
├── Project Relevance
├── What Matches
├── Missing Skills
├── Weak Areas
├── Resume Improvements
├── Learning Recommendations
└── Learning Path
```

---

## 10. Analysis State

The frontend should model analysis states.

```text
idle
loading
processing
success
error
```

Example:

```dart
enum AnalysisStatus {
  idle,
  loading,
  processing,
  success,
  error,
}
```

The UI must provide appropriate feedback for each state.

---

## 11. Analysis Result Model

The frontend should receive structured JSON from the backend.

Example:

```json
{
  "overallScore": 78,
  "atsScore": 84,
  "skillMatch": 82,
  "experienceMatch": 70,
  "keywordMatch": 80,
  "projectRelevance": 75,
  "matchedSkills": [],
  "missingSkills": [],
  "weakAreas": [],
  "improvements": [],
  "recommendations": []
}
```

The UI should render these fields rather than parsing natural-language AI responses.

---

## 12. Recommendations Feature

The recommendation screen displays:

* Missing skill.
* Importance.
* Reason.
* Recommended learning resource.
* Learning sequence.
* Estimated difficulty if available.

Example:

```text
React.js
Priority: High

Why:
Required by the JD but not demonstrated in the resume.

Learn:
1. JavaScript fundamentals
2. React components
3. Hooks
4. API integration
5. Build a project
```

---

## 13. History Feature

The history screen allows users to view previous analyses.

Example:

```text
Analysis History

Software Engineer
Score: 82%
2 Sep 2026

Flutter Developer
Score: 91%
30 Aug 2026

Backend Developer
Score: 67%
27 Aug 2026
```

Selecting an item opens the stored analysis.

---

## 14. Navigation

Recommended navigation:

```text
Authentication
     ↓
Home
 ┌───┼────────────┬──────────────┐
 ↓   ↓            ↓              ↓
Resume  JD      Analysis       History
                               
                 ↓
          Recommendations

Profile
```

GoRouter should handle protected routes.

Unauthenticated users should not access protected application screens.

---

## 15. API Communication

All API calls should use a centralized API client.

Example:

```text
UI
 ↓
Controller / Provider
 ↓
Repository
 ↓
API Client
 ↓
Backend
```

The UI must not directly call Dio for business operations.

---

## 16. Error Handling

The frontend should distinguish between:

```text
Network Error
Authentication Error
Validation Error
File Error
Server Error
Analysis Error
AI Processing Error
Unknown Error
```

Example user-facing messages:

```text
"Unable to connect to the server."

"The selected file type is not supported."

"Your analysis could not be completed. Please try again."
```

Internal stack traces must not be shown to users.

---

## 17. Loading Experience

Long-running operations must show meaningful progress.

Example:

```text
Uploading Resume...
       ↓
Extracting Resume Text...
       ↓
Understanding Job Description...
       ↓
Comparing Skills...
       ↓
Running ATS Analysis...
       ↓
Generating Recommendations...
       ↓
Analysis Complete
```

---

## 18. Local Caching

The frontend may cache:

* Recent analysis summaries.
* User preferences.
* Non-sensitive UI state.

Sensitive tokens must be stored securely.

Cached analysis must be invalidated when necessary.

---

## 19. UI Principles

The application should prioritize:

* Simple navigation.
* Clear score visualization.
* Easy-to-understand explanations.
* Mobile-first layouts.
* Accessible typography.
* Consistent spacing.
* Clear loading states.
* Clear error states.
* Minimal unnecessary interactions.

The score should never be the only important information on the analysis screen.

---

## 20. Security Rules

The Flutter application must never contain:

```text
MongoDB credentials
LLM API keys
Storage service secret keys
Backend private credentials
```

API authentication tokens must be stored using secure platform storage.

---

## 21. Testing

Frontend testing should include:

### Unit Tests

* Validators.
* Parsers.
* Data models.
* State logic.

### Widget Tests

* Login screen.
* Resume upload.
* JD input.
* Score screen.
* Recommendation screen.

### Integration Tests

* Login flow.
* Resume upload.
* JD submission.
* Analysis flow.
* History retrieval.

---

## 22. Frontend Design Goal

The frontend should make the product feel like an intelligent career assistant rather than a simple score calculator.

The user should be able to answer:

```text
How well do I match?

What does the company want?

What do I already have?

What am I missing?

What should I improve?

What should I learn next?
```

These questions should be directly reflected in the UI.
