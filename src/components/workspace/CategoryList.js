'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';

export default function CategoryList() {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const { categories, addCategory, updateCategory, deleteCategory, activeCategory, setActiveCategory } = useStore();

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleEditCategory = (e, id, newName) => {
    e.preventDefault();
    if (newName.trim() && id !== 'default') {
      updateCategory(id, newName.trim());
      setEditingId(null);
    }
  };

  const handleDeleteCategory = (id) => {
    if (id !== 'default' && window.confirm('确定要删除这个分类吗？相关笔记将移至"所有笔记"')) {
      deleteCategory(id);
      if (activeCategory === id) {
        setActiveCategory('default');
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
      >
        <FolderIcon className="w-5 h-5" />
        <span>分类</span>
        <ChevronDownIcon className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {categories.map(category => (
            <div key={category.id} className="group flex items-center">
              {editingId === category.id ? (
                <form 
                  onSubmit={(e) => handleEditCategory(e, category.id, newCategory)}
                  className="flex-1"
                >
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded"
                    autoFocus
                    onBlur={() => setEditingId(null)}
                  />
                </form>
              ) : (
                <>
                  <button
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex-1 text-left px-4 py-2 rounded-lg ${
                      category.id === activeCategory
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                  {category.id !== 'default' && (
                    <div className="hidden group-hover:flex items-center space-x-1 px-2">
                      <button
                        onClick={() => {
                          setEditingId(category.id);
                          setNewCategory(category.name);
                        }}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <PencilIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
          <form onSubmit={handleAddCategory} className="px-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="新建分类..."
              className="w-full px-2 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </form>
        </div>
      )}
    </div>
  );
}

function FolderIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

function ChevronDownIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PencilIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2m-4 0a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2v-4a2 2 0 00-2-2m-4-2V5a2 2 0 00-2-2H7c-2 0-4 2-4 2v14c0 2 2 2 4 2H19a2 2 0 002-2v-14c0-2-2-2-4-2H7a2 2 0 00-2-2V5z" />
    </svg>
  );
}
