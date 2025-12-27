# Research: Gateway API Integration

**Feature**: 009-gateway-api-integration
**Date**: 2025-12-27

## Research Questions

### 1. Gateway URL Structure

**Question**: What is the correct URL path structure for each backend service through the gateway?

**Decision**: Use service-specific path prefixes:
- Service API: `/api/service/v1/{module}/{action}`
- Tools API: `/api/tools/v1/{module}/{action}`
- Executor API: `/api/executor/v1/{module}/{action}`

**Rationale**:
- Gateway at localhost:8888 routes requests based on URL path prefix
- Matches the OpenAPI docs structure observed:
  - http://localhost:8888/docs/service/v3/api-docs shows `/api/service/v1/*` paths
  - http://localhost:8888/docs/tools/v3/api-docs shows `/api/tools/v1/*` paths
  - http://localhost:8888/docs/executor/v3/api-docs shows `/api/executor/v1/*` paths

**Alternatives Considered**:
- Query parameter routing (`/api/v1?service=executor`) - Rejected: Not how gateway is configured
- Header-based routing - Rejected: More complex, gateway uses path-based routing

---

### 2. Current API Files Inventory

**Question**: Which API files need to be updated?

**Decision**: Update 6 API service files:

| File | Endpoints | New Prefix |
|------|-----------|------------|
| `services/api/resources.ts` | 8 endpoints | `/api/service/v1/` |
| `services/api/topology.ts` | 15 endpoints | `/api/service/v1/` |
| `services/api/nodes.ts` | 6 endpoints | `/api/service/v1/` |
| `services/api/prompt-templates.ts` | 7 endpoints | `/api/service/v1/` |
| `services/api/template-usages.ts` | 3 endpoints | `/api/service/v1/` |
| `services/api/models.ts` | 5 endpoints | `/api/executor/v1/` |

**Files NOT changed**:
- `services/api/client.ts` - HTTP client logic unchanged
- `services/api/types.ts` - TypeScript types unchanged
- `services/api/index.ts` - Exports unchanged
- All hooks in `services/hooks/` - No URL handling
- All components - No direct API calls

**Rationale**: Only endpoint constant definitions need updating. The HTTP client and all consumer code (hooks, components) remain unchanged.

---

### 3. Vite Proxy Configuration

**Question**: How should the Vite dev server proxy be configured?

