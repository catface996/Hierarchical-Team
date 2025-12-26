# Data Model: Prompt Template API Integration

**Feature**: 007-prompt-template-api
**Date**: 2025-12-26

## 1. Entity Definitions

### 1.1 PromptTemplateDTO

The main prompt template entity returned by the API.

```typescript
/**
 * Prompt template entity from /api/v1/prompt-templates/* endpoints
 */
export interface PromptTemplateDTO {
  /** Template ID (int64) */
  id: number;

  /** Template name (max 200 chars) */
  name: string;

  /** Usage type ID (nullable) */
  usageId: number | null;

  /** Usage type name (joined from TemplateUsage) */
  usageName: string | null;

  /** Template description (max 1000 chars) */
  description: string | null;

  /** Current version number (int32) */
  currentVersion: number;

  /** Template content (up to 64KB) */
  content: string;

  /** Optimistic lock version */
  version: number;

  /** Creator user ID */
  createdBy: number;

  /** Creation timestamp (ISO 8601) */
  createdAt: string;

  /** Last update timestamp (ISO 8601) */
  updatedAt: string;
}
```

### 1.2 PromptTemplateDetailDTO

Extended template entity with version history, returned by detail endpoint.

```typescript
/**
 * Prompt template detail with version history
 */
export interface PromptTemplateDetailDTO {
  /** Template ID */
  id: number;

  /** Template name */
  name: string;

  /** Usage type ID */
  usageId: number | null;

  /** Usage type name */
  usageName: string | null;

  /** Template description */
  description: string | null;

  /** Current version number */
  currentVersion: number;

  /** Current version content */
  content: string;

  /** Optimistic lock version */
  version: number;

  /** Creator user ID */
  createdBy: number;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;

  /** Version history list (all versions) */
  versions: PromptTemplateVersionDTO[];
}
```

### 1.3 PromptTemplateVersionDTO

Historical snapshot of a template version.

```typescript
/**
 * Template version history entry
 */
export interface PromptTemplateVersionDTO {
  /** Version record ID */
  id: number;

  /** Parent template ID */
  templateId: number;

  /** Version number (starts at 1) */
  versionNumber: number;

  /** Content snapshot at this version */
  content: string;

  /** Change description (max 500 chars) */
  changeNote: string | null;

  /** Creator of this version */
  createdBy: number;

  /** Version creation timestamp */
  createdAt: string;
}
```

### 1.4 TemplateUsageDTO

Category/purpose classification for templates.

```typescript
/**
 * Template usage category
 */
export interface TemplateUsageDTO {
  /** Usage ID */
  id: number;

  /** Usage code (uppercase with underscores, e.g., "FAULT_DIAGNOSIS") */
  code: string;

  /** Display name */
  name: string;

  /** Description of this usage type */
  description: string | null;

  /** Creation timestamp */
  createdAt: string;

  /** Last update timestamp */
  updatedAt: string;
}
```

## 2. Request Types

### 2.1 Query/List Requests

```typescript
/**
 * Query prompt templates list
 * POST /api/v1/prompt-templates/list
 */
export interface ListPromptTemplatesRequest {
  /** Filter by usage ID (optional) */
  usageId?: number;

  /** Search keyword (matches name/description) */
  keyword?: string;

  /** Page number (1-based, default 1) */
  page?: number;

  /** Page size (default 10, max 100) */
  size?: number;
}

/**
 * Get template detail with versions
 * POST /api/v1/prompt-templates/detail
 */
export interface GetTemplateDetailRequest {
  /** Template ID */
  id: number;
}

/**
 * Get specific version content
 * POST /api/v1/prompt-templates/version/detail
 */
export interface GetVersionDetailRequest {
  /** Template ID */
  templateId: number;

  /** Version number to retrieve (>= 1) */
  versionNumber: number;
}
```

### 2.2 Mutation Requests

```typescript
/**
 * Create new prompt template
 * POST /api/v1/prompt-templates/create
 */
export interface CreatePromptTemplateRequest {
  /** Operator ID (injected by client in dev mode) */
  operatorId: number;

  /** Template name (required, max 200 chars) */
  name: string;

  /** Template content (required, max 64KB) */
  content: string;

  /** Usage type ID (optional) */
  usageId?: number;

  /** Description (optional, max 1000 chars) */
  description?: string;
}

/**
 * Update prompt template
 * POST /api/v1/prompt-templates/update
 * Creates a new version automatically
 */
export interface UpdatePromptTemplateRequest {
  /** Template ID */
  id: number;

  /** Operator ID */
  operatorId: number;

  /** New content (required) */
  content: string;

  /** Change note (optional, max 500 chars) */
  changeNote?: string;

  /** Expected optimistic lock version for conflict detection */
  expectedVersion?: number;
}

/**
 * Delete prompt template
 * POST /api/v1/prompt-templates/delete
 */
export interface DeleteTemplateRequest {
  /** Template ID */
  id: number;

  /** Operator ID */
  operatorId: number;
}

/**
 * Rollback to previous version
 * POST /api/v1/prompt-templates/rollback
 */
export interface RollbackTemplateRequest {
  /** Template ID */
  id: number;

  /** Operator ID */
  operatorId: number;

  /** Target version number to rollback to (>= 1) */
  targetVersion: number;

  /** Expected optimistic lock version */
  expectedVersion?: number;
}
```

