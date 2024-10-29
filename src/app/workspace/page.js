'use client';

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';

// 基础布局骨架
const WorkspaceSkeleton = () => (
  <div className="h-screen flex">
    <div className="w-64 border-r border-gray-200 dark:border-gray-700 animate-pulse">
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
    </div>
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"></div>
      <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg h-[calc(100vh-8rem)] animate-pulse"></div>
      </div>
    </div>
  </div>
);

// 预加载关键组件
const WorkspaceLayout = dynamic(
  () => import('@/components/workspace/WorkspaceLayout'),
  {
    loading: () => <WorkspaceSkeleton />,
    ssr: false
  }
);

// 预加载编辑器
const preloadEditor = () => {
  const timer = setTimeout(() => {
    import('@/components/workspace/NoteEditor');
  }, 1000);
  return () => clearTimeout(timer);
};

export default function WorkspacePage() {
  // 组件挂载后预加载编辑器
  useEffect(preloadEditor, []);
  
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <WorkspaceLayout />
    </Suspense>
  );
}
