import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set) => ({
      notes: [],
      folders: [{ id: 'root', name: '所有笔记', parentId: null }],
      activeNoteId: null,
      
      setActiveNote: (id) => set((state) => {
        if (!id) return { activeNoteId: null };
        return { 
          activeNoteId: id,
          notes: state.notes.map(note => 
            note.id === id 
              ? { ...note, lastViewedAt: new Date().toISOString() }
              : note
          )
        };
      }),
      
      addFolder: ({ name, parentId = null }) => set((state) => ({
        folders: [...state.folders, {
          id: Date.now().toString(),
          name,
          parentId
        }]
      })),
      
      addNote: (note) => set((state) => {
        // 检查重名并添加后缀
        let title = note.title;
        let counter = 1;
        while (state.notes.some(n => n.title === title)) {
          counter++;
          title = `${note.title} #${counter}`;
        }

        return { 
          notes: [...state.notes, {
            ...note,
            title,
            folderId: note.folderId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastViewedAt: new Date().toISOString()
          }],
          activeNoteId: note.id 
        };
      }),
      
      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map(note => 
          note.id === id ? { ...note, ...updates } : note
        ).sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.updatedAt) - new Date(a.updatedAt);
        })
      })),
      
      updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(folder => 
          folder.id === id ? { ...folder, ...updates } : folder
        )
      })),
      
      deleteFolder: (id) => set((state) => {
        // 递归获取所有子文件夹ID
        const getSubFolderIds = (folderId) => {
          const subFolders = state.folders.filter(f => f.parentId === folderId);
          return [folderId, ...subFolders.flatMap(f => getSubFolderIds(f.id))];
        };
        
        const folderIdsToDelete = getSubFolderIds(id);
        
        return {
          folders: state.folders.filter(folder => !folderIdsToDelete.includes(folder.id)),
          notes: state.notes.map(note => 
            folderIdsToDelete.includes(note.folderId) 
              ? { ...note, folderId: 'root' } 
              : note
          )
        };
      }),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter(note => note.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
      })),
      
      sortNotes: (sortBy) => set((state) => {
        const sortedNotes = [...state.notes].sort((a, b) => {
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
        folders: state.folders 
      }),
    }
  )
);

export default useStore;
