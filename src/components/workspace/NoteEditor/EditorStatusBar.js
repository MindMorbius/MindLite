import { ClockIcon, ArrowPathIcon, DocumentTextIcon, FolderIcon, EyeIcon } from '@heroicons/react/24/solid';
import { useStore } from '@/lib/store';

export default function EditorStatusBar({ activeNote, localContent, saveStatus, className }) {
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
    <div className={`flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 whitespace-nowrap text-right ${className}`}>
      <span className="flex items-center gap-1">
        <ClockIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        {saveStatus === 'saving' && '保存中...'}
        {saveStatus === 'saved' && '已保存'}
        {saveStatus === 'error' && '保存失败'}
      </span>

      <span className="flex items-center gap-1">
        <DocumentTextIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        {localContent.length}字
      </span>

      {activeNote?.createdAt && (
        <span className="hidden sm:flex items-center gap-1" title="创建时间">
          <ArrowPathIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {formatDate(activeNote.createdAt)}
        </span>
      )}

      {activeNote?.updatedAt && activeNote.updatedAt !== activeNote.createdAt && (
        <span className="flex items-center gap-1" title="更新时间">
          <ArrowPathIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {formatDate(activeNote.updatedAt)}
        </span>
      )}

      {activeNote?.lastViewedAt && (
        <span className="hidden sm:flex items-center gap-1" title="最后查看">
          <EyeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          {formatDate(activeNote.lastViewedAt)}
        </span>
      )}
    </div>
  );
}
