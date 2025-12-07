import { Topology, Team, Agent, AgentRole, AgentStatus } from '../types';

export const INITIAL_TOPOLOGY: Topology = {
  nodes: [
    { id: 'gateway-01', label: 'API Gateway', type: 'Gateway' },
    { id: 'auth-svc', label: 'Auth Service', type: 'Service' },
    { id: 'payment-svc', label: 'Payment API', type: 'Service' },
    { id: 'order-db', label: 'Order DB (PostgreSQL)', type: 'Database' },
    { id: 'redis-cache', label: 'Session Cache', type: 'Cache' },
  ],
  links: [
    { source: 'gateway-01', target: 'auth-svc' },
    { source: 'gateway-01', target: 'payment-svc' },
    { source: 'auth-svc', target: 'redis-cache' },
    { source: 'payment-svc', target: 'order-db' },
  ]
};

const defaultFindings = { warnings: 0, critical: 0 };

// Helper to generate a team based on a node
export const generateTeamForNode = (nodeId: string, nodeLabel: string, nodeType: string): Team => {
  const teamId = `team-${nodeId}`;
  
  // Define workers based on resource type
  const members: Agent[] = [];
  
  if (nodeType === 'Database') {
    members.push(
      { id: `${teamId}-w1`, name: 'DB Perf Monitor', role: AgentRole.WORKER, specialty: 'Query Optimization', status: AgentStatus.IDLE, findings: defaultFindings },
      { id: `${teamId}-w2`, name: 'Data Integrity Bot', role: AgentRole.WORKER, specialty: 'Consistency Check', status: AgentStatus.IDLE, findings: defaultFindings }
    );
  } else if (nodeType === 'Service' || nodeType === 'Gateway') {
    members.push(
      { id: `${teamId}-w1`, name: 'Log Analyzer', role: AgentRole.WORKER, specialty: 'Error Tracking', status: AgentStatus.IDLE, findings: defaultFindings },
      { id: `${teamId}-w2`, name: 'Traffic Inspector', role: AgentRole.WORKER, specialty: 'Load Analysis', status: AgentStatus.IDLE, findings: defaultFindings }
    );
  } else {
    members.push(
      { id: `${teamId}-w1`, name: 'Health Check', role: AgentRole.WORKER, specialty: 'Uptime', status: AgentStatus.IDLE, findings: defaultFindings }
    );
  }

  return {
    id: teamId,
    resourceId: nodeId,
    name: `${nodeLabel} Team`,
    supervisor: {
      id: `${teamId}-sup`,
      name: `${nodeLabel} Lead`,
      role: AgentRole.TEAM_SUPERVISOR,
      status: AgentStatus.IDLE,
      findings: defaultFindings
    },
    members
  };
};

export const GLOBAL_SUPERVISOR: Agent = {
  id: 'global-sup',
  name: 'Global Orchestrator',
  role: AgentRole.GLOBAL_SUPERVISOR,
  status: AgentStatus.IDLE,
  findings: defaultFindings
};