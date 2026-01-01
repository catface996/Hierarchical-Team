# SSE Events Contract

**Feature**: 016-diagnosis-sse-refactor
**Date**: 2025-12-31
**Source**: Backend spec 042-refactor-executor-integration

## Endpoint

```
POST /api/service/v1/executions/trigger
Accept: text/event-stream
Content-Type: application/json
```

## Request

```json
{
  "topologyId": 123,
  "userMessage": "Analyze system state and health status."
}
```

## SSE Stream Format

```
event: {category}.{action}
data: {JSON payload}

```

## Event Payloads

### Lifecycle Events

#### lifecycle.started

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:00:00Z",
  "sequence": 1,
  "source": null,
  "event": {
    "category": "lifecycle",
    "action": "started"
  },
  "data": {}
}
```

#### lifecycle.completed

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:05:00Z",
  "sequence": 100,
  "source": {
    "agent_id": "10",
    "agent_type": "global_supervisor",
    "agent_name": "Global Supervisor",
    "team_name": null
  },
  "event": {
    "category": "lifecycle",
    "action": "completed"
  },
  "data": {
    "summary": "Diagnosis completed successfully. Found 2 warnings, 0 critical issues."
  }
}
```

#### lifecycle.failed

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:05:00Z",
  "sequence": 50,
  "source": {
    "agent_id": "10",
    "agent_type": "global_supervisor",
    "agent_name": "Global Supervisor",
    "team_name": null
  },
  "event": {
    "category": "lifecycle",
    "action": "failed"
  },
  "data": {
    "error": "Connection timeout to database cluster"
  }
}
```

#### lifecycle.cancelled

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:03:00Z",
  "sequence": 30,
  "source": null,
  "event": {
    "category": "lifecycle",
    "action": "cancelled"
  },
  "data": {}
}
```

### LLM Events

#### llm.stream

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:01:00Z",
  "sequence": 10,
  "source": {
    "agent_id": "10",
    "agent_type": "global_supervisor",
    "agent_name": "Global Supervisor",
    "team_name": null
  },
  "event": {
    "category": "llm",
    "action": "stream"
  },
  "data": {
    "content": "Analyzing topology structure..."
  }
}
```

#### llm.reasoning

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:01:05Z",
  "sequence": 11,
  "source": {
    "agent_id": "10",
    "agent_type": "global_supervisor",
    "agent_name": "Global Supervisor",
    "team_name": null
  },
  "event": {
    "category": "llm",
    "action": "reasoning"
  },
  "data": {
    "thought": "I should check the database cluster first as it's the most critical component."
  }
}
```

#### llm.tool_call

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:01:10Z",
  "sequence": 12,
  "source": {
    "agent_id": "20",
    "agent_type": "worker",
    "agent_name": "Database Monitor",
    "team_name": "Payment Gateway"
  },
  "event": {
    "category": "llm",
    "action": "tool_call"
  },
  "data": {
    "tool": "check_database_status",
    "args": {
      "host": "db-cluster-01",
      "timeout": 30
    }
  }
}
```

#### llm.tool_result

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:01:15Z",
  "sequence": 13,
  "source": {
    "agent_id": "20",
    "agent_type": "worker",
    "agent_name": "Database Monitor",
    "team_name": "Payment Gateway"
  },
  "event": {
    "category": "llm",
    "action": "tool_result"
  },
  "data": {
    "tool": "check_database_status",
    "result": {
      "status": "healthy",
      "connections": 45,
      "latency_ms": 12
    }
  }
}
```

### Dispatch Events

#### dispatch.team

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:01:20Z",
  "sequence": 14,
  "source": {
    "agent_id": "10",
    "agent_type": "global_supervisor",
    "agent_name": "Global Supervisor",
    "team_name": null
  },
  "event": {
    "category": "dispatch",
    "action": "team"
  },
  "data": {
    "team_name": "Payment Gateway",
    "task": "Check database cluster health and connection pool status"
  }
}
```

#### dispatch.worker

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:01:25Z",
  "sequence": 15,
  "source": {
    "agent_id": "15",
    "agent_type": "team_supervisor",
    "agent_name": "Payment Gateway Supervisor",
    "team_name": "Payment Gateway"
  },
  "event": {
    "category": "dispatch",
    "action": "worker"
  },
  "data": {
    "worker_name": "Database Monitor",
    "task": "Execute database health check"
  }
}
```

### System Events

#### system.warning

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:02:00Z",
  "sequence": 20,
  "source": {
    "agent_id": "20",
    "agent_type": "worker",
    "agent_name": "Database Monitor",
    "team_name": "Payment Gateway"
  },
  "event": {
    "category": "system",
    "action": "warning"
  },
  "data": {
    "message": "Connection pool utilization at 85%, approaching threshold"
  }
}
```

#### system.error

```json
{
  "run_id": "uuid-string",
  "timestamp": "2025-12-31T10:02:30Z",
  "sequence": 25,
  "source": {
    "agent_id": "20",
    "agent_type": "worker",
    "agent_name": "Database Monitor",
    "team_name": "Payment Gateway"
  },
  "event": {
    "category": "system",
    "action": "error"
  },
  "data": {
    "message": "Failed to connect to replica node",
    "code": "DB_CONNECTION_FAILED"
  }
}
```

## Cancel Endpoint

```
POST /api/service/v1/executions/cancel
Content-Type: application/json
```

### Request

```json
{
  "runId": "uuid-string"
}
```

### Response (Success)

```json
{
  "code": "SUCCESS",
  "message": "Execution cancelled",
  "data": {
    "type": "cancelled",
    "runId": "uuid-string",
    "content": "Execution was cancelled by user",
    "timestamp": "2025-12-31T10:03:00Z"
  }
}
```

### Response (Failure)

```json
{
  "code": "CANCEL_FAILED",
  "message": "Execution already completed",
  "data": null
}
```
