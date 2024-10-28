'use client';

import dynamic from 'next/dynamic';

const WorkspaceLayout = dynamic(() => import('@/components/workspace/WorkspaceLayout'), {
  loading: () => (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-600 dark:text-gray-400">
        加载中...
      </div>
    </div>
  ),
  ssr: false
});

export default function WorkspacePage() {
  return <WorkspaceLayout />;
}
