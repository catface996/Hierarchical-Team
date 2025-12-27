# API 合约: Tools 管理

## POST /api/tools/v1/tools/list

- **目的**: 获取所有工具列表 (来自用户故事1)
- **请求**: 
  ```typescript
  {
    page?: number;        // 页码，默认1
    limit?: number;       // 每页数量，默认50
    search?: string;      // 搜索关键词
  }
  ```
- **响应**: 
  ```typescript
  {
    success: boolean;
    data: {
      tools: AgentTool[];
      total: number;
      page: number;
      limit: number;
    };
    message: string;
  }
  ```
- **错误情况**:
  - `500`: 服务器内部错误
  - `503`: 服务不可用

## POST /api/tools/v1/tools/create

- **目的**: 创建新工具 (来自用户故事3)
- **请求**: 
  ```typescript
  {
    name: string;         // 必填，1-100字符
    description: string;  // 可选，最大500字符
    type: 'Function' | 'Integration' | 'Retrieval'; // 必填
  }
  ```
- **响应**: 
  ```typescript
  {
    success: boolean;
    data: AgentTool;      // 创建的工具对象，包含生成的id和createdAt
    message: string;
  }
  ```
- **错误情况**:
  - `400`: 请求数据无效 (缺少必填字段、格式错误等)
  - `409`: 工具名称已存在 (唯一性冲突)
  - `500`: 服务器内部错误

## POST /api/tools/v1/tools/update

- **目的**: 更新现有工具信息 (来自用户故事4)
- **请求**: 
  ```typescript
  {
    id: string;           // 工具ID
    name: string;         // 必填，1-100字符
    description: string;  // 可选，最大500字符
    type: 'Function' | 'Integration' | 'Retrieval'; // 必填
  }
  ```
- **响应**: 
  ```typescript
  {
    success: boolean;
    data: AgentTool;      // 更新后的工具对象
    message: string;
  }
  ```
- **错误情况**:
  - `400`: 请求数据无效
  - `404`: 工具不存在
  - `409`: 工具名称已存在 (与其他工具冲突)
  - `500`: 服务器内部错误

## POST /api/tools/v1/tools/delete

- **目的**: 删除工具 (来自用户故事5)
- **请求**: 
  ```typescript
  {
    id: string;           // 工具ID
  }
  ```
- **响应**: 
  ```typescript
  {
    success: boolean;
    data: null;
    message: string;
  }
  ```
- **错误情况**:
  - `404`: 工具不存在
  - `409`: 工具正在使用中 (返回警告信息，但仍可强制删除)
  - `500`: 服务器内部错误

## POST /api/tools/v1/tools/usage

- **目的**: 检查工具使用状态 (用于删除前的警告提示)
- **请求**: 
  ```typescript
  {
    id: string;           // 工具ID
  }
  ```
- **响应**: 
  ```typescript
  {
    success: boolean;
    data: {
      inUse: boolean;           // 是否正在使用
      usageCount: number;       // 使用次数
      lastUsed: number | null;  // 最后使用时间戳
      dependencies: string[];   // 依赖此工具的系统/组件列表
    };
    message: string;
  }
  ```
- **错误情况**:
  - `404`: 工具不存在
  - `500`: 服务器内部错误

## POST /api/tools/v1/tools/validate-name

- **目的**: 验证工具名称唯一性 (实时验证)
- **请求**: 
  ```typescript
  {
    name: string;         // 要验证的名称
    excludeId?: string;   // 排除的工具ID (编辑时使用)
  }
  ```
- **响应**: 
  ```typescript
  {
    success: boolean;
    data: {
      available: boolean;   // 名称是否可用
      suggestion?: string;  // 建议的替代名称 (如果不可用)
    };
    message: string;
  }
  ```
- **错误情况**:
  - `400`: 请求数据无效
  - `500`: 服务器内部错误

## 错误响应格式

所有 API 错误都遵循统一格式：

```typescript
{
  success: false;
  data: null;
  message: string;        // 用户友好的错误消息
  error: {
    code: string;         // 错误代码
    details?: any;        // 详细错误信息 (开发环境)
  };
}
```

## 通用错误代码

- `VALIDATION_ERROR`: 数据验证失败
- `NOT_FOUND`: 资源不存在
- `DUPLICATE_NAME`: 名称重复
- `IN_USE`: 资源正在使用中
- `SERVER_ERROR`: 服务器内部错误
- `SERVICE_UNAVAILABLE`: 服务不可用

## 请求头要求

```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  // 认证头 (如果需要)
  'Authorization': 'Bearer {token}'
}
```