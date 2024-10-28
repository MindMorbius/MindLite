'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import EditorToolbar from './EditorToolbar';
import EditorContent from './EditorContent';
import EditorStatusBar from './EditorStatusBar';
import EmptyState from '../EmptyState';

export default function NoteEditor() {
  const { notes, activeNoteId } = useStore();
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

  // 如果没有笔记，显示空状态
  if (notes.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px]">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px] flex flex-col">
      {/* 固定的工具栏和状态栏 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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

      {/* 内容区域 */}
      <div className="flex-1 p-3 sm:p-4 overflow-auto">
        <EditorContent 
          localTitle={localTitle}
          setLocalTitle={setLocalTitle}
          localContent={localContent}
          setLocalContent={setLocalContent}
          isPreview={isPreview}
          showMarkmap={showMarkmap}
          setSaveStatus={setSaveStatus}
        />
      </div>
    </div>
  );
}
