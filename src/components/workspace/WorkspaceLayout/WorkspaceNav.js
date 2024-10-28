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
  Cog6ToothIcon as SettingsIcon,
  HomeIcon
} from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';
import { Menu } from '@headlessui/react';

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
          <Menu as="div" className="relative">
            <Menu.Button as={Button} size="sm">
              <SettingsIcon className="w-5 h-5" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/"
                    className={`${
                      active ? 'bg-gray-100 dark:bg-gray-700' : ''
                    } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    <HomeIcon className="w-5 h-5 mr-2" />
                    回到主页
                  </Link>
                )}
              </Menu.Item>
              {/* 可以在这里添加更多菜单项 */}
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </nav>
  );
}
