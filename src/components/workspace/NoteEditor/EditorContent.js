import { useCallback } from 'react';
import { useStore } from '@/lib/store';
import { debounce } from 'lodash';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import MarkmapView from './Markmap';

// 添加代码高亮样式
import 'highlight.js/styles/github-dark.css';

export default function EditorContent({
  localTitle,
  setLocalTitle,
  localContent,
  setLocalContent,
  isPreview,
  showMarkmap,
  setSaveStatus
}) {
  const { activeNoteId, updateNote } = useStore();

  // 优化防抖保存
  const debouncedSave = useCallback(
    debounce((id, updates) => {
      updateNote(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }, 500),
    []
  );

  // 添加自动保存提示
  const handleSave = useCallback((id, updates) => {
    setSaveStatus('saving');
    try {
      debouncedSave(id, updates);
      setTimeout(() => setSaveStatus('saved'), 1000);
    } catch (error) {
      setSaveStatus('error');
    }
  }, [debouncedSave, setSaveStatus]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    if (activeNoteId) {
      handleSave(activeNoteId, { title: newTitle });
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    if (activeNoteId) {
      handleSave(activeNoteId, { content: newContent });
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="无标题"
        className="w-full px-2 text-lg sm:text-xl md:text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
        value={localTitle}
        onChange={handleTitleChange}
      />
      
      {showMarkmap ? (
        <MarkmapView content={localContent} show={showMarkmap} />
      ) : isPreview ? (
        <article className="prose prose-slate dark:prose-invert prose-pre:bg-gray-900 prose-pre:text-gray-100 max-w-none px-2">
          <ReactMarkdown 
            children={localContent}
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
          />
        </article>
      ) : (
        <textarea
          placeholder="开始输入..."
          className="w-full h-[calc(100vh-12rem)] sm:h-[calc(100vh-16rem)] md:h-[500px] p-2 bg-transparent border-none outline-none resize-none font-mono text-sm"
          value={localContent}
          onChange={handleContentChange}
        />
      )}
    </div>
  );
}
