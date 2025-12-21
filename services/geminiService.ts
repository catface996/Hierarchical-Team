
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Agent, Topology, TopologyGroup, TopologyNode, ChatMessage, DiscoveredDelta, ReportTemplate, LogMessage } from "../types";

// Helper to simulate typing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟诊断场景和发现的数据
const DIAGNOSTIC_SCENARIOS: Record<string, {
  analysis: string;
  findings: { metric: string; value: string; status: 'ok' | 'warning' | 'critical' }[];
  recommendation?: string;
}> = {
  'API Gateway': {
    analysis: 'Inspecting ingress traffic patterns, TLS handshake latency, and rate limiting thresholds',
    findings: [
      { metric: 'Request Latency P99', value: '245ms', status: 'warning' },
      { metric: 'Active Connections', value: '12,847', status: 'ok' },
      { metric: 'Error Rate (5xx)', value: '0.02%', status: 'ok' },
      { metric: 'SSL Certificate Expiry', value: '45 days', status: 'ok' }
    ],
    recommendation: 'Consider enabling connection pooling to reduce P99 latency'
  },
  'Auth Service': {
    analysis: 'Evaluating JWT validation performance, session store health, and OAuth flow metrics',
    findings: [
      { metric: 'Token Validation Time', value: '12ms', status: 'ok' },
      { metric: 'Session Cache Hit Rate', value: '94.2%', status: 'ok' },
      { metric: 'Failed Auth Attempts', value: '847/min', status: 'warning' },
      { metric: 'Active Sessions', value: '45,231', status: 'ok' }
    ],
    recommendation: 'Unusual spike in failed auth attempts - recommend enabling geo-blocking'
  },
  'Payment API': {
    analysis: 'Analyzing transaction throughput, payment gateway response times, and fraud detection latency',
    findings: [
      { metric: 'Transaction TPS', value: '1,247', status: 'ok' },
      { metric: 'Gateway Response P95', value: '892ms', status: 'critical' },
      { metric: 'Fraud Check Latency', value: '234ms', status: 'warning' },
      { metric: 'Settlement Queue Depth', value: '12,453', status: 'warning' }
    ],
    recommendation: 'Payment gateway showing degraded performance - escalate to vendor'
  },
  'Order DB': {
    analysis: 'Checking connection pool utilization, query performance, and replication lag',
    findings: [
      { metric: 'Connection Pool Usage', value: '78%', status: 'warning' },
      { metric: 'Avg Query Time', value: '45ms', status: 'ok' },
      { metric: 'Replication Lag', value: '120ms', status: 'ok' },
      { metric: 'Dead Tuples', value: '2.3M', status: 'warning' }
    ],
    recommendation: 'Schedule VACUUM ANALYZE to clear dead tuples'
  },
  'Session Cache': {
    analysis: 'Monitoring memory utilization, eviction rates, and cluster synchronization',
    findings: [
      { metric: 'Memory Usage', value: '67%', status: 'ok' },
      { metric: 'Cache Hit Rate', value: '96.8%', status: 'ok' },
      { metric: 'Eviction Rate', value: '0.3/s', status: 'ok' },
      { metric: 'Cluster Sync Lag', value: '8ms', status: 'ok' }
    ]
  },
  'K8s Cluster': {
    analysis: 'Inspecting node health, pod scheduling, and resource quotas across namespaces',
    findings: [
      { metric: 'Node Availability', value: '12/12', status: 'ok' },
      { metric: 'Pod Restart Rate', value: '3/hour', status: 'ok' },
      { metric: 'CPU Allocation', value: '72%', status: 'warning' },
      { metric: 'Memory Pressure', value: 'None', status: 'ok' }
    ],
    recommendation: 'Approaching CPU quota limits - consider horizontal scaling'
  },
  'default': {
    analysis: 'Performing standard health checks and metric collection',
    findings: [
      { metric: 'Service Health', value: 'Healthy', status: 'ok' },
      { metric: 'Response Time', value: '125ms', status: 'ok' },
      { metric: 'Error Rate', value: '0.01%', status: 'ok' }
    ]
  }
};

// Global Orchestrator 的思考过程
export async function* streamGlobalThinking(userRequest: string, teams: Team[]): AsyncGenerator<string> {
  const thoughts = [
    `Parsing directive: "${userRequest}"`,
    `Identifying relevant subsystems and dependencies...`,
    `Cross-referencing with ${teams.length} available operational teams...`,
    `Calculating optimal task distribution based on team specializations...`,
    `Establishing priority matrix for parallel execution...`
  ];

  for (const thought of thoughts) {
    for (const char of thought) {
      yield char;
      await delay(15);
    }
    yield '\n';
    await delay(200);
  }
}

