# API Contract: Gateway Routing

**Feature**: 009-gateway-api-integration
**Date**: 2025-12-27

## Gateway Configuration

### Development Environment

| Property | Value |
|----------|-------|
| Gateway Host | `localhost` |
| Gateway Port | `8888` |
| Protocol | HTTP |

### Production Environment

| Property | Value |
|----------|-------|
| Gateway Host | TBD (environment-specific) |
| Protocol | HTTPS |

## Service Routing Rules

The gateway routes requests based on URL path prefix to the appropriate backend service.

### Routing Table

| Path Prefix | Target Service | Description |
|-------------|---------------|-------------|
| `/api/service/v1/*` | AIOps Service | Resources, Topologies, Nodes, Prompt Templates |
| `/api/tools/v1/*` | AIOps Tools | Tool Categories, Tools, LLM Integration |
| `/api/executor/v1/*` | Op-Stack Executor | AI Models, Hierarchies, Runs |
| `/api/auth/*` | Auth Service | Authentication (future - not via gateway yet) |

## Endpoint Contracts

### Service API Endpoints

All endpoints use **POST** method with JSON request/response bodies.

#### Resources Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/service/v1/resources/query` | List resources with pagination |
| `POST /api/service/v1/resources/create` | Create new resource |
| `POST /api/service/v1/resources/get` | Get resource by ID |
| `POST /api/service/v1/resources/update` | Update resource |
| `POST /api/service/v1/resources/delete` | Delete resource |
| `POST /api/service/v1/resources/update-status` | Update resource status |
| `POST /api/service/v1/resource-types/query` | List resource types |
| `POST /api/service/v1/resources/audit-logs/query` | Query audit logs |

#### Topologies Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/service/v1/topologies/query` | List topologies |
| `POST /api/service/v1/topologies/create` | Create topology |
| `POST /api/service/v1/topologies/get` | Get topology details |
| `POST /api/service/v1/topologies/update` | Update topology |
| `POST /api/service/v1/topologies/delete` | Delete topology |
| `POST /api/service/v1/topologies/graph/query` | Get topology graph data |
| `POST /api/service/v1/topologies/members/query` | List topology members |
| `POST /api/service/v1/topologies/members/add` | Add members to topology |
| `POST /api/service/v1/topologies/members/remove` | Remove members from topology |

#### Nodes Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/service/v1/nodes/query` | List nodes with pagination |
| `POST /api/service/v1/nodes/create` | Create new node |
| `POST /api/service/v1/nodes/get` | Get node by ID |
| `POST /api/service/v1/nodes/update` | Update node |
| `POST /api/service/v1/nodes/delete` | Delete node |
| `POST /api/service/v1/nodes/types/query` | List node types |

#### Relationships Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/service/v1/relationships/create` | Create relationship |
| `POST /api/service/v1/relationships/update` | Update relationship |
| `POST /api/service/v1/relationships/delete` | Delete relationship |
| `POST /api/service/v1/relationships/resource/query` | Query resource relationships |
| `POST /api/service/v1/relationships/resource/cycle-detection` | Detect cycles |

#### Prompt Templates Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/service/v1/prompt-templates/list` | List templates |
| `POST /api/service/v1/prompt-templates/create` | Create template |
| `POST /api/service/v1/prompt-templates/detail` | Get template detail |
| `POST /api/service/v1/prompt-templates/update` | Update template |
| `POST /api/service/v1/prompt-templates/delete` | Delete template |
| `POST /api/service/v1/prompt-templates/rollback` | Rollback version |
| `POST /api/service/v1/prompt-templates/version/detail` | Get version detail |

#### Template Usages Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/service/v1/template-usages/list` | List usages |
| `POST /api/service/v1/template-usages/create` | Create usage |
| `POST /api/service/v1/template-usages/delete` | Delete usage |

### Executor API Endpoints

#### Models Module

| Endpoint | Description |
|----------|-------------|
| `POST /api/executor/v1/models/list` | List AI models |
| `POST /api/executor/v1/models/create` | Create model config |
| `POST /api/executor/v1/models/get` | Get model by ID |
| `POST /api/executor/v1/models/update` | Update model config |
| `POST /api/executor/v1/models/delete` | Delete model |

## Response Format

Gateway passes through backend responses unchanged.

### Success Response (200 OK)

```json
{
  "code": "0",
  "message": "success",
  "data": { ... }
}
```

### Created Response (201 Created)

Returns created object directly (no wrapper).

### Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Version conflict or duplicate |
| 500 | Internal Server Error |

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

## Authentication

Gateway handles authentication via Bearer token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

In development mode, frontend injects default `operatorId: 1` for requests.
