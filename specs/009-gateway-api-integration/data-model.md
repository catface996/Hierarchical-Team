# Data Model: Gateway API Integration

**Feature**: 009-gateway-api-integration
**Date**: 2025-12-27

## Overview

This feature does not introduce new data models. It modifies URL routing configuration only.

## Entities Affected

### Configuration Changes Only

| Entity | Change Type | Description |
|--------|-------------|-------------|
| API Endpoint URLs | Modified | Path prefix changes from `/api/v1/` to `/api/{service}/v1/` |
| Vite Proxy Config | Modified | Single gateway target instead of multiple service targets |

## No Schema Changes

- **TypeScript types**: Unchanged (request/response DTOs remain identical)
- **API response format**: Unchanged (gateway is transparent proxy)
- **Data structures**: Unchanged (no new fields or entities)

## URL Path Schema

### Gateway Routing Pattern

```text
/api/{service}/v1/{module}/{action}

Where:
  - {service}: Backend service name (service, tools, executor)
  - {module}: Resource module (resources, topologies, nodes, models, etc.)
  - {action}: Operation (query, create, get, update, delete, etc.)
```

### Service Mapping

| Service | Path Prefix | Backend |
|---------|-------------|---------|
| service | `/api/service/v1/` | AIOps Service API |
| tools | `/api/tools/v1/` | AIOps Tools API |
| executor | `/api/executor/v1/` | Op-Stack Executor API |

## Validation Rules

No new validation rules. Existing validation remains in place:
- Request body validation handled by backend services
- Error responses unchanged (400, 401, 404, 409 status codes)
- TypeScript compile-time type checking for request payloads

## State Transitions

Not applicable - this feature modifies routing configuration, not business logic.
