'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  FolderIcon,
  DocumentTextIcon,
  ChevronRightIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderPlusIcon,
  BookmarkIcon as PinIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';

// 添加 NoteTreeItem 组件定义
function NoteTreeItem({ note, active, onClick }) {
  const { deleteNote, updateNote, folders } = useStore();
  const [showMoveModal, setShowMoveModal] = useState(false);

  const handleMove = (folderId) => {
    updateNote(note.id, { folderId });
    setShowMoveModal(false);
  };

  return (
    <div className="relative"> {/* 添加relative定位 */}
      <div className={`group relative flex items-center pl-5 pr-2 py-1.5 rounded-lg ${
        active ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}>
        <button
          onClick={onClick}
          className="flex-1 flex items-center space-x-2 text-left min-w-0"
        >
          <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{note.title || '无标题'}</span>
        </button>
        <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center space-x-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-0.5 px-1 rounded">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMoveModal(!showMoveModal); // 切换显示状态
            }}
            className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${
              showMoveModal ? 'bg-gray-200 dark:bg-gray-600' : ''
            }`}
            title="移动笔记"
          >
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateNote(note.id, { pinned: !note.pinned });
            }}
            className={`p-1.5 rounded-full ${
              note.pinned 
                ? 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
            title={note.pinned ? '取消置顶' : '置顶笔记'}
          >
            <PinIcon className={`w-3.5 h-3.5 ${note.pinned ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('确定要删除这篇笔记吗？')) {
                deleteNote(note.id);
              }
            }}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full"
            title="删除笔记"
          >
            <TrashIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {showMoveModal && (
        <MoveNoteModal
          note={note}
          folders={folders}
          onMove={handleMove}
          onClose={() => setShowMoveModal(false)}
        />
      )}
    </div>
  );
}

// 添加 FolderActionButtons 组件
function FolderActionButtons({ folder, onEdit, onDelete }) {
  const { addFolder } = useStore();

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          const name = window.prompt('请输入子文件夹名称');
          if (name?.trim()) {
            addFolder({ name: name.trim(), parentId: folder.id });
          }
        }}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        title="新建子文件夹"
      >
        <FolderPlusIcon className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
        title="重命名文件夹"
      >
        <PencilIcon className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('确定要删除此文件夹吗？文件夹内的笔记将移至根目录。')) {
            onDelete();
          }
        }}
        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
        title="删除文件夹"
      >
        <TrashIcon className="w-3 h-3" />
      </button>
    </>
  );
}

// 修改 MoveNoteModal 组件为下拉菜单样式
function MoveNoteModal({ note, folders, onMove, onClose }) {
  return (
    <>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="absolute right-0 top-8 z-50 w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onMove(null)}
          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
        >
          <DocumentTextIcon className="w-4 h-4" />
          <span>移至根目录</span>
        </button>
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
        {folders
          .filter(f => f.id !== 'root')
          .map(folder => (
            <button
              key={folder.id}
              onClick={() => onMove(folder.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
            >
              <FolderIcon className="w-4 h-4" />
              <span>{folder.name}</span>
            </button>
          ))}
      </div>
    </>
  );
}

export default function FolderTree({ searchTerm, onNoteClick, activeNoteId }) {
  const { folders, notes, addFolder, updateFolder, deleteFolder } = useStore();
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [editingId, setEditingId] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');

  const toggleFolder = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFolderContents = (folderId) => {
    const subFolders = folders.filter(f => f.parentId === folderId);
    const folderNotes = notes
      .filter(n => {
        if (searchTerm) {
          return n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 n.content?.toLowerCase().includes(searchTerm.toLowerCase());
        }
        if (folderId === 'root') {
          return !n.folderId || n.folderId === 'root';
        }
        return n.folderId === folderId;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });

    return (
      <div className="ml-4 space-y-1">
        {subFolders.map(folder => renderFolder(folder))}
        {folderNotes.map(note => (
          <NoteTreeItem 
            key={note.id}
            note={note}
            active={note.id === activeNoteId}
            onClick={() => onNoteClick(note.id)}
          />
        ))}
      </div>
    );
  };

  const renderFolder = (folder) => {
    const isExpanded = expandedFolders.has(folder.id);
    
    return (
      <div key={folder.id}>
        <div className="group flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <button
            onClick={() => toggleFolder(folder.id)}
            className="p-1"
          >
            <ChevronRightIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
          <div className="flex-1 flex items-center py-1">
            <FolderIcon className="w-4 h-4 mx-1" />
            {editingId === folder.id ? (
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onBlur={() => {
                  if (newFolderName.trim()) {
                    updateFolder(folder.id, { name: newFolderName.trim() });
                  }
                  setEditingId(null);
                }}
                className="flex-1 px-2 py-0.5 text-sm bg-gray-100 dark:bg-gray-700 rounded"
                autoFocus
              />
            ) : (
              <span className="flex-1 px-2 text-sm">{folder.name}</span>
            )}
          </div>
          {folder.id !== 'root' && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 pr-2">
              <FolderActionButtons 
                folder={folder}
                onEdit={() => {
                  setEditingId(folder.id);
                  setNewFolderName(folder.name);
                }}
                onDelete={() => deleteFolder(folder.id)}
              />
            </div>
          )}
        </div>
        {isExpanded && renderFolderContents(folder.id)}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto p-2 space-y-1">
      <div className="px-2 mb-2">
        <Button
          onClick={() => {
            const name = window.prompt('请输入文件夹名称');
            if (name?.trim()) {
              addFolder({ name: name.trim(), parentId: 'root' });
            }
          }}
          size="sm"
          className="w-full flex items-center justify-center"
        >
          <FolderPlusIcon className="w-4 h-4 mr-1.5" />
          新建文件夹
        </Button>
      </div>
      
      {/* 直接渲染根目录内容，不显示root文件夹本身 */}
      <div className="space-y-1">
        {folders.filter(f => f.parentId === 'root').map(folder => renderFolder(folder))}
        {notes
          .filter(n => {
            if (searchTerm) {
              return n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     n.content?.toLowerCase().includes(searchTerm.toLowerCase());
            }
            return !n.folderId || n.folderId === 'root';
          })
          .sort((a, b) => {
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          })
          .map(note => (
            <NoteTreeItem 
              key={note.id}
              note={note}
              active={note.id === activeNoteId}
              onClick={() => onNoteClick(note.id)}
            />
          ))}
      </div>
    </div>
  );
}
