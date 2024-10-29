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
  PlusIcon
} from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import { Menu, Transition, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { useStore } from '@/lib/store';
import { Fragment } from 'react';

export default function WorkspaceNav({ onMenuClick }) {
  const { notes, addQuickNote, addNote } = useStore();
  
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
            <Button 
              onClick={handleAddNote}
              size="sm" 
              variant="secondary"
              className="min-w-[80px] flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              <span>笔记</span>
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
          <Button size="sm">
            <ShareIcon className="w-5 h-5" />
          </Button>
          <ThemeToggle />
          <Menu as="div" className="relative">
            <MenuButton as={Button} size="sm" aria-label="设置">
              <SettingsIcon className="w-5 h-5" />
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
              <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <MenuItem>
                  {({ isActive }) => (
                    <Link
                      href="/"
                      className={`${
                        isActive ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      <HomeIcon className="w-5 h-5 mr-2" />
                      回到主页
                    </Link>
                  )}
                </MenuItem>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
    </nav>
  );
}
