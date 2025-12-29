import React, { useEffect, useRef, useMemo } from 'react';
import { LogMessage } from '../types';
import { Terminal, ArrowRight, Brain, CheckCircle2 } from 'lucide-react';

interface LogStreamProps {
  logs: LogMessage[];
  focusTarget: { agentId: string; ts: number } | null;
}

const LogStream: React.FC<LogStreamProps> = ({ logs, focusTarget }) => {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const logRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Compute a scroll trigger based on logs content (not just length)
  // This ensures we scroll when streaming content updates the last message
  const scrollTrigger = useMemo(() => {
    if (logs.length === 0) return '';
    const lastLog = logs[logs.length - 1];
    return `${logs.length}-${lastLog.content.length}`;
  }, [logs]);

  // Auto-scroll to bottom only if NOT focusing on a specific agent
  useEffect(() => {
    if (!focusTarget && containerRef.current) {
      // Use scrollTop instead of scrollIntoView for smoother experience
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [scrollTrigger, focusTarget]); // Depend on scrollTrigger so it scrolls on content changes

  // Scroll to focused agent
  useEffect(() => {
    if (focusTarget && logs.length > 0) {
       // Find the first occurrence of this agent in the logs
       // Alternatively, we could find the last one. Let's try finding the last one as it's likely the most relevant 'current' action.
       // Actually, locating to the *start* of their block is usually better for reading.
       // Let's find the FIRST log entry for this agent ID.
       const targetLog = logs.find(l => l.fromAgentId === focusTarget.agentId);
       
       if (targetLog) {
         const el = logRefs.current.get(targetLog.id);
         if (el) {
           el.scrollIntoView({ behavior: 'smooth', block: 'center' });
           
           // Visual highlight effect
           el.classList.add('bg-cyan-900/40', 'ring-1', 'ring-cyan-500/50');
           setTimeout(() => {
             el.classList.remove('bg-cyan-900/40', 'ring-1', 'ring-cyan-500/50');
           }, 1500);
         }
       }
    }
  }, [focusTarget]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'instruction': return <ArrowRight size={16} className="text-blue-400" />;
      case 'thought': return <Brain size={16} className="text-purple-400" />;
      case 'report': return <CheckCircle2 size={16} className="text-green-400" />;
      case 'system': return <Terminal size={16} className="text-slate-500" />;
      default: return <Terminal size={16} className="text-slate-500" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'instruction': return 'border-blue-500/10 bg-blue-950/5';
      case 'thought': return 'border-purple-500/10 bg-purple-950/5';
      case 'report': return 'border-green-500/10 bg-green-950/5';
      default: return 'border-transparent hover:bg-slate-900/30';
    }
  };

  return (
    <div className="flex flex-col h-full font-mono text-sm relative">
      <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {logs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 space-y-4">
             <Brain size={48} className="opacity-20 animate-pulse" />
             <p className="italic">Waiting for mission protocol...</p>
          </div>
        )}
        
        {logs.map((log) => (
          <div 
            key={log.id} 
            ref={(el) => {
              if (el) logRefs.current.set(log.id, el);
              else logRefs.current.delete(log.id);
            }}
            className={`p-4 rounded-lg border transition-all duration-500 ${getStyle(log.type)} animate-in fade-in slide-in-from-bottom-2`}
          >
             <div className="flex items-center gap-3 mb-2">
                {getIcon(log.type)}
                <span className="text-sm font-bold text-slate-200">{log.fromAgentName}</span>
                {log.toAgentId && <span className="text-xs text-slate-500">→</span>}
                {log.toAgentId && <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Target</span>}
                <span className="text-[10px] text-slate-600 ml-auto font-mono tracking-tighter opacity-60">
                    {new Date(log.timestamp).toISOString().split('T')[1].slice(0,12)}
                </span>
             </div>
             <div className="text-slate-300 pl-8 text-sm leading-relaxed whitespace-pre-wrap font-sans relative">
               {log.content}
               {log.isStreaming && (
                 <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-500 animate-pulse" />
               )}
             </div>
          </div>
        ))}
        <div ref={endRef} className="h-4" />
      </div>
    </div>
  );
};

export default LogStream;