export const generateGlobalPlan = async (userRequest: string, topology: Topology, teams: Team[]) => {
  await delay(800);
  const req = userRequest.toLowerCase();

  // 更智能的团队选择逻辑
  let selectedTeams = teams.filter(t => {
    const teamName = t.name.toLowerCase();
    return req.includes(teamName.split(' ')[0]) ||
           (teamName.includes('gateway') && (req.includes('latency') || req.includes('traffic') || req.includes('api'))) ||
           (teamName.includes('db') && (req.includes('database') || req.includes('query') || req.includes('connection'))) ||
           (teamName.includes('payment') && (req.includes('payment') || req.includes('transaction') || req.includes('billing'))) ||
           (teamName.includes('auth') && (req.includes('auth') || req.includes('login') || req.includes('security'))) ||
           (teamName.includes('cache') && (req.includes('cache') || req.includes('redis') || req.includes('session'))) ||
           (teamName.includes('k8s') && (req.includes('cluster') || req.includes('pod') || req.includes('kubernetes')));
  });

  // 如果没有匹配的，选择前3个团队
  if (selectedTeams.length === 0) {
    selectedTeams = teams.slice(0, Math.min(3, teams.length));
  }

  // 为每个团队生成具体指令
  const priorities = ['HIGH', 'MEDIUM', 'LOW'];
  return selectedTeams.map((t, idx) => {
    const resourceType = t.name.replace(' Team', '');
    return {
      teamId: t.id,
      priority: priorities[Math.min(idx, 2)],
      instruction: `[PRIORITY: ${priorities[Math.min(idx, 2)]}] Conduct comprehensive analysis of ${resourceType}. Focus areas: performance metrics, error patterns, resource utilization. Report anomalies immediately.`,
      expectedDuration: `${2 + idx}min`
    };
  });
};

// Team Supervisor 的思考和委派过程
export async function* streamTeamLeadThinking(team: Team, instruction: string): AsyncGenerator<string> {
  const resourceName = team.name.replace(' Team', '');
  const thoughts = [
    `Acknowledging directive from Global Orchestrator`,
    `Analyzing task scope for ${resourceName}...`,
    `Reviewing team member capabilities: ${team.members.map(m => m.specialty || m.name).join(', ')}`,
    `Formulating execution strategy...`
  ];

  for (const thought of thoughts) {
    for (const char of thought) {
      yield char;
      await delay(12);
    }
    yield '\n';
    await delay(150);
  }
}

export const generateTeamDelegation = async (team: Team, instruction: string) => {
  await delay(500);
  const resourceName = team.name.replace(' Team', '');

  // 根据 Worker 的专长生成具体任务
  return team.members.map((member, idx) => {
    const specialty = member.specialty || 'General Analysis';
    let task = '';

    if (specialty.toLowerCase().includes('log')) {
      task = `Scan application logs for errors, warnings, and anomalous patterns in ${resourceName}. Time window: last 15 minutes. Flag any ERROR or CRITICAL entries.`;
    } else if (specialty.toLowerCase().includes('metric')) {
      task = `Collect and analyze performance metrics for ${resourceName}. Focus on latency percentiles, throughput, and resource saturation indicators.`;
    } else if (specialty.toLowerCase().includes('trace')) {
      task = `Analyze distributed traces involving ${resourceName}. Identify slow spans, failed calls, and dependency bottlenecks.`;
    } else {
      task = `Execute ${specialty} analysis on ${resourceName}. Correlate findings with baseline metrics and report deviations.`;
    }

    return {
      agentId: member.id,
      task,
      specialty
    };
  });
};

