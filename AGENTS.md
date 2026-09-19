# MINDMATE NER — Development & Workflow Rules

This document outlines the strict guidelines and operational rules for AI assistants and developers working on the **MINDMATE NER** repository.

---

## 🚨 MANDATORY WORKFLOW RULES

### 1. Functionality Protection & Approval Requirement
* **Do NOT change existing functionality** without explicit user permission and approval.
* Existing features, navigation flows, UI animations, and API behavior must remain fully intact and operational unless the user explicitly requests changes.
* Proposed architectural or feature modifications must be presented and accepted before implementation begins.

### 2. Database & Data Integrity Safeguards
* **Do NOT erase, wipe, drop, clear, or overwrite database data** under any circumstances without explicit user approval.
* Schema additions or model modifications must be non-destructive and strictly backward-compatible.
* Do NOT clear existing MongoDB Atlas collections, test records, or user accounts during testing or development.

### 3. Step-by-Step & Scoped Execution
* Implement tasks strictly according to the specified step or prompt.
* **Do NOT implement future features**, unrequested ML models, unrequested integrations, or unrequested games until explicit permission for that specific step is granted.
* Always stop after completing the requested step and provide a summary report.

### 4. Preservation of Core Infrastructure
* **Do NOT rebuild or refactor the project structure** from scratch.
* Preserve existing JWT authentication architecture, Node.js backend controllers, MongoDB Atlas integration, and React + Vite frontend setup.
* Always extract and verify `userId` strictly from authenticated JWTs on backend API endpoints—never trust client-supplied user IDs.

### 5. Code Quality & Testing Requirements
* Always verify TypeScript compilation (`npm run build`) for both client and backend before concluding work.
* Maintain high-contrast, accessible, elderly-friendly UI standards.
* Keep state calculations and scoring logic inside reusable utilities/services rather than cluttering UI components.

---

*These rules are binding for all code generation, refactoring, database interactions, and feature implementations across the project.*
