# Tasks: Prompt Template API Integration

**Input**: Design documents from `/specs/007-prompt-template-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Add TypeScript types and API service infrastructure

- [x] T001 Add PromptTemplateDTO, PromptTemplateDetailDTO, PromptTemplateVersionDTO types to services/api/types.ts
- [x] T002 [P] Add TemplateUsageDTO type to services/api/types.ts
- [x] T003 [P] Add request types (ListPromptTemplatesRequest, CreatePromptTemplateRequest, UpdatePromptTemplateRequest, DeleteTemplateRequest, RollbackTemplateRequest, GetTemplateDetailRequest, GetVersionDetailRequest) to services/api/types.ts
- [x] T004 [P] Add usage request types (CreateTemplateUsageRequest, DeleteUsageRequest) to services/api/types.ts
- [x] T005 Create prompt template API service file services/api/prompt-templates.ts with endpoint constants
- [x] T006 [P] Create template usages API service file services/api/template-usages.ts with endpoint constants

---

## Phase 2: Foundational (API Layer)

**Purpose**: Core API functions that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Implement promptTemplateApi.list() function in services/api/prompt-templates.ts
- [x] T008 [P] Implement promptTemplateApi.create() function in services/api/prompt-templates.ts
- [x] T009 [P] Implement promptTemplateApi.getDetail() function in services/api/prompt-templates.ts
- [x] T010 [P] Implement promptTemplateApi.update() function in services/api/prompt-templates.ts
- [x] T011 [P] Implement promptTemplateApi.delete() function in services/api/prompt-templates.ts
- [x] T012 [P] Implement promptTemplateApi.rollback() function in services/api/prompt-templates.ts
- [x] T013 [P] Implement promptTemplateApi.getVersionDetail() function in services/api/prompt-templates.ts
- [x] T014 Implement templateUsageApi.list() function in services/api/template-usages.ts
- [x] T015 [P] Implement templateUsageApi.create() function in services/api/template-usages.ts
- [x] T016 [P] Implement templateUsageApi.delete() function in services/api/template-usages.ts
- [x] T017 Export promptTemplateApi and templateUsageApi from services/api/index.ts

**Checkpoint**: API layer ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Prompt Templates List (Priority: P1) 🎯 MVP

**Goal**: Users can browse and search prompt templates with pagination and filtering

**Independent Test**: Navigate to Prompt Registry page, verify templates load from API, search works, usage filter works

### Implementation for User Story 1

- [x] T018 [US1] Create useTemplateUsages hook in services/hooks/useTemplateUsages.ts (fetch usage list for dropdown)
- [x] T019 [US1] Create usePromptTemplates hook in services/hooks/usePromptTemplates.ts with pagination, keyword search, usageId filter
- [x] T020 [US1] Update PromptManagement.tsx to import and use usePromptTemplates hook instead of props
- [x] T021 [US1] Update PromptManagement.tsx to import and use useTemplateUsages hook for category filter
- [x] T022 [US1] Replace hardcoded CATEGORIES array with dynamic usages from API in components/PromptManagement.tsx
- [x] T023 [US1] Update card view to display usageName instead of category in components/PromptManagement.tsx
- [x] T024 [US1] Update list view table to display usageName instead of category in components/PromptManagement.tsx
- [x] T025 [US1] Add loading state UI (spinner) while fetching templates in components/PromptManagement.tsx
- [x] T026 [US1] Add error state UI with retry button in components/PromptManagement.tsx
- [x] T027 [US1] Update pagination controls to use hook's setPage function in components/PromptManagement.tsx
- [x] T028 [US1] Display currentVersion badge on template cards/rows in components/PromptManagement.tsx
- [x] T029 [US1] Remove tags display from card/list views (not supported by backend) in components/PromptManagement.tsx

**Checkpoint**: User Story 1 complete - templates list from API, search and filter working

---

## Phase 4: User Story 2 - Create New Prompt Template (Priority: P1)

**Goal**: Users can create new prompt templates via API

**Independent Test**: Click "New template", fill form, submit, verify template appears in list

### Implementation for User Story 2

- [x] T030 [US2] Create usePromptTemplateMutations hook with createTemplate function in services/hooks/usePromptTemplateMutations.ts
- [x] T031 [US2] Update PromptFormModal to use usage dropdown instead of category select in components/PromptManagement.tsx
- [x] T032 [US2] Remove tags input from PromptFormModal in components/PromptManagement.tsx
- [x] T033 [US2] Add content size validation (max 64KB) before form submission in components/PromptManagement.tsx
- [x] T034 [US2] Wire PromptFormModal submit to createTemplate mutation in components/PromptManagement.tsx
- [x] T035 [US2] Add loading state to form submit button during API call in components/PromptManagement.tsx
- [x] T036 [US2] Handle API error responses (409 conflict, 400 validation) with user messages in components/PromptManagement.tsx
- [x] T037 [US2] Refresh template list after successful create in components/PromptManagement.tsx

**Checkpoint**: User Story 2 complete - create template via API working

---

## Phase 5: User Story 3 - Edit Prompt Template (Priority: P1)

**Goal**: Users can edit templates, each edit creates new version with optimistic locking

**Independent Test**: Open template, modify content, save, verify version number increments

### Implementation for User Story 3

- [x] T038 [US3] Add updateTemplate function to usePromptTemplateMutations hook in services/hooks/usePromptTemplateMutations.ts
- [x] T039 [US3] Add changeNote input field to PromptFormModal for edit mode in components/PromptManagement.tsx
- [x] T040 [US3] Pass expectedVersion (optimistic lock) when calling update API in components/PromptManagement.tsx
- [x] T041 [US3] Handle HTTP 409 version conflict: auto-reload and show notification in components/PromptManagement.tsx
- [x] T042 [US3] Wire PromptFormModal submit to updateTemplate mutation for edit mode in components/PromptManagement.tsx
- [x] T043 [US3] Refresh template list after successful update in components/PromptManagement.tsx

**Checkpoint**: User Story 3 complete - edit template with versioning working

---

## Phase 6: User Story 4 - Delete Prompt Template (Priority: P2)

**Goal**: Users can delete templates with confirmation

**Independent Test**: Click delete on template, confirm, verify it disappears from list

### Implementation for User Story 4

- [x] T044 [US4] Add deleteTemplate function to usePromptTemplateMutations hook in services/hooks/usePromptTemplateMutations.ts
- [x] T045 [US4] Add confirmation dialog before delete in components/PromptManagement.tsx
- [x] T046 [US4] Wire delete button to deleteTemplate mutation in components/PromptManagement.tsx
- [x] T047 [US4] Handle delete API errors with user messages in components/PromptManagement.tsx
- [x] T048 [US4] Refresh template list after successful delete in components/PromptManagement.tsx

**Checkpoint**: User Story 4 complete - delete template working

---

## Phase 7: User Story 5 - View Version History (Priority: P2)

**Goal**: Users can view template version history and see previous version content

**Independent Test**: Open template detail, view version history list, click version to see content

### Implementation for User Story 5

- [x] T049 [US5] Create usePromptTemplate hook for fetching single template detail with versions in services/hooks/usePromptTemplate.ts
- [x] T050 [US5] Create PromptDetailView component in components/prompt/PromptDetailView.tsx
- [x] T051 [US5] Create VersionHistory component in components/prompt/VersionHistory.tsx
- [x] T052 [US5] Display version history list with versionNumber, changeNote, createdAt in components/prompt/VersionHistory.tsx
- [x] T053 [US5] Add click handler to show version content in a modal or panel in components/prompt/VersionHistory.tsx
- [x] T054 [US5] Add navigation from template list to detail view in components/PromptManagement.tsx
- [x] T055 [US5] Add route for prompt template detail /prompts/:id in App.tsx

**Checkpoint**: User Story 5 complete - version history viewable

---

## Phase 8: User Story 6 - Rollback to Previous Version (Priority: P3)

**Goal**: Users can rollback a template to a previous version

**Independent Test**: View version history, click rollback on previous version, confirm, verify content reverts

### Implementation for User Story 6

- [x] T056 [US6] Add rollbackTemplate function to usePromptTemplateMutations hook in services/hooks/usePromptTemplateMutations.ts
- [x] T057 [US6] Add "Rollback to this version" button to version history items in components/prompt/VersionHistory.tsx
- [x] T058 [US6] Add confirmation dialog before rollback in components/prompt/VersionHistory.tsx
- [x] T059 [US6] Wire rollback button to rollbackTemplate mutation in components/prompt/VersionHistory.tsx
- [x] T060 [US6] Handle rollback API errors with user messages in components/prompt/VersionHistory.tsx
- [x] T061 [US6] Refresh template detail after successful rollback in components/prompt/PromptDetailView.tsx

**Checkpoint**: User Story 6 complete - rollback functionality working

---

## Phase 9: User Story 7 - Manage Template Usages (Priority: P3)

**Goal**: Administrators can create and delete template usage categories

**Independent Test**: Access usage management, create new usage, verify it appears in dropdown

### Implementation for User Story 7

- [x] T062 [US7] Add createUsage and deleteUsage functions to useTemplateUsages hook in services/hooks/useTemplateUsages.ts
- [x] T063 [US7] Create UsageManagement component in components/prompt/UsageManagement.tsx
- [x] T064 [US7] Add usage list display with delete button in components/prompt/UsageManagement.tsx
- [x] T065 [US7] Add create usage form with code, name, description fields in components/prompt/UsageManagement.tsx
- [x] T066 [US7] Add code format validation (uppercase with underscores) in components/prompt/UsageManagement.tsx
- [x] T067 [US7] Handle 409 conflict when usage is in use (cannot delete) in components/prompt/UsageManagement.tsx
- [x] T068 [US7] Add route for usage management /prompts/usages in App.tsx
- [x] T069 [US7] Add link to usage management from PromptManagement page in components/PromptManagement.tsx

**Checkpoint**: User Story 7 complete - usage management working

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and edge case handling

- [ ] T070 [P] Remove old PromptTemplate interface from types.ts (replaced by PromptTemplateDTO)
- [ ] T071 [P] Remove mock prompts data and props from App.tsx
- [x] T072 Update App.tsx to remove onAdd, onUpdate, onDelete props from PromptManagement
- [x] T073 [P] Add empty state component when no templates exist in components/PromptManagement.tsx
- [x] T074 [P] Add retry functionality to error states across all components
- [x] T075 Export new hooks from services/hooks/index.ts
- [x] T076 Verify production build succeeds with npm run build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1, US2, US3 are all P1 - can run in parallel after Foundational
  - US4, US5 are P2 - can run in parallel with each other
  - US6, US7 are P3 - can run in parallel with each other
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Depends on US1 for list refresh
- **User Story 3 (P1)**: Can start after Foundational - Depends on US1/US2 for form modal
- **User Story 4 (P2)**: Can start after US1 - Uses same list component
- **User Story 5 (P2)**: Can start after Foundational - New component, independent
- **User Story 6 (P3)**: Depends on US5 - Uses version history component
- **User Story 7 (P3)**: Can start after Foundational - Independent admin feature

### Within Each User Story

- Types/API before hooks
- Hooks before components
- Core implementation before error handling
- Test functionality after each checkpoint

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T001 Types || T002 Usage types || T003 Request types || T004 Usage request types
T005 Prompt API file || T006 Usage API file
```

