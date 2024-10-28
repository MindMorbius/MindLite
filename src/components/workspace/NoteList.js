'use client';

import { useStore } from '@/lib/store';
import { 
  DocumentTextIcon, 
  PencilIcon, 
  TrashIcon,
  BookmarkIcon as PinIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function NoteList({ searchTerm, onNoteClick, activeNoteId }) {
  const { notes, activeFolder, deleteNote, updateNote } = useStore();
  const [activeActions, setActiveActions] = useState(null);
  
  // 长按处理
  const handleTouchStart = (noteId) => {
    const timer = setTimeout(() => setActiveActions(noteId), 500);
    return () => clearTimeout(timer);
  };

  // 过滤笔记
  const filteredNotes = notes
    .filter(note => {
      return searchTerm ? 
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  return (
    <div className="h-full overflow-auto p-2">
      <div className="space-y-1">
        {filteredNotes.map(note => (
          <div 
            key={note.id}
            onTouchStart={() => handleTouchStart(note.id)}
            onTouchEnd={() => setActiveActions(null)}
            className={`group relative flex items-center px-3 py-2.5 rounded-lg ${
              note.id === activeNoteId 
                ? 'bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <button
              onClick={() => onNoteClick(note.id)}
              className="flex-1 flex items-center space-x-3 text-left min-w-0"
            >
              <DocumentTextIcon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm truncate">{note.title || '无标题'}</span>
            </button>
            <div className={`
              absolute right-3 flex items-center space-x-1
              bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm py-0.5 px-1 rounded
              ${activeActions === note.id || note.pinned ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'}
            `}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateNote(note.id, { pinned: !note.pinned });
                }}
                className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  note.pinned ? 'text-blue-500' : ''
                }`}
              >
                <PinIcon className={`w-4 h-4 ${note.pinned ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('确定要删除这篇笔记吗？')) {
                    deleteNote(note.id);
                  }
                }}
                className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
