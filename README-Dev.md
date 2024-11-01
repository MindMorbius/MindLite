# MindLite 开发文档

## 技术栈
- Frontend: Next.js 14, JavaScript
- State: Zustand
- Storage: IndexedDB, PostgreSQL
- AI: siliconflow API、bigmodel API

### 数据存储

#### 本地存储
- Zustand 管理应用状态
- IndexedDB 存储笔记和音频数据
- 以笔记 UUID 为主键关联所有数据

#### 数据结构
笔记数据包含:
- 基础信息(标题、路径等)
- 笔记内容
- 录音信息(转录文本、时间戳等) 
- 录音文件
- 对话数据(后期扩展)

#### 云端同步
使用 PostgreSQL 存储:
- 笔记基础信息和内容
- 录音卡片元数据(不含音频文件)
- 对话数据(后期扩展)
- 使用乐观锁处理并发
- 支持软删除

#### 同步策略
- 增量同步
- 冲突检测与合并
- 录音文件暂不同步

#### PostgreSQL 数据库设计
```
// 认证相关表
interface AuthSchema {
  users: {
    uuid: string;              // PRIMARY KEY
    provider: string;          // oauth provider: github/Linux.do
    provider_id: string;       // UNIQUE, provider's user id
    name: string;              // display name
    avatar_url: string;        // avatar from provider
    created_at: timestamp;
    last_login_at: timestamp;
    deleted_at: timestamp;     // 软删除
  };

  sessions: {
    uuid: string;              // PRIMARY KEY
    user_uuid: string;         // FOREIGN KEY -> users.uuid
    token: string;             // oauth access token
    refresh_token: string;     // oauth refresh token
    expires_at: timestamp;
    created_at: timestamp;
  };
}

// 笔记相关表
interface NoteSchema {
  notes: {
    user_uuid: string;          // FOREIGN KEY -> users.uuid
    uuid: string;              // PRIMARY KEY
    title: string;
    info: json;                 // 笔记信息:路径、分类、关键词
    created_at: timestamp;
    updated_at: timestamp;
    last_viewed_at: timestamp;
    sync_version: number;      // 乐观锁，处理并发
    deleted_at: timestamp;     // 软删除
  };

  note_contents: {
    note_uuid: string;         // FOREIGN KEY -> notes.uuid
    content: text;
    updated_at: timestamp;
    sync_version: number;
  };

  audio_notes: {
    user_uuid: string;        // FOREIGN KEY -> users.uuid
    uuid: string;             // PRIMARY KEY
    note_uuid: string;        // FOREIGN KEY -> notes.uuid
    merged_content: text;     // 合并文本
    slices_info: json;        // 切片信息：转录文本、录音信息
    created_at: timestamp;
    updated_at: timestamp;
    sync_version: number;
    deleted_at: timestamp;    // 软删除
  };

  // 后期增加
  chat_messages: {
    user_uuid: string;        // FOREIGN KEY -> users.uuid
    uuid: string;            // PRIMARY KEY
    note_uuid: string;       // FOREIGN KEY -> notes.uuid
    content: json;          // 请求返回内容
    created_at: timestamp;
    updated_at: timestamp;
    sync_version: number;
    deleted_at: timestamp;    // 软删除
  };
}
```

#### Zustand Store 设计
```
interface LocalStore {
  notes: {
    [uuid: string]: {
      // 笔记基础信息
      title: string;
      info: json; // 笔记信息:路径、分类、关键词
      createdAt: string;
      updatedAt: string;
      lastViewedAt: string;
      syncVersion: number;
      syncStatus: 'synced' | 'local' | 'syncing' | 'error';
      
      // 笔记内容
      content: string;
      contentSyncVersion: number;
      contentSyncStatus: 'synced' | 'local' | 'syncing' | 'error';
      
      // 关联的音频笔记
      audioNotes: {
        [uuid: string]: {
          mergedContent: string;  // 合并文本
          slicesInfo: json;       // 切片信息：转录文本、录音信息
          createdAt: string;
          updatedAt: string;
          syncVersion: number;
          syncStatus: 'synced' | 'local' | 'syncing' | 'error';
        }
      };
      
      // 后期增加：对话数据
      chatMessages: {
        [uuid: string]: {
          role: 'user' | 'assistant';
          content: json;          // 请求返回内容
          createdAt: string;
          updatedAt: string;      // 增加更新时间
          syncVersion: number;
          syncStatus: 'synced' | 'local' | 'syncing' | 'error';
        }
      };
    }
  };
  
  // 同步队列
  syncQueue: {
    notes: string[];            // 待同步的笔记 uuid
    contents: string[];         // 待同步的内容 uuid
    audioNotes: string[];       // 待同步的录音信息 uuid
    chatMessages: string[];     // 待同步的对话 uuid
  };
}
```

#### IndexedDB 设计 (仅用于音频文件存储)
```
interface AudioStorage {
  audioFiles: {
    [uuid: string]: {
      blob: Blob;
      hash: string;           // 文件完整性校验
      noteUuid: string;       // 关联的笔记ID
      lastAccessed: string;   // 最后访问时间，用于缓存清理
    }
  };
}
```


### 语音转录模块

#### 转录卡片
- 音频模块布局
- 交互卡片
- 数据持久化
  - 使用 IndexedDB 存储音频文件（wav blob）
  - 使用 localStorage 存储卡片元数据
  - 使用 Map 作为运行时缓存

#### 转录能力
- API实现
- 本地化实现（测试失败，暂时废弃）
  - 检测WebAssembly支持
  - 制作模型缓存下载界面
  - 集成sherpa-onnx模型
