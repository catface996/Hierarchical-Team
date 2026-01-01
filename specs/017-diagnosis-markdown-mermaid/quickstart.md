# Quickstart: Diagnosis Message Markdown & Mermaid Support

**Feature**: 017-diagnosis-markdown-mermaid
**Date**: 2025-12-31

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Backend service running (for triggering diagnosis execution)

## Setup

### 1. Install New Dependency

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### 2. Verify Existing Dependencies

The following should already be in `package.json`:
```json
{
  "react-markdown": "9.0.1",
  "remark-gfm": "4.0.0",
  "mermaid": "10.9.0"
}
```

## Development

### Start Dev Server

```bash
npm run dev
```

Navigate to `http://localhost:3000/diagnosis?topologyId=<your-topology-id>`

### Test Markdown Rendering

1. Select a topology with bound agents
2. Enter a query that will trigger markdown-formatted responses
3. Verify:
   - Headers render with appropriate sizing
   - Code blocks have syntax highlighting
   - Lists render with proper indentation
   - Tables render with borders

### Test Mermaid Diagrams

Sample query to trigger mermaid output:
```
Analyze the system architecture and provide a flowchart diagram showing the main components and their interactions.
```

Or manually test by modifying agent response in dev tools.

### Test Streaming

1. Trigger a long-running diagnosis
2. Watch content stream in progressively
3. Verify:
   - Markdown formatting applies as content arrives
   - Streaming cursor appears at end of content
   - No visual glitches or layout shifts

## File Structure After Implementation

```
components/
├── LogStream.tsx              # Modified - uses MarkdownContent
└── markdown/                  # New directory
    ├── MarkdownContent.tsx    # Main renderer
    ├── MermaidDiagram.tsx     # Mermaid diagram component
    └── CodeBlock.tsx          # Syntax-highlighted code block
```

## Validation Checklist

- [ ] `npm run build` succeeds without errors
- [ ] `npm run lint` passes
- [ ] Markdown headings (H1-H6) render correctly
- [ ] Bold and italic text render correctly
- [ ] Code blocks have syntax highlighting
- [ ] Mermaid diagrams render as SVG
- [ ] Invalid mermaid shows error + raw code
- [ ] Links open in new tab
- [ ] Tables render with borders
- [ ] Streaming cursor works during SSE
- [ ] Dark theme consistent with app
- [ ] No XSS when rendering `<script>` in content