**Decision**: Single proxy rule to gateway:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8888',
    changeOrigin: true,
    secure: false,
  },
}
```

**Rationale**:
- Gateway handles all service routing internally
- Simplifies development setup (one port to remember)
- Matches production deployment pattern

**Current Configuration** (to be replaced):
```typescript
proxy: {
  '/api/v1/models': {
    target: 'http://localhost:7070',
    // ...
  },
  '/api': {
    target: 'http://localhost:8080',
    // ...
  },
}
```

---

### 4. Migration Risk Assessment

**Question**: What are the risks and mitigation strategies?

**Decision**: Low-risk migration with simple rollback path.

**Risks Identified**:
1. **Endpoint typos** - Mitigated by: TypeScript compile-time checking, manual testing
2. **Gateway unavailable** - Mitigated by: Clear error messages, existing error handling
3. **Backend service changes** - Mitigated by: No backend changes needed, path routing only

**Rollback Strategy**:
- Revert `vite.config.ts` proxy changes
- Revert endpoint prefix changes in API files
- Git provides easy rollback capability

---

### 5. API Response Format

**Question**: Does the gateway change API response format?

**Decision**: No changes to response format.

**Rationale**:
- Gateway is transparent proxy - passes through responses unchanged
- Frontend `apiPost` function handles:
  - 201 Created: Returns response directly
  - 200 OK: Extracts `data` field from wrapper
  - Errors: Extracts `message` from error body
- No changes needed to response handling logic

---

## Endpoint Migration Reference

### resources.ts Endpoints

| Current | New |
|---------|-----|
| `/api/v1/resources/query` | `/api/service/v1/resources/query` |
| `/api/v1/resources/create` | `/api/service/v1/resources/create` |
| `/api/v1/resources/get` | `/api/service/v1/resources/get` |
| `/api/v1/resources/update` | `/api/service/v1/resources/update` |
| `/api/v1/resources/delete` | `/api/service/v1/resources/delete` |
| `/api/v1/resources/update-status` | `/api/service/v1/resources/update-status` |
| `/api/v1/resource-types/query` | `/api/service/v1/resource-types/query` |
| `/api/v1/resources/audit-logs/query` | `/api/service/v1/resources/audit-logs/query` |

### topology.ts Endpoints

| Current | New |
|---------|-----|
| `/api/v1/resources/topology/query` | `/api/service/v1/resources/topology/query` |
| `/api/v1/resources/members/query` | `/api/service/v1/resources/members/query` |
| `/api/v1/resources/members-with-relations/query` | `/api/service/v1/resources/members-with-relations/query` |
| `/api/v1/resources/members/add` | `/api/service/v1/resources/members/add` |
| `/api/v1/resources/members/remove` | `/api/service/v1/resources/members/remove` |
| `/api/v1/resources/ancestors/query` | `/api/service/v1/resources/ancestors/query` |
| `/api/v1/relationships/create` | `/api/service/v1/relationships/create` |
| `/api/v1/relationships/update` | `/api/service/v1/relationships/update` |
| `/api/v1/relationships/delete` | `/api/service/v1/relationships/delete` |
| `/api/v1/relationships/resource/query` | `/api/service/v1/relationships/resource/query` |
| `/api/v1/relationships/resource/cycle-detection` | `/api/service/v1/relationships/resource/cycle-detection` |
| `/api/v1/topologies/members/query` | `/api/service/v1/topologies/members/query` |
| `/api/v1/topologies/members/add` | `/api/service/v1/topologies/members/add` |
| `/api/v1/topologies/members/remove` | `/api/service/v1/topologies/members/remove` |
| `/api/v1/topologies/query` | `/api/service/v1/topologies/query` |
| `/api/v1/topologies/create` | `/api/service/v1/topologies/create` |
| `/api/v1/topologies/get` | `/api/service/v1/topologies/get` |
| `/api/v1/topologies/update` | `/api/service/v1/topologies/update` |
| `/api/v1/topologies/delete` | `/api/service/v1/topologies/delete` |
| `/api/v1/topologies/graph/query` | `/api/service/v1/topologies/graph/query` |

### nodes.ts Endpoints

| Current | New |
|---------|-----|
| `/api/v1/nodes/query` | `/api/service/v1/nodes/query` |
| `/api/v1/nodes/create` | `/api/service/v1/nodes/create` |
| `/api/v1/nodes/get` | `/api/service/v1/nodes/get` |
| `/api/v1/nodes/update` | `/api/service/v1/nodes/update` |
| `/api/v1/nodes/delete` | `/api/service/v1/nodes/delete` |
| `/api/v1/nodes/types/query` | `/api/service/v1/nodes/types/query` |

### prompt-templates.ts Endpoints

| Current | New |
|---------|-----|
| `/api/v1/prompt-templates/list` | `/api/service/v1/prompt-templates/list` |
| `/api/v1/prompt-templates/create` | `/api/service/v1/prompt-templates/create` |
| `/api/v1/prompt-templates/detail` | `/api/service/v1/prompt-templates/detail` |
| `/api/v1/prompt-templates/update` | `/api/service/v1/prompt-templates/update` |
| `/api/v1/prompt-templates/delete` | `/api/service/v1/prompt-templates/delete` |
| `/api/v1/prompt-templates/rollback` | `/api/service/v1/prompt-templates/rollback` |
| `/api/v1/prompt-templates/version/detail` | `/api/service/v1/prompt-templates/version/detail` |

### template-usages.ts Endpoints

| Current | New |
|---------|-----|
| `/api/v1/template-usages/list` | `/api/service/v1/template-usages/list` |
| `/api/v1/template-usages/create` | `/api/service/v1/template-usages/create` |
| `/api/v1/template-usages/delete` | `/api/service/v1/template-usages/delete` |

### models.ts Endpoints

| Current | New |
|---------|-----|
| `/api/v1/models/list` | `/api/executor/v1/models/list` |
| `/api/v1/models/create` | `/api/executor/v1/models/create` |
| `/api/v1/models/get` | `/api/executor/v1/models/get` |
| `/api/v1/models/update` | `/api/executor/v1/models/update` |
| `/api/v1/models/delete` | `/api/executor/v1/models/delete` |
