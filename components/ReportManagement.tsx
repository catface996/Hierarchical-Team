
import React, { useState, useMemo } from 'react';
import { Report } from '../types';
import { 
  FileText, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  User,
  Tag,
  FileCheck,
  ShieldAlert,
  BarChart,
  Lock,
  Archive
} from 'lucide-react';

interface ReportManagementProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
}

const ITEMS_PER_PAGE = 8;

const ReportManagement: React.FC<ReportManagementProps> = ({ reports, onViewReport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'All' || r.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
  }, [reports, searchTerm, typeFilter]);

  const totalPages = Math.ceil(filteredReports.length / ITEMS_PER_PAGE);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Security': return <Lock size={16} className="text-red-400" />;
      case 'Performance': return <BarChart size={16} className="text-orange-400" />;
      case 'Audit': return <FileCheck size={16} className="text-blue-400" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Final': return 'bg-green-950/30 text-green-400 border-green-900';
      case 'Draft': return 'bg-yellow-950/30 text-yellow-400 border-yellow-900';
      case 'Archived': return 'bg-slate-800 text-slate-400 border-slate-700';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6 overflow-hidden">
       {/* Header */}
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
            <FileText className="text-cyan-400" /> System Reports
          </h2>
          <p className="text-slate-400 text-sm mt-1">Access generated diagnosis logs, audits, and performance summaries.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-4 gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800 shrink-0">
         <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-center">
            <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
               <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-cyan-500 text-slate-200"
               />
            </div>
            
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700">
                {['All', 'Diagnosis', 'Security', 'Performance', 'Audit'].map(type => (
                   <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${typeFilter === type ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
                   >
                      {type}
                   </button>
                ))}
            </div>
         </div>

         <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-700">
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="List View"
                >
                    <LayoutList size={16} />
                </button>
                <button
                    onClick={() => setViewMode('card')}
                    className={`p-1.5 rounded transition-all ${viewMode === 'card' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Card View"
                >
                    <LayoutGrid size={16} />
                </button>
            </div>
            
            <div className="text-xs text-slate-500 font-mono">
                <span className="text-white font-bold">{paginatedReports.length}</span> / {filteredReports.length}
            </div>
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-slate-900/30 border border-slate-800 rounded-lg shadow-inner custom-scrollbar relative">
          {paginatedReports.length > 0 ? (
             viewMode === 'list' ? (
                // LIST VIEW
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-950 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Title</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Type</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Status</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">Date & Author</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900">
                        {paginatedReports.map(report => (
                           <tr key={report.id} className="hover:bg-slate-800/50 transition-colors group">
                              <td className="p-4">
                                  <div className="font-bold text-slate-200">{report.title}</div>
                                  <div className="text-xs text-slate-500 font-mono">{report.id}</div>
                              </td>
                              <td className="p-4">
                                  <div className="flex items-center gap-2 text-sm text-slate-300">
                                      {getTypeIcon(report.type)}
                                      <span>{report.type}</span>
                                  </div>
                              </td>
                              <td className="p-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(report.status)}`}>
                                      {report.status}
                                  </span>
                              </td>
                              <td className="p-4">
                                  <div className="flex flex-col text-xs text-slate-500">
                                      <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(report.createdAt).toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1 mt-0.5"><User size={12}/> {report.author}</span>
                                  </div>
                              </td>
                              <td className="p-4 text-right">
                                  <button 
                                     onClick={() => onViewReport(report)}
                                     className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                                     title="View Report"
                                  >
                                      <Eye size={16} />
                                  </button>
                              </td>
                           </tr>
                        ))}
                    </tbody>
                </table>
             ) : (
                // CARD VIEW
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {paginatedReports.map(report => (
                        <div key={report.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-cyan-500/30 hover:bg-slate-800/80 transition-all group flex flex-col h-[260px]">
                           <div className="flex justify-between items-start mb-3">
                               <div className="p-2 rounded-lg bg-slate-950 text-slate-400 border border-slate-700">
                                  {getTypeIcon(report.type)}
                               </div>
                               <button 
                                  onClick={() => onViewReport(report)}
                                  className="p-1.5 hover:bg-slate-700 rounded text-slate-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                               >
                                  <Eye size={16} />
                               </button>
                           </div>

                           <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{report.title}</h3>
                           <div className="flex items-center gap-2 mb-3">
                               <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(report.status)}`}>
                                   {report.status}
                               </span>
                               <span className="text-xs text-slate-500 font-mono truncate">{report.id}</span>
                           </div>

                           <p className="text-xs text-slate-400 line-clamp-3 mb-4 flex-1">{report.summary}</p>

                           <div className="mt-auto space-y-2 pt-3 border-t border-slate-800/50">
                               <div className="flex justify-between text-xs text-slate-500">
                                   <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(report.createdAt).toLocaleDateString()}</span>
                                   <span className="flex items-center gap-1"><User size={12}/> {report.author}</span>
                               </div>
                               <div className="flex gap-1 flex-wrap">
                                   {report.tags.slice(0,3).map(tag => (
                                       <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-500 flex items-center gap-1">
                                           <Tag size={8} /> {tag}
                                       </span>
                                   ))}
                               </div>
                           </div>
                        </div>
                    ))}
                </div>
             )
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-500">
                 <FileText size={32} className="opacity-20 mb-2" />
                 <p>No reports found.</p>
             </div>
          )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 py-2 border-t border-slate-900 shrink-0">
          <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-50 hover:bg-slate-800 text-slate-300 transition-colors"
          >
              <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-slate-400">
              Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{Math.max(1, totalPages)}</span>
          </span>
          <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded bg-slate-900 border border-slate-800 disabled:opacity-50 hover:bg-slate-800 text-slate-300 transition-colors"
          >
              <ChevronRight size={16} />
          </button>
      </div>
    </div>
  );
};

export default ReportManagement;
