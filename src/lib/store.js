import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      notes: [],
      categories: [{ id: 'default', name: '所有笔记' }],
      activeNoteId: null,
      activeCategory: 'default',
      
      setActiveNote: (id) => set({ activeNoteId: id }),
      setActiveCategory: (id) => set({ activeCategory: id }),
      
      addCategory: (name) => set((state) => ({
        categories: [...state.categories, {
          id: Date.now().toString(),
          name
        }]
      })),
      
      addNote: (note) => set((state) => ({ 
        notes: [...state.notes, {
          ...note,
          categoryId: state.activeCategory
        }],
        activeNoteId: note.id 
      })),
      
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, ...updates } : note
        ).sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      })),
      
      updateCategory: (id, name) => set((state) => ({
        categories: state.categories.map(cat => 
          cat.id === id ? { ...cat, name } : cat
        )
      })),
      
      deleteCategory: (id) => set((state) => ({
        categories: state.categories.filter(cat => cat.id !== id),
        notes: state.notes.map(note => 
          note.categoryId === id ? { ...note, categoryId: 'default' } : note
        )
      })),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
      })),
      
      sortNotes: (sortBy) => set((state) => {
        const sortedNotes = [...state.notes].sort((a, b) => {
          // 置顶笔记始终在前
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          
          switch (sortBy) {
            case 'title':
              return a.title.localeCompare(b.title);
            case 'created':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'updated':
            default:
              return new Date(b.updatedAt) - new Date(a.updatedAt);
          }
        });
        return { notes: sortedNotes };
      }),
    }),
    {
      name: 'mindlite-storage',
      partialize: (state) => ({ 
        notes: state.notes,
        categories: state.categories 
      }),
    }
  )
);

export default useStore;
