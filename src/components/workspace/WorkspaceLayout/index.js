'use client';

import { useState } from 'react';
import WorkspaceNav from './WorkspaceNav';
import dynamic from 'next/dynamic';

const NoteEditor = dynamic(() => import('../NoteEditor'), {
  loading: () => (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px] p-4 md:p-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
      <div className="space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  )
});

import Sidebar from '../Sidebar';

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = (value) => {
    // 如果传入具体的布尔值就使用它，否则切换当前状态
    setSidebarOpen(typeof value === 'boolean' ? value : !sidebarOpen);
  };

  return (
    <div className="h-screen flex">
      {/* 侧边栏 */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <WorkspaceNav onMenuClick={() => toggleSidebar()} />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
            <NoteEditor />
          </div>
        </main>
      </div>
    </div>
  );
}
