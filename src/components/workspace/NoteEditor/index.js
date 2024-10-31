'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState, useCallback, useRef } from 'react';
import { debounce } from 'lodash';
import EditorToolbar from './EditorToolbar';
import EditorStatusBar from './EditorStatusBar';
import EmptyState from '../EmptyState';
import EditorContent from './EditorContent';

export default function NoteEditor() {
  const { notes, activeNoteId, updateNote } = useStore();
  const activeNote = notes.find(note => note.id === activeNoteId);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showMarkmap, setShowMarkmap] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [layoutMode, setLayoutMode] = useState('edit');

  // 当活动笔记改变时更新本地状态
  useEffect(() => {
    if (activeNote) {
      setLocalTitle(activeNote.title);
      setLocalContent(activeNote.content);
    } else {
      setLocalTitle('');
      setLocalContent('');
    }
  }, [activeNote]);

  // 优化防抖保存
  const debouncedSave = useCallback(
    debounce((id, updates) => {
      updateNote(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    }, 500),
    [updateNote]
  );

  const handleSave = useCallback((id, updates) => {
    setSaveStatus('saving');
    try {
      debouncedSave(id, updates);
      setTimeout(() => setSaveStatus('saved'), 1000);
    } catch (error) {
      setSaveStatus('error');
    }
  }, [debouncedSave]);

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

  // 如果没有笔记，显示空状态
  if (notes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px]">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px]">
      {/* 工具栏区域 */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col p-3 sm:p-4 gap-3">
          <EditorToolbar 
            layoutMode={layoutMode}
            setLayoutMode={setLayoutMode}
            showMarkmap={showMarkmap}
            setShowMarkmap={setShowMarkmap}
            isTranscribing={isTranscribing}
            setIsTranscribing={setIsTranscribing}
          />
          <EditorStatusBar 
            activeNote={activeNote} 
            localContent={localContent}
            saveStatus={saveStatus} 
            className="text-xs sm:text-sm text-gray-500 dark:text-gray-400"
          />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto relative">
        <div className="absolute inset-0 px-3 sm:px-4 pt-3 sm:pt-4">
          <EditorContent
            layoutMode={layoutMode}
            showMarkmap={showMarkmap}
            localTitle={localTitle}
            localContent={localContent}
            setLocalTitle={setLocalTitle}
            setLocalContent={setLocalContent}
            handleTitleChange={handleTitleChange}
            handleContentChange={handleContentChange}
          />
        </div>
      </div>
    </div>
  );
}
