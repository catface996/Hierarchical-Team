# Quickstart: Prompt Template API Integration

**Feature**: 007-prompt-template-api
**Date**: 2025-12-26

## Overview

This guide helps developers quickly implement the Prompt Template API integration. The implementation follows existing patterns in the codebase.

## Prerequisites

1. Backend API running at `localhost:8080`
2. Vite dev server configured with proxy (already done in `vite.config.ts`)
3. Familiarity with existing hooks pattern (`useResources`, `useTopologies`)

## Quick Implementation Steps

### Step 1: Add Types (services/api/types.ts)

Add these types to the existing types file:

```typescript
// ============================================================================
// Prompt Template Types (Feature: 007-prompt-template-api)
// ============================================================================

export interface PromptTemplateDTO {
  id: number;
  name: string;
  usageId: number | null;
  usageName: string | null;
  description: string | null;
  currentVersion: number;
  content: string;
  version: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplateDetailDTO extends PromptTemplateDTO {
  versions: PromptTemplateVersionDTO[];
}

export interface PromptTemplateVersionDTO {
  id: number;
  templateId: number;
  versionNumber: number;
  content: string;
  changeNote: string | null;
  createdBy: number;
  createdAt: string;
}

export interface TemplateUsageDTO {
  id: number;
  code: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

// Request types
export interface ListPromptTemplatesRequest {
  usageId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface CreatePromptTemplateRequest {
  operatorId: number;
  name: string;
  content: string;
  usageId?: number;
  description?: string;
}

// ... (see data-model.md for complete list)
```

### Step 2: Create API Service (services/api/prompt-templates.ts)

```typescript
import { apiPost } from './client';
import type {
  PromptTemplateDTO,
  PromptTemplateDetailDTO,
  PageResult,
  ListPromptTemplatesRequest,
  CreatePromptTemplateRequest,
  // ... other types
} from './types';

const ENDPOINTS = {
  LIST: '/api/v1/prompt-templates/list',
  CREATE: '/api/v1/prompt-templates/create',
  DETAIL: '/api/v1/prompt-templates/detail',
  UPDATE: '/api/v1/prompt-templates/update',
  DELETE: '/api/v1/prompt-templates/delete',
  ROLLBACK: '/api/v1/prompt-templates/rollback',
  VERSION_DETAIL: '/api/v1/prompt-templates/version/detail',
} as const;

export const promptTemplateApi = {
  list: (params: ListPromptTemplatesRequest): Promise<PageResult<PromptTemplateDTO>> =>
    apiPost(ENDPOINTS.LIST, params),

  create: (params: CreatePromptTemplateRequest): Promise<PromptTemplateDTO> =>
    apiPost(ENDPOINTS.CREATE, params),

  getDetail: (params: { id: number }): Promise<PromptTemplateDetailDTO> =>
    apiPost(ENDPOINTS.DETAIL, params),

  // ... other methods
};
```

### Step 3: Create List Hook (services/hooks/usePromptTemplates.ts)

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { promptTemplateApi } from '../api/prompt-templates';
import type { PromptTemplateDTO, ListPromptTemplatesRequest } from '../api/types';

export interface PromptTemplateFilters {
  usageId?: number;
  keyword?: string;
}

export function usePromptTemplates(filters: PromptTemplateFilters = {}) {
  const [templates, setTemplates] = useState<PromptTemplateDTO[]>([]);
  const [pagination, setPagination] = useState({ page: 1, size: 10, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const fetchTemplates = useCallback(async (page: number, size: number) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const params: ListPromptTemplatesRequest = { page, size, ...filters };
      const result = await promptTemplateApi.list(params);

      if (currentRequestId !== requestIdRef.current) return;

      setTemplates(result.content);
      setPagination({ page: result.page, size: result.size, totalElements: result.totalElements, totalPages: result.totalPages });
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      if (currentRequestId === requestIdRef.current) setLoading(false);
    }
  }, [filters.usageId, filters.keyword]);

  useEffect(() => {
    fetchTemplates(1, pagination.size);
  }, [filters.usageId, filters.keyword, pagination.size, fetchTemplates]);

  return { templates, pagination, loading, error, refresh: () => fetchTemplates(pagination.page, pagination.size), setPage: (p: number) => fetchTemplates(p, pagination.size) };
}
```

### Step 4: Create Mutations Hook (services/hooks/usePromptTemplateMutations.ts)

```typescript
import { useState, useCallback } from 'react';
import { promptTemplateApi } from '../api/prompt-templates';
import { ApiError } from '../api/client';

