/**
 * useTemplateUsages Hook
 *
 * Fetch template usage list for dropdowns and filters
 * Feature: 007-prompt-template-api
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { templateUsageApi } from '../api/template-usages';
import { ApiError } from '../api/client';
import type { TemplateUsageDTO, CreateTemplateUsageRequest } from '../api/types';

export interface UseTemplateUsagesResult {
  usages: TemplateUsageDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createUsage: (params: Omit<CreateTemplateUsageRequest, 'operatorId'>) => Promise<TemplateUsageDTO>;
  deleteUsage: (id: number) => Promise<void>;
  mutationLoading: boolean;
  mutationError: string | null;
}

/**
 * Hook for fetching and managing template usages
 */
export function useTemplateUsages(): UseTemplateUsagesResult {
  const [usages, setUsages] = useState<TemplateUsageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Use ref to track current request for canceling stale requests
  const requestIdRef = useRef(0);

  const fetchUsages = useCallback(async () => {
    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await templateUsageApi.list();

      // Check if this is the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setUsages(result);
    } catch (err) {
      // Check if this is the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to fetch template usages';
      setError(message);
      console.error('Failed to fetch template usages:', err);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch usages on mount
  useEffect(() => {
    fetchUsages();
  }, [fetchUsages]);

  const createUsage = useCallback(async (params: Omit<CreateTemplateUsageRequest, 'operatorId'>): Promise<TemplateUsageDTO> => {
    setMutationLoading(true);
    setMutationError(null);

    try {
      const newUsage = await templateUsageApi.create(params);
      // Refresh the list to include the new usage
      await fetchUsages();
      return newUsage;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create usage';
      setMutationError(message);
      throw err;
    } finally {
      setMutationLoading(false);
    }
  }, [fetchUsages]);

  const deleteUsage = useCallback(async (id: number): Promise<void> => {
    setMutationLoading(true);
    setMutationError(null);

    try {
      await templateUsageApi.delete({ id });
      // Refresh the list to remove the deleted usage
      await fetchUsages();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete usage';
      setMutationError(message);
      throw err;
    } finally {
      setMutationLoading(false);
    }
  }, [fetchUsages]);

  return {
    usages,
    loading,
    error,
    refresh: fetchUsages,
    createUsage,
    deleteUsage,
    mutationLoading,
    mutationError,
  };
}
