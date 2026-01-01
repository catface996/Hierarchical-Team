# Research: Diagnosis Page SSE Stream Refactor

**Feature**: 016-diagnosis-sse-refactor
**Date**: 2025-12-31
**Status**: Complete

## Research Summary

All technical unknowns have been resolved based on the backend integration guide.

## 1. New SSE Event Format

**Decision**: Adopt the new `ExecutorEvent` structure with `source` object.

**Rationale**: The backend (042-refactor-executor-integration) has standardized the SSE event format with structured agent identification that provides clearer, more explicit agent attribution.

**Alternatives Considered**:
- Keep legacy `_is_global_supervisor` / `_team_name` fields → Rejected: Backend is removing these fields
- Hybrid approach supporting both formats → Rejected: Increases complexity, backend migration is complete

### New Event Structure

```typescript
interface ExecutorEvent {
  run_id: string;
  timestamp: string;  // ISO 8601
  sequence: number;   // For ordering
  source: EventSource;
  event: {
    category: string;  // lifecycle | llm | dispatch | system
    action: string;    // started | stream | tool_call | ...
  };
  data: Record<string, any>;
}

interface EventSource {
  agent_id: string;      // Binding relationship ID (agent_bound.id)
  agent_type: "global_supervisor" | "team_supervisor" | "worker";
  agent_name: string;
  team_name: string | null;
}
```

## 2. Event Categories and Actions

**Decision**: Support all documented event categories and actions.

**Rationale**: Full support ensures no loss of functionality during refactor.

| Category | Actions | UI Handling |
|----------|---------|-------------|
| `lifecycle` | `started`, `completed`, `failed`, `cancelled` | Status indicators, completion summary |
| `llm` | `stream`, `reasoning`, `tool_call`, `tool_result` | Chat bubbles, collapsible thinking section |
| `dispatch` | `team`, `worker` | Delegation flow visualization |
| `system` | `topology`, `warning`, `error` | System status messages |

## 3. Agent Identification Logic

**Decision**: Use `source.agent_type` as primary identification.

**Rationale**: The new format provides explicit type information rather than requiring content parsing or flag checking.

### Mapping

| `source.agent_type` | Display Name Format |
|---------------------|---------------------|
| `global_supervisor` | "Global Supervisor" |
| `team_supervisor` | "[team_name] Supervisor" |
| `worker` | `source.agent_name` |

## 4. Backward Compatibility

**Decision**: Remove legacy field handling after confirming backend migration is complete.

**Rationale**: The backend has fully migrated to the new format. Supporting legacy fields would add maintenance burden without benefit.

**Migration Path**:
1. Update TypeScript types to new format
2. Update parsing logic in `useExecution.ts`
3. Update agent identification in `DiagnosisView.tsx`
4. Remove legacy `_is_*` and `_team_name` fields from types

## 5. Error Handling

**Decision**: Graceful degradation with console warnings.

**Rationale**: Per FR-010, system must not crash on malformed events.

| Scenario | Handling |
|----------|----------|
| Missing `source` | Fall back to "System" label, log warning |
| Unknown `agent_type` | Display `agent_name` only |
| Malformed JSON | Skip event, log warning, continue stream |
| Missing required fields | Use defaults, log warning |

## 6. Collapsible Reasoning Display

**Decision**: Implement collapsible "Thinking..." section for `llm.reasoning` events.

**Rationale**: Per clarification session, reasoning events should be visible but not clutter the main output flow.

**Implementation Approach**:
- Extend `LogMessage` type with `reasoning?: string` field
- Render reasoning in collapsible section within chat bubble
- Default state: collapsed
