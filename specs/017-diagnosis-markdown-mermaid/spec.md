# Feature Specification: Diagnosis Message Markdown & Mermaid Support

**Feature Branch**: `017-diagnosis-markdown-mermaid`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "在诊断页面的消息展示区域中，展示消息的气泡要能支持markdown语法，支持mermaid语法等"

## Clarifications

### Session 2025-12-31

- Q: Which syntax highlighting library should be used for code blocks? → A: Use `react-syntax-highlighter` with Prism
- Q: How should hyperlinks in markdown content behave when clicked? → A: Open in new tab (`target="_blank"` with `rel="noopener"`)
- Q: How should oversized Mermaid diagrams be handled? → A: Constrain to max-height with scrollable overflow

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Render Markdown in Agent Messages (Priority: P1)

As a user viewing diagnosis results, I want agent response messages to render Markdown formatting (headings, lists, code blocks, links, etc.) so that the content is more readable and well-structured.

**Why this priority**: This is the core functionality that enables rich text rendering. Without Markdown support, all other formatting features are meaningless.

**Independent Test**: Can be fully tested by triggering an execution where an agent returns markdown-formatted text (e.g., lists, code blocks, bold text) and verifying proper rendering.

**Acceptance Scenarios**:

1. **Given** a log message containing `# Heading` text, **When** the message is displayed, **Then** the text is rendered as an H1 heading with appropriate styling.
2. **Given** a log message containing `**bold**` and `*italic*` text, **When** the message is displayed, **Then** the text renders with bold and italic formatting.
3. **Given** a log message containing a code block with triple backticks, **When** the message is displayed, **Then** the code is rendered in a monospace font with syntax highlighting and a distinct background.
4. **Given** a log message containing a bulleted or numbered list, **When** the message is displayed, **Then** the list renders with proper indentation and markers.
5. **Given** a log message containing a Markdown table, **When** the message is displayed, **Then** the table renders with proper columns and borders.

---

### User Story 2 - Render Mermaid Diagrams (Priority: P2)

As a user viewing diagnosis results, I want Mermaid diagram code blocks to render as interactive diagrams so that I can visualize system architecture, flowcharts, and sequences produced by agents.

**Why this priority**: Mermaid support enables visual representation of complex information that agents may produce during analysis, significantly improving comprehension.

**Independent Test**: Can be tested by triggering an execution where an agent returns a mermaid code block (e.g., flowchart or sequence diagram) and verifying it renders as a visual diagram.

**Acceptance Scenarios**:

1. **Given** a log message containing a ````mermaid` code block with flowchart syntax, **When** the message is displayed, **Then** a rendered flowchart diagram appears instead of raw code.
2. **Given** a log message containing a ````mermaid` code block with sequence diagram syntax, **When** the message is displayed, **Then** a rendered sequence diagram appears.
3. **Given** a Mermaid code block with invalid syntax, **When** the message is displayed, **Then** an error indicator appears with the raw code visible for debugging.

---

### User Story 3 - Code Block Syntax Highlighting (Priority: P2)

As a user viewing agent responses with code snippets, I want code blocks to have syntax highlighting appropriate to the language so that code is easier to read and understand.

**Why this priority**: Agents frequently share code snippets in various languages. Syntax highlighting dramatically improves readability.

**Independent Test**: Can be tested by displaying a message with code blocks in different languages (JavaScript, Python, JSON) and verifying appropriate syntax highlighting.

**Acceptance Scenarios**:

1. **Given** a code block tagged with ````javascript`, **When** the message is displayed, **Then** JavaScript syntax highlighting is applied (keywords, strings, comments colored appropriately).
2. **Given** a code block tagged with ````json`, **When** the message is displayed, **Then** JSON syntax highlighting is applied.
3. **Given** a code block with no language tag, **When** the message is displayed, **Then** the code renders with monospace font but no syntax highlighting.

---

### User Story 4 - Streaming Content Markdown Rendering (Priority: P3)

As a user watching live agent output, I want Markdown to render progressively during SSE streaming so that the content remains readable even while it's being received.

**Why this priority**: The diagnosis page receives streaming content via SSE. Markdown rendering should not break or flicker excessively during streaming.

**Independent Test**: Can be tested by triggering a long-running execution and observing that markdown formatting applies progressively without visual glitches.

**Acceptance Scenarios**:

1. **Given** streaming content that includes a partial code block (e.g., opening ``` received but not yet closed), **When** viewing the stream, **Then** the partial content displays gracefully without breaking the layout.
2. **Given** streaming content building up a markdown list, **When** each list item streams in, **Then** the list renders progressively with proper formatting.

---

### Edge Cases

- What happens when Markdown contains XSS payloads (e.g., `<script>` tags)? → Must sanitize HTML output.
- What happens when a Mermaid diagram is extremely large? → Constrain to max-height (e.g., 400px) with scrollable overflow container.
- What happens when Markdown contains deeply nested elements? → Should render correctly with reasonable nesting limits.
- How do inline code (single backticks) vs code blocks (triple backticks) render differently? → Inline code should render inline, code blocks should render as blocks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render Markdown syntax in log message content using react-markdown library.
- **FR-002**: System MUST support GitHub Flavored Markdown (GFM) including tables, task lists, and strikethrough via remark-gfm plugin.
- **FR-003**: System MUST render code blocks with syntax highlighting using `react-syntax-highlighter` with Prism theme.
- **FR-004**: System MUST detect mermaid code blocks (````mermaid`) and render them as visual diagrams using the mermaid library.
- **FR-005**: System MUST handle Mermaid rendering errors gracefully, showing error message and raw code as fallback.
- **FR-006**: System MUST sanitize rendered HTML to prevent XSS attacks (no script execution, no dangerous attributes).
- **FR-007**: System MUST maintain visual consistency with existing dark theme styling (slate-900 backgrounds, cyan/purple accents).
- **FR-008**: System MUST preserve the streaming cursor indicator at the end of streaming content while rendering Markdown.
- **FR-009**: System MUST apply Markdown rendering to the `log.content` field in LogItem component.
- **FR-010**: System SHOULD also apply Markdown rendering to the `log.reasoning` field (collapsible thinking section).
- **FR-011**: System MUST render hyperlinks to open in a new tab (`target="_blank"` with `rel="noopener noreferrer"`) to prevent navigation away from the diagnosis session.
- **FR-012**: System MUST constrain Mermaid diagram containers to a max-height (e.g., 400px) with scrollable overflow to prevent oversized diagrams from disrupting layout.

### Key Entities *(include if feature involves data)*

- **LogMessage.content**: Main message text that will be parsed and rendered as Markdown.
- **LogMessage.reasoning**: Optional thinking/reasoning text that may also contain Markdown.
- **MermaidBlock**: A code block with `mermaid` language tag that should render as a diagram.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All standard Markdown elements (headings, lists, code blocks, links, bold, italic, tables) render correctly in log messages.
- **SC-002**: Mermaid diagrams render as visual SVG diagrams within message bubbles.
- **SC-003**: No XSS vulnerabilities introduced through Markdown rendering (validated via security review of sanitization).
- **SC-004**: Streaming content with partial Markdown does not cause visual glitches or layout breaking.
- **SC-005**: Rendered Markdown maintains visual consistency with existing dark theme (no jarring white backgrounds or mismatched fonts).
