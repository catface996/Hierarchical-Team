
import { Topology, Team, Agent, AgentRole, AgentStatus, TopologyGroup, PromptTemplate, AIModel, AgentTool, Report, DiagnosisSession } from '../types';

export const INITIAL_TOPOLOGY: Topology = {
  nodes: [
    // Existing Nodes
    { id: 'gateway-01', label: 'API Gateway', type: 'Gateway', properties: { region: 'us-east-1', throughput: '10k' } },
    { id: 'auth-svc', label: 'Auth Service', type: 'Service', properties: { replicas: '3', version: 'v1.4.2' } },
    { id: 'payment-svc', label: 'Payment API', type: 'Service', properties: { replicas: '5', version: 'v2.0.1' } },
    { id: 'order-db', label: 'Order DB (PostgreSQL)', type: 'Database', properties: { size: '500GB' } },
    { id: 'redis-cache', label: 'Session Cache', type: 'Cache' },
    { id: 'k8s-cluster', label: 'K8s Cluster', type: 'Infrastructure' }, 
    { id: 'legacy-monolith', label: 'Legacy Core', type: 'Service', properties: { replicas: '1', deprecated: 'true' } },
    
    // New Nodes for Expanded Scenarios
    { id: 'cdn-edge', label: 'Global CDN', type: 'Gateway', properties: { provider: 'CloudFlare', cacheHit: '94%' } },
    { id: 'web-client', label: 'Web Storefront', type: 'Service', properties: { framework: 'Next.js', replicas: '8' } },
    { id: 'event-stream', label: 'Kafka Cluster', type: 'Infrastructure', properties: { partitions: '64', retention: '7d' } },
    { id: 'analytics-dw', label: 'Data Warehouse', type: 'Database', properties: { engine: 'Snowflake', size: '20TB' } },
    { id: 'ml-model-v1', label: 'Fraud Detection Model', type: 'Service', properties: { framework: 'PyTorch', latency: '45ms' } }
  ],
  links: [
    // Call Relationships (Traffic Flow)
    { source: 'gateway-01', target: 'auth-svc', type: 'call' },
    { source: 'gateway-01', target: 'payment-svc', type: 'call' },
    { source: 'auth-svc', target: 'redis-cache', type: 'call' },
    { source: 'payment-svc', target: 'order-db', type: 'call' },
    
    // New Flows
    { source: 'cdn-edge', target: 'web-client', type: 'call' },
    { source: 'web-client', target: 'gateway-01', type: 'call' },
    { source: 'payment-svc', target: 'event-stream', type: 'call' },
    { source: 'event-stream', target: 'analytics-dw', type: 'call' },
    { source: 'payment-svc', target: 'ml-model-v1', type: 'call' },

    // Deployment Relationships (Solid, No Arrow)
    { source: 'k8s-cluster', target: 'gateway-01', type: 'deployment' },
    { source: 'k8s-cluster', target: 'auth-svc', type: 'deployment' },
    { source: 'k8s-cluster', target: 'payment-svc', type: 'deployment' },
    { source: 'k8s-cluster', target: 'redis-cache', type: 'deployment' },
    { source: 'k8s-cluster', target: 'web-client', type: 'deployment' },
    { source: 'k8s-cluster', target: 'ml-model-v1', type: 'deployment' },

    // Dependency Relationships (Dashed)
    { source: 'payment-svc', target: 'legacy-monolith', type: 'dependency' },
    { source: 'auth-svc', target: 'legacy-monolith', type: 'dependency' },
    { source: 'ml-model-v1', target: 'analytics-dw', type: 'dependency' }
  ]
};

