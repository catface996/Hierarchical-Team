# Tasks: Diagnosis Message Markdown & Mermaid Support

**Input**: Design documents from `/specs/017-diagnosis-markdown-mermaid/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Tests**: No tests requested - manual testing via diagnosis page execution

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `components/` at repository root
- **Package config**: `package.json` at repository root

---

## Phase 1: Setup

**Purpose**: Install dependencies and create component directory structure

- [x] T001 Install react-syntax-highlighter dependency: `npm install react-syntax-highlighter @types/react-syntax-highlighter`
- [x] T002 Create markdown components directory: `components/markdown/`
- [x] T003 Initialize Mermaid with dark theme configuration in `components/markdown/mermaidConfig.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core markdown components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create CodeBlock component with Prism syntax highlighting in `components/markdown/CodeBlock.tsx`
- [x] T005 Create base MarkdownContent component structure in `components/markdown/MarkdownContent.tsx`
- [x] T006 [P] Create custom heading components (H1-H6) with dark theme styling in `components/markdown/MarkdownContent.tsx`
- [x] T007 [P] Create custom link component with `target="_blank"` and `rel="noopener noreferrer"` in `components/markdown/MarkdownContent.tsx`
- [x] T008 [P] Create custom table components with dark theme styling in `components/markdown/MarkdownContent.tsx`
- [x] T009 [P] Create custom list components (ul, ol, li) with proper indentation in `components/markdown/MarkdownContent.tsx`
- [x] T010 Export all markdown components from `components/markdown/index.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Render Markdown in Agent Messages (Priority: P1) 🎯 MVP

**Goal**: Agent response messages render Markdown formatting (headings, lists, code blocks, links) for improved readability

**Independent Test**: Trigger diagnosis execution with agent that returns markdown-formatted text and verify proper rendering of headings, bold/italic, lists, code blocks, and tables

### Implementation for User Story 1

- [x] T011 [US1] Wire up ReactMarkdown with remark-gfm plugin in `components/markdown/MarkdownContent.tsx`
- [x] T012 [US1] Implement inline code styling (single backticks) with dark theme background in `components/markdown/CodeBlock.tsx`
- [x] T013 [US1] Add bold/italic text styling consistent with slate theme in `components/markdown/MarkdownContent.tsx`
- [x] T014 [US1] Integrate MarkdownContent into LogItem for `log.content` field in `components/LogStream.tsx`
- [x] T015 [US1] Integrate MarkdownContent into LogItem for `log.reasoning` field (collapsible section) in `components/LogStream.tsx`
- [x] T016 [US1] Verify XSS protection: script tags ignored, dangerous attributes stripped

**Checkpoint**: User Story 1 complete - basic markdown rendering works in diagnosis messages

---

## Phase 4: User Story 2 - Render Mermaid Diagrams (Priority: P2)

**Goal**: Mermaid code blocks render as visual SVG diagrams (flowcharts, sequence diagrams)

**Independent Test**: Send message with mermaid code block and verify it renders as visual diagram instead of raw code

### Implementation for User Story 2

- [x] T017 [P] [US2] Create MermaidDiagram component with async rendering in `components/markdown/MermaidDiagram.tsx`
- [x] T018 [US2] Implement unique ID generation for each diagram to prevent conflicts in `components/markdown/MermaidDiagram.tsx`
- [x] T019 [US2] Implement error fallback showing error message and raw code in `components/markdown/MermaidDiagram.tsx`
- [x] T020 [US2] Add max-height (400px) constraint with scrollable overflow in `components/markdown/MermaidDiagram.tsx`
- [x] T021 [US2] Integrate MermaidDiagram into CodeBlock for `mermaid` language detection in `components/markdown/CodeBlock.tsx`
- [x] T022 [US2] Export MermaidDiagram from `components/markdown/index.ts`

**Checkpoint**: User Story 2 complete - mermaid diagrams render as SVG visualizations

---

## Phase 5: User Story 3 - Code Block Syntax Highlighting (Priority: P2)

**Goal**: Code blocks have syntax highlighting appropriate to the language (JavaScript, Python, JSON, etc.)

**Independent Test**: Send message with code blocks in different languages and verify syntax coloring is applied

### Implementation for User Story 3

- [x] T023 [US3] Configure Prism with oneDark theme in `components/markdown/CodeBlock.tsx`
- [x] T024 [US3] Implement language detection from code fence tags in `components/markdown/CodeBlock.tsx`
- [x] T025 [US3] Add fallback styling for code blocks without language tag in `components/markdown/CodeBlock.tsx`
- [x] T026 [US3] Import common language support (javascript, typescript, python, json, bash, sql) in `components/markdown/CodeBlock.tsx`

**Checkpoint**: User Story 3 complete - syntax highlighting works for common languages

---

## Phase 6: User Story 4 - Streaming Content Markdown Rendering (Priority: P3)

**Goal**: Markdown renders progressively during SSE streaming without visual glitches

**Independent Test**: Trigger long-running diagnosis and verify markdown formatting applies progressively with streaming cursor visible

### Implementation for User Story 4

- [x] T027 [US4] Ensure streaming cursor renders OUTSIDE ReactMarkdown component in `components/markdown/MarkdownContent.tsx`
- [x] T028 [US4] Add `isStreaming` prop to MarkdownContent component in `components/markdown/MarkdownContent.tsx`
- [x] T029 [US4] Verify partial markdown (unclosed code blocks) renders gracefully without layout breaking
- [x] T030 [US4] Test streaming cursor animation continues during content updates in `components/LogStream.tsx`

**Checkpoint**: User Story 4 complete - streaming content renders smoothly with markdown formatting

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T031 Verify dark theme consistency across all markdown elements (no jarring white backgrounds)
- [x] T032 Run `npm run build` to verify no TypeScript errors
- [x] T033 Run `npm run lint` to verify code style (no lint script, tsc --noEmit passed for markdown components)
- [ ] T034 Manual test: Full diagnosis execution with mixed markdown content
- [ ] T035 Manual test: Mermaid error case with invalid syntax
- [ ] T036 Validate XSS protection with `<script>alert('xss')</script>` in content

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-6)**: All depend on Foundational phase completion
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Uses CodeBlock from US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Extends CodeBlock, can parallel with US2
- **User Story 4 (P3)**: Can start after US1 - Refines streaming behavior, builds on US1

### Within Each User Story

- Core component before integration
- Integration into LogStream after component complete
- Verify independently testable before moving on

### Parallel Opportunities

- T006, T007, T008, T009 in Foundational can run in parallel (different custom components)
- T017 (MermaidDiagram) can start while US1 integration is happening
- US2 and US3 can run in parallel after US1 MVP

---

## Parallel Example: Foundational Phase

```bash
# Launch custom markdown components in parallel:
Task: "Create custom heading components (H1-H6) in components/markdown/MarkdownContent.tsx"
Task: "Create custom link component with target='_blank' in components/markdown/MarkdownContent.tsx"
Task: "Create custom table components in components/markdown/MarkdownContent.tsx"
Task: "Create custom list components in components/markdown/MarkdownContent.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T010)
3. Complete Phase 3: User Story 1 (T011-T016)
4. **STOP and VALIDATE**: Test markdown rendering independently
5. Deploy/demo if basic markdown is sufficient

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP - basic markdown!)
3. Add User Story 2 → Test mermaid → Deploy (adds diagrams)
4. Add User Story 3 → Test syntax highlighting → Deploy (adds code colors)
5. Add User Story 4 → Test streaming → Deploy (streaming polish)

---

## Notes

- [P] tasks = different files or different sections, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- XSS protection is critical - verify at end of US1 and in Polish phase