### 2.3 Usage Management Requests

```typescript
/**
 * Create template usage
 * POST /api/v1/template-usages/create
 */
export interface CreateTemplateUsageRequest {
  /** Usage code (uppercase, underscores allowed, pattern: ^[A-Z][A-Z0-9_]*$) */
  code: string;

  /** Display name (required, max 100 chars) */
  name: string;

  /** Description (optional, max 500 chars) */
  description?: string;
}

/**
 * Delete template usage
 * POST /api/v1/template-usages/delete
 */
export interface DeleteUsageRequest {
  /** Usage ID */
  id: number;
}
```

## 3. Response Types

```typescript
/** List templates response */
export type ListPromptTemplatesResponse = ApiResponse<PageResult<PromptTemplateDTO>>;

/** Create template response (201 returns DTO directly) */
export type CreatePromptTemplateResponse = PromptTemplateDTO;

/** Get template detail response */
export type GetTemplateDetailResponse = ApiResponse<PromptTemplateDetailDTO>;

/** Update template response */
export type UpdatePromptTemplateResponse = ApiResponse<PromptTemplateDTO>;

/** Delete template response */
export type DeleteTemplateResponse = ApiResponse<void>;

/** Rollback template response */
export type RollbackTemplateResponse = ApiResponse<PromptTemplateDTO>;

/** Get version detail response */
export type GetVersionDetailResponse = ApiResponse<PromptTemplateVersionDTO>;

/** List usages response */
export type ListTemplateUsagesResponse = ApiResponse<TemplateUsageDTO[]>;

/** Create usage response (201 returns DTO directly) */
export type CreateTemplateUsageResponse = TemplateUsageDTO;

/** Delete usage response */
export type DeleteUsageResponse = ApiResponse<void>;
```

## 4. Entity Relationships

```
┌─────────────────────┐       ┌──────────────────────────┐
│   TemplateUsage     │       │     PromptTemplate       │
├─────────────────────┤       ├──────────────────────────┤
│ id (PK)             │◄──────│ usageId (FK, nullable)   │
│ code                │  1:N  │ id (PK)                  │
│ name                │       │ name                     │
│ description         │       │ description              │
└─────────────────────┘       │ content                  │
                              │ currentVersion           │
                              │ version (optimistic)     │
                              └───────────┬──────────────┘
                                          │
                                          │ 1:N
                                          ▼
                              ┌──────────────────────────┐
                              │ PromptTemplateVersion    │
                              ├──────────────────────────┤
                              │ id (PK)                  │
                              │ templateId (FK)          │
                              │ versionNumber            │
                              │ content                  │
                              │ changeNote               │
                              └──────────────────────────┘
```

## 5. Validation Rules

### 5.1 PromptTemplate

| Field | Rule |
|-------|------|
| name | Required, max 200 characters |
| content | Required, max 64KB (65,536 bytes) |
| description | Optional, max 1000 characters |

### 5.2 TemplateUsage

| Field | Rule |
|-------|------|
| code | Required, pattern `^[A-Z][A-Z0-9_]*$`, max 50 characters |
| name | Required, max 100 characters |
| description | Optional, max 500 characters |

### 5.3 Version Operations

| Field | Rule |
|-------|------|
| changeNote | Optional, max 500 characters |
| targetVersion | Must be >= 1 and < currentVersion |
| expectedVersion | Must match current version for optimistic locking |

## 6. State Transitions

### 6.1 Template Lifecycle

```
┌─────────────┐
│   CREATE    │
└──────┬──────┘
       │
       ▼
┌─────────────┐    UPDATE     ┌─────────────┐
│  ACTIVE     │──────────────►│  ACTIVE     │
│  (v1)       │               │  (v2, v3..) │
└──────┬──────┘◄──────────────└──────┬──────┘
       │        ROLLBACK             │
       │                             │
       ▼                             ▼
┌─────────────┐               ┌─────────────┐
│  DELETED    │               │  DELETED    │
│ (soft)      │               │ (soft)      │
└─────────────┘               └─────────────┘
```

### 6.2 Version History (Immutable)

- Each UPDATE creates a new version record
- ROLLBACK creates a new version with content from target version
- Version records are never modified or deleted
- `currentVersion` on template always reflects latest version number

## 7. Migration Notes

### 7.1 Frontend Type Changes

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `id: string` | `id: number` | Backend uses int64 |
| `category: string` | `usageId: number` | Dynamic from API |
| `tags: string[]` | (removed) | Not supported by backend |
| `updatedAt: number` | `updatedAt: string` | ISO 8601 format |
| (none) | `currentVersion` | Version tracking |
| (none) | `version` | Optimistic lock |
| (none) | `createdBy` | Audit field |
| (none) | `createdAt` | Audit field |

### 7.2 Component Update Requirements

1. **PromptManagement.tsx**: Replace props with hooks, update form fields
2. **Category filter**: Replace hardcoded categories with usage dropdown
3. **Tags UI**: Remove tags input (can be added back if backend supports)
4. **Version display**: Add version indicator to list/card views