**Phase 2 (Foundational)**:
```
T007 list → then all others can run in parallel:
T008 create || T009 getDetail || T010 update || T011 delete || T012 rollback || T013 getVersionDetail
T014 usage.list → then T015 create || T016 delete
```

**Phase 3+ (User Stories)**:
```
US1, US2, US3 can start in parallel after Foundational
US4, US5 can start in parallel
US6, US7 can start in parallel
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T017)
3. Complete Phase 3: User Story 1 (T018-T029)
4. Complete Phase 4: User Story 2 (T030-T037)
5. Complete Phase 5: User Story 3 (T038-T043)
6. **STOP and VALIDATE**: List, create, edit working with API
7. Deploy if ready - basic CRUD is functional

### Incremental Delivery

1. Complete Setup + Foundational → API layer ready
2. Add User Story 1 → Test independently → Templates list works ✓
3. Add User Story 2 → Test independently → Create template works ✓
4. Add User Story 3 → Test independently → Edit with versioning works ✓
5. Add User Story 4 → Test independently → Delete works ✓
6. Add User Story 5 → Test independently → Version history viewable ✓
7. Add User Story 6 → Test independently → Rollback works ✓
8. Add User Story 7 → Test independently → Usage management works ✓
9. Polish phase → Clean up, verify build

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase or logical group
- Key insight: US1, US2, US3 are all P1 priority - implement together for functional MVP
- The old mock data approach (props-based) should be removed AFTER hooks integration is verified working
