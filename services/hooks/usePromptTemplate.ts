/**
 * usePromptTemplate Hook
 *
 * Fetch single prompt template detail with version history
 * Feature: 007-prompt-template-api
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { promptTemplateApi } from '../api/prompt-templates';
import type { PromptTemplateDetailDTO, PromptTemplateVersionDTO } from '../api/types';

export interface UsePromptTemplateResult {
  template: PromptTemplateDetailDTO | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  getVersionDetail: (versionNumber: number) => Promise<PromptTemplateVersionDTO>;
  versionLoading: boolean;
}

/**
 * Hook for fetching single prompt template detail with versions
 */
export function usePromptTemplate(id: number | null): UsePromptTemplateResult {
  const [template, setTemplate] = useState<PromptTemplateDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [versionLoading, setVersionLoading] = useState(false);

  // Use ref to track current request for canceling stale requests
  const requestIdRef = useRef(0);

  const fetchTemplate = useCallback(async () => {
    if (id === null) {
      setTemplate(null);
      setLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const result = await promptTemplateApi.getDetail({ id });

      // Check if this is the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setTemplate(result);
    } catch (err) {
      // Check if this is the latest request
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Failed to fetch prompt template';
      setError(message);
      console.error('Failed to fetch prompt template:', err);
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [id]);

  // Fetch template on mount or when id changes
  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const getVersionDetail = useCallback(async (versionNumber: number): Promise<PromptTemplateVersionDTO> => {
    if (id === null) {
      throw new Error('Template ID is required');
    }

    setVersionLoading(true);
    try {
      const result = await promptTemplateApi.getVersionDetail({ templateId: id, versionNumber });
      return result;
    } finally {
      setVersionLoading(false);
    }
  }, [id]);

  return {
    template,
    loading,
    error,
    refresh: fetchTemplate,
    getVersionDetail,
    versionLoading,
  };
}
