export enum AgentStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  WORKING = 'WORKING',
  COMPLETED = 'COMPLETED',
  WAITING = 'WAITING', // Waiting for sub-agents
  ERROR = 'ERROR'
}

export enum AgentRole {
  GLOBAL_SUPERVISOR = 'Global Supervisor',
  TEAM_SUPERVISOR = 'Team Supervisor',
  WORKER = 'Worker'
}

export interface AgentFindings {
  warnings: number;
  critical: number;
}

export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  specialty?: string; // e.g., "Performance Analyst", "Security"
  status: AgentStatus;
  currentTask?: string;
  findings: AgentFindings;
}

export interface Team {
  id: string;
  resourceId: string; // Links to Topology Node
  name: string;
  supervisor: Agent;
  members: Agent[];
}

export interface LogMessage {
  id: string;
  timestamp: number;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId?: string; // If undefined, it's a broadcast or internal thought
  content: string;
  type: 'instruction' | 'report' | 'thought' | 'system';
  isStreaming?: boolean;
}

// Topology Definitions
export interface TopologyNode {
  id: string;
  label: string;
  type: 'Database' | 'Service' | 'Gateway' | 'Cache';
  x?: number;
  y?: number;
}

export interface TopologyLink {
  source: string;
  target: string;
}

export interface Topology {
  nodes: TopologyNode[];
  links: TopologyLink[];
}