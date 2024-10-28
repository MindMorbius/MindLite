import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ROOT_PATH = '/';
const QUICK_NOTES_PATH = '/速记';

export const useStore = create(
  persist(
    (set) => ({
      notes: [],
      folders: [
        { id: QUICK_NOTES_PATH, name: '速记', path: QUICK_NOTES_PATH }
      ],
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
      
      addFolder: ({ name, parentPath = ROOT_PATH }) => set((state) => {
        const newPath = parentPath === ROOT_PATH ? `/${name}` : `${parentPath}/${name}`;
        return {
          folders: [...state.folders, {
            id: newPath,
            name,
            path: newPath
          }]
        };
      }),
      
      addNote: (note) => set((state) => {
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
            path: note.path || ROOT_PATH,
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
      
      deleteFolder: (path) => set((state) => ({
        folders: state.folders.filter(folder => !folder.path.startsWith(path)),
        notes: state.notes.map(note => 
          note.path.startsWith(path) 
            ? { ...note, path: ROOT_PATH }
            : note
        )
      })),
      
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
      
      addQuickNote: () => set((state) => {
        const now = new Date();
        const id = now.getTime().toString();
        const formattedDate = now.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // 确保速记文件夹存在
        const folders = state.folders.some(f => f.path === QUICK_NOTES_PATH)
          ? state.folders
          : [...state.folders, { id: QUICK_NOTES_PATH, name: '速记', path: QUICK_NOTES_PATH }];

        return { 
          folders,
          notes: [...state.notes, {
            id,
            title: `速记 ${formattedDate}`,
            content: `---\n创建时间: ${formattedDate}\n类型: 速记\n---\n\n`,
            path: QUICK_NOTES_PATH,
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            lastViewedAt: now.toISOString()
          }],
          activeNoteId: id
        };
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
