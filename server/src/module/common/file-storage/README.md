# 文件存储模块使用文档

## 概述

文件存储模块采用**抽象工厂模式**设计，支持多种存储后端，可以轻松切换不同的文件存储服务。

## 支持的存储类型

| 存储类型 | 配置值 | 说明 |
|---------|--------|------|
| 本地存储 | `local` | 文件存储在服务器本地目录 |
| MinIO | `minio` | 自部署对象存储服务 |
| RustFS | `rustfs` | 国产信创对象存储服务（预留） |
| 腾讯云COS | `cos` | 腾讯云对象存储（旧代码保留） |

## 如何切换存储后端

只需要修改配置文件 `src/config/env/dev.yml` 中的 `app.file.storageType` 即可：

```yaml
app:
  file:
    storageType: 'minio'  # 改为 'local' 或 'rustfs'
```

**切换后不需要修改任何业务代码！** 🎉

## 切换到 RustFS

当 RustFS 正式可用时，只需以下步骤：

### 1. 修改配置文件

```yaml
app:
  file:
    storageType: 'rustfs'

rustfs:
  endPoint: '111.229.29.214'
  port: 9000
  useSSL: false
  accessKey: 'your-access-key'
  secretKey: 'your-secret-key'
  bucket: 'avatars'
  region: 'us-east-1'
```

### 2. 重启服务

```bash
pnpm start:dev
```

### 3. 完成！

所有上传的文件会自动存储到 RustFS，前端访问方式不变。

## 架构说明

```
┌─────────────────────────────────────┐
│       UploadService (业务层)         │
│  - 不关心具体存储实现                │
│  - 只调用 FileStorageFactory        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    FileStorageFactory (工厂层)       │
│  - 根据配置选择存储驱动              │
│  - 统一对外接口                      │
└──┬─────────┬──────────┬─────────────┘
   │         │          │
   ▼         ▼          ▼
┌─────┐  ┌──────┐  ┌────────┐
│Local│  │MinIO │  │ RustFS │
│Storage│  │Storage│ │Storage │
└─────┘  └──────┘  └────────┘
```

## 新增存储类型

如果需要新增其他存储服务（如阿里云OSS、AWS S3等），只需要：

1. 实现 `IFileStorage` 接口
2. 在 `FileStorageFactory` 中添加对应的 case
3. 在配置文件中添加对应配置项
4. 在 `FileStorageModule` 中注册新的 Provider

**示例：**

```typescript
// ali-oss-file-storage.service.ts
@Injectable()
export class AliOssFileStorage implements IFileStorage {
  async uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult> {
    // 实现阿里云 OSS 上传逻辑
  }
  
  async deleteFile(fileName: string): Promise<void> {
    // 实现删除逻辑
  }
}
```

```typescript
// file-storage.factory.ts
private getStorageInstance(): IFileStorage {
  switch (this.storageType) {
    case 'minio':
      return this.minioStorage;
    case 'rustfs':
      return this.rustfsStorage;
    case 'alioss':  // 新增
      return this.aliOssStorage;
    default:
      return this.localStorage;
  }
}
```

## 核心接口

所有存储驱动都必须实现 `IFileStorage` 接口：

```typescript
export interface IFileStorage {
  uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<UploadResult>;
  deleteFile(fileName: string): Promise<void>;
  fileExists?(fileName: string): Promise<boolean>;
  getFileUrl?(fileName: string): Promise<string>;
}
```

## 优势

- ✅ **解耦**：业务代码不依赖具体存储实现
- ✅ **可扩展**：新增存储类型不影响现有代码
- ✅ **易切换**：改配置即可切换后端
- ✅ **信创兼容**：支持国产 RustFS，满足信创要求
- ✅ **向后兼容**：保留了旧的 COS 和本地存储代码
