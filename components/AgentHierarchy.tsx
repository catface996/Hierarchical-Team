import React from 'react';
import { Agent, AgentRole, AgentStatus, Team } from '../types';
import { Network, Server, Database, Users, Cpu, Activity, ShieldCheck, PlayCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface AgentHierarchyProps {
  globalAgent: Agent;
  teams: Team[];
  activeTeamIds: Set<string>;
  onAgentClick: (agentId: string) => void;
}

const getStatusLabel = (status: AgentStatus) => {
  switch (status) {
    case AgentStatus.IDLE: return "Pending";
    case AgentStatus.THINKING: return "Thinking";
    case AgentStatus.WORKING: return "In Progress";
    case AgentStatus.COMPLETED: return "Finished";
    case AgentStatus.WAITING: return "Waiting";
    case AgentStatus.ERROR: return "Error";
    default: return "";
  }
};

const getStatusColor = (status: AgentStatus) => {
  switch (status) {
    case AgentStatus.IDLE: return "text-slate-500";
    case AgentStatus.THINKING: return "text-cyan-400";
    case AgentStatus.WORKING: return "text-green-400";
    case AgentStatus.COMPLETED: return "text-slate-300";
    case AgentStatus.WAITING: return "text-yellow-500";
    case AgentStatus.ERROR: return "text-red-500";
    default: return "text-slate-500";
  }
};

const AgentCard: React.FC<{ 
  agent: Agent, 
  isTeamSup?: boolean, 
  isActive?: boolean,
  onClick: (id: string) => void 
}> = ({ agent, isTeamSup, isActive, onClick }) => {
  return (
    <div 
      onClick={() => onClick(agent.id)}
      className={`
      flex flex-col p-2 rounded mb-1 border transition-all duration-200 cursor-pointer
      hover:bg-slate-800 hover:border-slate-600 hover:shadow-md
      ${isActive ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]' : 'border-slate-800 bg-slate-800/50'}
      ${isTeamSup ? 'ml-0' : 'ml-6'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {agent.role === AgentRole.TEAM_SUPERVISOR ? <Server size={14} className="text-purple-400" /> : <Activity size={14} className="text-slate-400" />}
          <div>
            <div className="text-xs font-medium text-slate-200 hover:text-cyan-300 transition-colors">{agent.name}</div>
          </div>
        </div>
      </div>
      
      {/* Status Row */}
      <div className="flex items-center gap-2 mt-2 ml-6">
         <span className={`text-[10px] font-mono uppercase tracking-wider ${getStatusColor(agent.status)}`}>
           {getStatusLabel(agent.status)}
         </span>
         
         {/* Findings Badges */}
         {agent.findings.warnings > 0 && (
           <span className="flex items-center gap-0.5 px-1 rounded bg-yellow-500/10 border border-yellow-500/20 text-[9px] text-yellow-500">
             <AlertTriangle size={8} /> {agent.findings.warnings}
           </span>
         )}
         {agent.findings.critical > 0 && (
           <span className="flex items-center gap-0.5 px-1 rounded bg-red-500/10 border border-red-500/20 text-[9px] text-red-500">
             <AlertOctagon size={8} /> {agent.findings.critical}
           </span>
         )}
      </div>
    </div>
  );
};

const AgentHierarchy: React.FC<AgentHierarchyProps> = ({ globalAgent, teams, activeTeamIds, onAgentClick }) => {
  return (
    <div className="h-full overflow-y-auto pr-2">
      {/* Global Supervisor */}
      <div className="mb-4">
        <div 
            onClick={() => onAgentClick(globalAgent.id)}
            className="flex items-center gap-2 mb-2 p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-lg cursor-pointer hover:bg-indigo-900/40 hover:border-indigo-500/50 transition-all"
        >
          <Network size={18} className="text-indigo-400" />
          <div className="flex-1">
             <div className="text-sm font-bold text-indigo-100">{globalAgent.name}</div>
             <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-mono uppercase ${getStatusColor(globalAgent.status)}`}>
                    {getStatusLabel(globalAgent.status)}
                </span>
             </div>
          </div>
        </div>
        
        {/* Teams */}
        <div className="pl-4 border-l border-slate-700 ml-4 space-y-4">
          {teams.map(team => (
            <div key={team.id} className="relative">
              {/* Connector line */}
              <div className="absolute -left-4 top-4 w-4 h-px bg-slate-700"></div>
              
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{team.name}</span>
              </div>
              
              {/* Team Supervisor */}
              <AgentCard 
                agent={team.supervisor} 
                isTeamSup={true} 
                isActive={activeTeamIds.has(team.id)} 
                onClick={onAgentClick}
              />
              
              {/* Workers */}
              <div className="pl-4 border-l border-slate-800 ml-3 mt-1 space-y-1">
                {team.members.map(member => (
                   <div key={member.id} className="relative">
                      <div className="absolute -left-4 top-1/2 w-4 h-px bg-slate-800"></div>
                      <AgentCard 
                        agent={member} 
                        isActive={activeTeamIds.has(team.id) && member.status !== AgentStatus.IDLE} 
                        onClick={onAgentClick}
                      />
                   </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AgentHierarchy;