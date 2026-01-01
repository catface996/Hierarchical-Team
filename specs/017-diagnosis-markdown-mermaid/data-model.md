# Data Model: Diagnosis Message Markdown & Mermaid Support

**Feature**: 017-diagnosis-markdown-mermaid
**Date**: 2025-12-31

## Overview

This feature is a **UI rendering enhancement** with no new data entities or API changes. The existing `LogMessage` type already contains all necessary fields.

## Existing Entities (No Changes)

### LogMessage

**Location**: `types/index.ts`

```typescript
interface LogMessage {
  id: string;
  timestamp: number;
  fromAgentId: string;
  fromAgentName: string;
  toAgentId?: string;
  toAgentName?: string;
  content: string;           // ← Markdown content rendered here
  type: 'instruction' | 'thought' | 'report' | 'system';
  isStreaming?: boolean;
  reasoning?: string;        // ← Optional markdown content rendered here
  toolCalls?: LogToolCallInfo[];
}
```

**Fields Used for Markdown Rendering**:
- `content`: Main message body - will be parsed and rendered as Markdown
- `reasoning`: Optional thinking/reasoning text - will also be rendered as Markdown
- `isStreaming`: Controls streaming cursor display after Markdown content

## Component Props (New)

### MarkdownContentProps

```typescript
interface MarkdownContentProps {
  /** The markdown content to render */
  content: string;
  /** Whether to show streaming cursor at the end */
  isStreaming?: boolean;
  /** Additional CSS class for the container */
  className?: string;
}
```

### MermaidDiagramProps

```typescript
interface MermaidDiagramProps {
  /** Mermaid diagram code */
  code: string;
  /** Max height constraint (default: 400px) */
  maxHeight?: number;
}
```

### CodeBlockProps

```typescript
interface CodeBlockProps {
  /** Code content */
  children: string;
  /** Language identifier (e.g., 'javascript', 'python') */
  language?: string;
  /** Whether this is an inline code span */
  inline?: boolean;
}
```

## No API Changes

This feature requires no backend API changes. All data flows through the existing SSE stream and is rendered client-side.