export async function* streamWorkerTask(agent: Agent, task: string, teamName: string): AsyncGenerator<string> {
  const resourceName = teamName.replace(' Team', '');
  const scenario = DIAGNOSTIC_SCENARIOS[resourceName] || DIAGNOSTIC_SCENARIOS['default'];

  // 开始执行
  yield `═══════════════════════════════════════\n`;
  yield `DIAGNOSTIC TASK INITIATED\n`;
  yield `Agent: ${agent.name} | Specialty: ${agent.specialty || 'General'}\n`;
  yield `═══════════════════════════════════════\n\n`;
  await delay(300);

  // 分析阶段
  yield `▶ ${scenario.analysis}\n\n`;
  await delay(400);

  // 进度指示
  const steps = ['Connecting to telemetry endpoint', 'Fetching metrics snapshot', 'Running anomaly detection', 'Correlating with historical baseline'];
  for (const step of steps) {
    yield `  ⟳ ${step}...`;
    await delay(300);
    yield ` ✓\n`;
    await delay(150);
  }
  yield '\n';

  // 发现结果
  yield `┌─────────────────────────────────────────────┐\n`;
  yield `│              FINDINGS MATRIX                │\n`;
  yield `├─────────────────────────────────────────────┤\n`;

  let warnings = 0;
  let criticals = 0;

  for (const finding of scenario.findings) {
    const statusIcon = finding.status === 'ok' ? '●' : finding.status === 'warning' ? '▲' : '✖';
    const statusColor = finding.status === 'ok' ? 'GREEN' : finding.status === 'warning' ? 'YELLOW' : 'RED';
    yield `│ ${statusIcon} ${finding.metric.padEnd(22)} │ ${finding.value.padEnd(10)} │ ${statusColor.padEnd(6)} │\n`;
    await delay(200);

    if (finding.status === 'warning') warnings++;
    if (finding.status === 'critical') criticals++;
  }
  yield `└─────────────────────────────────────────────┘\n\n`;

  // 建议
  if (scenario.recommendation) {
    yield `💡 RECOMMENDATION: ${scenario.recommendation}\n\n`;
    await delay(200);
  }

  // 总结
  yield `───────────────────────────────────────\n`;
  yield `TASK COMPLETE | Warnings: ${warnings} | Critical: ${criticals}\n`;
  yield `───────────────────────────────────────`;
}

// Team Lead 汇报给 Global Orchestrator
export const generateTeamReport = (teamName: string, workerResults: { warnings: number; critical: number }[]): string => {
  const totalWarnings = workerResults.reduce((sum, r) => sum + r.warnings, 0);
  const totalCritical = workerResults.reduce((sum, r) => sum + r.critical, 0);
  const resourceName = teamName.replace(' Team', '');

  let status = 'NOMINAL';
  if (totalCritical > 0) status = 'CRITICAL - Immediate attention required';
  else if (totalWarnings > 0) status = 'ADVISORY - Non-critical issues detected';

  return `Team analysis complete for ${resourceName}.\n` +
         `Status: ${status}\n` +
         `Summary: ${totalWarnings} warning(s), ${totalCritical} critical issue(s) identified.\n` +
         `All findings logged and awaiting global correlation.`;
};

// Global Orchestrator 最终总结
export async function* streamGlobalSummary(teamResults: { teamName: string; warnings: number; critical: number }[]): AsyncGenerator<string> {
  const totalWarnings = teamResults.reduce((sum, r) => sum + r.warnings, 0);
  const totalCritical = teamResults.reduce((sum, r) => sum + r.critical, 0);

  yield `\n╔═══════════════════════════════════════════════════════════╗\n`;
  yield `║           GLOBAL ORCHESTRATOR - MISSION SUMMARY           ║\n`;
  yield `╠═══════════════════════════════════════════════════════════╣\n`;
  await delay(200);

  yield `║ Teams Coordinated: ${teamResults.length.toString().padEnd(38)}║\n`;
  yield `║ Total Warnings:    ${totalWarnings.toString().padEnd(38)}║\n`;
  yield `║ Critical Issues:   ${totalCritical.toString().padEnd(38)}║\n`;
  yield `╠═══════════════════════════════════════════════════════════╣\n`;
  await delay(200);

  for (const result of teamResults) {
    const status = result.critical > 0 ? '✖ CRITICAL' : result.warnings > 0 ? '▲ WARNING' : '● HEALTHY';
    yield `║ ${result.teamName.padEnd(25)} │ ${status.padEnd(20)} ║\n`;
    await delay(100);
  }

  yield `╠═══════════════════════════════════════════════════════════╣\n`;

  if (totalCritical > 0) {
    yield `║ ⚠️  OVERALL STATUS: DEGRADED - Action Required             ║\n`;
  } else if (totalWarnings > 0) {
    yield `║ ⚡ OVERALL STATUS: OPERATIONAL - Minor issues detected    ║\n`;
  } else {
    yield `║ ✅ OVERALL STATUS: HEALTHY - All systems nominal          ║\n`;
  }

  yield `╚═══════════════════════════════════════════════════════════╝\n`;
}

