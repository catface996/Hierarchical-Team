
import React, { useState } from 'react';
import { AIModel } from '../types';
import StyledSelect from './ui/StyledSelect';
import { 
  ArrowLeft, 
  Cpu, 
  Plus, 
  Search, 
  Trash2, 
  Settings, 
  Save, 
  X,
  CheckCircle2,
  AlertTriangle,
  LayoutList,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Brain,
  Maximize2,
  Zap,
  Globe,
  ArrowUpRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface ModelManagementProps {
  models: AIModel[];
  onAdd: (model: AIModel) => void;
  onUpdate: (model: AIModel) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 8;

const ModelManagement: React.FC<ModelManagementProps> = ({ models, onAdd, onUpdate, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);

  const filteredModels = models.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredModels.length / ITEMS_PER_PAGE);
  const paginatedModels = filteredModels.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getModelStatusStyle = (status: string) => {
    return status === 'Active' 
      ? { color: 'text-green-400', accent: 'bg-green-600', bg: 'bg-green-950/30', border: 'border-green-500/20' }
      : { color: 'text-slate-500', accent: 'bg-slate-600', bg: 'bg-slate-900', border: 'border-slate-800' };
  };

  const openEditModal = (model: AIModel) => {
      setEditingModel(model);
      setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div className="flex items-center gap-4">
           <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"><ArrowLeft size={20} /></button>
           <div>
             <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
               <Brain className="text-cyan-400" /> Neural Assets
             </h2>
             <p className="text-slate-400 text-xs mt-1 font-medium">Provision and calibrate large language models for specialized agent nodes.</p>
           </div>
        </div>
        <button onClick={() => { setEditingModel(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-cyan-900/20 font-bold text-xs tracking-widest">
          <Plus size={14} /> Register model
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 shrink-0">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
            <input type="text" placeholder="Search by name or provider..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-950 border border-slate-700/60 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 text-slate-200 transition-all" />
         </div>
         <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutList size={16} /></button>
            <button onClick={() => setViewMode('card')} className={`p-1.5 rounded transition-all ${viewMode === 'card' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid size={16} /></button>
         </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar">
         {paginatedModels.length > 0 ? (
            viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                    {paginatedModels.map(model => {
                        const style = getModelStatusStyle(model.status);
                        return (
                            <div key={model.id} className="relative bg-slate-900 border border-slate-800/80 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all group flex flex-col min-h-[220px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-950/10">
                                <div className={`h-1 w-full ${style.accent} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors`}><Cpu size={20} /></div>
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${style.bg} ${style.border} ${style.color}`}>
                                            <span className={`w-1 h-1 rounded-full ${model.status === 'Active' ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-slate-600'}`}></span>
                                            {model.status}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <h3 className="text-base font-bold text-white mb-0.5 truncate group-hover:text-cyan-400 transition-colors leading-tight">{model.name}</h3>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.15em] opacity-80">{model.provider}</div>
                                    </div>
                                    <div className="space-y-2.5 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0"><Maximize2 size={12} className="text-slate-500" /></div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] text-slate-500 leading-none mb-1">Context Window</div>
                                                <div className="text-xs text-slate-200 font-bold truncate">{(model.contextWindow / 1000).toFixed(0)}k Tokens</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0"><Layers size={12} className="text-slate-500" /></div>
                                            <div className="min-w-0">
                                                <div className="text-[10px] text-slate-500 leading-none mb-1">Modality</div>
                                                <div className="text-xs text-slate-300 font-medium truncate">{model.type} Unit</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 pt-4 border-t border-slate-800/40 flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => openEditModal(model)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-cyan-400 transition-all" title="Modify Asset"><Settings size={15} /></button>
                                            <button onClick={() => onDelete(model.id)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-red-400 transition-all" title="Deregister"><Trash2 size={15} /></button>
                                        </div>
                                        <div className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[8px] font-mono text-slate-600 font-bold uppercase tracking-tighter truncate max-w-[80px]">{model.id}</div>
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
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Model Definition</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Provider</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Window size</th>
                                <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                            {paginatedModels.map(model => (
                                <tr key={model.id} className="hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => openEditModal(model)}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 transition-colors"><Brain size={18} /></div>
                                            <div>
                                                <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{model.name}</div>
                                                <div className="text-[9px] uppercase font-black text-slate-500 tracking-widest">{model.type} / {model.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-xs text-slate-300 font-bold">{model.provider}</span></td>
                                    <td className="p-4"><span className="text-xs text-slate-400 font-mono">{(model.contextWindow / 1000).toFixed(0)}k Tokens</span></td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={(e) => { e.stopPropagation(); openEditModal(model); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-400"><Settings size={16} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(model.id); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
         ) : (
             <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
                 <Brain size={48} className="opacity-10 mb-4" />
                 <p className="text-sm font-bold tracking-wide">No specialized neural assets registered.</p>
             </div>
         )}
      </div>

      <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-900/50 shrink-0">
          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs"><ChevronLeft size={14} /> Prev</button>
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 tracking-widest">Inventory segment</span>
              <span className="text-xs text-white bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">{currentPage}</span>
              <span className="text-[10px] text-slate-500 font-bold">/</span>
              <span className="text-xs text-slate-400 font-mono font-bold">{Math.max(1, totalPages)}</span>
          </div>
          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs">Next <ChevronRight size={14} /></button>
      </div>

      {isModalOpen && <ModelFormModal model={editingModel} onClose={() => setIsModalOpen(false)} onSave={(m) => { if(editingModel) onUpdate(m); else onAdd(m); setIsModalOpen(false); }} />}
    </div>
  );
};

const ModelFormModal: React.FC<{ model: AIModel | null, onClose: () => void, onSave: (model: AIModel) => void }> = ({ model, onClose, onSave }) => {
    const [formData, setFormData] = useState<AIModel>(model || { id: '', name: '', provider: 'Google', contextWindow: 32000, type: 'Text', status: 'Active' });
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-t-cyan-600 flex flex-col">
          <div className="flex items-center justify-between p-5 bg-slate-950/50 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest"><Sparkles size={16} className="text-cyan-400" /> {model ? 'Modify model manifest' : 'Register model asset'}</h3>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-5">
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Internal Identifier</label>
                  <input type="text" required disabled={!!model} value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none disabled:opacity-40" placeholder="gemini-3-pro..." />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Display Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none" placeholder="Gemini 3 Pro (Experimental)..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Neural Provider</label>
                      <input type="text" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none" />
                  </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Window Size</label>
                      <input type="number" value={formData.contextWindow} onChange={e => setFormData({...formData, contextWindow: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none font-mono" />
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data Modality</label>
                      <StyledSelect
                        value={formData.type}
                        onChange={(val) => setFormData({...formData, type: val as any})}
                        options={[
                          { value: 'Text', label: 'Text' },
                          { value: 'Multimodal', label: 'Multimodal' },
                          { value: 'Audio', label: 'Audio' }
                        ]}
                        placeholder="Select modality..."
                      />
                  </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Status</label>
                      <StyledSelect
                        value={formData.status}
                        onChange={(val) => setFormData({...formData, status: val as any})}
                        options={[
                          { value: 'Active', label: 'Active' },
                          { value: 'Deprecated', label: 'Deprecated' }
                        ]}
                        placeholder="Select status..."
                      />
                  </div>
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

export default ModelManagement;
