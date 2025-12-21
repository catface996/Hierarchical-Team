
import React, { useState, useMemo } from 'react';
import { Team, Agent, AgentRole, AgentStatus, AgentConfig, AgentExecutionRecord, TraceStep } from '../types';
import { AgentConfigModal } from './AgentConfigModal';
import { generateMockHistory } from '../services/mockData';
import { 
  Search, 
  Users, 
  Bot, 
  Cpu, 
  Server, 
  Activity, 
  LayoutList, 
  LayoutGrid, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Wrench,
  Shield,
  Zap,
  Brain,
  Target,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Trash2,
  Eye,
  X,
  History,
  Clock,
  ExternalLink,
  ChevronDown,
  Terminal,
  MessageSquare,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface AgentManagementProps {
  teams: Team[];
  onUpdateAgentConfig: (teamId: string, agentId: string, config: AgentConfig) => void;
  onDeleteAgent: (teamId: string, agentId: string) => void;
  onManagePrompts: () => void;
  onManageModels: () => void;
  onManageTools: () => void;
}

// 默认分页 8，确保网格布局美观
const ITEMS_PER_PAGE = 8;

interface FlatAgent extends Agent {
    teamId: string;
    teamName: string;
    resourceId: string;
}

const AgentManagement: React.FC<AgentManagementProps> = ({ 
    teams, 
    onUpdateAgentConfig,
    onDeleteAgent,
    onManagePrompts,
    onManageModels,
    onManageTools
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card'); 
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'SUPERVISOR' | 'WORKER'>('ALL');
  const [configAgent, setConfigAgent] = useState<FlatAgent | null>(null);
  const [viewingAgent, setViewingAgent] = useState<FlatAgent | null>(null);
  const [agentToDelete, setAgentToDelete] = useState<FlatAgent | null>(null);
  const [auditAgent, setAuditAgent] = useState<FlatAgent | null>(null);

  const allAgents: FlatAgent[] = useMemo(() => {
    return teams.flatMap(team => [
        { ...team.supervisor, teamId: team.id, teamName: team.name, resourceId: team.resourceId },
        ...team.members.map(member => ({ ...member, teamId: team.id, teamName: team.name, resourceId: team.resourceId }))
    ]);
  }, [teams]);

  const filteredAgents = useMemo(() => {
      return allAgents.filter(agent => {
          const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (agent.specialty || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                              agent.teamName.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesRole = roleFilter === 'ALL' ? true : 
                            roleFilter === 'SUPERVISOR' ? agent.role === AgentRole.TEAM_SUPERVISOR : 
                            agent.role === AgentRole.WORKER;
          return matchesSearch && matchesRole;
      });
  }, [allAgents, searchTerm, roleFilter]);

  const totalPages = Math.ceil(filteredAgents.length / ITEMS_PER_PAGE);
  const paginatedAgents = filteredAgents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getStatusColor = (status: AgentStatus) => {
    switch (status) {
      case AgentStatus.THINKING: return "text-cyan-400 bg-cyan-950/40 border-cyan-500/30";
      case AgentStatus.WORKING: return "text-green-400 bg-green-950/40 border-green-500/30";
      case AgentStatus.ERROR: return "text-red-400 bg-red-950/40 border-red-500/30";
      case AgentStatus.WAITING: return "text-yellow-400 bg-yellow-950/40 border-yellow-500/30";
      default: return "text-slate-400 bg-slate-900 border-slate-800";
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                    <Users className="text-cyan-400" /> Agents Registry
                </h2>
                <p className="text-slate-400 text-xs mt-1 font-medium">Monitoring and managing {allAgents.length} autonomous operation units across the cluster.</p>
            </div>
            <div className="flex gap-2">
                 <button onClick={onManagePrompts} className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-bold text-slate-300 hover:text-white transition-colors">
                     <FileText size={14} /> Prompts
                 </button>
                 <button onClick={onManageModels} className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-bold text-slate-300 hover:text-white transition-colors">
                     <Cpu size={14} /> Models
                 </button>
                 <button onClick={onManageTools} className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-xs font-bold text-slate-300 hover:text-white transition-colors">
                     <Wrench size={14} /> Tools
                 </button>
            </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 shrink-0">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search system units..." 
                        value={searchTerm} 
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
                        className="w-full bg-slate-950 border border-slate-700/60 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 text-slate-200 transition-all" 
                    />
                </div>
                <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
                    {[{key: 'ALL', label: 'All'}, {key: 'SUPERVISOR', label: 'Supervisor'}, {key: 'WORKER', label: 'Worker'}].map(({key, label}) => (
                        <button
                            key={key}
                            onClick={() => { setRoleFilter(key as any); setCurrentPage(1); }}
                            className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${roleFilter === key ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                        <LayoutList size={16} />
                    </button>
                    <button onClick={() => setViewMode('card')} className={`p-1.5 rounded transition-all ${viewMode === 'card' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
                        <LayoutGrid size={16} />
                    </button>
                </div>
            </div>
        </div>

        {/* Agents Grid - Redesigned Cards */}
        <div className="flex-1 overflow-auto custom-scrollbar">
            {paginatedAgents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                    {paginatedAgents.map(agent => (
                        <div key={agent.id} className="relative bg-slate-900 border border-slate-800/80 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all group flex flex-col min-h-[220px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-950/10">
                            {/* Decorative Top Line */}
                            <div className={`h-1 w-full ${agent.role === AgentRole.TEAM_SUPERVISOR ? 'bg-indigo-600' : 'bg-cyan-600'} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                            
                            <div className="p-5 flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-lg ${agent.role === AgentRole.TEAM_SUPERVISOR ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-500/20' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                                        {agent.role === AgentRole.TEAM_SUPERVISOR ? <Shield size={20} /> : <Zap size={20} />}
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider ${getStatusColor(agent.status)}`}>
                                        {agent.status}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-base font-bold text-white mb-0.5 truncate group-hover:text-cyan-400 transition-colors leading-tight">{agent.name}</h3>
                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] opacity-80">
                                        {agent.role === AgentRole.TEAM_SUPERVISOR ? 'Strategic Coordinator' : 'Tactical Unit'}
                                    </div>
                                </div>

                                <div className="space-y-2.5 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                                            <Target size={12} className="text-slate-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] text-slate-500 leading-none mb-1">Expertise</div>
                                            <div className="text-xs text-slate-200 font-bold truncate">{agent.specialty || 'Generalist'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0">
                                            <Layers size={12} className="text-slate-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] text-slate-500 leading-none mb-1">Deployment</div>
                                            <div className="text-xs text-slate-300 truncate font-medium">{agent.teamName}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-800/40 flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setViewingAgent(agent)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-cyan-400 transition-all" title="View Intelligence Profile"><Eye size={15} /></button>
                                        <button onClick={() => setConfigAgent(agent)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-cyan-400 transition-all" title="Modify Protocol"><Settings size={15} /></button>
                                        {agent.role === AgentRole.WORKER && (
                                            <button onClick={() => setAgentToDelete(agent)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-red-400 transition-all" title="Decommission"><Trash2 size={15} /></button>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setAuditAgent(agent)}
                                        className="px-2.5 py-1 rounded bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold transition-all flex items-center gap-1.5"
                                    >
                                        Trace log <ArrowUpRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                    <Users size={48} className="opacity-10 mb-4" />
                    <p className="text-sm font-bold tracking-wide">No neural units match the current filter.</p>
                </div>
            )}
        </div>

        {/* Audit/Config Modals... (逻辑部分保持一致) */}
        {auditAgent && <AgentAuditModal agent={auditAgent} onClose={() => setAuditAgent(null)} />}
        {configAgent && <AgentConfigModal agent={configAgent} onClose={() => setConfigAgent(null)} onSave={(newConfig) => { onUpdateAgentConfig(configAgent.teamId, configAgent.id, newConfig); setConfigAgent(null); }} />}
        
        {viewingAgent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-t-cyan-600">
                    <div className="p-5 bg-slate-950/50 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest"><Sparkles size={16} className="text-cyan-400" /> Unit intelligence profile</h3>
                        <button onClick={() => setViewingAgent(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                    </div>
                    <div className="p-6 space-y-5">
                        <div className="flex items-center gap-5 p-5 bg-slate-950/80 rounded-xl border border-slate-800 shadow-inner">
                             <div className="p-4 bg-indigo-950/40 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-950/50"><Bot size={36} /></div>
                             <div className="min-w-0">
                                 <div className="text-xl font-black text-white truncate">{viewingAgent.name}</div>
                                 <div className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase mt-1">{viewingAgent.role}</div>
                             </div>
                        </div>
                        <div className="p-5 bg-slate-950/40 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3 flex items-center gap-2"><Terminal size={12} /> Autonomous directive</div>
                            <p className="text-xs text-slate-300 leading-relaxed italic font-medium bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                                "{viewingAgent.config?.systemInstruction || 'Standard autonomous protocol. Operates within defined mission constraints with minimal supervision.'}"
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                                <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Model</div>
                                <div className="text-xs text-white font-mono">{viewingAgent.config?.model || 'Gemini 2.5'}</div>
                            </div>
                            <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800">
                                <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Temperature</div>
                                <div className="text-xs text-white font-mono">{viewingAgent.config?.temperature || '0.3'}</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex justify-end">
                        <button onClick={() => setViewingAgent(null)} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black tracking-widest rounded-lg transition-colors">Close portal</button>
                    </div>
                </div>
            </div>
        )}

        {agentToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-200">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                    <div className="flex justify-center mb-4 text-red-500">
                        <div className="p-4 bg-red-950/20 rounded-full border border-red-900/30">
                            <AlertTriangle size={32} />
                        </div>
                    </div>
                    <h3 className="font-bold text-xl text-white mb-2 tracking-tight">Decommission Unit?</h3>
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed">This action will permanently purge <span className="text-white font-black underline decoration-red-500/50">{agentToDelete.name}</span> from the neural network fabric.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setAgentToDelete(null)} className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 text-xs font-bold transition-colors">Abort purge</button>
                        <button onClick={() => { onDeleteAgent(agentToDelete.teamId, agentToDelete.id); setAgentToDelete(null); }} className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black tracking-widest shadow-lg shadow-red-900/20">Confirm purge</button>
                    </div>
                </div>
            </div>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-900/50 shrink-0">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                disabled={currentPage === 1} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs"
            >
                <ChevronLeft size={14} /> Prev
            </button>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-widest">Registry segment</span>
                <span className="text-xs text-white bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">{currentPage}</span>
                <span className="text-[10px] text-slate-500 font-bold">/</span>
                <span className="text-xs text-slate-400 font-mono font-bold">{Math.max(1, totalPages)}</span>
            </div>
            <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                disabled={currentPage === totalPages || totalPages === 0} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs"
            >
                Next <ChevronRight size={14} />
            </button>
        </div>
    </div>
  );
};

// ... AgentAuditModal ...
const AgentAuditModal: React.FC<{ agent: FlatAgent, onClose: () => void }> = ({ agent, onClose }) => {
    const [selectedRecord, setSelectedRecord] = useState<AgentExecutionRecord | null>(null);
    const history = useMemo(() => generateMockHistory(agent.id), [agent.id]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 lg:p-8 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-5">
                        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl text-indigo-400 shadow-lg shadow-indigo-950/50">
                            <History size={26} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                <span className="text-indigo-400 opacity-70">AGENT TRACE:</span> {agent.name}
                            </h3>
                            <div className="text-[10px] text-slate-500 flex items-center gap-3 mt-1 font-bold uppercase tracking-[0.2em]">
                                <span>SEGMENT ID: {agent.id}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                <span>SECTOR: {agent.teamName}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-all bg-slate-950/50 border border-slate-800"><X size={24} /></button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className={`w-full md:w-[320px] border-r border-slate-800 bg-slate-950/30 flex flex-col shrink-0 transition-all ${selectedRecord ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-slate-800 bg-slate-950/50 text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                            Transmission Log
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                            {history.map(record => (
                                <button 
                                    key={record.id}
                                    onClick={() => setSelectedRecord(record)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all group relative overflow-hidden ${selectedRecord?.id === record.id ? 'bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-900/20' : 'bg-slate-950/50 border-slate-800/60 hover:border-indigo-500/40 hover:bg-slate-900/50'}`}
                                >
                                    <div className="flex justify-between items-start mb-2 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'Success' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : record.status === 'Warning' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}></div>
                                            <span className={`text-[10px] font-black uppercase tracking-wider ${selectedRecord?.id === record.id ? 'text-white' : 'text-slate-500'}`}>{record.status}</span>
                                        </div>
                                        <span className={`text-[9px] font-mono font-bold ${selectedRecord?.id === record.id ? 'text-indigo-200' : 'text-slate-600'}`}>{new Date(record.startTime).toLocaleDateString()}</span>
                                    </div>
                                    <div className={`text-xs font-bold mb-1 truncate relative z-10 ${selectedRecord?.id === record.id ? 'text-white' : 'text-slate-200'}`}>Target: {record.resourceLabel}</div>
                                    <div className={`text-[10px] line-clamp-1 italic font-medium relative z-10 ${selectedRecord?.id === record.id ? 'text-indigo-100' : 'text-slate-500'}`}>"{record.summary}"</div>
                                    <div className="mt-3 flex items-center justify-between relative z-10">
                                        <div className={`flex items-center gap-1.5 text-[9px] font-bold ${selectedRecord?.id === record.id ? 'text-indigo-100' : 'text-slate-600'}`}>
                                            <Clock size={10} /> {(record.duration / 1000).toFixed(1)}s
                                        </div>
                                        <ArrowRight size={14} className={selectedRecord?.id === record.id ? 'text-white translate-x-0 opacity-100' : 'text-slate-700 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0'} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
                        {selectedRecord ? (
                            <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
                                <div className="p-7 border-b border-slate-800 bg-slate-900/40 shrink-0">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div>
                                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Protocol Result Summary</div>
                                            <h4 className="text-2xl font-black text-white leading-tight">{selectedRecord.summary}</h4>
                                        </div>
                                        <div className="flex gap-4 shrink-0">
                                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                                <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Time to complete</div>
                                                <div className="text-sm text-white font-mono font-bold tracking-tighter">{(selectedRecord.duration / 1000).toFixed(2)} SEC</div>
                                            </div>
                                            {selectedRecord && (
                                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                                    <div className="text-[9px] text-slate-500 font-bold uppercase mb-1">Status</div>
                                                    <div className={`text-sm font-black uppercase tracking-wider ${selectedRecord.status === 'Success' ? 'text-green-400' : 'text-yellow-400'}`}>{selectedRecord.status}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8 bg-[radial-gradient(circle_at_top_right,#0f172a,transparent)]">
                                    {selectedRecord.steps.map((step, idx) => (
                                        <div key={step.id} className="flex gap-6 group">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className={`p-3 rounded-xl border-2 shadow-lg transition-all ${
                                                    step.type === 'thought' ? 'bg-purple-950/20 border-purple-500/20 text-purple-400 shadow-purple-950/20' :
                                                    step.type === 'action' ? 'bg-cyan-950/20 border-cyan-500/20 text-cyan-400 shadow-cyan-950/20' :
                                                    'bg-blue-950/20 border-blue-500/20 text-blue-400 shadow-blue-950/20'
                                                }`}>
                                                    {step.type === 'thought' ? <Brain size={18} /> : step.type === 'action' ? <Terminal size={18} /> : <Eye size={18} />}
                                                </div>
                                                {idx < selectedRecord.steps.length - 1 && <div className="w-0.5 flex-1 bg-slate-800 my-3"></div>}
                                            </div>
                                            <div className="flex-1 pb-10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                                                        step.type === 'thought' ? 'text-purple-400' : step.type === 'action' ? 'text-cyan-400' : 'text-blue-400'
                                                    }`}>{step.type}</span>
                                                    <span className="text-[10px] text-slate-600 font-mono font-bold tracking-tight">{new Date(step.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed font-sans shadow-inner backdrop-blur-sm group-hover:bg-slate-900 transition-colors">
                                                    {step.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-800">
                                <History size={80} className="mb-6 opacity-10" />
                                <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Awaiting Log Selection</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentManagement;
