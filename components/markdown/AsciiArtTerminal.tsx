/**
 * AsciiArtTerminal Component
 *
 * Renders ASCII art using xterm.js for professional terminal-style display
 * with proper character spacing and ANSI color support
 * Feature: 017-diagnosis-markdown-mermaid
 */

import React, { useEffect, useRef, memo } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface AsciiArtTerminalProps {
  content: string;
}

/**
 * AsciiArtTerminal - Renders ASCII art in a xterm.js terminal
 *
 * Uses memo to prevent unnecessary re-renders which would cause flickering
 */
const AsciiArtTerminal: React.FC<AsciiArtTerminalProps> = memo(({ content }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Calculate dimensions based on content
    const lines = content.split('\n');
    const maxLineLength = Math.max(...lines.map(l => l.length), 40);
    const lineCount = lines.length;

    // Create terminal with dark theme matching our design system
    const terminal = new Terminal({
      theme: {
        background: '#0f172a', // slate-900
        foreground: '#22d3ee', // cyan-400
        cursor: 'transparent',
        cursorAccent: 'transparent',
        selectionBackground: '#334155', // slate-700
      },
      fontSize: 14,
      fontFamily: '"Fira Code", "JetBrains Mono", "SF Mono", Menlo, Monaco, "Courier New", monospace',
      lineHeight: 1.2,
      cursorBlink: false,
      cursorStyle: 'bar',
      disableStdin: true,
      cols: Math.min(maxLineLength + 2, 120),
      rows: lineCount + 1,
      scrollback: 0,
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    terminal.open(terminalRef.current);

    // Write content line by line
    lines.forEach((line, index) => {
      if (index > 0) {
        terminal.write('\r\n');
      }
      terminal.write(line);
    });

    xtermRef.current = terminal;

    // Cleanup
    return () => {
      terminal.dispose();
      xtermRef.current = null;
    };
  }, [content]);

  // Calculate height based on content
  const lines = content.split('\n');
  const estimatedHeight = Math.max(lines.length * 18 + 16, 60);

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
      {/* Terminal-style header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-slate-500 ml-2">terminal</span>
      </div>
      {/* xterm.js container */}
      <div
        ref={terminalRef}
        className="p-2 overflow-x-auto"
        style={{ minHeight: estimatedHeight }}
      />
    </div>
  );
});

AsciiArtTerminal.displayName = 'AsciiArtTerminal';

export default AsciiArtTerminal;
