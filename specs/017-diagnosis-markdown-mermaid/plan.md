# Implementation Plan: Diagnosis Message Markdown & Mermaid Support

**Branch**: `017-diagnosis-markdown-mermaid` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-diagnosis-markdown-mermaid/spec.md`

## Summary

Add Markdown and Mermaid diagram rendering support to diagnosis page message bubbles. Agent responses containing markdown syntax (headings, lists, code blocks, tables) will render as formatted rich text. Code blocks tagged with `mermaid` will render as visual SVG diagrams. Implementation uses existing `react-markdown`, `remark-gfm`, and `mermaid` libraries already in the project, plus new `react-syntax-highlighter` for code highlighting.

## Technical Context

**Language/Version**: TypeScript 5.8.2, React 18.2.0
**Primary Dependencies**: react-markdown 9.0.1, remark-gfm 4.0.0, mermaid 10.9.0, react-syntax-highlighter (to add)
**Storage**: N/A (frontend-only, no persistence)
**Testing**: Manual testing via diagnosis page execution
**Target Platform**: Web browser (modern browsers)
**Project Type**: Web frontend (React SPA)
**Performance Goals**: Markdown rendering must not cause visible lag during SSE streaming
**Constraints**: Must integrate with existing LogStream component without breaking streaming cursor indicator
**Scale/Scope**: Single component modification (LogStream.tsx) + new MarkdownContent component

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. API Pagination Request Format | N/A | No API calls in this feature |
| II. API Pagination Response Format | N/A | No API calls in this feature |
| III. API Client Conventions | N/A | No API calls in this feature |
| IV. Pagination Controls UI Pattern | N/A | No pagination in this feature |
| V. Destructive Action Confirmation | N/A | No destructive actions |
| VI. Icon Consistency Standards | N/A | No icons added/modified |

**Gate Status**: ✅ PASS - This is a frontend-only rendering enhancement with no API or data model changes.

## Project Structure

### Documentation (this feature)

```text
specs/017-diagnosis-markdown-mermaid/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (minimal - no new data entities)
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
components/
├── LogStream.tsx           # MODIFY: Use MarkdownContent for log.content and log.reasoning
├── markdown/               # NEW: Markdown rendering components
│   ├── MarkdownContent.tsx # NEW: Main markdown renderer with react-markdown
│   ├── MermaidDiagram.tsx  # NEW: Mermaid diagram rendering component
│   └── CodeBlock.tsx       # NEW: Syntax-highlighted code block component
└── DiagnosisView.tsx       # NO CHANGE (uses LogStream)

package.json                # MODIFY: Add react-syntax-highlighter dependency
```

**Structure Decision**: Single project structure. New `components/markdown/` directory contains reusable markdown rendering components that can be used elsewhere in the application if needed.

## Complexity Tracking

> No constitution violations. This feature is a straightforward UI enhancement.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | - | - |
