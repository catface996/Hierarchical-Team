# 数据模型: Tools 管理

## 实体: AgentTool

- **目的**: 代表系统中的功能扩展工具，提供特定的能力和服务
- **字段**:
  - `id`: string - 唯一标识符，系统生成
  - `name`: string - 工具名称，用户可见，必须唯一
  - `description`: string - 工具描述，说明工具的功能和用途
  - `type`: ToolType - 工具类型枚举值
  - `createdAt`: number - 创建时间戳 (Unix 时间戳)
- **关系**: 独立实体，无直接关联关系
- **验证规则**:
  - `name`: 必填，长度 1-100 字符，系统内唯一
  - `description`: 可选，最大长度 500 字符
  - `type`: 必填，必须是有效的 ToolType 枚举值
  - `id`: 系统生成，格式为 `tool-{随机字符串}`
  - `createdAt`: 系统生成，创建时的时间戳
- **状态转换**: 
  - 创建 -> 活跃
  - 活跃 -> 已删除 (软删除，实际为硬删除)

## 枚举: ToolType

- **目的**: 定义工具的分类类型，影响显示样式和功能特性
- **值**:
  - `Function`: 功能型工具 - 提供特定的计算或处理功能
  - `Integration`: 集成型工具 - 与外部系统或服务的集成
  - `Retrieval`: 检索型工具 - 数据查询和检索功能
- **显示样式映射**:
  - `Function`: 靛蓝色主题，Terminal 图标
  - `Integration`: 粉色主题，Link 图标  
  - `Retrieval`: 紫色主题，SearchCode 图标
- **验证**: 必须是预定义的枚举值之一

## 实体: ToolFormData

- **目的**: 表单数据传输对象，用于创建和编辑工具时的数据结构
- **字段**:
  - `id`: string - 工具ID (编辑时存在，创建时为空或系统生成)
  - `name`: string - 工具名称
  - `description`: string - 工具描述
  - `type`: ToolType - 工具类型
  - `createdAt`: number - 创建时间 (编辑时保持原值，创建时系统生成)
- **验证规则**: 与 AgentTool 相同
- **用途**: 
  - 表单组件的数据绑定
  - API 请求的数据载荷
  - 客户端验证的数据源

## 实体: ToolListState

- **目的**: 工具列表组件的状态管理数据结构
- **字段**:
  - `tools`: AgentTool[] - 工具列表数据
  - `filteredTools`: AgentTool[] - 经过搜索筛选的工具列表
  - `searchTerm`: string - 当前搜索关键词
  - `currentPage`: number - 当前页码 (从1开始)
  - `viewMode`: 'list' | 'card' - 视图模式
  - `isLoading`: boolean - 数据加载状态
  - `error`: string | null - 错误信息
  - `isModalOpen`: boolean - 模态框开启状态
  - `editingTool`: AgentTool | null - 当前编辑的工具 (null表示创建新工具)
- **计算属性**:
  - `totalPages`: number - 总页数，根据 filteredTools 长度和分页大小计算
  - `paginatedTools`: AgentTool[] - 当前页的工具列表
  - `itemsPerPage`: number - 每页项目数，根据视图模式确定 (卡片8个，列表10个)

## 实体: ApiResponse<T>

- **目的**: 标准化 API 响应格式
- **字段**:
  - `data`: T - 响应数据
  - `success`: boolean - 操作是否成功
  - `message`: string - 响应消息
  - `error`: string | null - 错误信息 (成功时为null)
- **用途**: 
  - 统一 API 响应处理
  - 错误信息标准化
  - 类型安全的数据访问

## 实体: ValidationError

- **目的**: 表单验证错误信息结构
- **字段**:
  - `field`: string - 出错的字段名
  - `message`: string - 错误消息
  - `code`: string - 错误代码 (如 'required', 'unique', 'maxLength')
- **用途**:
  - 客户端表单验证
  - 服务端验证错误的显示
  - 用户友好的错误提示