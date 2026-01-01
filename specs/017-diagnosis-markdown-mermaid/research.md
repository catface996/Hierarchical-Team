# Research: Diagnosis Message Markdown & Mermaid Support

**Feature**: 017-diagnosis-markdown-mermaid
**Date**: 2025-12-31

## Technology Decisions

### 1. Markdown Rendering Library

**Decision**: Use existing `react-markdown` (v9.0.1) with `remark-gfm` (v4.0.0)

**Rationale**:
- Already installed in package.json - no new dependencies for core markdown
- react-markdown v9 is the latest major version with good React 18 support
- remark-gfm enables GitHub Flavored Markdown (tables, task lists, strikethrough)
- Well-documented and widely used in React projects

**Alternatives Considered**:
- `marked` + `dangerouslySetInnerHTML`: Rejected due to XSS risk without sanitization layer
- `markdown-it`: Would require additional React wrapper, no benefit over react-markdown

### 2. Syntax Highlighting Library

**Decision**: Add `react-syntax-highlighter` with Prism

**Rationale**:
- Best integration with react-markdown's custom component system
- Prism offers more themes than highlight.js including dark themes (e.g., `vscDarkPlus`, `oneDark`)
- Tree-shakeable - can import only needed language support
- TypeScript support included

**Alternatives Considered**:
- `rehype-highlight` with highlight.js: Lighter weight but fewer dark theme options
- CSS-only styling: No actual syntax highlighting, just monospace font

**Installation**:
```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### 3. Mermaid Integration Pattern

**Decision**: Use existing `mermaid` (v10.9.0) with dynamic rendering via useEffect

**Rationale**:
- Already installed in package.json
- Mermaid v10 has improved async rendering API (`mermaid.render`)
- Must render asynchronously to avoid blocking React render cycle
- Use unique IDs for each diagram to prevent conflicts

**Implementation Pattern**:
```tsx
// MermaidDiagram.tsx pattern
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const id = useRef(`mermaid-${Date.now()}-${Math.random()}`);

  useEffect(() => {
    mermaid.render(id.current, code)
      .then(({ svg }) => setSvg(svg))
      .catch((err) => setError(err.message));
  }, [code]);

  if (error) return <FallbackCodeBlock code={code} error={error} />;
  return <div dangerouslySetInnerHTML={{ __html: svg }} />;
};
```

### 4. XSS Sanitization Strategy

**Decision**: Rely on react-markdown's built-in sanitization + restrict dangerous elements

**Rationale**:
- react-markdown does NOT use `dangerouslySetInnerHTML` for user content by default
- Custom components for links, images provide control over attributes
- Mermaid SVG output is controlled by library, not user input directly

**Implementation**:
- Links: Always add `target="_blank"` and `rel="noopener noreferrer"`
- Images: Restrict to known protocols (http, https, data)
- Scripts: react-markdown ignores script tags by default
- No need for additional sanitization library (rehype-sanitize) for this use case

### 5. Dark Theme Styling

**Decision**: Use Prism `oneDark` theme + custom CSS overrides for consistency

**Rationale**:
- `oneDark` theme has colors close to existing slate-900 palette
- Custom CSS variables can override specific colors to match design system
- Mermaid supports dark theme configuration via `mermaid.initialize({ theme: 'dark' })`

**Theme Configuration**:
```tsx
// Prism theme import
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Mermaid dark theme
mermaid.initialize({
  theme: 'dark',
  themeVariables: {
    primaryColor: '#0ea5e9',      // cyan-500
    primaryTextColor: '#e2e8f0',  // slate-200
    primaryBorderColor: '#334155', // slate-700
    lineColor: '#475569',         // slate-600
    secondaryColor: '#1e293b',    // slate-800
    tertiaryColor: '#0f172a',     // slate-900
  }
});
```

### 6. Streaming Content Handling

**Decision**: Render markdown on every content update, accept re-render cost

**Rationale**:
- react-markdown is fast enough for typical message sizes
- Partial markdown (unclosed code blocks) renders gracefully as plain text
- No need for debouncing - React's reconciliation handles efficient updates
- Streaming cursor indicator appended after markdown content

**Implementation Notes**:
- The streaming cursor (`<span className="animate-pulse">`) is rendered OUTSIDE the ReactMarkdown component
- This avoids markdown parser interfering with cursor display
- Pattern: `<ReactMarkdown>{content}</ReactMarkdown>{isStreaming && <Cursor />}`

## Dependencies Summary

### Existing (no changes)
- `react-markdown`: 9.0.1
- `remark-gfm`: 4.0.0
- `mermaid`: 10.9.0

### New (to add)
- `react-syntax-highlighter`: ^15.5.0
- `@types/react-syntax-highlighter`: ^15.5.11

## Component Architecture

```
LogStream.tsx
└── LogItem
    ├── Main Content
    │   └── MarkdownContent (NEW)
    │       ├── ReactMarkdown
    │       │   ├── Custom heading components
    │       │   ├── Custom link component (target="_blank")
    │       │   ├── Custom code component
    │       │   │   ├── Inline code → <code> with styling
    │       │   │   └── Code block → CodeBlock or MermaidDiagram
    │       │   └── Custom table components
    │       └── Streaming cursor (conditional)
    │
    └── Reasoning Section (collapsible)
        └── MarkdownContent (reused)
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance lag on large markdown | Low | Medium | Test with 10KB+ content; consider virtualization if needed |
| Mermaid syntax errors break UI | Medium | Low | Graceful fallback to raw code display |
| Dark theme mismatch | Low | Low | Custom CSS overrides for consistency |
| Streaming cursor visual glitch | Medium | Low | Cursor rendered outside ReactMarkdown |
