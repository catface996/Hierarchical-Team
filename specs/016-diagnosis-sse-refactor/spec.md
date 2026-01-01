# Feature Specification: Diagnosis Page SSE Stream Refactor

**Feature Branch**: `016-diagnosis-sse-refactor`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "Refactor diagnosis page real-time message display to align with new SSE event format from backend (042-refactor-executor-integration)"

## Clarifications

### Session 2025-12-31

- Q: How should `llm.reasoning` events be displayed in the UI? → A: Display in collapsible "Thinking..." section within agent bubble

## Overview

The diagnosis page displays real-time collaboration messages from multi-agent execution. The backend has refactored the SSE event format with a new structured payload that includes:
- Standardized event categories and actions (`lifecycle`, `llm`, `dispatch`, `system`)
- Unified `source` object with agent identification (`agent_id`, `agent_type`, `agent_name`, `team_name`)
- The `agent_id` now represents the **binding relationship ID** (agent_bound.id), not the Agent table primary key

This refactor updates the frontend to consume the new event format and display messages correctly.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Real-time Agent Messages (Priority: P1)

As a user monitoring a multi-agent diagnosis execution, I want to see real-time messages from agents displayed in separate chat bubbles based on their identity, so I can follow the execution flow and understand which agent is producing each output.

**Why this priority**: This is the core functionality - without correct message attribution and display, the diagnosis page is unusable.

**Independent Test**: Start a diagnosis execution and verify that messages from Global Supervisor, Team Supervisors, and Workers appear in correctly labeled chat bubbles with proper agent names.

**Acceptance Scenarios**:

1. **Given** a diagnosis execution is running, **When** the Global Supervisor produces output, **Then** the message appears in a chat bubble labeled "Global Supervisor"
2. **Given** a diagnosis execution is running, **When** a Team Supervisor produces output, **Then** the message appears in a chat bubble labeled "[Team Name] Supervisor"
3. **Given** a diagnosis execution is running, **When** a Worker produces output, **Then** the message appears in a chat bubble labeled with the worker's name
4. **Given** SSE events arrive with `llm.stream` category, **When** tokens are received, **Then** they are aggregated and displayed in real-time in the correct agent's bubble

---

### User Story 2 - View Execution Lifecycle Events (Priority: P2)

As a user, I want to see when execution starts, completes, fails, or is cancelled, so I can understand the current state of the diagnosis.

**Why this priority**: Lifecycle awareness is essential for user confidence but secondary to message display.

**Independent Test**: Trigger diagnosis execution and verify lifecycle events (started, completed, failed, cancelled) are properly displayed.

**Acceptance Scenarios**:

1. **Given** a diagnosis is triggered, **When** the `lifecycle.started` event arrives, **Then** the UI shows execution has begun
2. **Given** a diagnosis is running, **When** the `lifecycle.completed` event arrives, **Then** the UI shows execution is complete with summary
3. **Given** a diagnosis is running, **When** the `lifecycle.failed` event arrives, **Then** the UI shows an error message
4. **Given** a diagnosis is running, **When** the `lifecycle.cancelled` event arrives, **Then** the UI shows execution was cancelled

---

### User Story 3 - View Dispatch Events (Priority: P3)

As a user, I want to see when the Global Supervisor dispatches tasks to teams or workers, so I can understand the delegation flow.

**Why this priority**: Provides visibility into agent coordination but not critical for basic functionality.

**Independent Test**: Run a diagnosis that involves team/worker dispatch and verify dispatch events are displayed.

**Acceptance Scenarios**:

1. **Given** Global Supervisor is coordinating, **When** a `dispatch.team` event arrives, **Then** the UI shows which team was assigned and the task
2. **Given** Team Supervisor is coordinating, **When** a `dispatch.worker` event arrives, **Then** the UI shows which worker was assigned and the task

---

### Edge Cases

- What happens when SSE connection drops mid-execution? → Display connection error and allow reconnection
- What happens when events arrive out of order? → Use `sequence` field to reorder if needed
- What happens when `source` fields are missing? → Fall back to "System" label with warning logged
- What happens when `agent_type` is unrecognized? → Display with agent_name only

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse SSE events using the new structured format with `run_id`, `timestamp`, `sequence`, `source`, `event`, and `data` fields
- **FR-002**: System MUST identify agents using `source.agent_type` field: `global_supervisor`, `team_supervisor`, or `worker`
- **FR-003**: System MUST display agent name from `source.agent_name` field
- **FR-004**: System MUST display team context from `source.team_name` field for team supervisors and workers
- **FR-005**: System MUST aggregate `llm.stream` events from the same agent into a single chat bubble
- **FR-006**: System MUST handle all event categories: `lifecycle`, `llm`, `dispatch`, `system`
- **FR-007**: System MUST handle all `llm` actions: `stream`, `reasoning`, `tool_call`, `tool_result`
- **FR-007a**: System MUST display `llm.reasoning` events in a collapsible "Thinking..." section within the agent's chat bubble
- **FR-008**: System MUST handle all `lifecycle` actions: `started`, `completed`, `failed`, `cancelled`
- **FR-009**: System MUST store `run_id` from events for potential cancellation operations
- **FR-010**: System MUST gracefully handle missing or malformed events without crashing

### Key Entities

- **ExecutorEvent**: The root SSE event payload containing run_id, timestamp, sequence, source, event type, and data
- **EventSource**: Agent identification with agent_id (binding ID), agent_type, agent_name, and team_name
- **EventType**: Category and action pair defining the event type (e.g., `llm.stream`, `lifecycle.completed`)
- **LogMessage**: Frontend representation of a chat bubble with agent info, content, type, and streaming state

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All SSE events from new format are correctly parsed and displayed within 100ms of receipt
- **SC-002**: Agent messages are correctly attributed to Global Supervisor, Team Supervisor, or Worker based on `source.agent_type`
- **SC-003**: Team context is displayed for Team Supervisors (as "[TeamName] Supervisor") and Workers
- **SC-004**: Consecutive `llm.stream` tokens from the same agent appear in a single aggregated chat bubble
- **SC-005**: Lifecycle events (started, completed, failed, cancelled) are visually distinguished from content messages
- **SC-006**: Zero console errors during normal execution with valid SSE events
- **SC-007**: System gracefully handles malformed events without interrupting the stream

## Assumptions

- Backend SSE endpoint remains at the same URL path
- The `source` object is always present in events (except possibly `lifecycle.started`)
- Event sequence numbers are monotonically increasing per run
- The binding relationship ID (`source.agent_id`) does not need to be resolved for basic display (agent_name is sufficient)
