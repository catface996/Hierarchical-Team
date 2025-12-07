import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  INITIAL_TOPOLOGY, 
  generateTeamForNode, 
  GLOBAL_SUPERVISOR 
} from './services/mockData';
import { 
  Team, 
  Agent, 
  LogMessage, 
  AgentStatus,
  AgentFindings
} from './types';
import { 
  generateGlobalPlan, 
  generateTeamDelegation, 
  streamWorkerTask, 
  streamTeamReport 
} from './services/geminiService';
import TopologyGraph from './components/TopologyGraph';
import AgentHierarchy from './components/AgentHierarchy';
import LogStream from './components/LogStream';
import { RotateCcw, Activity, Terminal, Map, Send, Zap, GripVertical } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [topology] = useState(INITIAL_TOPOLOGY);
  const [teams, setTeams] = useState<Team[]>([]);
  const [globalAgent, setGlobalAgent] = useState<Agent>(GLOBAL_SUPERVISOR);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [userQuery, setUserQuery] = useState("Run a security audit on the Payment Service and check Order DB consistency.");
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeNodeIds, setActiveNodeIds] = useState<Set<string>>(new Set());
  const [activeTeamIds, setActiveTeamIds] = useState<Set<string>>(new Set());
  const [focusTarget, setFocusTarget] = useState<{ agentId: string; ts: number } | null>(null);

  // Layout State
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(288); // Default w-72 equivalent
  const [resizingSide, setResizingSide] = useState<'left' | 'right' | null>(null);
  
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Initialization
  useEffect(() => {
    const initialTeams = topology.nodes.map(node => 
      generateTeamForNode(node.id, node.label, node.type)
    );
    setTeams(initialTeams);
    addLog("system-root", "System", "Topology initialized. Teams generated.", "system");
  }, [topology]);

  // Logging Helpers
  const addLog = (fromId: string, fromName: string, content: string, type: LogMessage['type'], to?: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      fromAgentName: fromName,
      fromAgentId: fromId, 
      toAgentId: to,
      content,
      type
    }]);
  };

  const streamLogMessage = async (
    fromName: string,
    fromId: string,
    type: LogMessage['type'],
    toId: string | undefined,
    streamGenerator: AsyncGenerator<string>
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    // Init empty streaming log
    setLogs(prev => [...prev, {
      id,
      timestamp: Date.now(),
      fromAgentName: fromName,
      fromAgentId: fromId, 
      toAgentId: toId,
      content: '',
      type,
      isStreaming: true
    }]);

    let fullContent = '';
    for await (const chunk of streamGenerator) {
       if (chunk) {
           fullContent += chunk;
           setLogs(prev => prev.map(log => 
               log.id === id ? { ...log, content: fullContent } : log
           ));
       }
    }
    
    // Finish streaming
    setLogs(prev => prev.map(log => 
        log.id === id ? { ...log, isStreaming: false } : log
    ));
    
    return fullContent;
  };

  // --- Resizing Logic ---
  const startResizingLeft = useCallback(() => {
    setResizingSide('left');
  }, []);

  const startResizingRight = useCallback(() => {
    setResizingSide('right');
  }, []);

  const stopResizing = useCallback(() => {
    setResizingSide(null);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (resizingSide === 'left') {
        const newWidth = mouseMoveEvent.clientX;
        if (newWidth > 200 && newWidth < 600) {
          setLeftSidebarWidth(newWidth);
        }
      } else if (resizingSide === 'right') {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        if (newWidth > 200 && newWidth < 800) {
          setRightSidebarWidth(newWidth);
        }
      }
    },
    [resizingSide]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    
    if (resizingSide) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing, resizingSide]);

  // --- Simulation Logic ---

  const runSimulation = async () => {
    // API KEY CHECK REMOVED FOR MOCK MODE
    
    setIsSimulating(true);
    setLogs([]);
    setActiveNodeIds(new Set());
    setActiveTeamIds(new Set());
    setFocusTarget(null);
    resetAllAgentStats();
    
    // 1. Global Supervisor Planning
    setGlobalAgent(prev => ({ ...prev, status: AgentStatus.THINKING }));
    addLog(globalAgent.id, globalAgent.name, `Analyzing request: "${userQuery}"...`, 'thought');
    
    // Small delay for UI effect
    await new Promise(r => setTimeout(r, 1000));
    
    const globalPlan = await generateGlobalPlan(userQuery, topology, teams);
    
    if (globalPlan.length === 0) {
      addLog(globalAgent.id, globalAgent.name, "No relevant teams found for this request.", "report");
      setGlobalAgent(prev => ({ ...prev, status: AgentStatus.IDLE }));
      setIsSimulating(false);
      return;
    }

    setGlobalAgent(prev => ({ ...prev, status: AgentStatus.WAITING }));
    addLog(globalAgent.id, globalAgent.name, `Identified ${globalPlan.length} teams for execution. Delegating...`, 'instruction');

    // Highlight active nodes
    const planNodeIds = new Set<string>();
    const planTeamIds = new Set<string>();
    globalPlan.forEach(p => {
        const team = teams.find(t => t.id === p.teamId);
        if (team) {
            planNodeIds.add(team.resourceId);
            planTeamIds.add(team.id);
        }
    });
    setActiveNodeIds(planNodeIds);
    setActiveTeamIds(planTeamIds);

    // 2. Execute per Team (Sequential for better visualization)
    for (const planItem of globalPlan) {
      const team = teams.find(t => t.id === planItem.teamId);
      if (!team) continue;

      // Update Team Sup Status
      updateAgentStatus(team.id, team.supervisor.id, AgentStatus.THINKING);
      addLog(globalAgent.id, globalAgent.name, `Instruction for ${team.name}: ${planItem.instruction}`, 'instruction', team.supervisor.name);
      
      await new Promise(r => setTimeout(r, 800));

      // Team Sup delegates
      const assignments = await generateTeamDelegation(team, planItem.instruction);
      updateAgentStatus(team.id, team.supervisor.id, AgentStatus.WAITING);
      
      addLog(team.supervisor.id, team.supervisor.name, `Breaking down tasks for ${assignments.length} agents...`, 'thought');
      await new Promise(r => setTimeout(r, 800));

      const workerResults: { agentName: string, result: string }[] = [];

      // 3. Workers Execute
      for (const assignment of assignments) {
        const worker = team.members.find(m => m.id === assignment.agentId);
        if (!worker) continue;

        updateAgentStatus(team.id, worker.id, AgentStatus.WORKING);
        addLog(team.supervisor.id, team.supervisor.name, `Assigning task: "${assignment.task}"`, 'instruction', worker.name);
        
        // STREAMING WORKER EXECUTION
        const rawResult = await streamLogMessage(
          worker.name,
          worker.id,
          'report',
          team.supervisor.name,
          streamWorkerTask(worker, assignment.task, `Node ${team.resourceId} is online.`)
        );
        
        // Parse findings from result
        let cleanResult = rawResult;
        const summaryMatch = rawResult.match(/SUMMARY:\s*({.*?})/);
        if (summaryMatch) {
            try {
                const findings = JSON.parse(summaryMatch[1]);
                updateAgentFindings(team.id, worker.id, findings);
                // Remove the summary line from the log to keep it clean
                cleanResult = rawResult.replace(summaryMatch[0], '').trim();
                // Update log content to remove summary
                setLogs(prev => {
                    const lastLog = prev[prev.length - 1];
                    if (lastLog.fromAgentId === worker.id) {
                        return prev.map(l => l.id === lastLog.id ? { ...l, content: cleanResult } : l);
                    }
                    return prev;
                });
            } catch (e) {
                console.error("Failed to parse findings", e);
            }
        }

        updateAgentStatus(team.id, worker.id, AgentStatus.COMPLETED);
        workerResults.push({ agentName: worker.name, result: cleanResult });
      }

      // 4. Team Supervisor Reports Back
      updateAgentStatus(team.id, team.supervisor.id, AgentStatus.WORKING); 
      
      // STREAMING SUPERVISOR REPORT
      await streamLogMessage(
        team.supervisor.name,
        team.supervisor.id,
        'report',
        globalAgent.name,
        streamTeamReport(team, planItem.instruction, workerResults)
      );
      
      updateAgentStatus(team.id, team.supervisor.id, AgentStatus.COMPLETED);
    }

    // 5. Global Wrap up
    setGlobalAgent(prev => ({ ...prev, status: AgentStatus.COMPLETED }));
    addLog(globalAgent.id, globalAgent.name, "All team reports received. Mission accomplished.", "report");
    setIsSimulating(false);
    
    // Clear highlights after delay
    setTimeout(() => {
        setActiveNodeIds(new Set());
        setActiveTeamIds(new Set());
        // Do not reset Global Agent status immediately so user can see "Finished"
    }, 4000);
  };

  // State Helpers
  const updateAgentStatus = (teamId: string, agentId: string, status: AgentStatus) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      if (t.supervisor.id === agentId) {
        return { ...t, supervisor: { ...t.supervisor, status } };
      }
      return {
        ...t,
        members: t.members.map(m => m.id === agentId ? { ...m, status } : m)
      };
    }));
  };

  const updateAgentFindings = (teamId: string, agentId: string, findings: AgentFindings) => {
    setTeams(prev => prev.map(t => {
      if (t.id !== teamId) return t;
      if (t.supervisor.id === agentId) {
        return { ...t, supervisor: { ...t.supervisor, findings } };
      }
      return {
        ...t,
        members: t.members.map(m => m.id === agentId ? { ...m, findings } : m)
      };
    }));
  };

  const resetAllAgentStats = () => {
      setTeams(prev => prev.map(t => ({
          ...t,
          supervisor: { ...t.supervisor, status: AgentStatus.IDLE, findings: { warnings: 0, critical: 0 } },
          members: t.members.map(m => ({ ...m, status: AgentStatus.IDLE, findings: { warnings: 0, critical: 0 } }))
      })));
      setGlobalAgent(prev => ({ ...prev, status: AgentStatus.IDLE, findings: { warnings: 0, critical: 0 } }));
  };

  const handleNodeClick = useCallback((nodeId: string) => {
    const team = teams.find(t => t.resourceId === nodeId);
    if(team) addLog("system-nav", "System", `Inspecting ${team.name} (ID: ${team.id})`, "system");
  }, [teams]); // teams is stable for the duration of topology

  const handleAgentClick = useCallback((agentId: string) => {
    setFocusTarget({ agentId, ts: Date.now() });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-6 flex items-center justify-between shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
            <Activity className="text-cyan-400" size={20} />
            <h1 className="text-lg font-bold tracking-tight text-white">NexusOps <span className="text-slate-500 font-normal text-sm ml-2">Hierarchical Multi-Agent System</span></h1>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border ${isSimulating ? 'border-cyan-500/50 bg-cyan-950 text-cyan-400 animate-pulse' : 'border-slate-700 bg-slate-800 text-slate-500'}`}>
            <span className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
            {isSimulating ? 'SIMULATION ACTIVE' : 'SYSTEM IDLE'}
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Sidebar (Command Structure) - Resizable */}
        <aside 
          ref={sidebarRef}
          style={{ width: leftSidebarWidth }}
          className="border-r border-slate-800 bg-slate-900/30 flex flex-col shrink-0 transition-none will-change-[width]"
        >
           <div className="p-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm whitespace-nowrap overflow-hidden">
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Activity size={14} /> Active Agents
             </h2>
           </div>
           <div className="flex-1 overflow-hidden p-3 custom-scrollbar">
              <AgentHierarchy 
                globalAgent={globalAgent} 
                teams={teams} 
                activeTeamIds={activeTeamIds}
                onAgentClick={handleAgentClick}
              />
           </div>
        </aside>

        {/* Left Resizer Handle */}
        <div
          className={`w-1 cursor-col-resize hover:bg-cyan-500 transition-colors z-50 flex flex-col justify-center items-center group relative ${resizingSide === 'left' ? 'bg-cyan-500' : 'bg-slate-800'}`}
          onMouseDown={startResizingLeft}
        >
          {/* Invisible broader hit area for easier grabbing */}
          <div className="absolute w-4 h-full bg-transparent -left-1.5 cursor-col-resize"></div>
        </div>

        {/* Center: Main Analysis & Input (Largest Space) */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-950 relative shadow-[0_0_50px_rgba(0,0,0,0.5)] z-0">
            {/* Log Stream Header */}
            <div className="h-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center px-4 justify-between shrink-0 z-10">
                <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                  <Terminal size={14} className="text-cyan-500" /> 
                  Live Reasoning & Execution Log
                </span>
                <span className="text-[10px] text-slate-600 font-mono">SECURE CHANNEL // ENCRYPTED</span>
            </div>

            {/* Log Stream Body */}
            <div className="flex-1 overflow-hidden relative">
                <LogStream logs={logs} focusTarget={focusTarget} />
                {/* Gradient fade at bottom for style */}
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Input Controls Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 z-20">
                 <div className="flex gap-4 max-w-4xl mx-auto">
                     <div className="flex-1 relative">
                         <Zap className="absolute top-3 left-3 text-slate-500" size={16} />
                         <textarea 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none text-slate-200 placeholder-slate-600 h-12 transition-all focus:h-24 shadow-inner"
                            value={userQuery}
                            onChange={(e) => setUserQuery(e.target.value)}
                            disabled={isSimulating}
                            placeholder="Enter a complex mission for the Global Supervisor..."
                         />
                     </div>
                     <button 
                        onClick={runSimulation}
                        disabled={isSimulating}
                        className={`
                            h-12 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap shadow-lg
                            ${isSimulating 
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                                : 'bg-cyan-600 hover:bg-cyan-500 text-white hover:shadow-cyan-500/20 active:scale-95 border border-cyan-500'}
                        `}
                     >
                        {isSimulating ? <RotateCcw className="animate-spin" size={18} /> : <Send size={18} />}
                        <span>{isSimulating ? 'Processing...' : 'Execute Mission'}</span>
                     </button>
                 </div>
            </div>
        </section>

        {/* Right Resizer Handle */}
        <div
          className={`w-1 cursor-col-resize hover:bg-cyan-500 transition-colors z-50 flex flex-col justify-center items-center group relative ${resizingSide === 'right' ? 'bg-cyan-500' : 'bg-slate-800'}`}
          onMouseDown={startResizingRight}
        >
          {/* Invisible broader hit area for easier grabbing */}
          <div className="absolute w-4 h-full bg-transparent -left-1.5 cursor-col-resize"></div>
        </div>

        {/* Right: Sidebar (Topology) - Resizable */}
        <aside 
            style={{ width: rightSidebarWidth }}
            className="border-l border-slate-800 bg-slate-900/30 flex flex-col shrink-0 transition-none will-change-[width]"
        >
             <div className="p-3 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                 <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                    <Map size={14} /> Resource Map
                 </span>
             </div>
             <div className="flex-1 relative min-h-[200px] overflow-hidden">
                <TopologyGraph 
                    data={topology} 
                    activeNodeIds={activeNodeIds} 
                    onNodeClick={handleNodeClick}
                />
             </div>
             {/* Legend or Stats could go here */}
             <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 leading-relaxed">
                Nodes pulse when their assigned team is active. Click a node to inspect its linked team details in the system log.
             </div>
        </aside>

      </main>
    </div>
  );
};

export default App;