'use client';

import useStore from '@/lib/store';
import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon,
  DocumentPlusIcon,
  DocumentTextIcon,
  Bars3Icon as MenuIcon,
  BookmarkIcon as PinIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Search from '@/components/workspace/Search';
import FolderTree from '@/components/workspace/FolderTree';
import NoteList from '@/components/workspace/NoteList';
import { useSwipeable } from 'react-swipeable'; // 需要安装这个包

// 新增 PinnedNotes 组件
function PinnedNotes({ onNoteClick, activeNoteId }) {
  const { notes, updateNote } = useStore();
  const pinnedNotes = notes.filter(note => note.pinned);

  if (pinnedNotes.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">置顶笔记</h3>
      <div className="space-y-1">
        {pinnedNotes.map(note => (
          <div 
            key={note.id}
            className={`group relative flex items-center px-2 py-1.5 rounded-lg ${
              note.id === activeNoteId 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <button
              onClick={() => onNoteClick(note.id)}
              className="flex-1 flex items-center space-x-2 text-left min-w-0"
            >
              <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{note.title || '无标题'}</span>
            </button>
            <div className="opacity-0 group-hover:opacity-100 flex items-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateNote(note.id, { pinned: false });
                }}
                className="p-1.5 rounded-full text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                title="取消置顶"
              >
                <PinIcon className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onToggle }) {
  const { 
    notes, 
    activeNoteId,
    setActiveNote,
    addNote
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree' | 'list'

  // Move handleNewNote definition before useEffect
  const handleNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: '新建笔记',
      content: '',
      folderId: 'root',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastViewedAt: new Date().toISOString()
    };
    addNote(newNote);
  };

  useEffect(() => {
    if (!activeNoteId && notes.length > 0) {
      const lastViewedNote = [...notes].sort((a, b) => {
        const timeA = a.lastViewedAt ? new Date(a.lastViewedAt) : new Date(0);
        const timeB = b.lastViewedAt ? new Date(b.lastViewedAt) : new Date(0);
        return timeB - timeA;
      })[0];

      if (lastViewedNote) {
        setActiveNote(lastViewedNote.id);
      } else {
        handleNewNote();
      }
    }
  }, [activeNoteId, notes, setActiveNote, handleNewNote]);

  // 添加滑动手势
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onToggle(false),
    onSwipedRight: () => onToggle(true),
    trackMouse: false
  });

  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => onToggle(false)}
        />
      )}
      <div 
        {...swipeHandlers}
        className={`
          fixed md:static inset-y-0 left-0 z-50
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-all duration-300 
          w-[85vw] md:w-64 
          border-r border-gray-200 dark:border-gray-700 
          bg-white dark:bg-gray-800 
          flex flex-col
        `}
      >
        {/* 顶部工具栏 */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold">笔记</h2>
            <Button
              onClick={handleNewNote}
              size="sm"
              title="新建笔记"
            >
              <DocumentPlusIcon className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setViewMode(viewMode === 'tree' ? 'list' : 'tree')}
              size="sm"
              title={viewMode === 'tree' ? '列表视图' : '树状视图'}
            >
              {viewMode === 'tree' ? '列表' : '树状'}
            </Button>
            <button 
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* 搜索栏 */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索笔记..."
              className="w-full pl-8 pr-4 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <MagnifyingGlassIcon className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* 添加置顶笔记列表 */}
        <PinnedNotes 
          onNoteClick={setActiveNote}
          activeNoteId={activeNoteId}
        />

        {/* 主内容区 */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'tree' ? (
            <FolderTree 
              searchTerm={searchTerm}
              onNoteClick={setActiveNote}
              activeNoteId={activeNoteId}
            />
          ) : (
            <NoteList 
              searchTerm={searchTerm}
              onNoteClick={setActiveNote}
              activeNoteId={activeNoteId}
            />
          )}
        </div>
      </div>
    </>
  );
}
