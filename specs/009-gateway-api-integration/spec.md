# Feature Specification: Gateway API Integration

**Feature Branch**: `009-gateway-api-integration`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "后端接口统一由网关来做转发，后端有四个服务，分别是service，tools，executor，和auth，目前，除auth外，其他服务的接口均通过网关来转发"

## Overview

Migrate frontend API calls from direct backend service connections to unified gateway routing. Currently, the frontend connects to multiple backend services directly (localhost:8080, localhost:7070). This feature consolidates all API calls through a single gateway endpoint (localhost:8888) which handles service routing internally.

### Backend Services (via Gateway)

| Service | Gateway Path Prefix | Description |
|---------|---------------------|-------------|
| service | `/api/service/v1/*` | Resources, Topologies, Nodes, Prompt Templates, Template Usages |
| tools | `/api/tools/v1/*` | Tool Categories, Tools, LLM Tool Integration |
| executor | `/api/executor/v1/*` | AI Models, Hierarchies, Runs |
| auth | Direct connection | Authentication (not routed through gateway yet) |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless API Access Through Gateway (Priority: P1)

Users continue to use all existing features (resource management, topology management, prompt templates, model management) without noticing any changes, but all API calls are now routed through the unified gateway.

**Why this priority**: This is the core functionality - all existing features must continue to work after the migration. Breaking existing functionality would make the application unusable.

**Independent Test**: Can be fully tested by using each existing feature (create/edit/delete resources, models, templates) and verifying successful API responses through gateway.

**Acceptance Scenarios**:

1. **Given** the frontend is configured for gateway routing, **When** a user creates a new resource, **Then** the request is sent to `localhost:8888/api/service/v1/...` and succeeds
2. **Given** the frontend is configured for gateway routing, **When** a user lists AI models, **Then** the request is sent to `localhost:8888/api/executor/v1/models/list` and returns the model list
3. **Given** the frontend is configured for gateway routing, **When** a user creates a prompt template, **Then** the request is sent to `localhost:8888/api/service/v1/prompt-templates/create` and succeeds

---

### User Story 2 - Consistent URL Structure Across Services (Priority: P1)

All API endpoints follow a consistent naming convention with service prefix, enabling clear identification of which backend service handles each request.

**Why this priority**: Consistent URL structure is essential for maintainability and debugging. Without it, developers cannot easily identify which service is handling requests.

**Independent Test**: Review all API calls in browser DevTools network tab and verify consistent URL patterns.

**Acceptance Scenarios**:

1. **Given** any API request is made, **When** observing the network request, **Then** the URL follows pattern `/api/{service}/v1/{module}/{action}`
2. **Given** resource-related requests are made, **When** observing URLs, **Then** they start with `/api/service/v1/`
3. **Given** model-related requests are made, **When** observing URLs, **Then** they start with `/api/executor/v1/`
4. **Given** tool-related requests are made, **When** observing URLs, **Then** they start with `/api/tools/v1/`

---

### User Story 3 - Single Proxy Configuration (Priority: P2)

Development environment requires only one proxy configuration pointing to the gateway, simplifying setup and reducing configuration complexity.

**Why this priority**: Reduces developer friction and eliminates multi-port proxy configuration errors. However, functionality comes first.

**Independent Test**: Verify vite.config.ts has single proxy entry and all features work.

**Acceptance Scenarios**:

1. **Given** the development server starts, **When** checking vite.config.ts, **Then** only one proxy target (localhost:8888) is configured
2. **Given** the gateway is running on port 8888, **When** starting the frontend dev server, **Then** all API calls are proxied to the gateway

---

### Edge Cases

- What happens when the gateway is unavailable? Error message should indicate network/gateway connection failure
- What happens when a backend service behind the gateway is down? Gateway returns appropriate error, frontend displays service-specific error
- How does the system handle API endpoints that haven't been migrated yet? Not applicable - all service/tools/executor endpoints are available

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST route all resource management API calls through `/api/service/v1/*` gateway path
- **FR-002**: System MUST route all topology management API calls through `/api/service/v1/*` gateway path
- **FR-003**: System MUST route all node management API calls through `/api/service/v1/*` gateway path
- **FR-004**: System MUST route all prompt template API calls through `/api/service/v1/*` gateway path
- **FR-005**: System MUST route all template usage API calls through `/api/service/v1/*` gateway path
- **FR-006**: System MUST route all model management API calls through `/api/executor/v1/*` gateway path
- **FR-007**: System MUST use single gateway host (localhost:8888 in development) for all API requests
- **FR-008**: System MUST maintain existing API response handling logic (data extraction, error handling)
- **FR-009**: System MUST preserve backward compatibility - all existing features continue to work identically
- **FR-010**: System MUST update Vite proxy configuration to use single gateway target

### API Endpoint Mapping

The following endpoint migrations are required:

**Service API (current → new)**:
| Current | New |
|---------|-----|
| `/api/v1/resources/*` | `/api/service/v1/resources/*` |
| `/api/v1/resource-types/*` | `/api/service/v1/resource-types/*` |
| `/api/v1/topologies/*` | `/api/service/v1/topologies/*` |
| `/api/v1/nodes/*` | `/api/service/v1/nodes/*` |
| `/api/v1/relationships/*` | `/api/service/v1/relationships/*` |
| `/api/v1/prompt-templates/*` | `/api/service/v1/prompt-templates/*` |
| `/api/v1/template-usages/*` | `/api/service/v1/template-usages/*` |

**Executor API (current → new)**:
| Current | New |
|---------|-----|
| `/api/v1/models/*` | `/api/executor/v1/models/*` |

### Key Entities

- **Gateway**: Single entry point that routes requests to appropriate backend services based on URL path prefix
- **Service Prefix**: The path segment (`/api/{service}/v1/`) that identifies the target backend service
- **Backend Service**: Individual services (service, tools, executor, auth) that handle specific domain functionality

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All existing features (resources, topologies, nodes, models, templates) work without user-visible changes
- **SC-002**: 100% of API requests are routed through the gateway (verifiable via browser DevTools)
- **SC-003**: Zero regression in existing functionality - all acceptance tests pass
- **SC-004**: Single proxy configuration in vite.config.ts (reduced from 2+ entries to 1)
- **SC-005**: No changes required to existing React hooks or components (only API service layer changes)

## Assumptions

- Gateway is available at localhost:8888 in development environment
- Gateway handles service routing based on URL path prefix internally
- Backend API response format remains unchanged
- Auth service integration will be addressed in a separate feature
- Tools service APIs are not yet integrated in the frontend (future feature)
