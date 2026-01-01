# Quickstart: Diagnosis Page SSE Stream Refactor

**Feature**: 016-diagnosis-sse-refactor
**Date**: 2025-12-31

## Overview

This guide provides a quick reference for implementing the SSE event format refactor for the diagnosis page.

## Key Changes

### 1. Type Definitions (`services/api/types.ts`)

Add new types for the structured event format:

```typescript
// New ExecutorEvent types
interface ExecutorEvent {
  run_id: string;
  timestamp: string;
  sequence: number;
  source: EventSource | null;
  event: { category: EventCategory; action: string };
  data: Record<string, unknown>;
}

interface EventSource {
  agent_id: string;
  agent_type: 'global_supervisor' | 'team_supervisor' | 'worker';
  agent_name: string;
  team_name: string | null;
}

type EventCategory = 'lifecycle' | 'llm' | 'dispatch' | 'system';
```

### 2. Event Parsing (`services/hooks/useExecution.ts`)

Update SSE parsing to handle new format:

```typescript
// Parse SSE line
if (line.startsWith('data:')) {
  const event: ExecutorEvent = JSON.parse(line.slice(5).trim());

  // Extract run_id from first event
  if (!runId && event.run_id) {
    setRunId(event.run_id);
  }

  // Handle by category.action
  const eventKey = `${event.event.category}.${event.event.action}`;
  handleEvent(eventKey, event);
}
```

### 3. Agent Identification (`components/DiagnosisView.tsx`)

Simplify agent identification using `source.agent_type`:

```typescript
function getAgentIdentifier(event: ExecutorEvent): { id: string; name: string } {
  const { source } = event;

  if (!source) {
    return { id: 'system', name: 'System' };
  }

  switch (source.agent_type) {
    case 'global_supervisor':
      return { id: 'global-supervisor', name: 'Global Supervisor' };

    case 'team_supervisor':
      return {
        id: `team-supervisor-${source.team_name}`,
        name: `${source.team_name} Supervisor`
      };

    case 'worker':
      return {
        id: `worker-${source.team_name}-${source.agent_name}`,
        name: source.agent_name
      };

    default:
      return { id: 'unknown', name: source.agent_name || 'Unknown' };
  }
}
```

### 4. Message Aggregation

Update aggregation to handle reasoning events:

```typescript
function aggregateEventsToLogs(events: ExecutorEvent[], isExecuting: boolean): LogMessage[] {
  // Group by agent
  // Append llm.stream content to main content
  // Append llm.reasoning thought to reasoning field
  // Track tool calls from llm.tool_call and llm.tool_result
}
```

## Testing Checklist

- [ ] Global Supervisor messages display correctly
- [ ] Team Supervisor messages show "[Team] Supervisor" format
- [ ] Worker messages show worker name
- [ ] Consecutive llm.stream events aggregate into single bubble
- [ ] llm.reasoning events appear in collapsible section
- [ ] lifecycle events show appropriate status
- [ ] Malformed events don't crash the UI
- [ ] run_id captured for cancellation

## File Locations

| File | Purpose |
|------|---------|
| `services/api/types.ts` | Type definitions |
| `services/hooks/useExecution.ts` | SSE parsing logic |
| `components/DiagnosisView.tsx` | UI rendering and aggregation |
