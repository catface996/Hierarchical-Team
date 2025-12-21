
import React, { useState } from 'react';
import { AgentTool } from '../types';
import { 
  ArrowLeft, 
  Wrench, 
  Plus, 
  Search, 
  Trash2, 
  Settings, 
  Save, 
  X,
  Puzzle,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Terminal,
  Link,
  SearchCode,
  Zap,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';

interface ToolManagementProps {
  tools: AgentTool[];
  onAdd: (tool: AgentTool) => void;
  onUpdate: (tool: AgentTool) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 8;

const ToolManagement: React.FC<ToolManagementProps> = ({ tools, onAdd, onUpdate, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<AgentTool | null>(null);

  const filteredTools = tools.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE);
  const paginatedTools = filteredTools.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getToolTypeStyle = (type: string) => {
    switch (type) {
      case 'Function': return { accent: 'bg-indigo-600', text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/20', icon: Terminal };
      case 'Integration': return { accent: 'bg-pink-600', text: 'text-pink-400', bg: 'bg-pink-950/30', border: 'border-pink-500/20', icon: Link };
      case 'Retrieval': return { accent: 'bg-purple-600', text: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-500/20', icon: SearchCode };
      default: return { accent: 'bg-cyan-600', text: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/20', icon: Puzzle };
    }
  };

  const openEditModal = (tool: AgentTool) => {
      setEditingTool(tool);
      setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"><ArrowLeft size={20} /></button>
           <div>
             <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
               <Wrench className="text-cyan-400" /> Utility Fabric
             </h2>
             <p className="text-slate-400 text-xs mt-1 font-medium">Extend agent capabilities with specialized functions and environmental hooks.</p>
           </div>
        </div>
        <button onClick={() => { setEditingTool(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-cyan-900/20 font-bold text-xs tracking-widest">
          <Plus size={14} /> Provision tool
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 shrink-0">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input type="text" placeholder="Search operational tools..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-950 border border-slate-700/60 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 text-slate-200 transition-all" />
         </div>
         <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutList size={16} /></button>
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded transition-all ${viewMode === 'card' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid size={16} /></button>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
         {paginatedTools.length > 0 ? (
            viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                    {paginatedTools.map(tool => {
                        const style = getToolTypeStyle(tool.type);
                        return (
                             <div key={tool.id} className="relative bg-slate-900 border border-slate-800/80 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all group flex flex-col min-h-[220px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-950/10">
                                <div className={`h-1 w-full ${style.accent} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2.5 rounded-lg bg-slate-950 border border-slate-800 ${style.text} group-hover:text-cyan-400 transition-colors`}><style.icon size={20} /></div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.border} ${style.text}`}>{tool.type}</div>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-base font-bold text-white mb-0.5 group-hover:text-cyan-400 transition-colors leading-tight">{tool.name}</h3>
                                        <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest opacity-80">{tool.id}</div>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-4 flex-1">{tool.description}</p>
                                    <div className="mt-5 pt-4 border-t border-slate-800/40 flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEditModal(tool)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-cyan-400 transition-all" title="Modify Capability"><Settings size={15} /></button>
                                            <button onClick={() => onDelete(tool.id)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-red-400 transition-all" title="Decommission"><Trash2 size={15} /></button>
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-black text-slate-600"><Globe size={10} /> GLOBAL ASSET</div>
                                    </div>
                                </div>
                             </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-slate-900/30 border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Capability Unit</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Description preview</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Interface</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                            {paginatedTools.map(tool => {
                                const style = getToolTypeStyle(tool.type);
                                return (
                                    <tr key={tool.id} className="hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => openEditModal(tool)}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 ${style.text}`}><style.icon size={18} /></div>
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{tool.name}</div>
                                                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{tool.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><p className="text-xs text-slate-400 max-w-sm truncate italic">"{tool.description}"</p></td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border tracking-widest ${style.bg} ${style.border} ${style.text}`}>{tool.type}</span></td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={(e) => { e.stopPropagation(); openEditModal(tool); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-400"><Settings size={16} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); onDelete(tool.id); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )
         ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                 <Wrench size={48} className="opacity-10 mb-4" />
                 <p className="text-sm font-bold tracking-wide">No capability utilities detected in local fabric.</p>
             </div>
         )}
      </div>

      <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-900/50 shrink-0">
          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs"><ChevronLeft size={14} /> Prev</button>
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-widest">Utility segment</span>
              <span className="text-xs text-white bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">{currentPage}</span>
              <span className="text-[10px] text-slate-500 font-bold">/</span>
              <span className="text-xs text-slate-400 font-mono font-bold">{Math.max(1, totalPages)}</span>
          </div>
          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs">Next <ChevronRight size={14} /></button>
      </div>

      {isModalOpen && <ToolFormModal tool={editingTool} onClose={() => setIsModalOpen(false)} onSave={(t) => { if(editingTool) onUpdate(t); else onAdd(t); setIsModalOpen(false); }} />}
    </div>
  );
};

const ToolFormModal: React.FC<{ tool: AgentTool | null, onClose: () => void, onSave: (tool: AgentTool) => void }> = ({ tool, onClose, onSave }) => {
    const [formData, setFormData] = useState<AgentTool>(tool || { id: `tool-${Math.random().toString(36).substr(2, 6)}`, name: '', description: '', type: 'Function', createdAt: Date.now() });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-t-cyan-600 flex flex-col">
          <div className="flex items-center justify-between p-5 bg-slate-950/50 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest"><Sparkles size={16} className="text-cyan-400" /> {tool ? 'Modify capability hook' : 'Register capability hook'}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-5">
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Capability Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all" placeholder="Analyze Infrastructure Performance..." />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Description Segment</label>
                  <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none resize-none transition-all" placeholder="Define what this hook does in technical terms..." />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hook Architecture</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none">
                      <option value="Function">Function</option>
                      <option value="Integration">Integration</option>
                      <option value="Retrieval">Retrieval</option>
                  </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black tracking-widest rounded-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2"><Save size={16} /> Save record</button>
              </div>
          </form>
        </div>
      </div>
    );
};

export default ToolManagement;
