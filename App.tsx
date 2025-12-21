
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  INITIAL_TOPOLOGY, 
  generateTeamForNode, 
  GLOBAL_SUPERVISOR,
  INITIAL_TOPOLOGY_GROUPS,
  INITIAL_PROMPT_TEMPLATES,
  INITIAL_MODELS,
  INITIAL_TOOLS,
  INITIAL_REPORTS,
  INITIAL_SESSIONS,
  INITIAL_REPORT_TEMPLATES,
  INITIAL_DISCOVERY_SOURCES,
  RAW_SCAN_PAYLOADS
} from './services/mockData';
import { 
  Team, 
  Agent, 
  LogMessage, 
  AgentStatus,
  TopologyNode,
  TopologyGroup,
  DiagnosisSession,
  DiscoverySource,
  TopologyLink,
  AgentRole,
  Report,
  ReportTemplate
} from './types';
import { 
  analyzeInfrastructureDelta,
  generateGlobalPlan,
  generateTeamDelegation,
  streamWorkerTask,
  generateStructuredReport
} from './services/geminiService';
import TopologyGraph from './components/TopologyGraph';
import AgentHierarchy from './components/AgentHierarchy';
import LogStream from './components/LogStream';
import ResourceManagement from './components/ResourceManagement';
import TopologiesManagement from './components/TopologiesManagement';
import SubGraphCanvas from './components/SubGraphCanvas';
import Dashboard from './components/Dashboard';
import ResourceDetailView from './components/ResourceDetailView';
import AgentManagement from './components/AgentManagement';
import ReportManagement from './components/ReportManagement';
import ReportDetailView from './components/ReportDetailView';
import DiscoveryManagement from './components/DiscoveryManagement';
import DiscoveryInbox from './components/DiscoveryInbox';
import AuthPage from './components/AuthPage';
import { SettingsModal, AppSettings } from './components/SettingsModal';
import { Activity, Database, Network, FileText, LogOut, Settings, Play, Home, Radar, Users, Sparkles, X, FileSearch, Check, Wand2 } from 'lucide-react';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>({ language: 'en', theme: 'dark' });

  // 核心视图切换
  const [currentView, setCurrentView] = useState<'dashboard' | 'diagnosis' | 'resources' | 'resource-detail' | 'topologies' | 'topology-detail' | 'agents' | 'reports' | 'report-detail' | 'discovery'>('dashboard');
  const [discoverySubView, setDiscoverySubView] = useState<'connectors' | 'inbox'>('connectors');

  const [selectedTopologyId, setSelectedTopologyId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [diagnosisScope, setDiagnosisScope] = useState<TopologyGroup | null>(null);

  // 报告生成状态
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // 数据状态
  const [topology, setTopology] = useState(INITIAL_TOPOLOGY);
  const [teams, setTeams] = useState<Team[]>([]);
  const [topologyGroups, setTopologyGroups] = useState<TopologyGroup[]>(INITIAL_TOPOLOGY_GROUPS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [discoverySources, setDiscoverySources] = useState<DiscoverySource[]>(INITIAL_DISCOVERY_SOURCES);
  const [discoveredDelta, setDiscoveredDelta] = useState<{nodes: TopologyNode[], links: TopologyLink[]}>({ nodes: [], links: [] });

  const [globalAgent, setGlobalAgent] = useState<Agent>(GLOBAL_SUPERVISOR);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [userQuery, setUserQuery] = useState("Analyze system state and health status.");
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(280);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(340);

  useEffect(() => {
    setTeams(prevTeams => topology.nodes.map(node => {
        const existingTeam = prevTeams.find(t => t.resourceId === node.id);
        return existingTeam || generateTeamForNode(node.id, node.label, node.type);
    }));
  }, [topology]);

  const activeTeams = useMemo(() => {
      if (!diagnosisScope) return teams;
      return teams.filter(t => diagnosisScope.nodeIds.includes(t.resourceId));
  }, [teams, diagnosisScope]);

  const dashboardTopology = useMemo(() => {
    const base = diagnosisScope ? {
      nodes: topology.nodes.filter(n => diagnosisScope.nodeIds.includes(n.id)),
      links: topology.links.filter(l => {
        const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
        const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
        return diagnosisScope.nodeIds.includes(s) && diagnosisScope.nodeIds.includes(t);
      })
    } : topology;

    return {
        nodes: [...base.nodes, ...discoveredDelta.nodes.map(n => ({...n, isShadow: true}))],
        links: [...base.links, ...discoveredDelta.links.map(l => ({...l, type: 'inferred' as any}))]
    };
  }, [topology, diagnosisScope, discoveredDelta]);

  // --- 执行诊断逻辑：分级协作流 ---
  const handleExecuteDiagnosis = async () => {
    if (isSimulating || !userQuery.trim()) return;
    
    setIsSimulating(true);
    setLogs([{ id: `sys-${Date.now()}`, timestamp: Date.now(), fromAgentId: 'sys', fromAgentName: 'SYSTEM', content: `DIRECTIVE: "${userQuery}" [Scope: ${diagnosisScope?.name || 'GLOBAL'}]`, type: 'instruction' }]);
    
    await delay(1000);
    
    // 1. Global Supervisor 决策规划
    setGlobalAgent(p => ({...p, status: AgentStatus.THINKING}));
    setLogs(prev => [...prev, { id: `gs-1-${Date.now()}`, timestamp: Date.now(), fromAgentId: globalAgent.id, fromAgentName: globalAgent.name, content: `Parsing request against available ${activeTeams.length} functional teams...`, type: 'thought' }]);
    
    const plan = await generateGlobalPlan(userQuery, topology, activeTeams);
    setGlobalAgent(p => ({...p, status: AgentStatus.IDLE}));
    
    // 2. 逐级分发到各 Team Supervisor
    for (const step of plan) {
       const team = teams.find(t => t.id === step.teamId);
       if (!team) continue;
       
       setLogs(prev => [...prev, { id: `to-team-${team.id}`, timestamp: Date.now(), fromAgentId: globalAgent.id, fromAgentName: globalAgent.name, toAgentId: team.supervisor.id, content: step.instruction, type: 'instruction' }]);
       
       // 3. Team Supervisor 下发给 Worker
       await delay(500);
       const delegations = await generateTeamDelegation(team, step.instruction);
       for (const del of delegations) {
           const worker = team.members.find(m => m.id === del.agentId);
           if (!worker) continue;
           
           setLogs(prev => [...prev, { id: `to-worker-${worker.id}`, timestamp: Date.now(), fromAgentId: team.supervisor.id, fromAgentName: team.supervisor.name, toAgentId: worker.id, content: del.task, type: 'instruction' }]);
           
           // 4. Worker 任务执行
           const stream = streamWorkerTask(worker, del.task, step.instruction);
           let fullContent = "";
           const logId = `worker-run-${worker.id}-${Date.now()}`;
           setLogs(prev => [...prev, { id: logId, timestamp: Date.now(), fromAgentId: worker.id, fromAgentName: worker.name, content: "", type: 'thought', isStreaming: true }]);
           
           for await (const chunk of stream) {
               fullContent += chunk;
               setLogs(prev => prev.map(l => l.id === logId ? {...l, content: fullContent} : l));
           }
           setLogs(prev => prev.map(l => l.id === logId ? {...l, isStreaming: false} : l));
       }
       
       setLogs(prev => [...prev, { id: `rep-${team.id}`, timestamp: Date.now(), fromAgentId: team.supervisor.id, fromAgentName: team.supervisor.name, toAgentId: globalAgent.id, content: `Team objectives met for ${team.name}. Initial scan confirms operational stability.`, type: 'report' }]);
    }
    
    setLogs(prev => [...prev, { id: `sys-end-${Date.now()}`, timestamp: Date.now(), fromAgentId: 'sys', fromAgentName: 'SYSTEM', content: `Mission sequence complete. All reports aggregated.`, type: 'system' }]);
    setIsSimulating(false);
  };

  const handleCreateFinalReport = (newReport: Report) => {
      setReports(prev => [...prev, newReport]);
      setCurrentView('reports');
      setIsGeneratingReport(false);
  };

  const handleScan = async (sourceId: string) => {
    const source = discoverySources.find(s => s.id === sourceId);
    if (!source) return;
    
    setCurrentView('diagnosis');
    setIsSimulating(true);
    setLogs([{ id: 'sys-scan-1', timestamp: Date.now(), fromAgentId: 'sys', fromAgentName: 'SYSTEM', content: `Accessing ${source.name}...`, type: 'system' }]);
    
    await delay(1200);
    const rawPayload = source.type === 'K8s' ? RAW_SCAN_PAYLOADS.k8s : RAW_SCAN_PAYLOADS.trace;
    setLogs(prev => [...prev, { id: 'sys-scan-raw', timestamp: Date.now(), fromAgentId: 'sys', fromAgentName: 'SCANNER', content: `Raw Data Buffer Ingested:\n${rawPayload.substring(0, 150)}...`, type: 'discovery' }]);
    
    setGlobalAgent(prev => ({...prev, status: AgentStatus.THINKING}));
    const delta = await analyzeInfrastructureDelta(rawPayload);
    setGlobalAgent(prev => ({...prev, status: AgentStatus.IDLE}));
    
    setLogs(prev => [...prev, { id: 'sys-scan-2', timestamp: Date.now(), fromAgentId: 'global-sup', fromAgentName: 'Orchestrator', content: `Infrastructure analysis finished. AI detected ${delta.nodes.length} unknown resources. Reasoning: ${delta.reasoning}`, type: 'report' }]);
    
    setDiscoveredDelta(prev => ({ nodes: [...prev.nodes, ...delta.nodes], links: [...prev.links, ...delta.links] }));
    setDiscoverySources(prev => prev.map(s => s.id === sourceId ? {...s, lastScan: Date.now()} : s));
    setIsSimulating(false);
  };

  const handleApproveNode = (node: TopologyNode) => {
    setTopology(prev => ({ ...prev, nodes: [...prev.nodes, {...node, isShadow: false}] }));
    setDiscoveredDelta(prev => ({ ...prev, nodes: prev.nodes.filter(n => n.id !== node.id) }));
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard nodes={topology.nodes} teams={teams} recentSessions={INITIAL_SESSIONS} isSimulating={isSimulating} onNavigateToDiagnosis={() => setCurrentView('diagnosis')} onLoadSession={(s) => { setCurrentView('diagnosis'); setUserQuery(s.query); }} />;
      case 'topologies':
        return <TopologiesManagement topologyGroups={topologyGroups} activeScopeId={diagnosisScope?.id} isSimulating={isSimulating} onAdd={(tg) => setTopologyGroups(p => [...p, tg])} onUpdate={(u) => setTopologyGroups(p => p.map(g => g.id === u.id ? u : g))} onDelete={(id) => setTopologyGroups(p => p.filter(g => g.id !== id))} onEnter={(id) => { setSelectedTopologyId(id); setCurrentView('topology-detail'); }} onNavigateToDiagnosis={() => setCurrentView('diagnosis')} />;
      case 'topology-detail':
        const activeTg = topologyGroups.find(tg => tg.id === selectedTopologyId);
        return activeTg ? <SubGraphCanvas topologyGroup={activeTg} globalTopology={topology} activeScopeId={diagnosisScope?.id} isSimulating={isSimulating} onBack={() => setCurrentView('topologies')} onDiagnose={() => { setDiagnosisScope(activeTg); setCurrentView('diagnosis'); }} onNavigateToDiagnosis={() => setCurrentView('diagnosis')} onAddNode={(nid) => setTopologyGroups(p => p.map(g => g.id === selectedTopologyId ? {...g, nodeIds: [...g.nodeIds, nid]} : g))} onRemoveNode={(nid) => setTopologyGroups(p => p.map(g => g.id === selectedTopologyId ? {...g, nodeIds: g.nodeIds.filter(i => i !== nid)} : g))} onViewResource={(n) => { setSelectedResourceId(n.id); setCurrentView('resource-detail'); }} /> : null;
      case 'resources':
        return <ResourceManagement nodes={topology.nodes} onAdd={(n) => setTopology(prev => ({...prev, nodes: [...prev.nodes, n]}))} onUpdate={(n) => setTopology(prev => ({...prev, nodes: prev.nodes.map(x => x.id === n.id ? n : x)}))} onDelete={(id) => setTopology(prev => ({...prev, nodes: prev.nodes.filter(x => x.id !== id)}))} onViewDetail={(n) => { setSelectedResourceId(n.id); setCurrentView('resource-detail'); }} />;
      case 'resource-detail':
        const rNode = topology.nodes.find(n => n.id === selectedResourceId);
        return rNode ? <ResourceDetailView node={rNode} team={teams.find(t => t.resourceId === rNode.id)} associatedTopologyGroups={topologyGroups.filter(tg => tg.nodeIds.includes(rNode.id))} onBack={() => setCurrentView('resources')} onNavigateToTopology={(id) => { setSelectedTopologyId(id); setCurrentView('topology-detail'); }} onUpdateNode={(n) => setTopology(prev => ({...prev, nodes: prev.nodes.map(x => x.id === n.id ? n : x)}))} onUpdateAgentConfig={() => {}} onAddWorker={() => {}} onRemoveWorker={() => {}} /> : null;
      case 'agents':
        return <AgentManagement teams={teams} onUpdateAgentConfig={() => {}} onDeleteAgent={() => {}} onManagePrompts={() => {}} onManageModels={() => {}} onManageTools={() => {}} />;
      case 'reports':
        return <ReportManagement reports={reports} onViewReport={(r) => { setSelectedReportId(r.id); setCurrentView('report-detail'); }} onManageTemplates={() => {}} />;
      case 'report-detail':
        const rRep = reports.find(r => r.id === selectedReportId);
        return rRep ? <ReportDetailView report={rRep} onBack={() => setCurrentView('reports')} /> : null;
      case 'discovery':
        return (
          <div className="flex flex-col h-full bg-slate-950">
             <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 gap-6">
                <button onClick={() => setDiscoverySubView('connectors')} className={`py-3 text-sm font-bold border-b-2 transition-all ${discoverySubView === 'connectors' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Connectors</button>
                <button onClick={() => setDiscoverySubView('inbox')} className={`py-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${discoverySubView === 'inbox' ? 'text-cyan-400 border-cyan-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
                    Inbox {discoveredDelta.nodes.length > 0 && <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>}
                </button>
             </div>
             <div className="flex-1 overflow-hidden">
                {discoverySubView === 'connectors' ? <DiscoveryManagement sources={discoverySources} onAdd={(s) => setDiscoverySources(p => [...p, s])} onDelete={(id) => setDiscoverySources(p => p.filter(x => x.id !== id))} onScan={handleScan} /> : <DiscoveryInbox discoveredNodes={discoveredDelta.nodes} discoveredLinks={discoveredDelta.links} onApproveNode={handleApproveNode} onRejectNode={(id) => setDiscoveredDelta(p => ({...p, nodes: p.nodes.filter(n => n.id !== id)}))} onClear={() => setDiscoveredDelta({nodes: [], links: []})} />}
             </div>
          </div>
        );
      case 'diagnosis':
      default:
        return (
          <div className="flex-1 flex h-full overflow-hidden">
              <aside style={{ width: leftSidebarWidth }} className="border-r border-slate-800 bg-slate-900/20 p-2 overflow-y-auto custom-scrollbar text-xs">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 py-2 flex justify-between items-center">
                      <span>Hierarchy Stack</span>
                      {diagnosisScope && <button onClick={() => setDiagnosisScope(null)} className="text-cyan-400 hover:text-white transition-colors">Global View</button>}
                  </div>
                  <AgentHierarchy globalAgent={globalAgent} teams={activeTeams} activeTeamIds={new Set()} onAgentClick={() => {}} />
              </aside>
              <section className="flex-1 flex flex-col bg-slate-950 min-w-0">
                  <div className="h-10 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 bg-slate-900/40">
                      <div className="flex items-center gap-2">
                        <Activity size={12} className="text-cyan-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time collaboration stream</span>
                      </div>
                      {diagnosisScope && <div className="text-[9px] px-2 py-0.5 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 font-bold uppercase">Focus: {diagnosisScope.name}</div>}
                  </div>
                  <div className="flex-1 overflow-hidden"><LogStream logs={logs} focusTarget={null} /></div>
                  <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-3 bg-slate-950 border border-slate-700 rounded-xl px-4">
                          <Sparkles size={16} className="text-cyan-500" />
                          <input className="flex-1 h-12 bg-transparent text-sm text-slate-200 focus:outline-none" value={userQuery} onChange={e => setUserQuery(e.target.value)} placeholder="Submit directive for hierarchical execution..." />
                      </div>
                      
                      <div className="flex gap-2">
                          {logs.length > 0 && !isSimulating && diagnosisScope && (
                             <button 
                                onClick={() => setIsGeneratingReport(true)}
                                className="h-12 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95"
                             >
                                <FileSearch size={14} /> GENERATE REPORT
                             </button>
                          )}
                          <button onClick={handleExecuteDiagnosis} disabled={isSimulating} className="h-12 px-8 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg active:scale-95">
                            <Play size={14} fill="currentColor" /> EXECUTE
                          </button>
                      </div>
                  </div>
              </section>
              <aside style={{ width: rightSidebarWidth }} className="border-l border-slate-800 bg-slate-900/20 relative">
                  <div className="absolute top-0 left-0 w-full h-10 border-b border-slate-800 bg-slate-900/40 z-10 flex items-center px-4 font-bold text-[10px] text-slate-400 uppercase tracking-widest">Topology Monitor</div>
                  <TopologyGraph data={dashboardTopology} activeNodeIds={new Set()} onNodeClick={() => {}} />
              </aside>
          </div>
        );
    }
  };

  if (!isAuthenticated) {
      return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans">
      <header className="h-14 border-b border-slate-800 bg-slate-900 px-4 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                <Activity className="text-cyan-400" size={20} />
                <span className="font-bold text-white tracking-tight uppercase tracking-widest">EntropyOps</span>
            </div>
            <nav className="flex items-center gap-1">
                {[
                    { id: 'dashboard', label: 'Dashboard', icon: Home },
                    { id: 'topologies', label: 'Topologies', icon: Network },
                    { id: 'resources', label: 'Resources', icon: Database },
                    { id: 'agents', label: 'Agents', icon: Users },
                    { id: 'reports', label: 'Reports', icon: FileText },
                    { id: 'discovery', label: 'Discovery', icon: Radar },
                ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setCurrentView(item.id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${currentView === item.id || (item.id === 'topologies' && currentView === 'topology-detail') || (item.id === 'reports' && currentView === 'report-detail') ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        <item.icon size={14} /> {item.label}
                    </button>
                ))}
            </nav>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings size={18} /></button>
            <button onClick={() => setIsAuthenticated(false)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><LogOut size={18} /></button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden relative">{renderMainContent()}</main>
      {isSettingsOpen && <SettingsModal settings={appSettings} onClose={() => setIsSettingsOpen(false)} onSave={(s) => { setAppSettings(s); setIsSettingsOpen(false); }} />}
      {isGeneratingReport && diagnosisScope && (
          <ReportGenerationModal 
            topology={diagnosisScope} 
            logs={logs} 
            query={userQuery}
            onClose={() => setIsGeneratingReport(false)} 
            onSave={handleCreateFinalReport} 
          />
      )}
    </div>
  );
};

// --- Report Generation Modal Helper ---

const ReportGenerationModal: React.FC<{ 
    topology: TopologyGroup, 
    logs: LogMessage[], 
    query: string,
    onClose: () => void, 
    onSave: (report: Report) => void 
}> = ({ topology, logs, query, onClose, onSave }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(topology.templateIds?.[0] || null);
    const [isThinking, setIsThinking] = useState(false);
    const [previewContent, setPreviewContent] = useState<string | null>(null);

    const boundTemplates = useMemo(() => {
        return INITIAL_REPORT_TEMPLATES.filter(tpl => topology.templateIds?.includes(tpl.id));
    }, [topology.templateIds]);

    const handleGeneratePreview = async () => {
        const tpl = INITIAL_REPORT_TEMPLATES.find(x => x.id === selectedTemplateId);
        if (!tpl) return;
        
        setIsThinking(true);
        const content = await generateStructuredReport(tpl, logs, topology, query);
        setPreviewContent(content);
        setIsThinking(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-5 bg-slate-950/80 border-b border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-950/40 rounded-xl text-indigo-400 border border-indigo-500/20 shadow-lg">
                            <Wand2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">AI Report Synthesis</h3>
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Context: {topology.name}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Template Selector */}
                    <div className="w-72 border-r border-slate-800 bg-slate-950/30 p-5 flex flex-col overflow-y-auto">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 block">Select bound template</label>
                        <div className="space-y-2">
                            {boundTemplates.length > 0 ? boundTemplates.map(tpl => (
                                <button 
                                    key={tpl.id}
                                    onClick={() => setSelectedTemplateId(tpl.id)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTemplateId === tpl.id ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                                >
                                    <div className={`text-xs font-bold ${selectedTemplateId === tpl.id ? 'text-white' : 'text-slate-300'}`}>{tpl.name}</div>
                                    <div className={`text-[9px] mt-1 line-clamp-2 ${selectedTemplateId === tpl.id ? 'text-indigo-100' : 'text-slate-500'}`}>{tpl.description}</div>
                                </button>
                            )) : (
                                <div className="p-4 bg-red-950/20 border border-red-900/30 rounded text-[10px] text-red-400 italic font-bold">
                                    No templates bound to this topology. Go to Management to link schemas.
                                </div>
                            )}
                        </div>

                        {selectedTemplateId && !previewContent && !isThinking && (
                            <button 
                                onClick={handleGeneratePreview}
                                className="mt-8 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={14} /> Synthesize Logic
                            </button>
                        )}
                    </div>

                    {/* Right: Preview Area */}
                    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
                        {isThinking ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Engaging neural core for synthesis...</p>
                            </div>
                        ) : previewContent ? (
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar prose prose-invert prose-sm max-w-none">
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 pb-2 border-b border-slate-800">Draft Document Generated</div>
                                <div className="font-sans leading-relaxed text-slate-300 whitespace-pre-wrap">{previewContent}</div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-800">
                                <FileSearch size={64} className="mb-4 opacity-10" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Ready for Synthesis</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-bold">Cancel</button>
                    <button 
                        disabled={!previewContent}
                        onClick={() => {
                            const tpl = INITIAL_REPORT_TEMPLATES.find(x => x.id === selectedTemplateId);
                            onSave({
                                id: `rep-${Date.now()}`,
                                title: `${topology.name} - Post Diagnosis Audit`,
                                type: tpl?.category === 'Security' ? 'Security' : 'Diagnosis',
                                status: 'Final',
                                createdAt: Date.now(),
                                author: 'AI Orchestrator',
                                summary: `Automated synthesis report based on inquiry: "${query}"`,
                                content: previewContent || '',
                                tags: ['Automated', 'Diagnosis', topology.name],
                                topologyId: topology.id
                            });
                        }}
                        className="px-8 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-30 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <Check size={16} /> Finalize & Store Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