export const INITIAL_TOPOLOGY_GROUPS: TopologyGroup[] = [
  { 
    id: 'sg-payment-flow', 
    name: 'Payment Processing Flow', 
    description: 'Core transaction path including Gateway, Payment Service, and Order DB.', 
    nodeCount: 3, 
    createdAt: '2023-10-15T08:30:00Z',
    tags: ['Critical', 'Finance'],
    nodeIds: ['gateway-01', 'payment-svc', 'order-db']
  },
  { 
    id: 'sg-auth-cluster', 
    name: 'Authentication Cluster', 
    description: 'User session management and token verification infrastructure.', 
    nodeCount: 2, 
    createdAt: '2023-11-02T14:15:00Z',
    tags: ['Security'],
    nodeIds: ['auth-svc', 'redis-cache']
  },
  { 
    id: 'sg-infra-view', 
    name: 'Infrastructure Map', 
    description: 'Kubernetes cluster deployment topology.', 
    nodeCount: 6, 
    createdAt: '2023-09-10T09:00:00Z',
    tags: ['Infra', 'K8s'],
    nodeIds: ['k8s-cluster', 'gateway-01', 'auth-svc', 'payment-svc', 'redis-cache', 'web-client']
  },
  {
    id: 'sg-frontend-delivery',
    name: 'Frontend Delivery Network',
    description: 'Edge caching and client-facing application delivery.',
    nodeCount: 3,
    createdAt: '2023-12-05T10:20:00Z',
    tags: ['Frontend', 'CDN'],
    nodeIds: ['cdn-edge', 'web-client', 'gateway-01']
  },
  {
    id: 'sg-data-analytics',
    name: 'Data Analytics Pipeline',
    description: 'Event streaming and warehousing for business intelligence.',
    nodeCount: 3,
    createdAt: '2024-01-15T16:45:00Z',
    tags: ['Data', 'Analytics'],
    nodeIds: ['event-stream', 'analytics-dw', 'payment-svc']
  },
  {
    id: 'sg-fraud-detection',
    name: 'Real-time Fraud Detection',
    description: 'ML inference path for high-value transactions.',
    nodeCount: 3,
    createdAt: '2024-02-20T11:00:00Z',
    tags: ['AI/ML', 'Security'],
    nodeIds: ['payment-svc', 'ml-model-v1', 'analytics-dw']
  }
];

export const INITIAL_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'pt-sys-coord',
    name: 'Standard Coordinator Persona',
    description: 'System instruction for Team Supervisors to ensure effective delegation.',
    category: 'System',
    content: 'You are the Team Supervisor. Coordinate your workers effectively, aggregate their findings, and report a summarized status to the Global Supervisor. Ensure all tasks are completed.',
    tags: ['Persona', 'Supervisor'],
    updatedAt: Date.now() - 10000000
  },
  {
    id: 'pt-sys-sec',
    name: 'Security Auditor Persona',
    description: 'Strict persona for security-focused worker agents.',
    category: 'System',
    content: 'You are a Security-Focused Agent. Scrutinize all reports for potential vulnerabilities. Prioritize security warnings over performance metrics. Flag any anomalies immediately.',
    tags: ['Persona', 'Security', 'Critical'],
    updatedAt: Date.now() - 8000000
  },
  {
    id: 'pt-usr-perf',
    name: 'Performance Audit Request',
    description: 'Standard user query to trigger a performance check.',
    category: 'User',
    content: 'Analyze the current throughput and latency metrics for the Payment Service. Identify any bottlenecks in the database connection pool.',
    tags: ['Performance', 'Audit'],
    updatedAt: Date.now() - 5000000
  },
  {
    id: 'pt-rep-json',
    name: 'JSON Findings Format',
    description: 'Instruction to enforce structured JSON output for findings.',
    category: 'Reporting',
    content: 'Output your final analysis as a JSON object with the following schema: { "warnings": number, "critical": number, "summary": "string" }.',
    tags: ['Format', 'JSON'],
    updatedAt: Date.now() - 2000000
  },
  {
    id: 'pt-ana-sql',
    name: 'Slow Query Analysis',
    description: 'Specific instruction for DB agents to analyze slow logs.',
    category: 'Analysis',
    content: 'Review the PostgreSQL slow query log for the last hour. Identify the top 3 queries by total execution time and suggest index improvements.',
    tags: ['Database', 'SQL'],
    updatedAt: Date.now() - 1000000
  }
];

export const INITIAL_MODELS: AIModel[] = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', contextWindow: 1000000, type: 'Multimodal', status: 'Active' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro (Preview)', provider: 'Google', contextWindow: 2000000, type: 'Multimodal', status: 'Active' },
  { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Flash (Thinking)', provider: 'Google', contextWindow: 32000, type: 'Text', status: 'Active' },
];

