/**
 * useExecution Hook
 *
 * Trigger multi-agent execution and receive SSE stream events
 * Feature: Multi-Agent Execution Integration
 */

import { useState, useCallback, useRef } from 'react';
import type {
  ExecutionEvent,
  TriggerExecutionRequest,
  CancelExecutionResponse,
  ParsedAgentInfo,
  ExecutionEventType,
} from '../api/types';

// API endpoints
const EXECUTION_TRIGGER_URL = '/api/service/v1/executions/trigger';
const EXECUTION_CANCEL_URL = '/api/service/v1/executions/cancel';

/**
 * Parse agent info from event content
 * Note: Uses regex matching to handle content that may have leading whitespace/newlines
 * or where the agent prefix appears anywhere in the content (SSE token streaming)
 */
export function parseAgentInfo(content: string | null): ParsedAgentInfo | null {
  if (!content) return null;

  // Trim content and check for agent prefixes
  const trimmed = content.trim();

  // Global Supervisor: [Global Supervisor] ...
  // Use regex to match anywhere in content (SSE may stream tokens that append to previous content)
  if (trimmed.startsWith('[Global Supervisor]') || content.includes('[Global Supervisor]')) {
    return { role: 'global_supervisor', name: 'Global Supervisor' };
  }

  // Team Supervisor: [Team: TeamName | Supervisor] ...
  const teamSupervisorMatch = content.match(/\[Team: (.+?) \| Supervisor\]/);
  if (teamSupervisorMatch) {
    return { role: 'team_supervisor', team: teamSupervisorMatch[1] };
  }

  // Worker: [Team: TeamName | Worker: WorkerName] ...
  const workerMatch = content.match(/\[Team: (.+?) \| Worker: (.+?)\]/);
  if (workerMatch) {
    return { role: 'worker', team: workerMatch[1], name: workerMatch[2] };
  }

  return null;
}

/**
 * Classify event type from content
 */
export function getEventType(content: string | null, eventType: string | null): ExecutionEventType {
  if (eventType === 'error') return 'error';
  if (!content) return 'unknown';

  if (content.includes('🎯 开始分析任务') || content.includes('开始分析任务')) return 'task_start';
  if (content.includes('💭 思考中') || content.includes('思考中')) return 'thinking';
  if (content.includes('SELECT:')) return 'team_selection';
  if (content.includes('👔 开始协调') || content.includes('开始协调')) return 'coordination';
  if (content.includes('🔬 开始工作') || content.includes('开始工作')) return 'work_start';
  if (content.includes('THINKING:')) return 'agent_thinking';

  return 'output';
}

export interface UseExecutionOptions {
  /** Callback for each event */
  onEvent?: (event: ExecutionEvent) => void;
  /** Callback for errors */
  onError?: (error: Error) => void;
  /** Callback when execution completes */
  onComplete?: () => void;
}

export interface UseExecutionResult {
  /** Trigger execution */
  trigger: (topologyId: number, userMessage: string) => Promise<void>;
  /** Cancel current execution (calls cancel API + aborts SSE connection) */
  cancel: () => Promise<boolean>;
  /** Whether execution is in progress */
  isExecuting: boolean;
  /** All received events */
  events: ExecutionEvent[];
  /** Current error (if any) */
  error: Error | null;
  /** Current run ID (from 'started' event, used for cancellation) */
  runId: string | null;
  /** Clear events */
  clearEvents: () => void;
}

/**
 * Hook for triggering multi-agent execution with SSE streaming
 */
export function useExecution(options: UseExecutionOptions = {}): UseExecutionResult {
  const [isExecuting, setIsExecuting] = useState(false);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const trigger = useCallback(async (topologyId: number, userMessage: string) => {
    // Abort any existing execution
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsExecuting(true);
    setEvents([]);
    setError(null);
    setRunId(null);

    const request: TriggerExecutionRequest = { topologyId, userMessage };

    try {
      console.log('[useExecution] Triggering execution:', request);

      const response = await fetch(EXECUTION_TRIGGER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(request),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[useExecution] Stream completed');
          options.onComplete?.();
          break;
        }

        // Decode chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          // Skip empty lines and event type lines
          if (!line || line.startsWith('event:')) continue;

          if (line.startsWith('data:')) {
            const jsonStr = line.slice(5); // Remove 'data:' prefix
            if (!jsonStr.trim()) continue;

            try {
              const event: ExecutionEvent = JSON.parse(jsonStr);
              console.log('[useExecution] Event:', event);

              // Capture runId from 'started' event (first event)
              if (event.type === 'started' && event.runId) {
                console.log('[useExecution] Run started, runId:', event.runId);
                setRunId(event.runId);
              }

              setEvents((prev) => [...prev, event]);
              options.onEvent?.(event);

              // Check for error events
              if (event.type === 'error') {
                const errorMsg = event.content || 'Unknown execution error';
                console.error('[useExecution] Error event:', errorMsg);
              }
            } catch (e) {
              console.warn('[useExecution] Failed to parse event:', jsonStr, e);
            }
          }
        }
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('[useExecution] Execution aborted');
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[useExecution] Error:', error);
      setError(error);
      options.onError?.(error);
    } finally {
      setIsExecuting(false);
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [options]);

  const cancel = useCallback(async (): Promise<boolean> => {
    console.log('[useExecution] Cancelling execution, runId:', runId);

    // Step 1: Abort SSE connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Step 2: Call cancel API if we have a runId
    if (!runId) {
      console.warn('[useExecution] No runId available for cancellation');
      setIsExecuting(false);
      return false;
    }

    try {
      const response = await fetch(EXECUTION_CANCEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      });

      const result: CancelExecutionResponse = await response.json();
      console.log('[useExecution] Cancel result:', result);

      if (result.code === 'SUCCESS') {
        console.log('[useExecution] Execution cancelled successfully');
        setIsExecuting(false);
        return true;
      } else {
        console.warn('[useExecution] Cancel failed:', result.message);
        setIsExecuting(false);
        return false;
      }
    } catch (err) {
      console.error('[useExecution] Cancel API error:', err);
      setIsExecuting(false);
      return false;
    }
  }, [runId]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    setError(null);
    setRunId(null);
  }, []);

  return {
    trigger,
    cancel,
    isExecuting,
    events,
    error,
    runId,
    clearEvents,
  };
}
