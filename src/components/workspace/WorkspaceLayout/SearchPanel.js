'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function SearchPanel({ show, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { notes, setActiveNote } = useStore();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!show) return null;

  return (
    <div className="absolute top-14 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="搜索笔记..."
        className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        autoFocus
      />
      {searchTerm && (
        <div className="mt-2 max-h-64 overflow-auto">
          {filteredNotes.map(note => (
            <button
              key={note.id}
              onClick={() => {
                setActiveNote(note.id);
                setSearchTerm('');
                onClose();
              }}
              className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <div className="font-medium">{note.title || '无标题'}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {note.content || '空笔记'}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
