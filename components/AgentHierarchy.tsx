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
      flex items-center gap-1.5 px-1.5 py-1 rounded border transition-all duration-200 cursor-pointer
      hover:bg-slate-800 hover:border-slate-600 hover:shadow-md
      ${isActive ? 'border-cyan-500/50 bg-cyan-950/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]' : 'border-slate-800 bg-slate-800/50'}
      ${isTeamSup ? 'ml-0' : 'ml-4'}
    `}>
      {agent.role === AgentRole.TEAM_SUPERVISOR ? <Server size={12} className="text-purple-400 shrink-0" /> : <Activity size={12} className="text-slate-400 shrink-0" />}
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-medium text-slate-200 truncate">{agent.name}</div>
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-mono uppercase ${getStatusColor(agent.status)}`}>
            {getStatusLabel(agent.status)}
          </span>
          {agent.findings.warnings > 0 && (
            <span className="flex items-center gap-0.5 px-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-[8px] text-yellow-500">
              <AlertTriangle size={7} />{agent.findings.warnings}
            </span>
          )}
          {agent.findings.critical > 0 && (
            <span className="flex items-center gap-0.5 px-0.5 rounded bg-red-500/10 border border-red-500/20 text-[8px] text-red-500">
              <AlertOctagon size={7} />{agent.findings.critical}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const AgentHierarchy: React.FC<AgentHierarchyProps> = ({ globalAgent, teams, activeTeamIds, onAgentClick }) => {
  return (
    <div className="h-full overflow-y-auto pr-1 pl-1">
      {/* Global Supervisor */}
      <div
          onClick={() => onAgentClick(globalAgent.id)}
          className="flex items-center gap-1.5 p-2 bg-indigo-950/30 border border-indigo-500/30 rounded cursor-pointer hover:bg-indigo-900/40 hover:border-indigo-500/50 transition-all mb-1"
      >
        <Network size={14} className="text-indigo-400 shrink-0" />
        <div className="flex-1 min-w-0">
           <div className="text-[11px] font-bold text-indigo-100 truncate">{globalAgent.name}</div>
           <span className={`text-[9px] font-mono uppercase ${getStatusColor(globalAgent.status)}`}>
              {getStatusLabel(globalAgent.status)}
           </span>
        </div>
      </div>

      {/* Teams */}
      {teams.map((team, teamIdx) => {
        const isLastTeam = teamIdx === teams.length - 1;
        return (
          <div key={team.id} className="flex">
            {/* 左侧连接线区域 */}
            <div className="w-4 flex flex-col items-center shrink-0">
              {/* 垂直线上半部分 */}
              <div className="w-px h-2 bg-slate-600" />
              {/* 圆点 */}
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
              {/* 垂直线下半部分 - 如果不是最后一个 */}
              <div className={`w-px flex-1 ${isLastTeam ? 'bg-transparent' : 'bg-slate-600'}`} />
            </div>

            {/* 右侧内容区域 */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{team.name}</div>

              {/* Team Supervisor */}
              <AgentCard
                agent={team.supervisor}
                isTeamSup={true}
                isActive={activeTeamIds.has(team.id)}
                onClick={onAgentClick}
              />

              {/* Workers */}
              {team.members.map((member, memberIdx) => {
                const isLastMember = memberIdx === team.members.length - 1;
                return (
                  <div key={member.id} className="flex mt-0.5">
                    {/* Worker 连接线区域 - 更窄 */}
                    <div className="w-2.5 flex flex-col items-center shrink-0">
                      <div className="w-px h-1.5 bg-slate-700" />
                      <div className="w-1 h-1 rounded-full bg-slate-700 shrink-0" />
                      <div className={`w-px flex-1 ${isLastMember ? 'bg-transparent' : 'bg-slate-700'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <AgentCard
                        agent={member}
                        isActive={activeTeamIds.has(team.id) && member.status !== AgentStatus.IDLE}
                        onClick={onAgentClick}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgentHierarchy;