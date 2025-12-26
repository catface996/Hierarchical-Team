# API Contract: Template Usages

**Feature**: 007-prompt-template-api
**Base URL**: `/api/v1/template-usages`
**Protocol**: POST-only (following existing project pattern)

## Endpoints

### 1. List Template Usages

**Endpoint**: `POST /api/v1/template-usages/list`

**Request Body**:
```json
{}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "code": "FAULT_DIAGNOSIS",
      "name": "故障诊断",
      "description": "用于故障分析和诊断场景的提示词模板",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    },
    {
      "id": 2,
      "code": "PERFORMANCE_ANALYSIS",
      "name": "性能分析",
      "description": "用于系统性能分析的提示词模板",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    },
    {
      "id": 3,
      "code": "SECURITY_AUDIT",
      "name": "安全审计",
      "description": "用于安全审计场景的提示词模板",
      "createdAt": "2025-12-01T10:00:00Z",
      "updatedAt": "2025-12-01T10:00:00Z"
    }
  ],
  "success": true
}
```

**Notes**:
- Returns all usages (no pagination)
- Used to populate usage dropdown in template forms

---

### 2. Create Template Usage

**Endpoint**: `POST /api/v1/template-usages/create`

**Request Body**:
```json
{
  "code": "CUSTOM_USAGE",       // required: uppercase + underscores, pattern ^[A-Z][A-Z0-9_]*$
  "name": "自定义用途",          // required: display name, max 100 chars
  "description": "自定义场景"    // optional: max 500 chars
}
```

**Response** (201 Created):
```json
{
  "id": 4,
  "code": "CUSTOM_USAGE",
  "name": "自定义用途",
  "description": "自定义场景",
  "createdAt": "2025-12-26T16:00:00Z",
  "updatedAt": "2025-12-26T16:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid code format (must match `^[A-Z][A-Z0-9_]*$`)
- `409 Conflict`: Usage code already exists

---

### 3. Delete Template Usage

**Endpoint**: `POST /api/v1/template-usages/delete`

**Request Body**:
```json
{
  "id": 4    // required: usage ID to delete
}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": null,
  "success": true
}
```

**Error Responses**:
- `404 Not Found`: Usage not found
- `409 Conflict`: Usage is currently in use by templates (cannot delete)

---

## Code Pattern Validation

Usage codes must follow this pattern:

```
^[A-Z][A-Z0-9_]*$
```

**Valid examples**:
- `FAULT_DIAGNOSIS`
- `PERFORMANCE`
- `SECURITY_AUDIT_V2`
- `K8S_ANALYSIS`

**Invalid examples**:
- `fault_diagnosis` (lowercase)
- `_FAULT` (starts with underscore)
- `FAULT-DIAGNOSIS` (contains hyphen)
- `123_TEST` (starts with number)

---

## Common Error Response Format

```json
{
  "code": 400,
  "message": "Invalid code format",
  "data": null,
  "success": false
}
```

## HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success (list/delete) |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 404 | Not Found |
| 409 | Conflict (code exists or usage in use) |
| 500 | Internal Server Error |
