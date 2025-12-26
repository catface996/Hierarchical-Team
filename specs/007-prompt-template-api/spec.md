# Feature Specification: Prompt Template API Integration

**Feature Branch**: `007-prompt-template-api`
**Created**: 2025-12-26
**Status**: Draft
**Input**: User description: "集成后端提供的提示词模板管理接口，文档地址：http://localhost:8080/v3/api-docs，字段定义以后端为准，可以重构前端的字段定义"

## Overview

Integrate the backend Prompt Template Management API into the frontend application, replacing the current mock/local data implementation with real API calls. This includes refactoring frontend data models to align with backend field definitions.

## Clarifications

### Session 2025-12-26

- Q: How should the system handle version conflicts (HTTP 409) when two users edit the same template simultaneously? → A: Auto-reload - Discard user's changes and reload the latest version automatically

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Prompt Templates List (Priority: P1)

Users need to browse and search through available prompt templates to find the one that fits their needs.

**Why this priority**: This is the foundational feature - users must be able to see existing templates before they can do anything else with them.

**Independent Test**: Navigate to the Prompt Registry page and verify templates are loaded from the backend API, with search and filtering working correctly.

**Acceptance Scenarios**:

1. **Given** a user navigates to the Prompt Registry page, **When** the page loads, **Then** the system displays a paginated list of prompt templates from the backend API
2. **Given** a user is viewing the prompt list, **When** they enter a search keyword, **Then** the list filters to show only templates matching the keyword in name or description
3. **Given** a user is viewing the prompt list, **When** they select a usage type filter, **Then** only templates with that usage type are displayed
4. **Given** a user is viewing the prompt list, **When** they switch between list and card view, **Then** the same data is displayed in the selected format

---

### User Story 2 - Create New Prompt Template (Priority: P1)

Users need to create new prompt templates with a name, content, optional usage type, and description.

**Why this priority**: Creating templates is a core operation - without it, users cannot add new prompts to the system.

**Independent Test**: Click "New template" button, fill out the form, submit, and verify the new template appears in the list.

**Acceptance Scenarios**:

1. **Given** a user clicks "New template", **When** they fill in required fields (name, content) and submit, **Then** the template is created via API and appears in the list
2. **Given** a user is creating a template, **When** they select a usage type from the dropdown, **Then** the template is associated with that usage
3. **Given** a user submits a template with a duplicate name, **When** the API returns a conflict error, **Then** the system displays an appropriate error message
4. **Given** a user submits a template with content exceeding 64KB, **When** the API returns a validation error, **Then** the system displays an appropriate error message

---

### User Story 3 - Edit Prompt Template (Priority: P1)

Users need to modify existing prompt templates. Each edit creates a new version automatically.

**Why this priority**: Editing is essential for iterating on prompts and improving them over time.

**Independent Test**: Open an existing template, modify its content, save, and verify the changes are persisted and version number increments.

**Acceptance Scenarios**:

1. **Given** a user opens a template for editing, **When** they modify the content and save, **Then** the API creates a new version and the template shows the updated content
2. **Given** a user edits a template, **When** they optionally add a change note, **Then** the change note is recorded with the new version
3. **Given** two users edit the same template simultaneously, **When** the second user saves and receives a version conflict (HTTP 409), **Then** the system automatically discards the user's changes and reloads the latest version with a notification

---

### User Story 4 - Delete Prompt Template (Priority: P2)

Users need to remove prompt templates that are no longer needed.

**Why this priority**: Deletion is important for maintenance but less frequently used than CRUD operations.

**Independent Test**: Select a template, confirm deletion, and verify it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** a user clicks delete on a template, **When** they confirm the deletion, **Then** the template is soft-deleted via API and removed from the list
2. **Given** a user attempts to delete a template, **When** the deletion fails, **Then** an appropriate error message is displayed

---

### User Story 5 - View Version History (Priority: P2)

Users need to see the history of changes made to a template and view previous versions.

**Why this priority**: Version history provides audit trail and ability to reference past versions.

**Independent Test**: Open a template with multiple versions, view the version history list, and click to see a specific version's content.

**Acceptance Scenarios**:

1. **Given** a user opens a template detail, **When** they view the version history section, **Then** all historical versions are displayed with version number, change note, and timestamp
2. **Given** a user is viewing version history, **When** they click on a specific version, **Then** the content of that version is displayed

---

### User Story 6 - Rollback to Previous Version (Priority: P3)

