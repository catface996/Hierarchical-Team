/**
 * usePromptTemplates Hook
 *
 * Fetch prompt template list with pagination, filtering, and search support
 * Feature: 007-prompt-template-api
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { promptTemplateApi } from '../api/prompt-templates';
import type { PromptTemplateDTO, ListPromptTemplatesRequest } from '../api/types';

export interface PromptTemplateFilters {
  usageId?: number;
  keyword?: string;
}

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UsePromptTemplatesResult {
  templates: PromptTemplateDTO[];
  pagination: Pagination;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Hook for fetching prompt template list
 */
export function usePromptTemplates(filters: PromptTemplateFilters = {}): UsePromptTemplatesResult {
  const [templates, setTemplates] = useState<PromptTemplateDTO[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    size: DEFAULT_PAGE_SIZE,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to track current request for canceling stale requests
  const requestIdRef = useRef(0);

  const fetchTemplates = useCallback(async (page: number, size: number) => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const params: ListPromptTemplatesRequest = {
      page,
      size,
    };

    if (filters.usageId !== undefined) {
      params.usageId = filters.usageId;
    }
    if (filters.keyword?.trim()) {
      params.keyword = filters.keyword.trim();
    }

    try {
      const result = await promptTemplateApi.list(params);

      // Check if this is the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setTemplates(result.content);
      setPagination({
        page: result.page,
        size: result.size,
        totalElements: result.totalElements,
        totalPages: result.totalPages,
      });
    } catch (err) {
      // Check if this is the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to fetch prompt templates';
      setError(message);
      console.error('Failed to fetch prompt templates:', err);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filters.usageId, filters.keyword]);

  // Reset to first page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchTemplates(1, pagination.size);
  }, [filters.usageId, filters.keyword, pagination.size, fetchTemplates]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
    fetchTemplates(page, pagination.size);
  }, [pagination.size, fetchTemplates]);

  const setSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, size, page: 1 }));
    fetchTemplates(1, size);
  }, [fetchTemplates]);

  const refresh = useCallback(() => {
    fetchTemplates(pagination.page, pagination.size);
  }, [pagination.page, pagination.size, fetchTemplates]);

  return {
    templates,
    pagination,
    loading,
    error,
    refresh,
    setPage,
    setSize,
  };
}
