
import React from 'react';
import { TopologyNode, TopologyLink } from '../types';
import { 
  Inbox, 
  Check, 
  X, 
  Plus, 
  Network, 
  Zap, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert,
  BrainCircuit
} from 'lucide-react';

interface DiscoveryInboxProps {
  discoveredNodes: TopologyNode[];
  discoveredLinks: TopologyLink[];
  onApproveNode: (node: TopologyNode) => void;
  onRejectNode: (id: string) => void;
  onClear: () => void;
}

const DiscoveryInbox: React.FC<DiscoveryInboxProps> = ({ discoveredNodes, discoveredLinks, onApproveNode, onRejectNode, onClear }) => {
  if (discoveredNodes.length === 0 && discoveredLinks.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-slate-700">
              <Inbox size={48} className="opacity-10 mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest opacity-40">Discovery queue is empty</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 shrink-0">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <BrainCircuit className="text-purple-400" /> Discovery Inbox
                </h3>
                <p className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-widest">Awaiting human validation of AI-inferred architectural changes.</p>
            </div>
            <button onClick={onClear} className="text-xs text-slate-500 hover:text-white transition-colors">Clear queue</button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {discoveredNodes.map(node => (
                <div key={node.id} className="bg-slate-900 border border-purple-500/30 rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-950/30 rounded-lg border border-purple-500/20 text-purple-400">
                            <Plus size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">{node.label}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 font-black uppercase border border-purple-500/30">New Node Discovered</span>
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono mt-1">TYPE: {node.type} • ID: {node.id}</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button onClick={() => onRejectNode(node.id)} className="p-2 hover:bg-red-500/10 text-slate-600 hover:text-red-400 rounded-lg transition-all" title="Ignore"><X size={18} /></button>
                         <button onClick={() => onApproveNode(node)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2">
                             <Check size={14} /> Commit to Registry
                         </button>
                    </div>
                </div>
            ))}

            {discoveredLinks.map((link, idx) => (
                <div key={idx} className="bg-slate-900/50 border border-dashed border-purple-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-950 rounded-lg text-purple-400 opacity-60">
                            <Network size={20} />
                        </div>
                        <div>
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-300">{link.source}</span>
                                <ArrowRight size={12} className="text-purple-400" />
                                <span className="text-xs font-bold text-slate-300">{link.target}</span>
                             </div>
                             <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Inferred Traffic Pathway (Conf: {(link.confidence! * 100).toFixed(0)}%)</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button className="p-2 text-slate-600 hover:text-red-400 rounded-lg"><X size={18} /></button>
                         <button className="p-2 text-slate-600 hover:text-green-400 rounded-lg"><Check size={18} /></button>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default DiscoveryInbox;
