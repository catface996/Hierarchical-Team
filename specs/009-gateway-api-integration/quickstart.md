# Quickstart: Gateway API Integration

**Feature**: 009-gateway-api-integration
**Date**: 2025-12-27

## Prerequisites

- Gateway running at `localhost:8888`
- Node.js and npm installed
- Frontend development server

## Quick Validation Checklist

### 1. Gateway Connectivity

```bash
# Verify gateway is running
curl -s http://localhost:8888/health

# Verify service API is accessible
curl -s -X POST http://localhost:8888/api/service/v1/resource-types/query \
  -H "Content-Type: application/json" \
  -d '{}'

# Verify executor API is accessible
curl -s -X POST http://localhost:8888/api/executor/v1/models/list \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "size": 10}'
```

### 2. Start Frontend Development Server

```bash
npm run dev
```

### 3. Browser DevTools Validation

Open browser DevTools (F12) → Network tab, then test each feature:

#### Test Service API (Resources, Topologies, Nodes)

1. Navigate to Resources page
2. Verify requests go to `/api/service/v1/resources/*`
3. Navigate to Topologies page
4. Verify requests go to `/api/service/v1/topologies/*`

#### Test Executor API (Models)

1. Navigate to Models (Neural Assets) page
2. Verify requests go to `/api/executor/v1/models/*`

#### Test Prompt Templates API

1. Navigate to Prompt Templates page
2. Verify requests go to `/api/service/v1/prompt-templates/*`

### 4. Functional Validation

| Feature | Test Action | Expected Result |
|---------|-------------|-----------------|
| Resources | Load resource list | Resources display from API |
| Resources | Create new resource | Resource created successfully |
| Topologies | Load topology list | Topologies display from API |
| Topologies | View topology graph | Graph renders with nodes/edges |
| Nodes | Load node list | Nodes display from API |
| Models | Load model list | Models display from API |
| Models | Create new model | Model created successfully |
| Models | Toggle model status | Status updates in UI |
| Prompt Templates | Load template list | Templates display from API |
| Prompt Templates | Create template | Template created successfully |

## Troubleshooting

### Gateway Not Accessible

**Symptom**: Network errors, requests fail

**Solution**:
1. Verify gateway is running: `curl http://localhost:8888/health`
2. Check Vite proxy config points to `localhost:8888`
3. Restart development server after config changes

### Wrong API Paths

**Symptom**: 404 Not Found errors

**Solution**:
1. Check browser DevTools Network tab for actual request URL
2. Verify URL contains service prefix (`/api/service/v1/` or `/api/executor/v1/`)
3. Compare against contracts/gateway-routing.md

### Backend Service Down

**Symptom**: 502/503 errors from gateway

**Solution**:
1. Gateway is working, but backend service is unavailable
2. Check backend service logs
3. Restart the specific backend service

## Files Changed Summary

| File | Change |
|------|--------|
| `vite.config.ts` | Single proxy to localhost:8888 |
| `services/api/resources.ts` | Endpoints prefixed with `/api/service/v1/` |
| `services/api/topology.ts` | Endpoints prefixed with `/api/service/v1/` |
| `services/api/nodes.ts` | Endpoints prefixed with `/api/service/v1/` |
| `services/api/prompt-templates.ts` | Endpoints prefixed with `/api/service/v1/` |
| `services/api/template-usages.ts` | Endpoints prefixed with `/api/service/v1/` |
| `services/api/models.ts` | Endpoints prefixed with `/api/executor/v1/` |

## Rollback Instructions

If issues arise, rollback with git:

```bash
git checkout main -- vite.config.ts services/api/
```