export const generateStructuredReport = async (
    template: ReportTemplate,
    logs: LogMessage[],
    topology: TopologyGroup,
    query: string
): Promise<string> => {
    // 模拟生成报告（3秒内完成）
    await delay(2500);

    // 从日志中提取关键发现
    const reportLogs = logs.filter(l => l.type === 'report');
    const warningCount = reportLogs.reduce((sum, l) => {
        const match = l.content.match(/(\d+)\s*warning/i);
        return sum + (match ? parseInt(match[1]) : 0);
    }, 0);
    const criticalCount = reportLogs.reduce((sum, l) => {
        const match = l.content.match(/(\d+)\s*critical/i);
        return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    const now = new Date();
    const severity = criticalCount > 0 ? 'Critical' : warningCount > 0 ? 'Warning' : 'Normal';

    // 生成模拟报告内容
    return `# ${template.name}: ${topology.name}

## 1. Executive Summary

This automated diagnostic report was generated following the inquiry: **"${query}"**

- **Scope**: ${topology.name}
- **Resources Analyzed**: ${topology.nodeCount}
- **Report Generated**: ${now.toISOString()}
- **Overall Severity**: ${severity}

## 2. Key Findings

| Category | Count | Status |
|:---------|:------|:-------|
| Critical Issues | ${criticalCount} | ${criticalCount > 0 ? '🔴 Action Required' : '✅ Clear'} |
| Warnings | ${warningCount} | ${warningCount > 0 ? '🟡 Monitor' : '✅ Clear'} |

## 3. Detailed Analysis

### Infrastructure Health
${criticalCount > 0
    ? '⚠️ **Critical issues detected** - Immediate remediation recommended.'
    : warningCount > 0
    ? '⚡ **Advisory status** - Non-critical issues found that may require attention.'
    : '✅ **All systems operational** - No significant issues detected.'}

### Performance Metrics
- Response times within acceptable thresholds
- Resource utilization patterns analyzed
- No anomalous traffic patterns detected

## 4. Recommendations

${criticalCount > 0 ? `
1. **Immediate**: Address ${criticalCount} critical issue(s) identified
2. **Short-term**: Review system configurations for affected components
3. **Long-term**: Implement monitoring alerts for early detection
` : warningCount > 0 ? `
1. **Monitor**: Continue observing ${warningCount} warning indicator(s)
2. **Optimize**: Consider performance tuning for flagged resources
3. **Document**: Update runbooks with findings
` : `
1. **Maintain**: Continue current operational practices
2. **Review**: Schedule periodic health checks
3. **Document**: Archive this report for compliance
`}

## 5. Appendix

- Template Used: ${template.name}
- Analysis Scope: ${topology.nodeIds?.length || topology.nodeCount} nodes
- Tags: ${topology.tags?.join(', ') || 'N/A'}

---
*Report generated by EntropyOps AI Orchestrator*
`;
};

export const analyzeInfrastructureDelta = async (rawPayload: string): Promise<DiscoveredDelta> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `As an Infrastructure Scouter, analyze the following raw cluster telemetry (YAML/JSON).
  Identify any resources or dependencies that are NOT commonly found in a standard setup but present here.
  Output JSON format.
  
  RAW DATA:
  ${rawPayload}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ['id', 'label', 'type']
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                type: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ['source', 'target']
            }
          },
          reasoning: { type: Type.STRING }
        },
        required: ['nodes', 'links', 'reasoning']
      }
    }
  });

  try {
      return JSON.parse(response.text || '{}') as DiscoveredDelta;
  } catch (e) {
      console.error("Failed to parse AI discovery result", e);
      return { nodes: [], links: [], reasoning: "AI output parsing failed." };
  }
};

export async function* streamChatResponse(
  prompt: string,
  history: ChatMessage[],
  context: { nodes: TopologyNode[]; groups: TopologyGroup[]; allTeams: Team[]; }
): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const contents = history.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }));
  const systemInstruction = `You are EntropyOps Senior Orchestrator. Total Resources: ${context.nodes.length}.`;
  contents.push({ role: 'user', parts: [{ text: prompt }] });
  try {
    const responseStream = await ai.models.generateContentStream({ model: 'gemini-3-pro-preview', contents, config: { systemInstruction } });
    for await (const chunk of responseStream) { if (chunk.text) yield chunk.text; }
  } catch (error) { yield "Neural core connection error."; }
}
