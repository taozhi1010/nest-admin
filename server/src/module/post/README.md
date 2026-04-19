# Post 模块（文章和专栏）

## 模块结构

```
post/
├── article/                # 文章子模块
│   ├── dto/
│   │   └── index.ts       # 数据传输对象和验证规则
│   ├── entities/
│   │   └── article.entity.ts  # 文章实体类
│   ├── article.controller.ts  # 文章控制器（API路由）
│   ├── article.service.ts     # 文章服务（业务逻辑）
│   └── article.module.ts      # 文章模块
├── subject/                # 专栏子模块
│   ├── dto/
│   │   └── index.ts       # 数据传输对象和验证规则
│   ├── entities/
│   │   └── subject.entity.ts  # 专栏实体类
│   ├── subject.controller.ts  # 专栏控制器（API路由）
│   ├── subject.service.ts     # 专栏服务（业务逻辑）
│   └── subject.module.ts      # 专栏模块
└── post.module.ts          # Post 主模块
```

## 功能特性

### 文章管理 (article)
- ✅ 创建文章
- ✅ 查询文章列表（支持分页、筛选）
- ✅ 查询文章详情
- ✅ 更新文章
- ✅ 删除文章（软删除）
- ✅ 提交审核
- ✅ 审核文章
- ✅ 发布文章
- ✅ 支持定时发布
- ✅ 游客可访问的公开接口

### 专栏管理 (subject)
- ✅ 创建专栏
- ✅ 查询专栏列表（支持分页、筛选）
- ✅ 查询专栏详情
- ✅ 更新专栏
- ✅ 删除专栏（软删除）

## 状态管理

### 发布状态 (publish_status)
- `0` - 草稿：文章/专栏还在编辑中
- `1` - 待发布：审核通过，等待发布时间
- `2` - 已发布：内容已公开显示
- `3` - 已下架：主动下架，不再显示

### 审核状态 (audit_status)
- `0` - 未提交：刚创建或修改后还未提交审核
- `1` - 审核中：已提交，管理员正在审核
- `2` - 审核通过：内容合规，可以发布
- `3` - 审核拒绝：内容不合规，需要修改

## API 接口

### 文章接口 (`/post/article`)
- `POST /` - 创建文章
- `GET /list` - 查询文章列表（管理员）
- `GET /guest/list` - 查询文章列表（游客）
- `GET /:id` - 查询文章详情（管理员）
- `GET /guest/detail?id=xxx` - 查询文章详情（游客）
- `PUT /` - 更新文章
- `DELETE /:id` - 删除文章
- `POST /submit-audit/:id` - 提交审核
- `POST /audit` - 审核文章
- `POST /publish/:id` - 发布文章

### 专栏接口 (`/post/subject`)
- `POST /` - 创建专栏
- `GET /list` - 查询专栏列表
- `GET /:id` - 查询专栏详情
- `PUT /` - 更新专栏
- `DELETE /:id` - 删除专栏

## 权限标识

### 文章权限
- `post:article:add` - 创建文章
- `post:article:list` - 查询文章列表
- `post:article:query` - 查询文章详情
- `post:article:edit` - 更新文章
- `post:article:remove` - 删除文章
- `post:article:submitAudit` - 提交审核
- `post:article:audit` - 审核文章
- `post:article:publish` - 发布文章

### 专栏权限
- `post:subject:add` - 创建专栏
- `post:subject:list` - 查询专栏列表
- `post:subject:query` - 查询专栏详情
- `post:subject:edit` - 更新专栏
- `post:subject:remove` - 删除专栏

## 数据库表

- `post_article` - 文章表
- `post_subject` - 专栏表

## 使用示例

### 创建文章
```typescript
POST /post/article
{
  "title": "我的第一篇文章",
  "desc": "这是一篇测试文章",
  "subjectId": "专栏ID",
  "content": "文章内容...",
  "cover": "封面图片URL",
  "publishStatus": "0",  // 草稿
  "auditStatus": "0"     // 未提交
}
```

### 提交审核
```typescript
POST /post/article/submit-audit/文章ID
```

### 审核文章
```typescript
POST /post/article/audit
{
  "id": "文章ID",
  "auditStatus": "2",  // 审核通过
  "auditRemark": "内容质量很好"
}
```

### 发布文章
```typescript
POST /post/article/publish/文章ID
```

## 注意事项

1. **定时发布**：需要配合定时任务使用，定期检查 `scheduled_publish_time` 字段
2. **审核流程**：文章必须先审核通过才能发布
3. **软删除**：删除操作不会真正删除数据，只是将 `del_flag` 设置为 `1`
4. **游客接口**：`/guest/*` 路径的接口不需要登录即可访问
