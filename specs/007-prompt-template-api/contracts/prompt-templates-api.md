# API Contract: Prompt Templates

**Feature**: 007-prompt-template-api
**Base URL**: `/api/v1/prompt-templates`
**Protocol**: POST-only (following existing project pattern)

## Endpoints

### 1. List Prompt Templates

**Endpoint**: `POST /api/v1/prompt-templates/list`

**Request Body**:
```json
{
  "usageId": 1,         // optional: filter by usage type
  "keyword": "故障",     // optional: search in name/description
  "page": 1,            // optional: page number (1-based), default 1
  "size": 10            // optional: page size, default 10, max 100
}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "content": [
      {
        "id": 1,
        "name": "故障诊断提示词-v1",
        "usageId": 1,
        "usageName": "故障诊断",
        "description": "用于K8s故障诊断的提示词模板",
        "currentVersion": 3,
        "content": "请分析以下故障信息...",
        "version": 2,
        "createdBy": 1,
        "createdAt": "2025-12-26T10:00:00Z",
        "updatedAt": "2025-12-26T15:30:00Z"
      }
    ],
    "page": 1,
    "size": 10,
    "totalElements": 25,
    "totalPages": 3,
    "first": true,
    "last": false
  },
  "success": true
}
```

---

### 2. Create Prompt Template

**Endpoint**: `POST /api/v1/prompt-templates/create`

**Request Body**:
```json
{
  "operatorId": 1,                    // required: operator user ID
  "name": "新建故障诊断模板",           // required: max 200 chars
  "content": "请分析以下故障信息...",   // required: max 64KB
  "usageId": 1,                       // optional: usage type ID
  "description": "用于K8s故障分析"     // optional: max 1000 chars
}
```

**Response** (201 Created):
```json
{
  "id": 10,
  "name": "新建故障诊断模板",
  "usageId": 1,
  "usageName": "故障诊断",
  "description": "用于K8s故障分析",
  "currentVersion": 1,
  "content": "请分析以下故障信息...",
  "version": 0,
  "createdBy": 1,
  "createdAt": "2025-12-26T16:00:00Z",
  "updatedAt": "2025-12-26T16:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid parameters (name too long, content too large)
- `409 Conflict`: Template name already exists

---

### 3. Get Template Detail

**Endpoint**: `POST /api/v1/prompt-templates/detail`

**Request Body**:
```json
{
  "id": 1    // required: template ID
}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "故障诊断提示词-v1",
    "usageId": 1,
    "usageName": "故障诊断",
    "description": "用于K8s故障诊断的提示词模板",
    "currentVersion": 3,
    "content": "当前版本内容...",
    "version": 2,
    "createdBy": 1,
    "createdAt": "2025-12-26T10:00:00Z",
    "updatedAt": "2025-12-26T15:30:00Z",
    "versions": [
      {
        "id": 1,
        "templateId": 1,
        "versionNumber": 1,
        "content": "初始版本内容...",
        "changeNote": "初始版本",
        "createdBy": 1,
        "createdAt": "2025-12-26T10:00:00Z"
      },
      {
        "id": 2,
        "templateId": 1,
        "versionNumber": 2,
        "content": "第二版本内容...",
        "changeNote": "修复格式问题",
        "createdBy": 1,
        "createdAt": "2025-12-26T12:00:00Z"
      },
      {
        "id": 3,
        "templateId": 1,
        "versionNumber": 3,
        "content": "当前版本内容...",
        "changeNote": "优化提示词效果",
        "createdBy": 1,
        "createdAt": "2025-12-26T15:30:00Z"
      }
    ]
  },
  "success": true
}
```

**Error Responses**:
- `404 Not Found`: Template not found

---

### 4. Update Prompt Template

**Endpoint**: `POST /api/v1/prompt-templates/update`

**Request Body**:
```json
{
  "id": 1,                           // required: template ID
  "operatorId": 1,                   // required: operator user ID
  "content": "更新后的内容...",       // required: new content
  "changeNote": "修复格式问题",       // optional: change description
  "expectedVersion": 2               // optional: for optimistic locking
}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "故障诊断提示词-v1",
    "usageId": 1,
    "usageName": "故障诊断",
    "description": "用于K8s故障诊断的提示词模板",
    "currentVersion": 4,
    "content": "更新后的内容...",
    "version": 3,
    "createdBy": 1,
    "createdAt": "2025-12-26T10:00:00Z",
    "updatedAt": "2025-12-26T16:30:00Z"
  },
  "success": true
}
```

**Error Responses**:
- `404 Not Found`: Template not found
- `409 Conflict`: Version conflict (expectedVersion mismatch)

---

### 5. Delete Prompt Template

**Endpoint**: `POST /api/v1/prompt-templates/delete`

**Request Body**:
```json
{
  "id": 1,           // required: template ID
  "operatorId": 1    // required: operator user ID
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
- `404 Not Found`: Template not found

---

### 6. Rollback Template Version

**Endpoint**: `POST /api/v1/prompt-templates/rollback`

**Request Body**:
```json
{
  "id": 1,               // required: template ID
  "operatorId": 1,       // required: operator user ID
  "targetVersion": 2,    // required: version number to rollback to
  "expectedVersion": 3   // optional: for optimistic locking
}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "故障诊断提示词-v1",
    "usageId": 1,
    "usageName": "故障诊断",
    "description": "用于K8s故障诊断的提示词模板",
    "currentVersion": 5,
    "content": "第二版本内容...",
    "version": 4,
    "createdBy": 1,
    "createdAt": "2025-12-26T10:00:00Z",
    "updatedAt": "2025-12-26T17:00:00Z"
  },
  "success": true
}
```

**Notes**:
- Rollback creates a NEW version with content from target version
- `currentVersion` increments (does not revert to target)
- `changeNote` auto-generated: "Rollback to version {N}"

**Error Responses**:
- `404 Not Found`: Template or target version not found
- `409 Conflict`: Version conflict

---

### 7. Get Version Detail

**Endpoint**: `POST /api/v1/prompt-templates/version/detail`

**Request Body**:
```json
{
  "templateId": 1,      // required: template ID
  "versionNumber": 2    // required: version number (>= 1)
}
```

**Response** (200 OK):
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 2,
    "templateId": 1,
    "versionNumber": 2,
    "content": "第二版本内容...",
    "changeNote": "修复格式问题",
    "createdBy": 1,
    "createdAt": "2025-12-26T12:00:00Z"
  },
  "success": true
}
```

**Error Responses**:
- `404 Not Found`: Template or version not found

---

## Common Error Response Format

```json
{
  "code": 400,
  "message": "Invalid parameters",
  "data": null,
  "success": false
}
```

## HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Success (query/update/delete) |
| 201 | Created (create operations) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found (resource doesn't exist) |
| 409 | Conflict (version conflict or duplicate) |
| 500 | Internal Server Error |
