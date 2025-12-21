
import React, { useState } from 'react';
import { DiscoverySource } from '../types';
import { Radar, Plus, Settings, Trash2, X, Database, Cloud, Network, Activity, Zap, RefreshCw, Save } from 'lucide-react';

interface DiscoveryManagementProps {
  sources: DiscoverySource[];
  onAdd: (source: DiscoverySource) => void;
  onDelete: (id: string) => void;
  onScan: (id: string) => void;
}

const DiscoveryManagement: React.FC<DiscoveryManagementProps> = ({ sources, onAdd, onDelete, onScan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSource, setNewSource] = useState<Partial<DiscoverySource>>({ type: 'K8s', status: 'Connected' });

  const getIcon = (type: string) => {
    switch (type) {
      case 'K8s': return <Network className="text-blue-400" />;
      case 'Cloud': return <Cloud className="text-cyan-400" />;
      case 'Prometheus': return <Activity className="text-orange-400" />;
      default: return <Database className="text-slate-400" />;
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Radar size={20} className="text-cyan-400" /> Infrastructure Connectors
            </h2>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded text-xs font-bold transition-all">
                <Plus size={14} /> ADD CONNECTOR
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map(source => (
                <div key={source.id} className="bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col hover:border-slate-600 transition-colors">
                    <div className="flex justify-between mb-4">
                        <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg">{getIcon(source.type)}</div>
                        <div className="flex gap-1">
                             <button onClick={() => onScan(source.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-cyan-400" title="Scan"><RefreshCw size={14} /></button>
                             <button onClick={() => onDelete(source.id)} className="p-1.5 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                        </div>
                    </div>
                    <h3 className="font-bold text-white mb-1">{source.name}</h3>
                    <p className="text-xs text-slate-500 font-mono truncate mb-4">{source.endpoint}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-800">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${source.status === 'Connected' ? 'text-green-400 border-green-900 bg-green-950/20' : 'text-red-400 border-red-900 bg-red-950/20'}`}>{source.status}</span>
                        <button onClick={() => onScan(source.id)} className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                            <Zap size={12} /> SCAN NOW
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><Plus size={16} /> New Environment Link</h3>
                        <button onClick={() => setIsModalOpen(false)}><X className="text-slate-500 hover:text-white" /></button>
                    </div>
                    <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onAdd({...newSource, id: `src-${Date.now()}`} as any); setIsModalOpen(false); }}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Connector Name</label>
                                <input required onChange={e => setNewSource({...newSource, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-cyan-500" placeholder="e.g. Prod-K8s-Cluster" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Provider Type</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none" onChange={e => setNewSource({...newSource, type: e.target.value as any})}>
                                    <option value="K8s">Kubernetes API</option>
                                    <option value="Prometheus">Prometheus</option>
                                    <option value="Cloud">Public Cloud</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Endpoint / ARN</label>
                                <input required onChange={e => setNewSource({...newSource, endpoint: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none font-mono" placeholder="https://..." />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end gap-3">
                             <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold">Cancel</button>
                             <button type="submit" className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center gap-2"><Save size={14} /> REGISTER</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default DiscoveryManagement;
