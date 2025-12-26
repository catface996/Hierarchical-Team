/**
 * VersionHistory Component
 *
 * Display version history list with rollback functionality
 * Feature: 007-prompt-template-api
 */

import React, { useState } from 'react';
import {
  GitBranch,
  Clock,
  RotateCcw,
  Eye,
  Loader2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import type { PromptTemplateVersionDTO } from '../../services/api/types';

interface VersionHistoryProps {
  versions: PromptTemplateVersionDTO[];
  currentVersion: number;
  onViewVersion: (versionNumber: number) => void;
  onRollback: (versionNumber: number) => void;
  rollbackLoading: boolean;
  versionLoading: boolean;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  onViewVersion,
  onRollback,
  rollbackLoading,
  versionLoading,
}) => {
  const [confirmRollback, setConfirmRollback] = useState<number | null>(null);
  const [loadingVersion, setLoadingVersion] = useState<number | null>(null);

  const handleViewVersion = async (versionNumber: number) => {
    setLoadingVersion(versionNumber);
    try {
      await onViewVersion(versionNumber);
    } finally {
      setLoadingVersion(null);
    }
  };

  const handleRollbackConfirm = (versionNumber: number) => {
    setConfirmRollback(versionNumber);
  };

  const handleRollbackExecute = async () => {
    if (confirmRollback === null) return;
    await onRollback(confirmRollback);
    setConfirmRollback(null);
  };

  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="p-2">
      {sortedVersions.length === 0 ? (
        <div className="p-4 text-center text-slate-500 text-sm">No version history available</div>
      ) : (
        <div className="space-y-2">
          {sortedVersions.map((version) => {
            const isCurrent = version.versionNumber === currentVersion;
            const isLoading = loadingVersion === version.versionNumber && versionLoading;

            return (
              <div
                key={version.versionNumber}
                className={`p-3 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/30 border-cyan-500/30'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className={isCurrent ? 'text-cyan-400' : 'text-slate-500'} />
                    <span className={`text-sm font-bold ${isCurrent ? 'text-cyan-400' : 'text-white'}`}>
                      v{version.versionNumber}
                    </span>
                    {isCurrent && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-cyan-600 text-white">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewVersion(version.versionNumber)}
                      disabled={isLoading}
                      className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-cyan-400 transition-all disabled:opacity-50"
                      title="View content"
                    >
                      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                    </button>
                    {!isCurrent && (
                      <button
                        onClick={() => handleRollbackConfirm(version.versionNumber)}
                        disabled={rollbackLoading}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-all disabled:opacity-50"
                        title="Rollback to this version"
                      >
                        <RotateCcw size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1 mb-1">
                  <Clock size={10} />
                  {new Date(version.createdAt).toLocaleString()}
                </div>

                {version.changeNote && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                    {version.changeNote}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {confirmRollback !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-amber-950/50 border border-amber-800">
                <AlertTriangle size={24} className="text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-lg">Rollback to v{confirmRollback}?</h3>
            </div>
            <p className="text-slate-400 text-sm mb-6">
              This will create a new version with the content from version {confirmRollback}.
              The current content will be preserved in the version history.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmRollback(null)}
                disabled={rollbackLoading}
                className="px-4 py-2 text-slate-400 hover:bg-slate-800 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRollbackExecute}
                disabled={rollbackLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {rollbackLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RotateCcw size={16} />
                )}
                Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
