import React, { useState, useRef } from 'react';

export default function EditorInput({ 
  localTitle, 
  setLocalTitle, 
  localContent, 
  setLocalContent, 
  handleTitleChange, 
  handleContentChange,
  showTitle = true,
  textareaRef,
  onScroll,
}) {
  return (
    <div className="h-full flex flex-col">
      {showTitle && (
        <input
          type="text"
          placeholder="无标题"
          className="w-full px-2 text-lg sm:text-xl md:text-2xl font-bold bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
          value={localTitle}
          onChange={handleTitleChange}
        />
      )}
      <div className={`relative flex-1 ${showTitle ? 'mt-4' : 'mt-0'}`}>
        <textarea
          ref={textareaRef}
          placeholder="开始输入..."
          className="w-full h-full p-2 bg-transparent border-none outline-none resize-none font-mono text-sm overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-500 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-400"
          value={localContent}
          onChange={handleContentChange}
          onScroll={onScroll}
        />
      </div>
    </div>
  );
} 