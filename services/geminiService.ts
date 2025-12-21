
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Agent, Topology, TopologyGroup, TopologyNode, ChatMessage, DiscoveredDelta, ReportTemplate, LogMessage } from "../types";

// Helper to simulate typing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateGlobalPlan = async (userRequest: string, topology: Topology, teams: Team[]) => {
  await delay(1500);
  const req = userRequest.toLowerCase();
  const selectedTeams = teams.filter(t => 
    req.includes(t.name.toLowerCase().split(' ')[0]) || 
    (t.name.includes('DB') && (req.includes('database') || req.includes('consistency')))
  );
  const finalTeams = selectedTeams.length > 0 ? selectedTeams : [teams[0]];
  return finalTeams.map(t => ({ teamId: t.id, instruction: `Analyze: "${userRequest}" for ${t.name}.` }));
};

export const generateTeamDelegation = async (team: Team, instruction: string) => {
  await delay(1000);
  return team.members.map(member => ({ agentId: member.id, task: `Execute ${member.specialty}. Context: ${instruction}` }));
};

export async function* streamWorkerTask(agent: Agent, task: string, context: string): AsyncGenerator<string> {
  yield `[Task Initiated] Agent: ${agent.name}\nContext: ${context.substring(0, 50)}...\n\n`;
  const steps = ["Analyzing local context...", "Scanning logs...", "Correlation complete."];
  for (const step of steps) {
    for (const word of step.split(" ")) { yield word + " "; await delay(40); }
    yield "\n";
  }
  const r = Math.random();
  yield `\nSUMMARY: {"warnings": ${r < 0.3 ? 1 : 0}, "critical": ${r < 0.1 ? 1 : 0}}`;
}

export const generateStructuredReport = async (
    template: ReportTemplate, 
    logs: LogMessage[], 
    topology: TopologyGroup,
    query: string
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 提取日志中的核心发现
    const findings = logs
        .filter(l => l.type === 'report' || l.type === 'thought')
        .map(l => `${l.fromAgentName}: ${l.content}`)
        .join('\n\n');

    const prompt = `As a Senior EntropyOps Orchestrator, synthesize the following diagnosis session into a formal report using the provided Markdown Template.
    
    CONTEXT:
    - User Inquiry: ${query}
    - Topology Focus: ${topology.name}
    - Collaborating Units: ${topology.nodeCount} Agents
    
    COLLABORATION LOGS:
    ${findings}

    MARKDOWN TEMPLATE:
    ${template.content}

    INSTRUCTIONS:
    1. Fill in all placeholders like {{...}} with inferred data from the logs.
    2. Maintain the structure of the template.
    3. If visual charts are defined in the template (Mermaid or JSON charts), ensure they accurately reflect the data trends discussed in logs.
    4. Output ONLY the finalized Markdown content.`;

    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
    });

    return response.text || "Report generation failed.";
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