export const INITIAL_TOOLS: AgentTool[] = [
  { id: 'tool-search', name: 'Google Search', description: 'Web search for real-time information.', type: 'Integration', createdAt: Date.now() - 5000000 },
  { id: 'tool-db-query', name: 'SQL Client', description: 'Execute readonly SQL queries against registered DBs.', type: 'Function', createdAt: Date.now() - 4000000 },
  { id: 'tool-k8s-api', name: 'Kubernetes API', description: 'Fetch pod status and logs from K8s clusters.', type: 'Integration', createdAt: Date.now() - 3000000 },
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-2024-05-12-001',
    title: 'Weekly Security Audit',
    type: 'Security',
    status: 'Final',
    createdAt: Date.now() - 172800000, // 2 days ago
    author: 'Global Supervisor',
    summary: 'Routine security scan detected 3 minor vulnerabilities in the legacy monolith dependency chain.',
    tags: ['Weekly', 'Automated'],
    content: `
# Weekly Security Audit Report

**Date:** May 12, 2024
**Scope:** Global Topology
**Status:** Completed

## 1. Executive Summary
The automated weekly security scan was completed successfully. While the overall system posture remains strong, three minor vulnerabilities were detected in the communication path between the Authentication Service and the Legacy Core system.

## 2. Findings Distribution
The following chart illustrates the breakdown of findings by severity category found across the 12 clusters scanned.

\`\`\`json
{
  "type": "bar",
  "data": [
    { "name": "Auth Svc", "Low": 2, "Medium": 1, "High": 0 },
    { "name": "Payment", "Low": 1, "Medium": 0, "High": 0 },
    { "name": "Legacy", "Low": 5, "Medium": 3, "High": 0 },
    { "name": "Gateway", "Low": 0, "Medium": 1, "High": 0 }
  ],
  "xKey": "name",
  "series": [
    { "key": "Low", "color": "#4ade80" },
    { "key": "Medium", "color": "#facc15" },
    { "key": "High", "color": "#ef4444" }
  ]
}
\`\`\`

## 3. Detailed Analysis

### 3.1 Legacy Protocol Usage
The **legacy-monolith** is currently negotiating TLS 1.1 connections for compatibility with older hardware clients.

*   **Severity**: Low
*   **Affected Node**: \`legacy-monolith\`
*   **Recommendation**: Upgrade termination proxy to enforce TLS 1.2+.

### 3.2 Traffic Anomaly Flow
The following sequence diagram illustrates the unauthorized probe detected on Port 8080.

\`\`\`mermaid
sequenceDiagram
    participant Ext as External IP
    participant GW as API Gateway
    participant Pay as Payment Svc

    Ext->>GW: POST /api/v1/debug
    GW->>Pay: Forward Request (Port 8080)
    Note over Pay: Unused Debug Port Open
    Pay-->>GW: 200 OK (Debug Info)
    GW-->>Ext: 200 OK
\`\`\`

## 4. Remediation Plan

| ID | Issue | Owner | ETA |
|:---|:------|:------|:----|
| VULN-102 | Disable TLS 1.1 | Infra Team | May 20 |
| VULN-103 | Close Port 8080 | Payment Team | May 15 |
| VULN-104 | Gateway Rate Limits | Ops Team | May 16 |

> Note: All critical paths have been verified as secure. These findings represent defense-in-depth improvements.
    `
  },
  {
    id: 'rep-2024-05-13-002',
    title: 'Payment Service Performance Degradation',
    type: 'Performance',
    status: 'Archived',
    createdAt: Date.now() - 86400000, // 1 day ago
    author: 'Performance Agent',
    summary: 'Post-incident analysis of the latency spike observed during peak hours.',
    tags: ['Incident', 'Latency'],
    content: `
# Incident Report: Payment Service Latency

**Date:** May 13, 2024
**Scope:** Payment Processing Flow
**Status:** Archived

## Incident Description
At 14:00 UTC, p99 latency on the Payment API increased from 150ms to 2.4s. The degradation lasted for approximately 15 minutes.

## Latency Metrics
Below is the latency trend (p99) observed during the incident window (13:55 - 14:25 UTC).

\`\`\`json
{
  "type": "area",
  "data": [
    { "time": "13:55", "ms": 120 },
    { "time": "14:00", "ms": 450 },
    { "time": "14:05", "ms": 2400 },
    { "time": "14:10", "ms": 2250 },
    { "time": "14:15", "ms": 800 },
    { "time": "14:20", "ms": 140 },
    { "time": "14:25", "ms": 125 }
  ],
  "xKey": "time",
  "series": [
    { "key": "ms", "color": "#f87171" }
  ]
}
\`\`\`

## Root Cause Analysis
- **Database Lock Contention**: The Order DB experienced high lock contention due to a long-running batch update job scheduled incorrectly during peak hours.
- **Connection Pool Exhaustion**: As queries slowed down, the connection pool on the Payment Service saturated, queuing incoming requests.

## Resolution
1.  The batch job was manually terminated at 14:15 UTC.
2.  Latency returned to normal levels by 14:20 UTC.
3.  The batch job schedule has been moved to 03:00 UTC.

## Call Flow Impact
The bottleneck propagated upstream from the Database to the Gateway.

\`\`\`mermaid
graph LR
    User((User))
    GW[API Gateway]
    Pay[Payment Svc]
    DB[(Order DB)]
    
    User -- "Timeout (5s)" --> GW
    GW -- "Latency (2.4s)" --> Pay
    Pay -- "Lock Wait" --> DB
    style Pay fill:#7f1d1d,stroke:#ef4444,stroke-width:2px
    style DB fill:#7f1d1d,stroke:#ef4444,stroke-width:2px
\`\`\`

## Recommendations
- Implement circuit breakers for DB connections.
- Review all cron job schedules overlapping with business hours.
    `
  },
  {
    id: 'rep-2024-05-14-003',
    title: 'Q2 Infrastructure Capacity Plan',
    type: 'Audit',
    status: 'Draft',
    createdAt: Date.now() - 3600000, // 1 hour ago
    author: 'Infrastructure Lead',
    summary: 'Draft proposal for scaling the Kubernetes cluster to accommodate new ML workloads.',
    tags: ['Planning', 'K8s', 'ML'],
    content: `
# Q2 Infrastructure Capacity Planning

**Date:** May 14, 2024
**Status:** DRAFT

## Objective
Assess current cluster utilization and propose node group expansion for the upcoming Fraud Detection Model rollout.

## Projected Resource Usage
The following pie chart represents the projected resource allocation by service category after the ML rollout.

\`\`\`json
{
  "type": "pie",
  "data": [
    { "name": "Core Services", "value": 30 },
    { "name": "Databases", "value": 20 },
    { "name": "ML Inference", "value": 40 },
    { "name": "Monitoring", "value": 10 }
  ],
  "series": [
    { "key": "value", "color": "#22d3ee" } 
  ]
}
\`\`\`

*(Note: ML Inference will consume 40% of cluster compute)*

## Proposal
1. Add a new Node Group 'gpu-inference' with 2x p3.2xlarge instances.
2. Increase the 'general-compute' group by 2 nodes to handle sidecar proxies.

## Deployment Timeline

\`\`\`mermaid
gantt
    title Infrastructure Rollout Q2
    dateFormat  YYYY-MM-DD
    section Procurement
    Budget Approval           :done,    des1, 2024-05-01, 2024-05-10
    Instance Reservation      :active,  des2, 2024-05-12, 3d
    section Implementation
    Node Provisioning         :         des3, after des2, 2d
    K8s Config Update         :         des4, after des3, 1d
    ML Model Deploy           :         des5, after des4, 3d
\`\`\`
    `
  }
];

