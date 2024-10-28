'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { 
  Bars3Icon as MenuIcon, 
  MagnifyingGlassIcon as SearchIcon,
  ChevronDownIcon,
  ShareIcon,
  Cog6ToothIcon as SettingsIcon 
} from '@heroicons/react/24/solid';
import Search from '@/components/Search';

export default function WorkspaceNav({ onMenuClick }) {
  const [showSearch, setShowSearch] = useState(false);
  const { notes, setActiveNote } = useStore();

  return (
    <nav className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-full px-2 md:px-4 flex items-center justify-between">
        {/* 左侧菜单按钮和搜索 */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <button 
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg md:hidden"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <Link 
            href="/"
            className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            MindLite
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <SearchIcon className="w-5 h-5" />
          </button>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">最近编辑</span>
            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronDownIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* 搜索框 */}
        {showSearch && (
          <Search variant="popup" onSelect={() => setShowSearch(false)} />
        )}
        
        {/* 右侧按钮 */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <ShareIcon className="w-5 h-5" />
          </button>
          <ThemeToggle />
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </nav>
  );
}
