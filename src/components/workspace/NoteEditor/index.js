'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import EditorToolbar from './EditorToolbar';
import EditorStatusBar from './EditorStatusBar';
import EmptyState from '../EmptyState';
import EditorInput from './EditorInput';
import EditorPreview from './EditorPreview';
import MarkmapView from './markmap';

export default function NoteEditor() {
  const { notes, activeNoteId, updateNote } = useStore();
  const activeNote = notes.find(note => note.id === activeNoteId);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showMarkmap, setShowMarkmap] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isTranscribing, setIsTranscribing] = useState(false);

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

  const renderEditorContent = () => {
    if (showMarkmap) {
      return <MarkmapView content={localContent} show={showMarkmap} />;
    }

    if (isPreview) {
      return (
        <EditorPreview
          localTitle={localTitle}
          localContent={localContent}
        />
      );
    }

    return (
      <EditorInput
        localTitle={localTitle}
        setLocalTitle={setLocalTitle}
        localContent={localContent}
        setLocalContent={setLocalContent}
        handleTitleChange={handleTitleChange}
        handleContentChange={handleContentChange}
      />
    );
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
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* 固定的工具栏 */}
      <div className="flex-none border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4">
          <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-4 w-full">
            <EditorToolbar 
              isPreview={isPreview}
              setIsPreview={setIsPreview}
              showMarkmap={showMarkmap}
              setShowMarkmap={setShowMarkmap}
              isTranscribing={isTranscribing}
              setIsTranscribing={setIsTranscribing}
              className="self-end sm:self-auto"
            />
            <EditorStatusBar 
              activeNote={activeNote} 
              localContent={localContent}
              saveStatus={saveStatus} 
              className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 self-end sm:self-auto sm:ml-auto"
            />
          </div>
        </div>
      </div>

      {/* 内容区域 - 只有这里可以滚动 */}
      <div className="flex-1 overflow-auto">
        <div className="p-3 sm:p-4">
          {renderEditorContent()}
        </div>
      </div>
    </div>
  );
}