export const INITIAL_SESSIONS: DiagnosisSession[] = [
  {
    id: 'sess-001',
    query: "Investigate critical latency spikes in Payment API during high load.",
    timestamp: Date.now() - 7200000, // 2 hours ago
    status: 'Completed',
    findings: { warnings: 1, critical: 2 },
    scope: 'Payment Processing Flow',
    scopeId: 'sg-payment-flow',
    relatedNodeIds: ['payment-svc', 'order-db', 'gateway-01']
  },
  {
    id: 'sess-002',
    query: "Routine integrity check for all database clusters.",
    timestamp: Date.now() - 86400000, // 1 day ago
    status: 'Completed',
    findings: { warnings: 0, critical: 0 },
    scope: 'Global System',
    relatedNodeIds: ['order-db', 'analytics-dw', 'redis-cache']
  },
  {
    id: 'sess-003',
    query: "Security sweep: Verify Auth Service token validation logic.",
    timestamp: Date.now() - 43200000, // 12 hours ago
    status: 'Completed',
    findings: { warnings: 3, critical: 0 },
    scope: 'Authentication Cluster',
    scopeId: 'sg-auth-cluster',
    relatedNodeIds: ['auth-svc', 'redis-cache', 'gateway-01']
  },
  {
    id: 'sess-004',
    query: "Analyze Kafka throughput bottleneck for Fraud Detection.",
    timestamp: Date.now() - 10800000, // 3 hours ago
    status: 'Completed',
    findings: { warnings: 2, critical: 0 },
    scope: 'Real-time Fraud Detection',
    scopeId: 'sg-fraud-detection',
    relatedNodeIds: ['event-stream', 'ml-model-v1', 'payment-svc']
  },
  {
    id: 'sess-005',
    query: "Check CDN edge node health and cache hit ratios.",
    timestamp: Date.now() - 300000, // 5 mins ago
    status: 'Completed',
    findings: { warnings: 0, critical: 0 },
    scope: 'Frontend Delivery Network',
    scopeId: 'sg-frontend-delivery',
    relatedNodeIds: ['cdn-edge', 'web-client']
  }
];

