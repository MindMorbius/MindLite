import { ClockIcon, ArrowPathIcon, DocumentTextIcon, FolderIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/lib/store';

export default function EditorStatusBar({ activeNote, localContent }) {
  const { categories } = useStore();

  const getWordCount = (text) => {
    if (!text) return 0;
    const cleanText = text.replace(/```[\s\S]*?```/g, '')
                         .replace(/`.*?`/g, '')
                         .replace(/\[.*?\]\(.*?\)/g, '')
                         .replace(/[#*_~`]/g, '')
                         .trim();
    return cleanText.split(/\s+/).filter(Boolean).length;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4" />
          <span>创建于 {formatDate(activeNote?.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <ArrowPathIcon className="w-4 h-4" />
          <span>更新于 {formatDate(activeNote?.updatedAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <DocumentTextIcon className="w-4 h-4" />
          <span>{getWordCount(localContent)} 字</span>
        </div>
        <div className="flex items-center space-x-1">
          <FolderIcon className="w-4 h-4" />
          <span>
            {categories.find(c => c.id === activeNote?.categoryId)?.name || '所有笔记'}
          </span>
        </div>
      </div>
    </div>
  );
}
