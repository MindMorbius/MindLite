'use client';

import { useState, Suspense } from 'react';
import WorkspaceNav from './WorkspaceNav';
import dynamic from 'next/dynamic';
import Sidebar from '../Sidebar';

// 编辑器骨架屏
const EditorSkeleton = () => (
  <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px] p-4 md:p-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
    <div className="space-y-3">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

// 动态导入编辑器
const NoteEditor = dynamic(() => import('../NoteEditor'), {
  loading: () => <EditorSkeleton />,
  ssr: false
});

export default function WorkspaceLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <Suspense fallback={<div className="w-64 animate-pulse bg-gray-50 dark:bg-gray-800" />}>
        <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      </Suspense>
      
      <div className="flex-1 flex flex-col">
        <WorkspaceNav onMenuClick={() => setSidebarOpen(v => !v)} />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-2 md:px-4 py-4 md:py-8 max-w-4xl h-full">
            <Suspense fallback={<EditorSkeleton />}>
              <NoteEditor />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
