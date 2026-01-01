/**
 * MarkdownContent Component
 *
 * Main markdown renderer using react-markdown with custom components
 * for consistent dark theme styling
 * Feature: 017-diagnosis-markdown-mermaid
 */

import React, { createContext, useContext, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { Loader2 } from 'lucide-react';
import CodeBlock from './CodeBlock';

/**
 * Context to pass streaming state to child components
 * Used by CodeBlock to show loading state for mermaid diagrams during streaming
 */
export const StreamingContext = createContext<boolean>(false);
export const useStreaming = () => useContext(StreamingContext);

interface MarkdownContentProps {
  /** The markdown content to render */
  content: string;
  /** Whether to show streaming cursor at the end */
  isStreaming?: boolean;
  /** Additional CSS class for the container */
  className?: string;
}

/**
 * Custom heading components (H1-H6) with dark theme styling
 * T006: Create custom heading components
 */
const headingComponents: Partial<Components> = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-slate-100 mt-6 mb-4 pb-2 border-b border-slate-700">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-slate-100 mt-5 mb-3 pb-1 border-b border-slate-800">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-bold text-slate-200 mt-4 mb-2">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-base font-bold text-slate-200 mt-3 mb-2">
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5 className="text-sm font-bold text-slate-300 mt-2 mb-1">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="text-xs font-bold text-slate-400 mt-2 mb-1 uppercase tracking-wider">
      {children}
    </h6>
  ),
};

/**
 * Custom link component with target="_blank" and security attributes
 * T007: Create custom link component
 */
const linkComponent: Partial<Components> = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors"
    >
      {children}
    </a>
  ),
};

/**
 * Custom table components with dark theme styling
 * T008: Create custom table components
 */
const tableComponents: Partial<Components> = {
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-slate-700 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-800">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-slate-700">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-slate-800/50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-sm text-slate-300 border-slate-700">
      {children}
    </td>
  ),
};

/**
 * Custom list components (ul, ol, li) with proper indentation
 * T009: Create custom list components
 */
const listComponents: Partial<Components> = {
  ul: ({ children }) => (
    <ul className="list-disc list-inside my-2 ml-4 space-y-1 text-slate-300">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside my-2 ml-4 space-y-1 text-slate-300">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-slate-300 pl-1">
      {children}
    </li>
  ),
};

/**
 * Check if a single line contains ASCII art characters
 * Box-drawing characters: ┌ ─ ┐ │ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝ etc.
 */
const hasAsciiArtChars = (line: string): boolean => {
  // Box-drawing characters (Unicode range U+2500 to U+257F) and common ASCII art symbols
  const boxDrawingRegex = /[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬▼▲►◄●○■□╭╮╯╰]/;
  return boxDrawingRegex.test(line);
};

/**
 * Preprocess markdown content to wrap ASCII art blocks in code fences
 * This prevents markdown from collapsing newlines in ASCII art
 */
