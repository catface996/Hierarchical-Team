
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Agent, Topology, TopologyGroup, TopologyNode, ChatMessage, DiscoveredDelta } from "../types";

// Helper to simulate typing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateGlobalPlan = async (userRequest: string, topology: Topology, teams: Team[]) => {
  await delay(1500);
  const req = userRequest.toLowerCase();
  // Simple heuristic plan: assign task to teams whose names appear in the request or related to databases
  const selectedTeams = teams.filter(t => 
    req.includes(t.name.toLowerCase().split(' ')[0]) || 
    (t.name.includes('DB') && (req.includes('database') || req.includes('consistency')))
  );
  // Default to at least one team if no matches found
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

export async function* streamTeamReport(team: Team, instruction: string, workerResults: any[]): AsyncGenerator<string> {
  const lines = [`Reporting for ${team.name}.`, `Directive executed.`, `Aggregated Status: Nominal.`];
  for (const line of lines) {
    for (const word of line.split(" ")) { yield word + " "; await delay(20); }
    yield "\n";
  }
}

// --- New Discovery Logic ---

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
                // Fixed: Removed 'properties: { type: Type.OBJECT }' as OBJECT types 
                // in responseSchema must be non-empty. 
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
