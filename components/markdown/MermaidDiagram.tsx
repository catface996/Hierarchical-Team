/**
 * MermaidDiagram Component
 *
 * Renders Mermaid diagram code blocks as visual SVG diagrams
 * Handles async rendering, error fallback, and auto-fit height
 * Uses React.memo to prevent unnecessary re-renders during streaming
 * Feature: 017-diagnosis-markdown-mermaid
 */

import React, { useState, useEffect, useRef, useId, memo } from 'react';
import mermaid from './mermaidConfig';
import { AlertCircle, Loader2 } from 'lucide-react';

interface MermaidDiagramProps {
  /** Mermaid diagram code */
  code: string;
  /** Optional max height constraint (undefined = auto-fit to content) */
  maxHeight?: number;
}

/**
 * MermaidDiagram - Renders mermaid code as visual SVG diagram
 *
 * T017: Create MermaidDiagram component with async rendering
 * T018: Implement unique ID generation for each diagram
 * T019: Implement error fallback showing error message and raw code
 * T020: Auto-fit height by default, optional maxHeight for constraint
 *
 * Memoized to prevent re-renders when code hasn't changed (prevents jitter during streaming)
 */
const MermaidDiagram: React.FC<MermaidDiagramProps> = memo(({
  code,
  maxHeight,
}) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the last rendered code to prevent duplicate renders
  const lastRenderedCode = useRef<string>('');

  // T018: Unique ID generation using React's useId + random for uniqueness
  const baseId = useId();
  const diagramId = useRef(`mermaid-${baseId.replace(/:/g, '')}-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let isMounted = true;
    const trimmedCode = code.trim();

    // Skip if code is empty or already rendered with the same content
    if (!trimmedCode) {
      setError('Empty diagram code');
      setIsLoading(false);
      return;
    }

    // Skip duplicate renders - prevents jitter during streaming
    if (trimmedCode === lastRenderedCode.current && svg) {
      return;
    }

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Generate a new unique ID for each render to avoid mermaid cache issues
        const renderId = `mermaid-${Math.random().toString(36).slice(2)}-${Date.now()}`;

        // Mermaid v10 async render API
        const { svg: renderedSvg } = await mermaid.render(renderId, trimmedCode);

        if (isMounted) {
          lastRenderedCode.current = trimmedCode;
          setSvg(renderedSvg);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [code, svg]);

  // Loading state - show while rendering mermaid diagram
  if (isLoading) {
    return (
      <div className="my-4 p-6 bg-slate-900 border border-slate-700 rounded-lg flex flex-col items-center justify-center gap-3 min-h-[150px]">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-slate-400 text-sm">Rendering diagram...</span>
      </div>
    );
  }

  // T019: Error fallback showing error message and raw code
  if (error) {
    return (
      <div className="my-4 bg-slate-900 border border-red-500/30 rounded-lg overflow-hidden">
        {/* Error header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border-b border-red-500/20">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-sm text-red-400 font-medium">Mermaid Diagram Error</span>
        </div>
        {/* Error message */}
        <div className="px-4 py-2 text-xs text-red-300/80 bg-red-950/10 border-b border-slate-700">
          {error}
        </div>
        {/* Raw code fallback */}
        <pre className="p-4 text-sm text-slate-300 font-mono overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    );
  }

  // T020: Successfully rendered diagram with auto-fit height (optional maxHeight constraint)
  return (
    <div
      ref={containerRef}
      className="my-4 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden"
    >
      {/* Diagram container - auto-fit height by default, scrollable if maxHeight is set */}
      <div
        className={`p-4 ${maxHeight ? 'overflow-auto' : ''}`}
        style={maxHeight ? { maxHeight: `${maxHeight}px` } : undefined}
      >
        <div
          className="mermaid-diagram flex justify-center [&>svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
    </div>
  );
});

// Display name for debugging
MermaidDiagram.displayName = 'MermaidDiagram';

export default MermaidDiagram;
