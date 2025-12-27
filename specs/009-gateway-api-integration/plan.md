# Implementation Plan: Gateway API Integration

**Branch**: `009-gateway-api-integration` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-gateway-api-integration/spec.md`

## Summary

Migrate all frontend API calls from direct backend service connections (localhost:8080, localhost:7070) to unified gateway routing (localhost:8888). This involves updating URL path prefixes in all API service files and simplifying the Vite proxy configuration to a single gateway target.

## Technical Context

**Language/Version**: TypeScript 5.8.2
**Primary Dependencies**: React 18.2.0, Vite 6.2.0
**Storage**: N/A (backend API handles persistence)
**Testing**: Manual validation via browser DevTools
**Target Platform**: Web SPA (browser)
**Project Type**: Frontend SPA
**Performance Goals**: No performance impact - URL prefix changes only
**Constraints**: Backward compatibility - existing functionality must work identically
**Scale/Scope**: 8 API service files, ~50 endpoint URLs to update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a template - no specific gates defined. Proceeding with standard development practices:

- [x] No new libraries or dependencies required
- [x] Changes isolated to API service layer
- [x] Backward compatible (hooks and components unchanged)
- [x] Simple URL path prefix changes only

## Project Structure

### Documentation (this feature)

```text
specs/009-gateway-api-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
# Frontend SPA structure (existing)
services/
├── api/
│   ├── client.ts          # HTTP client (unchanged)
│   ├── types.ts           # TypeScript types (unchanged)
│   ├── index.ts           # Exports (unchanged)
│   ├── resources.ts       # → Update endpoints to /api/service/v1/*
│   ├── topology.ts        # → Update endpoints to /api/service/v1/*
│   ├── nodes.ts           # → Update endpoints to /api/service/v1/*
│   ├── prompt-templates.ts # → Update endpoints to /api/service/v1/*
│   ├── template-usages.ts # → Update endpoints to /api/service/v1/*
│   └── models.ts          # → Update endpoints to /api/executor/v1/*
├── hooks/                 # React hooks (unchanged)
└── ...

components/               # UI components (unchanged)
vite.config.ts           # → Simplify proxy to single gateway target
```

**Structure Decision**: Frontend SPA - changes limited to `services/api/*.ts` endpoint constants and `vite.config.ts` proxy configuration.

## Complexity Tracking

No complexity violations. This feature is a straightforward URL path migration.

## Endpoint Migration Summary

### Service API (localhost:8080 → gateway /api/service/v1/)

| File | Current Prefix | New Prefix |
|------|---------------|------------|
| resources.ts | `/api/v1/` | `/api/service/v1/` |
| topology.ts | `/api/v1/` | `/api/service/v1/` |
| nodes.ts | `/api/v1/` | `/api/service/v1/` |
| prompt-templates.ts | `/api/v1/` | `/api/service/v1/` |
| template-usages.ts | `/api/v1/` | `/api/service/v1/` |

### Executor API (localhost:7070 → gateway /api/executor/v1/)

| File | Current Prefix | New Prefix |
|------|---------------|------------|
| models.ts | `/api/v1/` | `/api/executor/v1/` |

### Proxy Configuration

| Current | New |
|---------|-----|
| `/api/v1/models` → localhost:7070 | Single proxy: `/api` → localhost:8888 |
| `/api` → localhost:8080 | (removed - handled by single proxy) |
