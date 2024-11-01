'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';
import { 
  Bars3Icon as MenuIcon, 
  MagnifyingGlassIcon as SearchIcon,
  ChevronDownIcon,
  ShareIcon,
  Cog6ToothIcon as SettingsIcon,
  HomeIcon,
  PlusIcon,
  UserIcon
} from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import { Menu, Transition, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { useStore } from '@/lib/store';
import { Fragment } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import AuthModal from '@/components/auth/AuthModal'
import UserDialog from '@/components/auth/UserDialog'

export default function WorkspaceNav({ onMenuClick }) {
  const { notes, addQuickNote, addNote, activeNoteId, setActiveNote, user, signOut } = useStore();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false)
  
  const totalNotes = notes.length;
  const quickNotes = notes.filter(note => note.path === '/速记').length;
  const pinnedNotes = notes.filter(note => note.pinned).length;

  const handleAddNote = () => {
    const now = new Date();
    addNote({
      id: now.getTime().toString(),
      title: '未命名笔记',
      content: '',
    });
  };

  // 获取当前活动笔记
  const activeNote = notes.find(note => note.id === activeNoteId);
  
  // 获取最近查看的笔记（不包括当前笔记）
  const recentNotes = notes
    .filter(note => note.id !== activeNoteId && note.lastViewedAt)
    .sort((a, b) => new Date(b.lastViewedAt) - new Date(a.lastViewedAt))
    .slice(0, 5);

  return (
    <nav className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-full px-2 md:px-4 flex items-center justify-between">
        {/* 左侧区域 */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            onClick={onMenuClick} 
            size="sm" 
            variant="ghost" 
            className="md:hidden"
          >
            <MenuIcon className="w-5 h-5" />
          </Button>
          
          {/* 移动端笔记切换按钮 */}
          <Menu as="div" className="relative md:hidden">
            <MenuButton
              as={Button}
              size="sm"
              variant="ghost"
              className="max-w-[150px] flex items-center space-x-1"
            >
              <span className="truncate">{activeNote?.title || '未选择笔记'}</span>
              <ChevronDownIcon className="w-4 h-4 flex-shrink-0" />
            </MenuButton>
            
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute left-0 mt-2 w-60 origin-top-left bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                {/* 添加新笔记按钮 */}
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={handleAddNote}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } w-full text-left px-4 py-2 text-sm flex items-center text-blue-600 dark:text-blue-400`}
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      <span>新建笔记</span>
                    </button>
                  )}
                </MenuItem>

                {/* 分隔线 */}
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

                {recentNotes.map(note => (
                  <MenuItem key={note.id}>
                    {({ active }) => (
                      <button
                        onClick={() => setActiveNote(note.id)}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } w-full text-left px-4 py-2 text-sm`}
                      >
                        <div className="font-medium truncate">{note.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(note.lastViewedAt), {
                            addSuffix: true,
                            locale: zhCN
                          })}
                        </div>
                      </button>
                    )}
                  </MenuItem>
                ))}
              </MenuItems>
            </Transition>
          </Menu>

          <div className="flex space-x-2">
            <Button 
              onClick={addQuickNote} 
              size="sm" 
              variant="primary"
              className="min-w-[80px] flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              <span>速记</span>
            </Button>

          </div>
          <div className="hidden md:flex items-center divide-x divide-gray-200 dark:divide-gray-700">
            <span className="px-3 text-sm text-gray-600 dark:text-gray-300">笔记: {totalNotes}</span>
            <span className="px-3 text-sm text-gray-600 dark:text-gray-300">速记: {quickNotes}</span>
            <span className="px-3 text-sm text-gray-600 dark:text-gray-300">置顶: {pinnedNotes}</span>
          </div>
        </div>
        
        {/* 右侧按钮 */}
        <div className="flex items-center space-x-2">
          {user ? (
            <button
              onClick={() => setShowUserDialog(true)}
              className="flex items-center relative"
            >
              <img 
                src={user.user_metadata.avatar_url} 
                alt="avatar"
                className="w-8 h-8 rounded-full hover:ring-4 ring-blue-500/50 transition-all duration-300 hover:scale-110 shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </button>
          ) : (
            <Button
              size="sm"
              variant="ghost" 
              onClick={() => setIsLoginOpen(true)}
              className="flex items-center space-x-1 transition-all duration-300 hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <UserIcon className="w-5 h-5" />
              <span className="hidden md:inline font-medium">登录</span>
            </Button>
          )}
        </div>
        
      </div>
      
      <AuthModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <UserDialog 
        isOpen={showUserDialog} 
        onClose={() => setShowUserDialog(false)} 
      />
    </nav>
  );
}
