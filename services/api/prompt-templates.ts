/**
 * Prompt Template API Service
 *
 * Encapsulates all prompt template management API calls
 * Feature: 007-prompt-template-api
 */

import { apiPost } from './client';
import type {
  PromptTemplateDTO,
  PromptTemplateDetailDTO,
  PromptTemplateVersionDTO,
  PageResult,
  ListPromptTemplatesRequest,
  CreatePromptTemplateRequest,
  GetTemplateDetailRequest,
  UpdatePromptTemplateRequest,
  DeleteTemplateRequest,
  RollbackTemplateRequest,
  GetVersionDetailRequest,
} from './types';

// ============================================================================
// API Endpoints
// ============================================================================

const ENDPOINTS = {
  LIST: '/api/service/v1/prompt-templates/list',
  CREATE: '/api/service/v1/prompt-templates/create',
  DETAIL: '/api/service/v1/prompt-templates/detail',
  UPDATE: '/api/service/v1/prompt-templates/update',
  DELETE: '/api/service/v1/prompt-templates/delete',
  ROLLBACK: '/api/service/v1/prompt-templates/rollback',
  VERSION_DETAIL: '/api/service/v1/prompt-templates/version/detail',
} as const;

// ============================================================================
// Prompt Template API
// ============================================================================

export const promptTemplateApi = {
  /**
   * Query paginated prompt template list
   * POST /api/v1/prompt-templates/list
   */
  list: (params: ListPromptTemplatesRequest): Promise<PageResult<PromptTemplateDTO>> =>
    apiPost<ListPromptTemplatesRequest, PageResult<PromptTemplateDTO>>(
      ENDPOINTS.LIST,
      params
    ),

  /**
   * Create a new prompt template
   * POST /api/v1/prompt-templates/create
   */
  create: (params: CreatePromptTemplateRequest): Promise<PromptTemplateDTO> =>
    apiPost<CreatePromptTemplateRequest, PromptTemplateDTO>(
      ENDPOINTS.CREATE,
      params
    ),

  /**
   * Get template detail with version history
   * POST /api/v1/prompt-templates/detail
   */
  getDetail: (params: GetTemplateDetailRequest): Promise<PromptTemplateDetailDTO> =>
    apiPost<GetTemplateDetailRequest, PromptTemplateDetailDTO>(
      ENDPOINTS.DETAIL,
      params
    ),

  /**
   * Update prompt template (creates new version)
   * POST /api/v1/prompt-templates/update
   */
  update: (params: UpdatePromptTemplateRequest): Promise<PromptTemplateDTO> =>
    apiPost<UpdatePromptTemplateRequest, PromptTemplateDTO>(
      ENDPOINTS.UPDATE,
      params
    ),

  /**
   * Delete prompt template (soft delete)
   * POST /api/v1/prompt-templates/delete
   */
  delete: (params: DeleteTemplateRequest): Promise<void> =>
    apiPost<DeleteTemplateRequest, void>(
      ENDPOINTS.DELETE,
      params
    ),

  /**
   * Rollback template to a previous version
   * POST /api/v1/prompt-templates/rollback
   */
  rollback: (params: RollbackTemplateRequest): Promise<PromptTemplateDTO> =>
    apiPost<RollbackTemplateRequest, PromptTemplateDTO>(
      ENDPOINTS.ROLLBACK,
      params
    ),

  /**
   * Get specific version content
   * POST /api/v1/prompt-templates/version/detail
   */
  getVersionDetail: (params: GetVersionDetailRequest): Promise<PromptTemplateVersionDTO> =>
    apiPost<GetVersionDetailRequest, PromptTemplateVersionDTO>(
      ENDPOINTS.VERSION_DETAIL,
      params
    ),
};
