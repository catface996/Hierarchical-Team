# Research: Prompt Template API Integration

**Feature**: 007-prompt-template-api
**Date**: 2025-12-26

## 1. Current State Analysis

### 1.1 Frontend PromptTemplate Type (types.ts:151-159)

```typescript
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: 'System' | 'User' | 'Analysis' | 'Reporting';
  tags: string[];
  updatedAt: number;
}
```

**Issues identified**:
- `id` is string, backend uses `number` (int64)
- `category` is hardcoded enum, backend uses `usageId/usageName` (dynamic)
- `tags` not supported by backend API
- Missing fields: `usageId`, `currentVersion`, `version` (optimistic lock), `createdBy`, `createdAt`

### 1.2 Existing PromptManagement Component (components/PromptManagement.tsx)

- Uses local state and props for CRUD operations
- No API integration currently
- Categories hardcoded: `['System', 'User', 'Analysis', 'Reporting']`
- Tags implemented but not supported by backend
- Form modal handles create/edit in single component

### 1.3 Existing API Patterns (services/api/)

The project follows a consistent pattern:

1. **API Client** (`client.ts`): POST-only pattern with `apiPost<TReq, TRes>()` function
2. **Types** (`types.ts`): All DTOs, request/response types in single file
3. **API Service** (e.g., `topology.ts`): Exports an object with method functions
4. **Hooks** (e.g., `useResources.ts`, `useTopologies.ts`): Encapsulate API calls with loading/error state

## 2. Backend API Analysis

### 2.1 Prompt Template Endpoints (POST-only)

| Endpoint | Purpose | Request | Response |
|----------|---------|---------|----------|
| `/api/v1/prompt-templates/list` | Query paginated list | `ListPromptTemplatesRequest` | `PageResult<PromptTemplateDTO>` |
| `/api/v1/prompt-templates/create` | Create template | `CreatePromptTemplateRequest` | `PromptTemplateDTO` (201) |
| `/api/v1/prompt-templates/detail` | Get with versions | `GetTemplateDetailRequest` | `PromptTemplateDetailDTO` |
| `/api/v1/prompt-templates/update` | Update (new version) | `UpdatePromptTemplateRequest` | `PromptTemplateDTO` |
| `/api/v1/prompt-templates/delete` | Soft delete | `DeleteTemplateRequest` | `void` |
| `/api/v1/prompt-templates/rollback` | Rollback to version | `RollbackTemplateRequest` | `PromptTemplateDTO` |
| `/api/v1/prompt-templates/version/detail` | Get specific version | `GetVersionDetailRequest` | `PromptTemplateVersionDTO` |

### 2.2 Template Usage Endpoints

| Endpoint | Purpose | Request | Response |
|----------|---------|---------|----------|
| `/api/v1/template-usages/list` | Query all usages | (empty body) | `TemplateUsageDTO[]` |
| `/api/v1/template-usages/create` | Create usage | `CreateTemplateUsageRequest` | `TemplateUsageDTO` (201) |
| `/api/v1/template-usages/delete` | Delete usage | `DeleteUsageRequest` | `void` |

### 2.3 Key Backend DTOs

**PromptTemplateDTO**:
```typescript
{
  id: number;           // int64
  name: string;         // max 200 chars
  usageId: number;      // nullable
  usageName: string;    // from joined usage
  description: string;  // max 1000 chars
  currentVersion: number;  // int32
  content: string;      // up to 64KB
  version: number;      // optimistic lock
  createdBy: number;
  createdAt: string;    // ISO datetime
  updatedAt: string;
}
```

**PromptTemplateVersionDTO**:
```typescript
{
  id: number;
  templateId: number;
  versionNumber: number;  // int32
  content: string;
  changeNote: string;     // max 500 chars
  createdBy: number;
  createdAt: string;
}
```

**TemplateUsageDTO**:
```typescript
{
  id: number;
  code: string;        // Pattern: ^[A-Z][A-Z0-9_]*$
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}
```

## 3. Design Decisions

### 3.1 Type Migration Strategy

**Decision**: Create new types aligned with backend DTOs, deprecate old `PromptTemplate` type

**Rationale**:
- Backend is source of truth for field definitions
- Version history requires new types not in current model
- Usage-based categorization replaces hardcoded categories

**Alternatives considered**:
- Adapter layer: Would add complexity without benefit
- Gradual migration: Component currently only uses mock data, clean break is simpler

### 3.2 Category → Usage Migration

**Decision**: Replace hardcoded `category` with dynamic `usageId/usageName` from API

**Rationale**:
- Backend uses TemplateUsage for categorization
- Allows runtime addition of new usage types
- Consistent with backend model

**Implementation**:
- Load usages via `useTemplateUsages()` hook
- Display `usageName` in UI
- Store `usageId` when creating/editing

### 3.3 Tags Handling

**Decision**: Remove tags from initial implementation

**Rationale**:
- Backend API does not support tags
- Can be added later as extension if needed

**Alternative considered**:
- Store tags in `attributes` JSON field - rejected as not part of backend spec

### 3.4 Version Conflict Handling

**Decision**: Auto-reload on 409 Conflict (per clarification)

**Implementation**:
- Catch 409 response in mutation hooks
- Call refresh/reload to get latest data
- Display toast notification to user

### 3.5 File Organization

**Decision**: Follow existing pattern with new files

**New files**:
- `services/api/prompt-templates.ts` - API functions
- `services/api/template-usages.ts` - Usage API functions
- `services/hooks/usePromptTemplates.ts` - List hook
- `services/hooks/usePromptTemplate.ts` - Detail hook
- `services/hooks/usePromptTemplateMutations.ts` - Mutations
- `services/hooks/useTemplateUsages.ts` - Usages hook

**Rationale**:
- Consistent with existing codebase structure
- Separation of concerns (API layer vs hook layer)
- Each file has single responsibility

## 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Backend API unavailable | Low | High | Error states with retry, loading indicators |
| Version conflicts frequent | Medium | Medium | Clear conflict message, auto-reload |
| Large content (64KB) | Low | Low | Client-side validation before submit |
| Usage dropdown empty | Low | Medium | Allow templates without usage, show message if no usages |

## 5. Dependencies

### 5.1 External Dependencies

- Backend API at localhost:8080 (proxied via Vite)
- Existing authentication token management

### 5.2 Internal Dependencies

- `services/api/client.ts` - HTTP client (no changes needed)
- `services/api/types.ts` - Add new types here
- `components/PromptManagement.tsx` - Update to use hooks

## 6. Open Questions (Resolved)

All questions resolved through specification and clarification:

1. ~~Version conflict handling~~ → Auto-reload with notification
2. ~~Category migration~~ → Use dynamic usages from API
3. ~~Tags support~~ → Removed from MVP (not in backend API)
