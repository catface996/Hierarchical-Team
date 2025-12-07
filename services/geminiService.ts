import { Team, Agent, Topology } from "../types";

// Helper to simulate typing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock content generator based on specialty
const getMockContent = (specialty?: string): string[] => {
  const defaults = [
    "Initializing protocol handshake...",
    "Scanning local context buffers...",
    "Correlating data points with baseline models...",
    "Heuristic analysis complete."
  ];

  if (!specialty) return defaults;

  const contentMap: Record<string, string[]> = {
    'Query Optimization': [
      "Analyzing query execution plans (Explain Analyze)...",
      "Detected full table scan on 'orders' relation.",
      "Index scan density is optimal at 92%.",
      "Buffer pool hit ratio holding at 99.5%."
    ],
    'Consistency Check': [
      "Verifying ACID transaction compliance...",
      "Cross-referencing Write-Ahead Logs (WAL).",
      "Replication lag is < 2ms.",
      "Data integrity checksum verification passed."
    ],
    'Error Tracking': [
      "Parsing /var/log/app/error.log stream...",
      "Grouping stack traces by exception signature.",
      "Found 3 occurrences of ConnectionTimeoutException.",
      "Error rate is within nominal thresholds (0.01%)."
    ],
    'Load Analysis': [
      "Sampling request throughput (RPS)...",
      "Latency p99 distribution indicates minor spikes.",
      "Concurrent connection pool usage at 45%.",
      "Resource saturation analysis negative."
    ],
    'Uptime': [
      "Pinging health check endpoints...",
      "Heartbeat signal received. Latency: 12ms.",
      "Service availability calculated at 99.99%.",
      "Dependencies are reachable."
    ]
  };

  return contentMap[specialty] || defaults;
};

// 1. Global Supervisor Planning (Mock)
export const generateGlobalPlan = async (
  userRequest: string, 
  topology: Topology, 
  teams: Team[]
): Promise<{ teamId: string; instruction: string }[]> => {
  await delay(1500); // Simulate thinking time

  // Simple keyword matching to make the mock feel responsive
  const req = userRequest.toLowerCase();
  const selectedTeams: Team[] = [];

  if (req.includes('database') || req.includes('db') || req.includes('consistency')) {
    const dbTeam = teams.find(t => t.name.includes('DB'));
    if (dbTeam) selectedTeams.push(dbTeam);
  }
  
  if (req.includes('payment') || req.includes('security')) {
    const paymentTeam = teams.find(t => t.name.includes('Payment'));
    if (paymentTeam) selectedTeams.push(paymentTeam);
  }
  
  if (req.includes('gateway') || req.includes('traffic')) {
     const gwTeam = teams.find(t => t.name.includes('Gateway'));
     if (gwTeam && !selectedTeams.includes(gwTeam)) selectedTeams.push(gwTeam);
  }

  // Fallback: Pick first two if no keywords matched
  if (selectedTeams.length === 0) {
    selectedTeams.push(teams[0]);
    if (teams.length > 1) selectedTeams.push(teams[1]);
  }

  return selectedTeams.map(t => ({
    teamId: t.id,
    instruction: `Analyze metrics and logs related to: "${userRequest}". Ensure stability of ${t.name}.`
  }));
};

// 2. Team Supervisor Delegation (Mock)
export const generateTeamDelegation = async (
  team: Team,
  instruction: string
): Promise<{ agentId: string; task: string }[]> => {
  await delay(1000); // Simulate thinking

  // Assign task to all members for the demo
  return team.members.map(member => ({
    agentId: member.id,
    task: `Execute ${member.specialty} protocols. Context: ${instruction}`
  }));
};

// 3. Worker Execution (Streaming Mock)
export async function* streamWorkerTask(
  agent: Agent,
  task: string,
  context: string
): AsyncGenerator<string> {
  const steps = getMockContent(agent.specialty);
  
  // Intro
  yield `[Task Initiated] Agent: ${agent.name}\n`;
  yield `Context: ${context.substring(0, 50)}...\n\n`;
  await delay(200);

  for (const step of steps) {
    const words = step.split(" ");
    for (const word of words) {
      yield word + " ";
      await delay(30 + Math.random() * 50); // Random typing speed
    }
    yield "\n";
    await delay(400); // Pause between lines
  }
  
  yield "\nFinalizing report...\n";
  await delay(300);

  // Randomly generate findings
  // 30% chance of warning, 10% chance of critical
  const r = Math.random();
  const warnings = r < 0.3 ? Math.floor(Math.random() * 3) + 1 : 0;
  const critical = r < 0.1 ? 1 : 0;

  yield `SUMMARY: {"warnings": ${warnings}, "critical": ${critical}}`;
}

// 4. Team Supervisor Synthesis (Streaming Mock)
export async function* streamTeamReport(
  team: Team,
  instruction: string,
  workerResults: { agentName: string; result: string }[]
): AsyncGenerator<string> {
  const lines = [
    `Reporting for ${team.name}.`,
    `Directive: "${instruction}" has been executed.`,
    `Aggregated Status: Nominal.`,
    `Sub-agent reports have been consolidated.`,
    `Awaiting further instructions from Global Supervisor.`
  ];

  for (const line of lines) {
    const words = line.split(" ");
    for (const word of words) {
      yield word + " ";
      await delay(20);
    }
    yield "\n";
    await delay(100);
  }
}