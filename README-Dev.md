# MindLite 开发文档

## 技术栈
- Frontend: Next.js 14, JavaScript
- State: Zustand
- Storage: IndexedDB, supabase
- AI: siliconflow API、bigmodel API

## 登录
- 使用 supabase 的 auth 认证
- 使用 github 账号登录
- 使用 @supabase/auth-helpers-nextjs 库
- Zustand store 维护登录状态
- @supabase/auth-ui-react 库实现登录界面

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

#### 云端同步 (supabase)
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

#### supabase 数据库设计优化
通过 supabase 的 auth 认证

1. 通用接口
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

// 调整数据库模型，user_uuid 改为 user_id
interface NoteSchema {
  notes: {
    uuid: string;
    user_id: string;
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
    user_id: string;
    mergedContent: string;
    content_info: AudioContentInfo;
    check_info: CheckInfo;
    deleted_info: DeletedInfo;
  };

  chat_messages: {
    uuid: string;
    note_uuid: string;
    user_id: string;
    chat_info: ChatInfo;
    check_info: CheckInfo;
    deleted_info: DeletedInfo;
  };
}

// Zustand store 结构不变
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

// IndexedDB 设计 (仅用于音频文件存储)
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


## 开发

### 使用supabase
- 建表
```
-- 业务表 (使用 auth.users 的 id 作为外键)
CREATE TABLE notes (
    uuid UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id), -- 改用 auth.users 的 id
    base_info JSONB NOT NULL,
    meta_info JSONB NOT NULL,
    check_info JSONB NOT NULL,
    deleted_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE note_contents (
    note_uuid UUID PRIMARY KEY REFERENCES notes(uuid),
    content TEXT,
    check_info JSONB NOT NULL
);

CREATE TABLE audio_notes (
    uuid UUID PRIMARY KEY,
    note_uuid UUID NOT NULL REFERENCES notes(uuid),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    merged_content TEXT,
    content_info JSONB NOT NULL,
    check_info JSONB NOT NULL,
    deleted_info JSONB
);

CREATE TABLE chat_messages (
    uuid UUID PRIMARY KEY,
    note_uuid UUID NOT NULL REFERENCES notes(uuid),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    chat_info JSONB NOT NULL,
    check_info JSONB NOT NULL,
    deleted_info JSONB
);

-- Indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_audio_notes_note_uuid ON audio_notes(note_uuid);
CREATE INDEX idx_chat_messages_note_uuid ON chat_messages(note_uuid);

-- RLS Policies (重要!)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 只能查看/修改自己的数据
CREATE POLICY "Users can only access their own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own note contents" ON note_contents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM notes 
            WHERE notes.uuid = note_contents.note_uuid 
            AND notes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can only access their own audio notes" ON audio_notes
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own chat messages" ON chat_messages
    FOR ALL USING (auth.uid() = user_id);
```