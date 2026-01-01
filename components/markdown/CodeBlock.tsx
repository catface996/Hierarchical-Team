/**
 * CodeBlock Component
 *
 * Renders code blocks with syntax highlighting using react-syntax-highlighter
 * Detects mermaid code blocks and delegates to MermaidDiagram component
 * Shows loading state for mermaid diagrams during streaming to prevent jitter
 * Feature: 017-diagnosis-markdown-mermaid
 */

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';
import AsciiArtTerminal from './AsciiArtTerminal';

interface CodeBlockProps {
  children: string;
  language?: string;
  inline?: boolean;
}

// Custom dark theme overrides to better match slate design system
const customStyle: React.CSSProperties = {
  margin: 0,
  padding: '1rem',
  borderRadius: '0.5rem',
  fontSize: '0.875rem',
  lineHeight: '1.5',
  background: '#0f172a', // slate-900
};

// Override oneDark to remove per-line/token background colors
const cleanOneDark = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: '#0f172a',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: 'transparent',
  },
  // Remove background from all token types
  ...Object.fromEntries(
    Object.entries(oneDark).map(([key, value]) => {
      if (typeof value === 'object' && value !== null && 'background' in value) {
        return [key, { ...value, background: 'transparent' }];
      }
      return [key, value];
    })
  ),
};

/**
 * CodeBlock component for rendering code with syntax highlighting
 *
 * - Inline code: renders with dark background styling
 * - Block code: renders with Prism syntax highlighting
 * - Mermaid blocks: delegated to MermaidDiagram (integrated in T021)
 *
 * Note: Mermaid diagrams render immediately when the code block is complete.
 * React-markdown only calls CodeBlock when the closing ``` is received,
 * so we can safely render without waiting for the entire message stream to end.
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ children, language, inline }) => {
  // Inline code - simple styled span
  if (inline) {
    return (
      <code className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[0.9em] border border-slate-700">
        {children}
      </code>
    );
  }

  // T021: Mermaid detection - delegate to MermaidDiagram component
  // Render immediately - react-markdown only provides complete code blocks
  if (language === 'mermaid') {
    return <MermaidDiagram code={String(children)} />;
  }

  // ASCII art - render with xterm.js for professional terminal display
  if (language === 'ascii') {
    return <AsciiArtTerminal content={String(children).replace(/\n$/, '')} />;
  }

  // Block code - use syntax highlighter with clean theme (no token backgrounds)
  return (
    <SyntaxHighlighter
      language={language || 'text'}
      style={cleanOneDark}
      customStyle={customStyle}
      showLineNumbers={false}
      wrapLines={true}
      wrapLongLines={true}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
