/**
 * usePromptTemplateMutations Hook
 *
 * Mutation operations for prompt templates (create, update, delete, rollback)
 * Feature: 007-prompt-template-api
 */

import { useState, useCallback } from 'react';
import { promptTemplateApi } from '../api/prompt-templates';
import { ApiError } from '../api/client';
import type {
  PromptTemplateDTO,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
  RollbackTemplateRequest,
} from '../api/types';

export interface UsePromptTemplateMutationsResult {
  createTemplate: (params: Omit<CreatePromptTemplateRequest, 'operatorId'>) => Promise<PromptTemplateDTO>;
  updateTemplate: (params: Omit<UpdatePromptTemplateRequest, 'operatorId'>, onConflict?: () => void) => Promise<PromptTemplateDTO>;
  deleteTemplate: (id: number) => Promise<void>;
  rollbackTemplate: (params: Omit<RollbackTemplateRequest, 'operatorId'>, onConflict?: () => void) => Promise<PromptTemplateDTO>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

/**
 * Hook for prompt template mutations
 */
export function usePromptTemplateMutations(): UsePromptTemplateMutationsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Create a new prompt template
   */
  const createTemplate = useCallback(async (params: Omit<CreatePromptTemplateRequest, 'operatorId'>): Promise<PromptTemplateDTO> => {
    setLoading(true);
    setError(null);

    try {
      const result = await promptTemplateApi.create(params);
      return result;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create template';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing prompt template
   * Handles HTTP 409 conflicts by calling onConflict callback
   */
  const updateTemplate = useCallback(async (
    params: Omit<UpdatePromptTemplateRequest, 'operatorId'>,
    onConflict?: () => void
  ): Promise<PromptTemplateDTO> => {
    setLoading(true);
    setError(null);

    try {
      const result = await promptTemplateApi.update(params);
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Version conflict - auto-reload
        setError('This template was modified by another user. Reloading latest version...');
        onConflict?.();
        throw err;
      }
      const message = err instanceof ApiError ? err.message : 'Failed to update template';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a prompt template
   */
  const deleteTemplate = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await promptTemplateApi.delete({ id });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete template';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Rollback a template to a previous version
   * Handles HTTP 409 conflicts by calling onConflict callback
   */
  const rollbackTemplate = useCallback(async (
    params: Omit<RollbackTemplateRequest, 'operatorId'>,
    onConflict?: () => void
  ): Promise<PromptTemplateDTO> => {
    setLoading(true);
    setError(null);

    try {
      const result = await promptTemplateApi.rollback(params);
      return result;
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // Version conflict - auto-reload
        setError('This template was modified by another user. Reloading latest version...');
        onConflict?.();
        throw err;
      }
      const message = err instanceof ApiError ? err.message : 'Failed to rollback template';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTemplate,
    updateTemplate,
    deleteTemplate,
    rollbackTemplate,
    loading,
    error,
    clearError,
  };
}
