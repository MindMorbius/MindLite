'use client';

import useStore from '@/lib/store';
import { useState } from 'react';
import { 
  PlusIcon,
  FolderIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  Bars3Icon as MenuIcon,
  BookmarkIcon as PinIcon  // 使用 BookmarkIcon 作为 Pin 图标
} from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import Search from '@/components/workspace/Search';

export default function Sidebar({ isOpen, onToggle }) {
  const { 
    notes, 
    categories,
    activeNoteId, 
    activeCategory,
    setActiveNote, 
    setActiveCategory,
    addNote,
    addCategory 
  } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  // 根据当前分类和搜索词过滤笔记
  const filteredNotes = notes.filter(note => {
    const matchesSearch = (note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'default' || note.categoryId === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleNewNote = () => {
    const newNote = {
      id: Date.now(),
      title: '新建笔记',
      content: '',
      categoryId: activeCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addNote(newNote);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
      setShowCategoryInput(false);
    }
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-0'} transition-all duration-300 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-full flex flex-col`}>
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold">我的笔记</h2>
        <button 
          onClick={onToggle}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* 搜索框 */}
        <Search variant="inline" />

        {/* 分类列表 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">分类</h3>
            <button
              onClick={() => setShowCategoryInput(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
          
          {showCategoryInput && (
            <form onSubmit={handleAddCategory} className="mb-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="新建分类..."
                className="w-full px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
                onBlur={() => !newCategory && setShowCategoryInput(false)}
              />
            </form>
          )}

          <div className="space-y-1">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`w-full text-left px-3 py-1.5 rounded text-sm ${
                  category.id === activeCategory
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 新建笔记按钮 */}
        <button 
          onClick={handleNewNote}
          className="w-full flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg mb-4"
        >
          <PlusIcon className="w-5 h-5" />
          <span>新建笔记</span>
        </button>
        
        {/* 笔记列表 */}
        <div className="flex-1 overflow-auto">
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <NoteItem
                key={note.id}
                note={note}
                title={note.title || '无标题'}
                date={new Date(note.updatedAt).toLocaleDateString()}
                active={note.id === activeNoteId}
                onClick={() => setActiveNote(note.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteItem({ note, title, date, active, onClick }) {
  const { deleteNote, updateNote, categories } = useStore();
  const [showActions, setShowActions] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个笔记吗？')) {
      deleteNote(note.id);
    }
  };

  const handlePin = (e) => {
    e.stopPropagation();
    updateNote(note.id, { pinned: !note.pinned });
  };

  const handleChangeCategory = (e, categoryId) => {
    e.stopPropagation();
    updateNote(note.id, { categoryId });
  };

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`group relative p-2 rounded-lg cursor-pointer ${
        active ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium flex items-center space-x-2">
            {note.pinned && <PinIcon className="w-3 h-3 text-blue-500" />}
            <span>{title}</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
        </div>
        
        {/* 操作按钮 */}
        {showActions && (
          <div className="flex items-center space-x-1">
            <Button
              onClick={handlePin}
              size="sm"
              title={note.pinned ? "取消置顶" : "置顶"}
            >
              <PinIcon className="w-3 h-3" />
            </Button>
            <div className="relative">
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCategoryMenu(!showCategoryMenu);
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="移动到分类"
              >
                <FolderIcon className="w-3 h-3" />
              </Button>
              {showCategoryMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-10">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={(e) => handleChangeCategory(e, category.id)}
                      className="w-full text-left px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={handleDelete}
              size="sm"
              variant="danger"
              title="删除"
            >
              <TrashIcon className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteStats({ notes, activeCategory }) {
  const categoryNotes = notes.filter(note => 
    activeCategory === 'default' ? true : note.categoryId === activeCategory
  );
  
  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="flex justify-between">
        <span>笔记数量</span>
        <span>{categoryNotes.length}</span>
      </div>
      <div className="flex justify-between">
        <span>字数统计</span>
        <span>{categoryNotes.reduce((acc, note) => 
          acc + (note.content?.replace(/<[^>]+>/g, '').length || 0), 0
        )}</span>
      </div>
    </div>
  );
}