const defaultFindings = { warnings: 0, critical: 0 };

// Helper to generate a team based on a node
export const generateTeamForNode = (nodeId: string, nodeLabel: string, nodeType: string): Team => {
  const teamId = `team-${nodeId}`;
  
  // Define workers based on resource type
  const members: Agent[] = [];
  
  const workerConfig = {
    model: 'gemini-2.5-flash',
    temperature: 0.7,
    systemInstruction: 'You are a specialized worker agent. Execute tasks precisely and report findings.',
    defaultContext: ''
  };

  if (nodeType === 'Database') {
    members.push(
      { id: `${teamId}-w1`, name: 'DB Perf Monitor', role: AgentRole.WORKER, specialty: 'Query Optimization', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig },
      { id: `${teamId}-w2`, name: 'Data Integrity Bot', role: AgentRole.WORKER, specialty: 'Consistency Check', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig }
    );
  } else if (nodeType === 'Service' || nodeType === 'Gateway') {
    members.push(
      { id: `${teamId}-w1`, name: 'Log Analyzer', role: AgentRole.WORKER, specialty: 'Error Tracking', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig },
      { id: `${teamId}-w2`, name: 'Traffic Inspector', role: AgentRole.WORKER, specialty: 'Load Analysis', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig }
    );
  } else if (nodeType === 'Infrastructure') {
    members.push(
      { id: `${teamId}-w1`, name: 'Node Scaler', role: AgentRole.WORKER, specialty: 'Resource Provisioning', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig },
      { id: `${teamId}-w2`, name: 'Cluster Health', role: AgentRole.WORKER, specialty: 'Node Health', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig }
    );
  } else {
    members.push(
      { id: `${teamId}-w1`, name: 'Health Check', role: AgentRole.WORKER, specialty: 'Uptime', status: AgentStatus.IDLE, findings: defaultFindings, config: workerConfig }
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
      findings: defaultFindings,
      config: {
        model: 'gemini-3-pro-preview',
        temperature: 0.5,
        systemInstruction: `You are the Team Supervisor for ${nodeLabel}. Coordinate your workers to ensure system stability.`,
        defaultContext: 'Always prioritize critical error paths.'
      }
    },
    members
  };
};

export const GLOBAL_SUPERVISOR: Agent = {
  id: 'global-sup',
  name: 'Global Orchestrator',
  role: AgentRole.GLOBAL_SUPERVISOR,
  status: AgentStatus.IDLE,
  findings: defaultFindings,
  config: {
    model: 'gemini-3-pro-preview',
    temperature: 0.2,
    systemInstruction: 'You are the Global System Orchestrator. Break down complex user requests into sub-tasks for specific resource teams.',
    defaultContext: ''
  }
};
