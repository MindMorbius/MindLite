# MindLite 开发文档

## 技术栈
- Frontend: Next.js 14, JavaScript
- State: Zustand
- Storage: IndexedDB, PostgreSQL
- AI: siliconflow API、bigmodel API

### 数据存储架构

#### 本地存储
1. Zustand 状态管理
   - 管理应用运行时状态
   - 缓存活跃笔记数据
   - 维护同步队列
   - 以笔记 UUID 为主键

2. IndexedDB 持久化
   - 存储音频文件 Blob 数据
   - 音频文件元数据
   - 缓存策略管理

#### 数据结构
笔记数据统一模型:
1. 基础数据
   - BaseInfo (标题、路径、标签等)
   - MetaInfo (字数统计、更新时间等)
   - CheckInfo (同步状态、版本控制)

2. 内容数据
   - 笔记 Markdown 内容
   - 音频转录文本和切片信息
   - 对话上下文和消息历史

3. 关联数据
   - 音频文件 (仅 IndexedDB)
   - 对话消息流
   - 软删除信息

#### 云端同步 (PostgreSQL)
1. 同步范围
   - 笔记基础信息 (BaseInfo, MetaInfo)
   - 笔记内容
   - 音频转录数据 (不含音频文件)
   - 对话历史

2. 同步机制
   - 乐观锁 (version 控制)
   - 软删除 (DeletedInfo)
   - 增量同步 (CheckInfo 状态追踪)

3. 冲突处理
   - 基于内容哈希的冲突检测
   - 冲突历史记录
   - 手动/自动合并策略

#### PostgreSQL 数据库设计优化
1. 认证相关表
```
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
```

2. 通用接口
```
// 笔记基础信息
interface BaseInfo {
  title: string;
  path: string;
  type: string;
  tags: string[];
  isPinned: boolean;
  position: number;
}

interface MetaInfo {
  wordCount: number;
  readTime: number;
  references: string[];
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string;
}

// 同步检查信息
interface CheckInfo {
  version: number;
  status: 'synced' | 'local' | 'syncing' | 'error';
  hash: string;
  lastSyncAt?: string;
  errorMsg?: string;
  conflicts?: Array<{
    serverHash: string;
    localHash: string;
    resolvedAt: string;
  }>;
}

// 删除信息
interface DeletedInfo {
  isDeleted: boolean;
  deletedAt: string;
  expireAt: string;
  deletedBy: string;
  reason?: string;
  originalPath?: string;
}

// 音频相关接口
interface AudioSlice {
  uuid: string;
  transcript: string;
  audioInfo: {
    duration: number;
    createdAt: string;
  };
}

interface AudioContentInfo {
  slices: Record<string, AudioSlice>;
}

// 对话相关接口
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string;         // 可选，assistant 消息才有
  usage?: {              // 可选，assistant 消息才有
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  createdAt: number;
}

interface ChatInfo {
  messages: Message[];
  metadata?: {
    title?: string;
    summary?: string;
    tags?: string[];
  };
}
```

3. PostgreSQL 数据库设计
```
interface NoteSchema {
  notes: {
    uuid: string;
    user_uuid: string;
    base_info: BaseInfo;
    meta_info: MetaInfo;
    check_info: CheckInfo;
    deleted_info: DeletedInfo;
  };

  note_contents: {
    note_uuid: string;
    content: text;
    check_info: CheckInfo;
  };

  audio_notes: {
    uuid: string;
    note_uuid: string;
    user_uuid: string;
    mergedContent: string;
    content_info: AudioContentInfo;
    check_info: CheckInfo;
    deleted_info: DeletedInfo;
  };

  chat_messages: {
    uuid: string;
    note_uuid: string;
    user_uuid: string;
    chat_info: ChatInfo;
    check_info: CheckInfo;
    deleted_info: DeletedInfo;
  };
}
```

#### Zustand Store 设计
```
interface LocalStore {
  notes: {
    [uuid: string]: {
      // 基础信息
      base_info: BaseInfo;
      meta_info: MetaInfo;
      check_info: CheckInfo;
      
      // 笔记内容
      content: string;
      content_check_info: CheckInfo;
      
      // 关联的音频笔记
      audioNotes: {
        [uuid: string]: {
          mergedContent: string;
          content_info: AudioContentInfo;
          check_info: CheckInfo;
        }
      };
      
      // 对话数据
      chatMessages: {
        [uuid: string]: {
          chat_info: ChatInfo;
          check_info: CheckInfo;
        }
      };
    }
  };
  
  // 同步队列
  syncQueue: {
    notes: string[];
    contents: string[];
    audioNotes: string[];
    chatMessages: string[];
  };
}
```

#### IndexedDB 设计 (仅用于音频文件存储)
```
interface AudioStorage {
  audioFiles: {
    [uuid: string]: {
      blob: Blob;
      hash: string;           // 文件校验
      noteUuid: string;       // 关联的笔记ID
      sliceUuid: string;      // 关联的音频切片UUID
    }
  };
}
```

### 语音转录模块

#### 转录卡片
- 音频模块布局
- 交互卡片
- 音频切片

#### 转录能力
- API实现
- 本地化实现（测试失败，暂时废弃）
  - 检测WebAssembly支持
  - 制作模型缓存下载界面
  - 集成sherpa-onnx模型
