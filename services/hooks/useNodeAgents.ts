/**
 * useNodeAgents Hook
 *
 * Manage agents bound to a node
 */

import { useState, useEffect, useCallback } from 'react';
import { nodeApi } from '../api/nodes';
import type { AgentDTO } from '../api/types';

interface UseNodeAgentsResult {
  agents: AgentDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  bindAgent: (agentId: number) => Promise<boolean>;
  unbindAgent: (agentId: number) => Promise<boolean>;
  binding: boolean;
}

export function useNodeAgents(nodeId: number): UseNodeAgentsResult {
  const [agents, setAgents] = useState<AgentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [binding, setBinding] = useState(false);

  const fetchAgents = useCallback(async () => {
    if (!nodeId) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await nodeApi.listAgents({ nodeId });
      setAgents(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load agents');
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const bindAgent = useCallback(async (agentId: number): Promise<boolean> => {
    setBinding(true);
    setError(null);
    try {
      await nodeApi.bindAgent({ nodeId, agentId });
      await fetchAgents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bind agent');
      return false;
    } finally {
      setBinding(false);
    }
  }, [nodeId, fetchAgents]);

  const unbindAgent = useCallback(async (agentId: number): Promise<boolean> => {
    setBinding(true);
    setError(null);
    try {
      await nodeApi.unbindAgent({ nodeId, agentId });
      await fetchAgents();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unbind agent');
      return false;
    } finally {
      setBinding(false);
    }
  }, [nodeId, fetchAgents]);

  return {
    agents,
    loading,
    error,
    refresh: fetchAgents,
    bindAgent,
    unbindAgent,
    binding,
  };
}
