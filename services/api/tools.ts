/**
 * Tools Management API Service
 *
 * CRUD operations for tool configurations
 * Feature: 010-tools-management
 */

import { apiPost, apiPostRaw } from './client';
import type {
  ToolDTO,
  ToolListRequest,
  ToolListResponse,
  ToolCreateRequest,
  ToolUpdateRequest,
  ToolIdRequest,
} from '../../types';

// API endpoints - routed through gateway to tools service
const TOOLS_API = {
  LIST: '/api/tools/v1/tools/list',
  CREATE: '/api/tools/v1/tools/create',
  GET: '/api/tools/v1/tools/get',
  UPDATE: '/api/tools/v1/tools/update',
  DELETE: '/api/tools/v1/tools/delete',
  ACTIVATE: '/api/tools/v1/tools/activate',
  DEACTIVATE: '/api/tools/v1/tools/deactivate',
} as const;

/**
 * List tools with pagination and optional filters
 * Note: Uses apiPostRaw because Tools API returns data directly without wrapper
 */
export async function listTools(request: ToolListRequest): Promise<ToolListResponse> {
  return apiPostRaw<ToolListRequest, ToolListResponse>(TOOLS_API.LIST, request);
}

/**
 * Create a new tool
 */
export async function createTool(request: ToolCreateRequest): Promise<ToolDTO> {
  return apiPostRaw<ToolCreateRequest, ToolDTO>(TOOLS_API.CREATE, request);
}

/**
 * Get a single tool by ID
 */
export async function getTool(request: ToolIdRequest): Promise<ToolDTO> {
  return apiPostRaw<ToolIdRequest, ToolDTO>(TOOLS_API.GET, request);
}

/**
 * Update an existing tool
 */
export async function updateTool(request: ToolUpdateRequest): Promise<ToolDTO> {
  return apiPostRaw<ToolUpdateRequest, ToolDTO>(TOOLS_API.UPDATE, request);
}

/**
 * Delete a tool by ID
 */
export async function deleteTool(request: ToolIdRequest): Promise<void> {
  return apiPostRaw<ToolIdRequest, void>(TOOLS_API.DELETE, request);
}

/**
 * Activate a tool (set status to 'active')
 */
export async function activateTool(request: ToolIdRequest): Promise<ToolDTO> {
  return apiPostRaw<ToolIdRequest, ToolDTO>(TOOLS_API.ACTIVATE, request);
}

/**
 * Deactivate a tool (set status to 'disabled')
 */
export async function deactivateTool(request: ToolIdRequest): Promise<ToolDTO> {
  return apiPostRaw<ToolIdRequest, ToolDTO>(TOOLS_API.DEACTIVATE, request);
}
