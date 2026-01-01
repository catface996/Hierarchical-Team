# Implementation Plan: Diagnosis Page SSE Stream Refactor

**Branch**: `016-diagnosis-sse-refactor` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-diagnosis-sse-refactor/spec.md`

## Summary

Refactor the diagnosis page SSE event handling to consume the new backend event format (042-refactor-executor-integration). The new format provides a structured `source` object with `agent_id`, `agent_type`, `agent_name`, and `team_name` fields, replacing the legacy underscore-prefixed fields (`_is_global_supervisor`, `_team_name`, etc.).

## Technical Context

**Language/Version**: TypeScript 5.8.2, React 18.2.0
**Primary Dependencies**: React, Vite 6.2.0, Lucide React (icons)
**Storage**: N/A (frontend-only, SSE stream consumption)
**Testing**: Manual testing with SSE endpoints
**Target Platform**: Web (modern browsers)
**Project Type**: Web application (frontend)
**Performance Goals**: <100ms event parsing and display (SC-001)
**Constraints**: Must handle malformed events gracefully without crashing
**Scale/Scope**: Single page refactor (DiagnosisView + useExecution hook + types)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. API Pagination Request Format | N/A | SSE stream, not paginated |
| II. API Pagination Response Format | N/A | SSE stream, not paginated |
| III. API Client Conventions | ✅ Pass | POST method for SSE trigger |
| IV. Pagination Controls UI Pattern | N/A | No pagination in this feature |
| V. Destructive Action Confirmation | N/A | No destructive actions |
| VI. Icon Consistency Standards | ✅ Pass | No new icons added |

**Gate Status**: ✅ PASS - No constitution violations

## Project Structure

### Documentation (this feature)

```text
specs/016-diagnosis-sse-refactor/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
# Files to modify
services/
├── api/
│   └── types.ts           # Update ExecutionEvent, add ExecutorEvent types
└── hooks/
    └── useExecution.ts    # Update SSE parsing logic

components/
└── DiagnosisView.tsx      # Update getAgentIdentifier, aggregateEventsToLogs
```

**Structure Decision**: Frontend-only changes to existing files. No new files required for core functionality.

## Complexity Tracking

> No violations to justify - all changes follow existing patterns.