export function usePromptTemplateMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTemplate = useCallback(async (params: CreatePromptTemplateRequest) => {
    setLoading(true);
    setError(null);
    try {
      return await promptTemplateApi.create(params);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Create failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTemplate = useCallback(async (params: UpdatePromptTemplateRequest, onConflict?: () => void) => {
    setLoading(true);
    setError(null);
    try {
      return await promptTemplateApi.update(params);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Version conflict - auto-reload
        onConflict?.();
      }
      const message = err instanceof ApiError ? err.message : 'Update failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ... deleteTemplate, rollbackTemplate

  return { createTemplate, updateTemplate, loading, error };
}
```

### Step 5: Update PromptManagement Component

```typescript
// components/PromptManagement.tsx
import { usePromptTemplates } from '../services/hooks/usePromptTemplates';
import { usePromptTemplateMutations } from '../services/hooks/usePromptTemplateMutations';
import { useTemplateUsages } from '../services/hooks/useTemplateUsages';

const PromptManagement: React.FC = () => {
  const [filters, setFilters] = useState<PromptTemplateFilters>({});
  const { templates, pagination, loading, error, refresh, setPage } = usePromptTemplates(filters);
  const { usages } = useTemplateUsages();
  const { createTemplate, updateTemplate, deleteTemplate } = usePromptTemplateMutations();

  // Replace hardcoded CATEGORIES with usages from API
  // Replace local state operations with mutation calls
  // Add loading/error states to UI

  return (/* updated JSX */);
};
```

## Key Patterns to Follow

### 1. Error Handling

```typescript
try {
  await apiCall();
} catch (err) {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      // Version conflict - reload data
      refresh();
      showNotification('Data was modified by another user. Reloaded.');
    } else {
      setError(err.message);
    }
  }
}
```

### 2. Optimistic Locking

```typescript
const updateTemplate = async () => {
  await promptTemplateApi.update({
    id: template.id,
    content: newContent,
    expectedVersion: template.version,  // Send current version
    operatorId: 1,
  });
};
```

### 3. Loading States

```typescript
{loading && <LoadingSpinner />}
{error && <ErrorMessage message={error} onRetry={refresh} />}
{!loading && !error && templates.length === 0 && <EmptyState />}
{!loading && !error && templates.length > 0 && <TemplateList templates={templates} />}
```

## Testing Checklist

- [ ] List templates loads from API
- [ ] Search/filter updates results
- [ ] Create new template works
- [ ] Edit template creates new version
- [ ] Delete shows confirmation, removes from list
- [ ] Version history displays correctly
- [ ] Rollback creates new version with old content
- [ ] Error states show user-friendly messages
- [ ] Loading indicators appear during operations

## Common Gotchas

1. **operatorId**: In dev mode, the client auto-injects `operatorId: 1`. Production will use authenticated user ID.

2. **Pagination**: Backend uses 1-based page numbers, not 0-based.

3. **Version field**: The `version` field is for optimistic locking, not the template version. Use `currentVersion` for display.

4. **Content size**: Validate content size client-side before submitting (max 64KB).

5. **Usage dropdown**: Load usages once at app startup or component mount, cache in state.

## Reference Files

- API Types: `services/api/types.ts`
- Existing patterns: `services/api/topology.ts`, `services/hooks/useResources.ts`
- Contracts: `specs/007-prompt-template-api/contracts/`
