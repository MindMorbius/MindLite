'use client';

import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import SearchPanel from './SearchPanel';
import { useState } from 'react';
import { 
  Bars3Icon as MenuIcon, 
  MagnifyingGlassIcon as SearchIcon,
  ChevronDownIcon,
  ShareIcon,
  Cog6ToothIcon as SettingsIcon 
} from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';

export default function WorkspaceNav({ onMenuClick }) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <nav className="h-14 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="h-full px-2 md:px-4 flex items-center justify-between">
        {/* 左侧菜单按钮和搜索 */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button onClick={onMenuClick} size="sm" className="md:hidden">
            <MenuIcon className="w-5 h-5" />
          </Button>
          <Link 
            href="/"
            className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            MindLite
          </Link>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2" />
          <Button onClick={() => setShowSearch(!showSearch)} size="sm">
            <SearchIcon className="w-5 h-5" />
          </Button>
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">最近编辑</span>
            <Button size="sm">
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* 搜索面板 */}
        <SearchPanel show={showSearch} onClose={() => setShowSearch(false)} />
        
        {/* 右侧按钮 */}
        <div className="flex items-center space-x-2">
          <Button size="sm">
            <ShareIcon className="w-5 h-5" />
          </Button>
          <ThemeToggle />
          <Button size="sm">
            <SettingsIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
