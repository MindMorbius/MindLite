'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import EditorToolbar from './EditorToolbar';
import EditorContent from './EditorContent';
import EditorStatusBar from './EditorStatusBar';

export default function NoteEditor() {
  const { notes, activeNoteId } = useStore();
  const activeNote = notes.find(note => note.id === activeNoteId);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showMarkmap, setShowMarkmap] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm min-h-[calc(100vh-8rem)] md:min-h-[600px] p-4 md:p-6">
      <EditorToolbar 
        isPreview={isPreview}
        setIsPreview={setIsPreview}
        showMarkmap={showMarkmap}
        setShowMarkmap={setShowMarkmap}
        saveStatus={saveStatus}
      />

      <EditorContent 
        localTitle={localTitle}
        setLocalTitle={setLocalTitle}
        localContent={localContent}
        setLocalContent={setLocalContent}
        isPreview={isPreview}
        showMarkmap={showMarkmap}
        setSaveStatus={setSaveStatus}
      />

      <EditorStatusBar activeNote={activeNote} localContent={localContent} />
    </div>
  );
}