Users need to restore a template to a previous version if a recent change was problematic.

**Why this priority**: Rollback is a recovery feature, important but not used in normal workflows.

**Independent Test**: View version history, select a previous version, confirm rollback, and verify the template content reverts.

**Acceptance Scenarios**:

1. **Given** a user is viewing a template's version history, **When** they select a previous version and confirm rollback, **Then** a new version is created with the content from the selected version
2. **Given** a user rolls back to version N, **When** the rollback completes, **Then** the current version number increments and content matches version N

---

### User Story 7 - Manage Template Usages (Priority: P3)

Administrators need to create and manage template usage categories (e.g., Fault Diagnosis, Performance Analysis).

**Why this priority**: Usage management is administrative functionality, needed less frequently.

**Independent Test**: Create a new usage type, verify it appears in the usage dropdown when creating/editing templates.

**Acceptance Scenarios**:

1. **Given** an administrator accesses usage management, **When** they create a new usage with code and name, **Then** the usage appears in the system
2. **Given** an administrator attempts to delete a usage, **When** templates are still using that usage, **Then** the system prevents deletion with an appropriate message
3. **Given** an administrator creates a usage, **When** the code format is invalid (not uppercase with underscores), **Then** the system displays a validation error

---

### Edge Cases

- What happens when the backend API is unavailable? System should display an error state and allow retry.
- How does the system handle very long template content (up to 64KB limit)?
- What happens when a user tries to view a template that has been deleted by another user?
- How does the system handle concurrent edits resulting in version conflicts? → Auto-reload: discard user's changes, reload latest version, show notification

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch prompt templates from the backend API `/api/v1/prompt-templates/list`
- **FR-002**: System MUST support pagination when listing templates (page, size parameters)
- **FR-003**: System MUST support filtering templates by usage type (usageId parameter)
- **FR-004**: System MUST support searching templates by keyword (matches name and description)
- **FR-005**: System MUST create templates via `/api/v1/prompt-templates/create` with name, content, optional usageId, and description
- **FR-006**: System MUST update templates via `/api/v1/prompt-templates/update`, which auto-generates new versions
- **FR-007**: System MUST delete templates via `/api/v1/prompt-templates/delete` (soft delete)
- **FR-008**: System MUST fetch template details with version history via `/api/v1/prompt-templates/detail`
- **FR-009**: System MUST fetch specific version content via `/api/v1/prompt-templates/version/detail`
- **FR-010**: System MUST rollback templates via `/api/v1/prompt-templates/rollback`
- **FR-011**: System MUST fetch template usages via `/api/v1/template-usages/list`
- **FR-012**: System MUST create template usages via `/api/v1/template-usages/create`
- **FR-013**: System MUST delete template usages via `/api/v1/template-usages/delete`
- **FR-014**: System MUST handle API errors gracefully with user-friendly messages
- **FR-015**: System MUST handle version conflicts (409 responses) by automatically discarding user changes, reloading the latest version, and displaying a notification to the user
- **FR-016**: System MUST validate template content does not exceed 64KB before submission
- **FR-017**: System MUST refactor frontend PromptTemplate type to align with backend PromptTemplateDTO

### Key Entities

- **PromptTemplate**: A reusable prompt instruction with name, content, description, usage association, version tracking. Key attributes: id, name, content, description, usageId, usageName, currentVersion, version (optimistic lock), createdBy, createdAt, updatedAt
- **PromptTemplateVersion**: A historical snapshot of a template at a specific point in time. Key attributes: id, templateId, versionNumber, content, changeNote, createdBy, createdAt
- **TemplateUsage**: A category for organizing templates by purpose. Key attributes: id, code, name, description, createdAt, updatedAt

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view, create, edit, and delete prompt templates with all operations persisted to the backend
- **SC-002**: Users can search and filter templates, with results appearing within 2 seconds
- **SC-003**: Users can view template version history and rollback to previous versions
- **SC-004**: System handles API errors gracefully, displaying clear error messages to users
- **SC-005**: Frontend data models align with backend API contracts, eliminating data transformation issues

## Assumptions

- The backend API at `http://localhost:8080` is available and stable
- Authentication is already implemented (Bearer token in headers)
- The `operatorId` required by API endpoints will be obtained from the current user session
- Template content supports plain text format (no rich text or markdown preview required for MVP)
- The existing UI design (card/list views, search, pagination) will be preserved while integrating with the real API
