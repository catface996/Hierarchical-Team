
import React, { useState, useMemo } from 'react';
import { PromptTemplate } from '../types';
import StyledSelect from './ui/StyledSelect';
import { 
  Search, 
  Plus, 
  Settings, 
  Trash2, 
  Copy, 
  FileText, 
  LayoutList, 
  LayoutGrid, 
  Save, 
  X, 
  Tag,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowLeft,
  Sparkles,
  Zap,
  Terminal,
  Clock,
  Eye,
  ArrowUpRight
} from 'lucide-react';

interface PromptManagementProps {
  prompts: PromptTemplate[];
  onAdd: (prompt: PromptTemplate) => void;
  onUpdate: (prompt: PromptTemplate) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const ITEMS_PER_PAGE = 8;
const CATEGORIES = ['System', 'User', 'Analysis', 'Reporting'] as const;

const PromptManagement: React.FC<PromptManagementProps> = ({ prompts, onAdd, onUpdate, onDelete, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
        const matchesSearch = 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });
  }, [prompts, searchTerm, activeCategory]);

  const totalPages = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const paginatedPrompts = filteredPrompts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'System': return { accent: 'bg-indigo-600', text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/20' };
      case 'Analysis': return { accent: 'bg-purple-600', text: 'text-purple-400', bg: 'bg-indigo-950/30', border: 'border-purple-500/20' };
      case 'Reporting': return { accent: 'bg-pink-600', text: 'text-pink-400', bg: 'bg-indigo-950/30', border: 'border-pink-500/20' };
      default: return { accent: 'bg-cyan-600', text: 'text-cyan-400', bg: 'bg-indigo-950/30', border: 'border-cyan-500/20' };
    }
  };

  const handleCopy = (content: string) => {
      navigator.clipboard.writeText(content);
  };

  const openEditModal = (prompt: PromptTemplate) => {
      setEditingPrompt(prompt);
      setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"><ArrowLeft size={20} /></button>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                        <FileText className="text-cyan-400" /> Prompt Registry
                    </h2>
                    <p className="text-slate-400 text-xs mt-1 font-medium">Standardized instruction templates for hierarchical agent coordination.</p>
                </div>
            </div>
            <button onClick={() => { setEditingPrompt(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-all shadow-lg shadow-cyan-900/20 font-bold text-xs tracking-widest">
                <Plus size={14} /> New template
            </button>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 shrink-0">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input type="text" placeholder="Filter by name, tag..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full bg-slate-950 border border-slate-700/60 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 text-slate-200 transition-all" />
                </div>
                <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800 overflow-x-auto no-scrollbar">
                    <button onClick={() => { setActiveCategory('All'); setCurrentPage(1); }} className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all whitespace-nowrap ${activeCategory === 'All' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>All</button>
                    {CATEGORIES.map(cat => (
                        <button key={cat} onClick={() => { setActiveCategory(cat); setCurrentPage(1); }} className={`px-3 py-1.5 text-[10px] font-bold rounded transition-all whitespace-nowrap ${activeCategory === cat ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{cat}</button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
                <div className="flex bg-slate-950/80 rounded-lg p-1 border border-slate-800">
                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutList size={16} /></button>
                    <button onClick={() => setViewMode('card')} className={`p-1.5 rounded transition-all ${viewMode === 'card' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutGrid size={16} /></button>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
            {paginatedPrompts.length > 0 ? (
                viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
                        {paginatedPrompts.map(prompt => {
                            const style = getCategoryStyle(prompt.category);
                            return (
                                <div key={prompt.id} className="relative bg-slate-900 border border-slate-800/80 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all group flex flex-col min-h-[280px] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-cyan-950/10">
                                    <div className={`h-1 w-full ${style.accent} opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-2 rounded-lg ${style.bg} ${style.border} ${style.text}`}><Terminal size={20} /></div>
                                            <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest ${style.bg} ${style.border} ${style.text}`}>{prompt.category}</div>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-base font-bold text-white mb-1 truncate group-hover:text-cyan-400 transition-colors">{prompt.name}</h3>
                                            <p className="text-[10px] text-slate-500 font-medium line-clamp-1 opacity-80 italic">{prompt.description}</p>
                                        </div>
                                        <div className="flex-1 bg-slate-950/50 rounded-lg border border-slate-800/60 p-3 mb-4 overflow-hidden relative">
                                            <p className="text-[10px] font-mono text-slate-400 leading-relaxed line-clamp-4">{prompt.content}</p>
                                            <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-slate-950 to-transparent"></div>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-5">
                                            {prompt.tags.slice(0, 2).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="mt-auto pt-4 border-t border-slate-800/40 flex justify-between items-center shrink-0">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleCopy(prompt.content)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-cyan-400 transition-all" title="Copy Content"><Copy size={15} /></button>
                                                <button onClick={() => openEditModal(prompt)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-cyan-400 transition-all" title="Configure Template"><Settings size={15} /></button>
                                                <button onClick={() => onDelete(prompt.id)} className="p-1.5 hover:bg-slate-700/50 rounded-lg text-slate-500 hover:text-red-400 transition-all" title="Purge Record"><Trash2 size={15} /></button>
                                            </div>
                                            <div className="text-[9px] font-black text-slate-600 flex items-center gap-1.5"><Clock size={10} /> {new Date(prompt.updatedAt).toLocaleDateString()}</div>
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
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Template Label</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Category</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">Content Hash</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                                {paginatedPrompts.map(prompt => {
                                    const style = getCategoryStyle(prompt.category);
                                    return (
                                        <tr key={prompt.id} className="hover:bg-slate-800/40 transition-colors group cursor-pointer" onClick={() => openEditModal(prompt)}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg border ${style.bg} ${style.border} ${style.text}`}><Terminal size={16} /></div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{prompt.name}</div>
                                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{prompt.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase border tracking-widest ${style.bg} ${style.border} ${style.text}`}>{prompt.category}</span>
                                            </td>
                                            <td className="p-4 text-xs font-mono text-slate-500 opacity-60 truncate max-w-xs">{prompt.content.substring(0, 50)}...</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={(e) => { e.stopPropagation(); handleCopy(prompt.content); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-400"><Copy size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(prompt); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-cyan-400"><Settings size={16} /></button>
                                                    <button onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }} className="p-2 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-red-400"><Trash2 size={16} /></button>
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
                    <FileText size={48} className="opacity-10 mb-4" />
                    <p className="text-sm font-bold tracking-wide">No specialized prompt patterns found in cache.</p>
                </div>
            )}
        </div>

        <div className="flex justify-center items-center gap-6 pt-4 border-t border-slate-900/50 shrink-0">
            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs"><ChevronLeft size={14} /> Prev</button>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 tracking-widest">Library segment</span>
                <span className="text-xs text-white bg-slate-800 px-2 py-0.5 rounded font-mono font-bold">{currentPage}</span>
                <span className="text-[10px] text-slate-500 font-bold">/</span>
                <span className="text-xs text-slate-400 font-mono font-bold">{Math.max(1, totalPages)}</span>
            </div>
            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages || totalPages === 0} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-30 hover:bg-slate-800 text-slate-300 transition-all font-bold text-xs">Next <ChevronRight size={14} /></button>
        </div>

        {isModalOpen && <PromptFormModal prompt={editingPrompt} onClose={() => setIsModalOpen(false)} onSave={(p) => { if (editingPrompt) onUpdate(p); else onAdd(p); setIsModalOpen(false); }} />}
    </div>
  );
};

const PromptFormModal: React.FC<{ prompt: PromptTemplate | null, onClose: () => void, onSave: (prompt: PromptTemplate) => void }> = ({ prompt, onClose, onSave }) => {
  const [formData, setFormData] = useState<PromptTemplate>(prompt || { id: `pt-${Math.random().toString(36).substr(2, 6)}`, name: '', description: '', content: '', category: 'System', tags: [], updatedAt: Date.now() });
  const [tagInput, setTagInput] = useState('');
  const handleAddTag = () => { if (tagInput.trim()) { setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] }); setTagInput(''); } };
  const removeTag = (idx: number) => { setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) }); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border-t-4 border-t-cyan-600 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 bg-slate-950/50 border-b border-slate-800">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest"><Sparkles size={16} className="text-cyan-400" /> {prompt ? 'Modify prompt record' : 'Draft new instruction'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...formData, updatedAt: Date.now() }); }} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Template Title</label>
                   <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all" placeholder="Strategic Coordinator..." />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Category Segment</label>
                   <StyledSelect
                     value={formData.category}
                     onChange={(val) => setFormData({...formData, category: val as any})}
                     options={CATEGORIES.map(c => ({ value: c, label: c }))}
                     placeholder="Select category..."
                   />
                </div>
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Summary Objective</label>
               <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none transition-all" placeholder="High-level goal of this prompt..." />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Instruction Logic (Code)</label>
               <textarea rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-cyan-500/50 outline-none font-mono leading-relaxed resize-none" placeholder="Enter system instruction logic here..." />
            </div>
            <div>
               <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">System Tags</label>
               <div className="flex gap-2 mb-2">
                   <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())} placeholder="Add tag..." className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500/50 outline-none" />
                   <button type="button" onClick={handleAddTag} className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all tracking-widest">Add</button>
               </div>
               <div className="flex flex-wrap gap-2">{formData.tags.map((tag, idx) => ( <span key={idx} className="flex items-center gap-1 bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-bold border border-slate-700">{tag}<button type="button" onClick={() => removeTag(idx)} className="hover:text-white"><X size={12}/></button></span> ))}</div>
            </div>
        </form>
        <div className="p-5 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-3">
             <button onClick={onClose} className="px-5 py-2.5 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all">Cancel</button>
             <button onClick={(e) => { e.preventDefault(); onSave({ ...formData, updatedAt: Date.now() }); onClose(); }} className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black tracking-widest rounded-lg shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2"><Save size={16} /> Save record</button>
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
