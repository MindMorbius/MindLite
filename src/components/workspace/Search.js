import { useState } from 'react';
import { useStore } from '@/lib/store';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/solid';
import Button from '@/components/ui/Button';

export default function Search({ variant = 'inline', onSelect }) {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { notes, setActiveNote } = useStore();

  const filteredNotes = notes.filter(note => 
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (note) => {
    setActiveNote(note.id);
    setSearchTerm('');
    setShowSearch(false);
    onSelect?.();
  };

  if (variant === 'inline') {
    return (
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索笔记..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchTerm && (
          <SearchResults notes={filteredNotes} onSelect={handleSelect} />
        )}
      </div>
    );
  }

  return (
    <>
      <Button onClick={() => setShowSearch(!showSearch)} size="sm">
        <SearchIcon className="w-5 h-5" />
      </Button>
      
      {showSearch && (
        <div className="absolute top-14 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索笔记..."
            className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {searchTerm && (
            <SearchResults notes={filteredNotes} onSelect={handleSelect} />
          )}
        </div>
      )}
    </>
  );
}

function SearchResults({ notes, onSelect }) {
  return (
    <div className="mt-2 max-h-64 overflow-auto">
      {notes.map(note => (
        <button
          key={note.id}
          onClick={() => onSelect(note)}
          className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <div className="font-medium">{note.title || '无标题'}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {note.content || '空笔记'}
          </div>
        </button>
      ))}
    </div>
  );
}
