/**
 * useTools Hook
 *
 * Fetch and manage tool list with pagination, loading, error states
 * Feature: 010-tools-management
 */

import { useState, useEffect, useCallback } from 'react';
import { listTools } from '../api/tools';
import type { ToolDTO, ToolListRequest, ToolStatus } from '../../types';

const DEFAULT_PAGE_SIZE = 8;

interface UseToolsOptions {
  page?: number;
  size?: number;
  status?: ToolStatus;
  categoryId?: string;
  search?: string;
}

interface UseToolsResult {
  tools: ToolDTO[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  setPage: (page: number) => void;
  setStatus: (status: ToolStatus | undefined) => void;
  setSearch: (search: string) => void;
  status: ToolStatus | undefined;
  search: string;
  refresh: () => void;
}

export function useTools(options: UseToolsOptions = {}): UseToolsResult {
  const [tools, setTools] = useState<ToolDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(options.page ?? 1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<ToolStatus | undefined>(options.status);
  const [search, setSearch] = useState(options.search ?? '');

  const fetchTools = useCallback(async () => {
    setLoading(true);
    setError(null);

    const pageSize = options.size ?? DEFAULT_PAGE_SIZE;

    try {
      // Always include page and page_size as required by backend API
      const request: ToolListRequest = {
        page: page,
        page_size: pageSize,
      };

      // Only add optional filters if explicitly set
      if (status !== undefined) {
        request.status = status;
      }
      if (search.trim()) {
        request.search = search.trim();
      }
      if (options.categoryId) {
        request.category_id = options.categoryId;
      }

      console.log('[useTools] Fetching tools with request:', request);
      const response = await listTools(request);
      setTools(response.items || []);
      setTotal(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / pageSize));
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载工具列表失败';
      setError(message);
      setTools([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, search, options.size, options.categoryId]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  const refresh = useCallback(() => {
    fetchTools();
  }, [fetchTools]);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSetStatus = useCallback((newStatus: ToolStatus | undefined) => {
    setStatus(newStatus);
    setPage(1); // Reset to first page when filter changes
  }, []);

  const handleSetSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset to first page when search changes
  }, []);

  return {
    tools,
    loading,
    error,
    page,
    totalPages,
    total,
    setPage: handleSetPage,
    setStatus: handleSetStatus,
    setSearch: handleSetSearch,
    status,
    search,
    refresh,
  };
}
