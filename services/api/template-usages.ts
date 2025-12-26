/**
 * Template Usage API Service
 *
 * Encapsulates all template usage management API calls
 * Feature: 007-prompt-template-api
 */

import { apiPost } from './client';
import type {
  TemplateUsageDTO,
  CreateTemplateUsageRequest,
  DeleteUsageRequest,
} from './types';

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  LIST: '/api/v1/template-usages/list',
  CREATE: '/api/v1/template-usages/create',
  DELETE: '/api/v1/template-usages/delete',
} as const;

// ============================================================================
// Template Usage API
// ============================================================================

export const templateUsageApi = {
  /**
   * Query all template usages
   * POST /api/v1/template-usages/list
   */
  list: (): Promise<TemplateUsageDTO[]> =>
    apiPost<Record<string, never>, TemplateUsageDTO[]>(
      ENDPOINTS.LIST,
      {}
    ),

  /**
   * Create a new template usage
   * POST /api/v1/template-usages/create
   */
  create: (params: CreateTemplateUsageRequest): Promise<TemplateUsageDTO> =>
    apiPost<CreateTemplateUsageRequest, TemplateUsageDTO>(
      ENDPOINTS.CREATE,
      params
    ),

  /**
   * Delete a template usage
   * POST /api/v1/template-usages/delete
   */
  delete: (params: DeleteUsageRequest): Promise<void> =>
    apiPost<DeleteUsageRequest, void>(
      ENDPOINTS.DELETE,
      params
    ),
};