const preprocessAsciiArt = (content: string): string => {
  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let asciiArtBuffer: string[] = [];

  const flushAsciiArt = () => {
    if (asciiArtBuffer.length > 0) {
      // Wrap buffered ASCII art in code fences with 'ascii' language for special styling
      result.push('```ascii');
      result.push(...asciiArtBuffer);
      result.push('```');
      asciiArtBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code block state
    if (line.trim().startsWith('```')) {
      flushAsciiArt();
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    // Don't process inside code blocks
    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    // Check if line has ASCII art characters
    if (hasAsciiArtChars(line)) {
      asciiArtBuffer.push(line);
    } else {
      // If we had ASCII art buffered and now hit a non-ASCII-art line
      if (asciiArtBuffer.length > 0) {
        // Only wrap if we have multiple lines of ASCII art (single line might be inline decoration)
        if (asciiArtBuffer.length >= 2) {
          flushAsciiArt();
        } else {
          // Single line with ASCII chars - just output normally
          result.push(...asciiArtBuffer);
          asciiArtBuffer = [];
        }
      }
      result.push(line);
    }
  }

  // Flush any remaining ASCII art at end of content
  if (asciiArtBuffer.length >= 2) {
    flushAsciiArt();
  } else if (asciiArtBuffer.length > 0) {
    result.push(...asciiArtBuffer);
  }

  return result.join('\n');
};

/**
 * Custom paragraph and text styling
 * T013: Add bold/italic text styling
 */
const textComponents: Partial<Components> = {
  p: ({ children }) => (
    <p className="my-2 text-slate-300 leading-relaxed">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-100">
      {children}
    </strong>
  ),
  em: ({ children }) => (
    <em className="italic text-slate-200">
      {children}
    </em>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-cyan-500/50 pl-4 my-4 italic text-slate-400 bg-slate-900/50 py-2 rounded-r">
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className="my-6 border-slate-700" />
  ),
};

/**
 * Code component that delegates to CodeBlock
 * Handles both inline and block code
 */
const codeComponent: Partial<Components> = {
  code: ({ className, children, ...props }) => {
    // Check if this is a code block (has language class) or inline code
    const match = /language-(\w+)/.exec(className || '');
    const isInline = !match && !className;

    return (
      <CodeBlock
        language={match ? match[1] : undefined}
        inline={isInline}
        {...props}
      >
        {String(children)}
      </CodeBlock>
    );
  },
  pre: ({ children }) => (
    // Pre tag just passes through - CodeBlock handles the styling
    <div className="my-4">
      {children}
    </div>
  ),
};

/**
 * Combined custom components for ReactMarkdown
 */
const customComponents: Components = {
  ...headingComponents,
  ...linkComponent,
  ...tableComponents,
  ...listComponents,
  ...textComponents,
  ...codeComponent,
};

/**
 * MarkdownContent - Main markdown rendering component
 *
 * Uses react-markdown with remark-gfm for GitHub Flavored Markdown
 * Custom components ensure consistent dark theme styling
 * Streaming cursor is rendered OUTSIDE ReactMarkdown to avoid parser issues
 * StreamingContext provides isStreaming state to child components (e.g., CodeBlock for mermaid)
 * 
 * Code block buffering: When streaming, if there's an unclosed code block (odd number of ```),
 * we buffer the incomplete code block and show a loading indicator to prevent jitter.
 */
const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  isStreaming = false,
  className = '',
}) => {
  // Buffer incomplete mermaid blocks during streaming and preprocess ASCII art
  const { displayContent, isBuffering } = useMemo(() => {
    let processedContent = content;
    let buffering = false;

    if (isStreaming) {
      // Only buffer mermaid diagrams, not regular code blocks
      const mermaidOpenMatch = processedContent.match(/```mermaid\s*\n/g);
      if (mermaidOpenMatch) {
        // Find last ```mermaid and check if it's closed
        const lastMermaidStart = processedContent.lastIndexOf('```mermaid');
        const afterMermaid = processedContent.slice(lastMermaidStart + 10); // after "```mermaid"
        const hasClosing = afterMermaid.includes('```');

        if (!hasClosing) {
          // Truncate before the unclosed mermaid block
          processedContent = processedContent.slice(0, lastMermaidStart);
          buffering = true;
        }
      }
    }

    // Preprocess ASCII art to wrap in code fences
    processedContent = preprocessAsciiArt(processedContent);

    return { displayContent: processedContent, isBuffering: buffering };
  }, [content, isStreaming]);

  return (
    <StreamingContext.Provider value={isStreaming}>
      <div className={`markdown-content ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={customComponents}
        >
          {displayContent}
        </ReactMarkdown>
        {/* Loading indicator for buffered code block */}
        {isBuffering && (
          <div className="my-4 p-4 bg-slate-900 border border-slate-700 rounded-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            <span className="text-slate-400 text-sm">Rendering diagram...</span>
          </div>
        )}
        {/* Streaming cursor rendered OUTSIDE ReactMarkdown (T027) */}
        {isStreaming && !isBuffering && (
          <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-500 animate-pulse" />
        )}
      </div>
    </StreamingContext.Provider>
  );
};

export default MarkdownContent;
