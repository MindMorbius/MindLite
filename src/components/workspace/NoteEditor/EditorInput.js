import React, { useState, useRef } from 'react';
import MarkdownToolbar from './MarkdownToolbar';

export default function EditorInput({ localTitle, setLocalTitle, localContent, setLocalContent, handleTitleChange, handleContentChange }) {
  const [showToolbar, setShowToolbar] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(null);
  const textareaRef = useRef(null);
  const toolbarRef = useRef(null);

  const handleInsertMarkdown = (markdown, offset) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newContent = localContent.substring(0, start) + 
      markdown + 
      localContent.substring(end);
    
    setLocalContent(newContent);
    handleContentChange({ target: { value: newContent } });
    
    // 设置新的光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + offset, start + offset);
    }, 0);
  };

  const handleSelect = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const { selectionStart } = textarea;
      if (selectionStart === textarea.selectionEnd) {
        const textBeforeCursor = localContent.substring(0, selectionStart);
        const lines = textBeforeCursor.split('\n');
        const currentLineNumber = lines.length;
        const lineHeight = 15;

        setCursorPosition({
          y: (currentLineNumber - 1) * lineHeight
        });
        setShowToolbar(true);
      }
    }
  };

  const handleBlur = (e) => {
    // 检查点击是否发生在工具栏内
    if (toolbarRef.current?.contains(e.relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      setShowToolbar(false);
    }, 200);
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
      <div className="relative">
        {showToolbar && cursorPosition && (
          <div 
            ref={toolbarRef}
            className="absolute left-0 right-0 z-10 animate-in slide-in-from-bottom-2 fade-in duration-200"
            style={{
              top: cursorPosition.y,
              transform: 'translateY(-100%)',
              willChange: 'transform, opacity'
            }}
          >
            <MarkdownToolbar onInsert={handleInsertMarkdown} />
          </div>
        )}
        <textarea
          ref={textareaRef}
          placeholder="开始输入..."
          className="w-full h-[calc(100vh-16rem)] p-2 bg-transparent border-none outline-none resize-none font-mono text-sm overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-400"
          value={localContent}
          onChange={handleContentChange}
          onSelect={handleSelect}
          onClick={handleSelect}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
} 