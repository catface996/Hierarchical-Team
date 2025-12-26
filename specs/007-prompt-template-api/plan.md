# Implementation Plan: Prompt Template API Integration

**Branch**: `007-prompt-template-api` | **Date**: 2025-12-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-prompt-template-api/spec.md`

## Summary

Integrate the backend Prompt Template Management API into the frontend, replacing current mock data with real API calls. This involves creating API client functions, React hooks for data management, TypeScript types aligned with backend DTOs, and updating the PromptManagement component to use the new API layer.

## Technical Context

**Language/Version**: TypeScript 5.8.2
**Primary Dependencies**: React 18.2.0, react-router-dom 7.11.0, Vite 6.2.0, Lucide React (icons)
**Storage**: Backend API (proxied to localhost:8080 via Vite dev server)
**Testing**: Playwright (E2E tests)
**Target Platform**: Web browser (SPA)
**Project Type**: Web application (frontend only, backend API provided)
**Performance Goals**: API responses rendered within 2 seconds
**Constraints**: Template content max 64KB, optimistic locking for concurrent edits
**Scale/Scope**: Standard CRUD operations with version history support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution template has not been customized for this project. Using default web application best practices:

- [x] **API Integration Pattern**: Follow existing pattern in `services/api/` (POST-only API pattern already established)
- [x] **Type Safety**: Define TypeScript types in `services/api/types.ts` aligned with backend DTOs
- [x] **React Hooks Pattern**: Create custom hooks in `services/hooks/` following established patterns
- [x] **Error Handling**: Use existing `ApiError` class and error message mapping
- [x] **Code Organization**: Follow existing project structure (services/api, services/hooks, components)

## Project Structure

### Documentation (this feature)

```text
specs/007-prompt-template-api/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
services/
├── api/
│   ├── client.ts           # Existing HTTP client
│   ├── types.ts            # Add PromptTemplate types here
│   ├── prompt-templates.ts # NEW: Prompt template API functions
│   └── template-usages.ts  # NEW: Template usage API functions
└── hooks/
    ├── usePromptTemplates.ts      # NEW: List/query hook
    ├── usePromptTemplate.ts       # NEW: Single template detail hook
    ├── usePromptTemplateMutations.ts # NEW: Create/update/delete/rollback
    └── useTemplateUsages.ts       # NEW: Usage list/mutations

components/
├── PromptManagement.tsx    # Update to use API hooks
└── prompt/                 # NEW: Detail view components (if needed)
    ├── PromptDetailView.tsx
    └── VersionHistory.tsx

tests/
└── prompt-templates.spec.ts # NEW: E2E tests
```

**Structure Decision**: Following the established pattern from resources and topologies features - API functions in `services/api/`, React hooks in `services/hooks/`, components updated to use hooks.

## Complexity Tracking

> No constitution violations identified. Following established patterns.

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| API Layer | New files in services/api/ | Follows existing pattern for resources, topology, nodes |
| State Management | React hooks (no external state library) | Consistent with existing codebase |
| Type Definitions | Extend services/api/types.ts | Single source of truth for API types |
