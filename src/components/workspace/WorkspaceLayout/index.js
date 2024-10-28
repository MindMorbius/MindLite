'use client';

import { useState } from 'react';
import WorkspaceNav from './WorkspaceNav';
import NoteEditor from '../NoteEditor/index.js';  // 更新引用路径
import Sidebar from '../Sidebar';

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex">
      {/* 移动端遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* 侧边栏 */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 md:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300
      `}>
        <Sidebar isOpen={true} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <WorkspaceNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl">
            <NoteEditor />
          </div>
        </main>
      </div>
    </div>
  );
}
