/**
 * PromptDetailView Component
 *
 * Display prompt template details with version history
 * Feature: 007-prompt-template-api
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  Clock,
  GitBranch,
  Copy,
  Settings,
  Loader2,
  AlertCircle,
  RefreshCw,
  Terminal,
  User,
  ChevronRight,
  Bot,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Wand2,
  Brain,
  Code,
  Shield,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { usePromptTemplate } from '../../services/hooks/usePromptTemplate';
import { usePromptTemplateMutations } from '../../services/hooks/usePromptTemplateMutations';
import { useTemplateUsages } from '../../services/hooks/useTemplateUsages';
import VersionHistory from './VersionHistory';
import type { PromptTemplateVersionDTO } from '../../services/api/types';

// Icon mapping for different usage types
const USAGE_ICON_MAP: Record<string, LucideIcon> = {
  // 实际业务类型
  FAULT_DIAGNOSIS: Zap,        // 故障诊断
  KNOWLEDGE_QA: Brain,         // 知识问答
  DATA_ANALYSIS: BarChart3,    // 数据分析
  REPORT_GENERATION: ClipboardList, // 报告生成
  CODE_REVIEW: Code,           // 代码审查
  OPS_SUGGESTION: Wand2,       // 运维建议
  DAILY_INSPECTION: ClipboardList, // 日常巡检
  OPERATION_SUGGESTION: Wand2, // 运维建议 (备选code)
  ROUTINE_CHECK: ClipboardList, // 日常巡检 (备选code)
  // 通用类型
  SYSTEM_PROMPT: Bot,
  USER_PROMPT: MessageSquare,
  ANALYSIS: BarChart3,
  REPORTING: ClipboardList,
  GENERATION: Wand2,
  REASONING: Brain,
  CODE: Code,
  SECURITY: Shield,
  AUTOMATION: Zap,
};

const getUsageIcon = (usageCode: string | null | undefined): LucideIcon => {
  if (!usageCode) return Terminal;
  return USAGE_ICON_MAP[usageCode.toUpperCase()] || Terminal;
};

interface PromptDetailViewProps {
  templateId: number;
  onBack: () => void;
  onEdit: () => void;
}

const PromptDetailView: React.FC<PromptDetailViewProps> = ({ templateId, onBack, onEdit }) => {
  const { template, loading, error, refresh, getVersionDetail, versionLoading } = usePromptTemplate(templateId);
  const { rollbackTemplate, loading: rollbackLoading } = usePromptTemplateMutations();
  const { usages } = useTemplateUsages();
  const [selectedVersion, setSelectedVersion] = useState<PromptTemplateVersionDTO | null>(null);
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Helper to get usage code from usageId
  const getUsageCode = (usageId: number | null): string | null => {
    if (!usageId) return null;
    const usage = usages.find(u => u.id === usageId);
    return usage?.code || null;
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleViewVersion = async (versionNumber: number) => {
    try {
      const versionDetail = await getVersionDetail(versionNumber);
      setSelectedVersion(versionDetail);
      setShowVersionModal(true);
    } catch (err) {
      console.error('Failed to load version detail:', err);
    }
  };

  const handleRollback = async (versionNumber: number) => {
    if (!template) return;

    try {
      await rollbackTemplate({
        templateId: template.id,
        targetVersion: versionNumber,
        expectedVersion: template.currentVersion,
      }, refresh);
      refresh();
    } catch (err) {
      console.error('Rollback failed:', err);
    }
  };

  const getUsageStyle = (usageName: string | null) => {
    if (!usageName) return { accent: 'bg-slate-600', text: 'text-slate-400', bg: 'bg-slate-950/30', border: 'border-slate-500/20' };
    const hash = usageName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const styles = [
      { accent: 'bg-indigo-600', text: 'text-indigo-400', bg: 'bg-indigo-950/30', border: 'border-indigo-500/20' },
      { accent: 'bg-purple-600', text: 'text-purple-400', bg: 'bg-purple-950/30', border: 'border-purple-500/20' },
      { accent: 'bg-pink-600', text: 'text-pink-400', bg: 'bg-pink-950/30', border: 'border-pink-500/20' },
      { accent: 'bg-cyan-600', text: 'text-cyan-400', bg: 'bg-cyan-950/30', border: 'border-cyan-500/20' },
      { accent: 'bg-emerald-600', text: 'text-emerald-400', bg: 'bg-emerald-950/30', border: 'border-emerald-500/20' },
      { accent: 'bg-amber-600', text: 'text-amber-400', bg: 'bg-amber-950/30', border: 'border-amber-500/20' },
    ];
    return styles[hash % styles.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Loading...</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-cyan-500" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-white">Template Not Found</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <AlertCircle size={48} className="text-red-400 mb-4" />
          <p className="text-red-400 mb-4">{error || 'Template not found'}</p>
          <button onClick={refresh} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const style = getUsageStyle(template.usageName);
  const UsageIcon = getUsageIcon(getUsageCode(template.usageId));

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={20} />
            </button>
            <div className={`p-3 rounded-xl ${style.bg} ${style.border} ${style.text}`}>
              <UsageIcon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">{template.name}</h2>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-widest ${style.bg} ${style.border} ${style.text}`}>
                  {template.usageName || 'Uncategorized'}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
                  <GitBranch size={10} /> v{template.currentVersion}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1">{template.description || 'No description'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(template.content)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all"
              title="Copy Content"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
            >
              <Settings size={14} /> Edit Template
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto custom-scrollbar">
          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Created</div>
              <div className="text-sm text-white flex items-center gap-2">
                <Clock size={14} className="text-slate-500" />
                {new Date(template.createdAt).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Last Updated</div>
              <div className="text-sm text-white flex items-center gap-2">
                <Clock size={14} className="text-slate-500" />
                {new Date(template.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Created By</div>
              <div className="text-sm text-white flex items-center gap-2">
                <User size={14} className="text-slate-500" />
                {template.creatorName || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="mb-6">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Template Content</div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-auto max-h-[400px] custom-scrollbar">
              <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{template.content}</pre>
            </div>
          </div>
        </div>

        {/* Version History Sidebar */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/30 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitBranch size={16} className="text-cyan-400" />
              Version History
            </h3>
          </div>
          <div className="flex-1 overflow-auto custom-scrollbar">
            <VersionHistory
              versions={template.versions}
              currentVersion={template.currentVersion}
              onViewVersion={handleViewVersion}
              onRollback={handleRollback}
              rollbackLoading={rollbackLoading}
              versionLoading={versionLoading}
            />
          </div>
        </div>
      </div>

      {/* Version Detail Modal */}
      {showVersionModal && selectedVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-5 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch className="text-cyan-400" size={20} />
                <div>
                  <h3 className="font-bold text-white">Version {selectedVersion.versionNumber}</h3>
                  <p className="text-[10px] text-slate-500">{new Date(selectedVersion.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setShowVersionModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-auto custom-scrollbar">
              {selectedVersion.changeNote && (
                <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Change Note</div>
                  <p className="text-sm text-slate-300">{selectedVersion.changeNote}</p>
                </div>
              )}
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Content at Version {selectedVersion.versionNumber}</div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedVersion.content}</pre>
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
              <button onClick={() => setShowVersionModal(false)} className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg text-xs font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptDetailView;
