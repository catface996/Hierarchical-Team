# Data Model: Diagnosis Page SSE Stream Refactor

**Feature**: 016-diagnosis-sse-refactor
**Date**: 2025-12-31

## Entity Definitions

### ExecutorEvent (New - replaces ExecutionEvent for SSE parsing)

The root SSE event payload from the backend.

```typescript
interface ExecutorEvent {
  /** Unique execution run identifier */
  run_id: string;

  /** Event timestamp (ISO 8601) */
  timestamp: string;

  /** Sequence number for ordering events */
  sequence: number;

  /** Agent source information */
  source: EventSource;

  /** Event type (category + action) */
  event: EventType;

  /** Event-specific data payload */
  data: EventData;
}
```

**Validation Rules**:
- `run_id`: Required, non-empty string
- `timestamp`: Required, valid ISO 8601 format
- `sequence`: Required, non-negative integer
- `source`: Required for all events except `lifecycle.started`
- `event`: Required, must contain valid category and action

### EventSource

Agent identification within an event.

```typescript
interface EventSource {
  /** Binding relationship ID (agent_bound.id) - NOT agent table PK */
  agent_id: string;

  /** Agent type in hierarchy */
  agent_type: AgentType;

  /** Display name for the agent */
  agent_name: string;

  /** Team name (null for global_supervisor) */
  team_name: string | null;
}

type AgentType = 'global_supervisor' | 'team_supervisor' | 'worker';
```

**Validation Rules**:
- `agent_id`: Required, non-empty string
- `agent_type`: Required, must be one of the valid values
- `agent_name`: Required, non-empty string
- `team_name`: Required for `team_supervisor` and `worker`, null for `global_supervisor`

### EventType

Event category and action pair.

```typescript
interface EventType {
  /** Event category */
  category: EventCategory;

  /** Action within category */
  action: string;
}

type EventCategory = 'lifecycle' | 'llm' | 'dispatch' | 'system';
```

**Valid Category-Action Combinations**:

| Category | Actions |
|----------|---------|
| `lifecycle` | `started`, `completed`, `failed`, `cancelled` |
| `llm` | `stream`, `reasoning`, `tool_call`, `tool_result` |
| `dispatch` | `team`, `worker` |
| `system` | `topology`, `warning`, `error` |

### EventData (Union Type)

Event-specific data payloads.

```typescript
// Lifecycle events
interface LifecycleStartedData {}
interface LifecycleCompletedData { summary: string; }
interface LifecycleFailedData { error: string; }
interface LifecycleCancelledData {}

// LLM events
interface LlmStreamData { content: string; }
interface LlmReasoningData { thought: string; }
interface LlmToolCallData { tool: string; args: Record<string, unknown>; }
interface LlmToolResultData { tool: string; result: unknown; }

// Dispatch events
interface DispatchTeamData { team_name: string; task: string; }
interface DispatchWorkerData { worker_name: string; task: string; }

// System events
interface SystemTopologyData { hierarchy: Record<string, unknown>; }
interface SystemWarningData { message: string; }
interface SystemErrorData { message: string; code: string; }

type EventData =
  | LifecycleStartedData | LifecycleCompletedData | LifecycleFailedData | LifecycleCancelledData
  | LlmStreamData | LlmReasoningData | LlmToolCallData | LlmToolResultData
  | DispatchTeamData | DispatchWorkerData
  | SystemTopologyData | SystemWarningData | SystemErrorData;
```

### LogMessage (Updated)

Frontend representation of a chat bubble.

```typescript
interface LogMessage {
  /** Unique message ID */
  id: string;

  /** Timestamp (Unix ms) */
  timestamp: number;

  /** Agent identifier (for grouping) */
  fromAgentId: string;

  /** Agent display name */
  fromAgentName: string;

  /** Main content text */
  content: string;

  /** Message type for styling */
  type: LogMessageType;

  /** Whether content is still streaming */
  isStreaming: boolean;

  /** Collapsible reasoning content (NEW) */
  reasoning?: string;

  /** Tool calls within this message (NEW) */
  toolCalls?: ToolCallInfo[];
}

type LogMessageType = 'thought' | 'instruction' | 'report' | 'system';

interface ToolCallInfo {
  tool: string;
  args: Record<string, unknown>;
  result?: unknown;
}
```

## Entity Relationships

```
ExecutorEvent
    │
    ├──> EventSource (1:1, required except lifecycle.started)
    │       └── agent_type determines display format
    │
    ├──> EventType (1:1, required)
    │       └── category.action determines data shape
    │
    └──> EventData (1:1, varies by event type)

Multiple ExecutorEvents aggregate into:
    │
    └──> LogMessage (N:1 for same agent's consecutive events)
            └── reasoning field populated from llm.reasoning events
            └── toolCalls populated from llm.tool_call + llm.tool_result
```

## State Transitions

### Execution State Machine

```
IDLE ──(trigger)──> EXECUTING
         │
         ├──(lifecycle.started)──> RUNNING
         │         │
         │         ├──(lifecycle.completed)──> COMPLETED
         │         │
         │         ├──(lifecycle.failed)──> FAILED
         │         │
         │         └──(lifecycle.cancelled)──> CANCELLED
         │
         └──(connection error)──> ERROR
```

### Log Message Aggregation

```
New Event Arrives
       │
       ├── Same agent as current log?
       │       │
       │       YES ──> Append to current log content
       │       │
       │       NO ──> Finalize current log, start new log
       │
       └── Is llm.reasoning event?
               │
               YES ──> Append to current log's reasoning field
               │
               NO ──> Append to content field
```
