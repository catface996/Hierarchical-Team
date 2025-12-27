# Tasks: Gateway API Integration

**Input**: Design documents from `/specs/009-gateway-api-integration/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/gateway-routing.md, quickstart.md

**Tests**: Tests are NOT explicitly requested. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend SPA**: `services/api/`, `vite.config.ts` at repository root
- Per plan.md structure decision

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup required - this feature modifies existing files only

*No setup tasks - all changes are in-place modifications to existing API service files*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update Vite proxy configuration - MUST complete before API endpoint changes can be tested

**⚠️ CRITICAL**: No API endpoint changes can be properly tested until this phase is complete

- [x] T001 Update vite.config.ts: Replace multi-port proxy configuration with single gateway proxy to localhost:8888

**Checkpoint**: Gateway proxy ready - API endpoint migration can now begin

---

## Phase 3: User Story 1 - Seamless API Access Through Gateway (Priority: P1) 🎯 MVP

**Goal**: All existing features continue to work through gateway routing

**Independent Test**: Load each feature page (Resources, Topologies, Models, Prompts) and verify API calls succeed via browser DevTools

### Implementation for User Story 1

#### Service API Endpoints (→ /api/service/v1/)

- [x] T002 [P] [US1] Update services/api/resources.ts: Change all endpoint paths from `/api/v1/` to `/api/service/v1/` (8 endpoints)
- [x] T003 [P] [US1] Update services/api/topology.ts: Change all endpoint paths from `/api/v1/` to `/api/service/v1/` (20 endpoints)
- [x] T004 [P] [US1] Update services/api/nodes.ts: Change all endpoint paths from `/api/v1/` to `/api/service/v1/` (6 endpoints)
- [x] T005 [P] [US1] Update services/api/prompt-templates.ts: Change all endpoint paths from `/api/v1/` to `/api/service/v1/` (7 endpoints)
- [x] T006 [P] [US1] Update services/api/template-usages.ts: Change all endpoint paths from `/api/v1/` to `/api/service/v1/` (3 endpoints)

#### Executor API Endpoints (→ /api/executor/v1/)

- [x] T007 [P] [US1] Update services/api/models.ts: Change all endpoint paths from `/api/v1/` to `/api/executor/v1/` (5 endpoints)

**Checkpoint**: All API endpoints migrated - application should be fully functional through gateway

---

## Phase 4: User Story 2 - Consistent URL Structure Across Services (Priority: P1)

**Goal**: All API endpoints follow consistent naming pattern `/api/{service}/v1/{module}/{action}`

**Independent Test**: Open browser DevTools Network tab, trigger various API calls, verify all URLs follow the pattern

### Implementation for User Story 2

*No additional implementation tasks - URL consistency is achieved by completing User Story 1*
*This story is validated through inspection of the endpoint changes made in US1*

- [x] T008 [US2] Verify URL pattern consistency: Review all modified files to confirm pattern `/api/{service}/v1/{module}/{action}`

**Checkpoint**: URL structure validated - all endpoints follow consistent pattern

---

## Phase 5: User Story 3 - Single Proxy Configuration (Priority: P2)

**Goal**: Development environment uses single gateway proxy

**Independent Test**: Check vite.config.ts has single proxy entry pointing to localhost:8888

### Implementation for User Story 3

*No additional implementation tasks - single proxy configuration is achieved in T001 (Foundational phase)*

- [x] T009 [US3] Verify proxy simplification: Confirm vite.config.ts has single proxy entry to localhost:8888

**Checkpoint**: Proxy configuration simplified

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup

- [x] T010 [P] Run build to verify no TypeScript errors: `npm run build`
- [x] T011 [P] Update code comments: Remove outdated port references in API files (7070, 8080)
- [x] T012 Run quickstart.md validation checklist: Test all features through gateway

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No setup needed - skip
- **Foundational (Phase 2)**: No dependencies - can start immediately (proxy config)
- **User Story 1 (Phase 3)**: Depends on Foundational (proxy must be configured first for testing)
- **User Story 2 (Phase 4)**: Depends on User Story 1 (URL pattern validation)
- **User Story 3 (Phase 5)**: Depends on Foundational (proxy simplification validation)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (T001) - MAIN IMPLEMENTATION
- **User Story 2 (P1)**: Depends on User Story 1 (validation task only)
- **User Story 3 (P2)**: Depends on Foundational (validation task only)

### Within User Story 1

- All tasks T002-T007 can run in parallel (different files, no dependencies)

### Parallel Opportunities

- T002, T003, T004, T005, T006, T007 can all run in parallel (different API files)
- T010, T011 can run in parallel (build vs comment cleanup)

---

## Parallel Example: User Story 1 Implementation

```bash
# Launch all API file updates together (6 files in parallel):
Task: "Update services/api/resources.ts endpoints"
Task: "Update services/api/topology.ts endpoints"
Task: "Update services/api/nodes.ts endpoints"
Task: "Update services/api/prompt-templates.ts endpoints"
Task: "Update services/api/template-usages.ts endpoints"
Task: "Update services/api/models.ts endpoints"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001: Update vite.config.ts proxy
2. Complete T002-T007: Update all API endpoint paths (can run in parallel)
3. **STOP and VALIDATE**: Test all features through gateway
4. Build passes, all features work → MVP complete

### Incremental Delivery

1. T001 (proxy) → Gateway routing ready
2. T002-T007 (endpoints) → All API calls migrated
3. T008-T009 (validation) → Pattern and config verified
4. T010-T012 (polish) → Build verified, comments cleaned

### Recommended Execution Order

Since this is a straightforward migration with highly parallelizable tasks:

1. **T001** (proxy config) - Must be first
2. **T002-T007** (all endpoint updates) - Run in parallel
3. **T010** (build verification) - Immediately after T002-T007
4. **T008, T009, T011, T012** (validation and cleanup) - Final checks

---

## Endpoint Migration Reference (Quick Reference)

### resources.ts (8 endpoints)
- `/api/v1/resources/*` → `/api/service/v1/resources/*`
- `/api/v1/resource-types/*` → `/api/service/v1/resource-types/*`

### topology.ts (20 endpoints)
- `/api/v1/topologies/*` → `/api/service/v1/topologies/*`
- `/api/v1/relationships/*` → `/api/service/v1/relationships/*`
- `/api/v1/resources/topology/*` → `/api/service/v1/resources/topology/*`
- `/api/v1/resources/members/*` → `/api/service/v1/resources/members/*`
- `/api/v1/resources/ancestors/*` → `/api/service/v1/resources/ancestors/*`

### nodes.ts (6 endpoints)
- `/api/v1/nodes/*` → `/api/service/v1/nodes/*`

### prompt-templates.ts (7 endpoints)
- `/api/v1/prompt-templates/*` → `/api/service/v1/prompt-templates/*`

### template-usages.ts (3 endpoints)
- `/api/v1/template-usages/*` → `/api/service/v1/template-usages/*`

### models.ts (5 endpoints)
- `/api/v1/models/*` → `/api/executor/v1/models/*`

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- This is a low-risk migration - simple string prefix changes in constant definitions
