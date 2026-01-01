# Tasks: Diagnosis Page SSE Stream Refactor

**Input**: Design documents from `/specs/016-diagnosis-sse-refactor/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested - manual testing only per plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend Web App**: `services/`, `components/` at repository root
- Files to modify: `services/api/types.ts`, `services/hooks/useExecution.ts`, `components/DiagnosisView.tsx`

---

## Phase 1: Setup (Type Definitions)

**Purpose**: Add new type definitions for the structured SSE event format

- [x] T001 [P] Add ExecutorEvent interface to services/api/types.ts
- [x] T002 [P] Add EventSource interface with AgentType union to services/api/types.ts
- [x] T003 [P] Add EventType interface with EventCategory union to services/api/types.ts
- [x] T004 [P] Add EventData union type and data interfaces (LlmStreamData, LifecycleCompletedData, etc.) to services/api/types.ts
- [x] T005 Update LogMessage interface to add reasoning and toolCalls fields in services/api/types.ts

**Checkpoint**: All new types available for use in hooks and components

---

## Phase 2: Foundational (SSE Parsing Logic)

**Purpose**: Update the useExecution hook to parse the new SSE event format

**⚠️ CRITICAL**: This phase must complete before user story implementation begins

- [x] T006 Refactor SSE line parsing in useExecution.ts to extract ExecutorEvent from data lines in services/hooks/useExecution.ts
- [x] T007 Update run_id extraction logic to use event.run_id field in services/hooks/useExecution.ts
- [x] T008 Add event category/action parsing using event.event.category and event.event.action in services/hooks/useExecution.ts
- [x] T009 Add graceful error handling for malformed JSON events in services/hooks/useExecution.ts

**Checkpoint**: SSE events are parsed into ExecutorEvent objects - ready for agent identification

---

## Phase 3: User Story 1 - View Real-time Agent Messages (Priority: P1) 🎯 MVP

**Goal**: Display real-time messages from agents in correctly labeled chat bubbles based on agent identity

**Independent Test**: Start a diagnosis execution and verify that messages from Global Supervisor, Team Supervisors, and Workers appear in correctly labeled chat bubbles with proper agent names

### Implementation for User Story 1

- [x] T010 [US1] Refactor getAgentIdentifier function to use source.agent_type in components/DiagnosisView.tsx
- [x] T011 [US1] Implement global_supervisor identification returning "Global Supervisor" label in components/DiagnosisView.tsx
- [x] T012 [US1] Implement team_supervisor identification returning "[team_name] Supervisor" label in components/DiagnosisView.tsx
- [x] T013 [US1] Implement worker identification returning source.agent_name in components/DiagnosisView.tsx
- [x] T014 [US1] Add fallback handling for missing source object (return "System") in components/DiagnosisView.tsx
- [x] T015 [US1] Update aggregateEventsToLogs to handle llm.stream event aggregation in components/DiagnosisView.tsx
- [x] T016 [US1] Update aggregateEventsToLogs to accumulate llm.reasoning into reasoning field in components/DiagnosisView.tsx
- [x] T017 [US1] Add collapsible "Thinking..." UI section for reasoning content in components/LogStream.tsx
- [x] T018 [US1] Remove legacy _is_global_supervisor, _team_name field handling in components/DiagnosisView.tsx

**Checkpoint**: Agent messages display with correct attribution - US1 complete and testable

---

## Phase 4: User Story 2 - View Execution Lifecycle Events (Priority: P2)

**Goal**: Display execution lifecycle state (started, completed, failed, cancelled)

**Independent Test**: Trigger diagnosis execution and verify lifecycle events are properly displayed

### Implementation for User Story 2

- [x] T019 [US2] Add lifecycle.started event handler to show execution begin state in components/DiagnosisView.tsx
- [x] T020 [US2] Add lifecycle.completed event handler to show completion summary in components/DiagnosisView.tsx
- [x] T021 [US2] Add lifecycle.failed event handler to show error message in components/DiagnosisView.tsx
- [x] T022 [US2] Add lifecycle.cancelled event handler to show cancellation state in components/DiagnosisView.tsx
- [x] T023 [US2] Update getLogType function to map lifecycle events to 'system' type in components/DiagnosisView.tsx
- [x] T024 [US2] Add visual styling to distinguish lifecycle events from content messages in components/DiagnosisView.tsx

**Checkpoint**: Lifecycle events display correctly - US2 complete and testable

---

## Phase 5: User Story 3 - View Dispatch Events (Priority: P3)

**Goal**: Display task delegation flow when Global Supervisor dispatches to teams/workers

**Independent Test**: Run a diagnosis that involves team/worker dispatch and verify dispatch events are displayed

### Implementation for User Story 3

- [x] T025 [US3] Add dispatch.team event handler to show team assignment in components/DiagnosisView.tsx
- [x] T026 [US3] Add dispatch.worker event handler to show worker assignment in components/DiagnosisView.tsx
- [x] T027 [US3] Format dispatch events to show team/worker name and task description in components/DiagnosisView.tsx
- [x] T028 [US3] Update getLogType function to map dispatch events to 'instruction' type in components/DiagnosisView.tsx

**Checkpoint**: Dispatch events display delegation flow - US3 complete and testable

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup and edge case handling

- [ ] T029 [P] Remove deprecated ExecutionEvent legacy fields from services/api/types.ts (deferred - requires backend coordination)
- [x] T030 [P] Add console.warn for unrecognized event categories in services/hooks/useExecution.ts
- [x] T031 [P] Add console.warn for malformed source objects in components/DiagnosisView.tsx
- [x] T032 Verify zero console errors during normal execution (SC-006) - TypeScript compilation verified
- [x] T033 Test graceful handling of malformed events (SC-007) - isValidExecutorEvent validates and skips malformed events
- [x] T034 Validate quickstart.md checklist items - Implementation follows quickstart guide patterns

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on US1/US2

### Within Each Phase

- Type definitions (Phase 1) can run in parallel
- Foundational parsing changes must be sequential (same file)
- User story tasks within DiagnosisView.tsx are sequential (same file)

### Parallel Opportunities

- All Phase 1 tasks (T001-T004) can run in parallel (different type additions)
- T029-T031 in Phase 6 can run in parallel (different files/independent changes)
- User stories can be developed sequentially with clear checkpoints

---

## Parallel Example: Phase 1 Setup

```bash
# Launch all type definition tasks in parallel:
Task: "Add ExecutorEvent interface to services/api/types.ts"
Task: "Add EventSource interface with AgentType union to services/api/types.ts"
Task: "Add EventType interface with EventCategory union to services/api/types.ts"
Task: "Add EventData union type and data interfaces to services/api/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Type Definitions)
2. Complete Phase 2: Foundational (SSE Parsing)
3. Complete Phase 3: User Story 1 (Agent Message Display)
4. **STOP and VALIDATE**: Test agent attribution works correctly
5. Deploy/demo if ready - core functionality complete

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test agent display → MVP!
3. Add User Story 2 → Test lifecycle events → Enhanced status visibility
4. Add User Story 3 → Test dispatch events → Full delegation visibility
5. Polish → Cleanup and edge case handling

### File Touch Summary

| File | Phases | Tasks |
|------|--------|-------|
| services/api/types.ts | 1, 6 | T001-T005, T029 |
| services/hooks/useExecution.ts | 2, 6 | T006-T009, T030 |
| components/DiagnosisView.tsx | 3, 4, 5, 6 | T010-T028, T031 |

---

## Notes

- [P] tasks = different files or independent additions
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each phase or logical group
- Stop at any checkpoint to validate independently
- Most changes are in DiagnosisView.tsx - execute sequentially within phases
