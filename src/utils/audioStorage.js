class AudioStoragePool {
  constructor() {
    this.pool = new Map();
    this.loadFromStorage();
  }

  // 从 IndexedDB 加载数据
  async loadFromStorage() {
    try {
      const db = await this.getDB();
      const tx = db.transaction('audioFiles', 'readonly');
      const store = tx.objectStore('audioFiles');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        
        request.onsuccess = () => {
          const items = request.result;
          items.forEach(item => {
            const url = URL.createObjectURL(item.blob);
            this.pool.set(item.id, { 
              blob: item.blob, 
              url, 
              metadata: item.metadata 
            });
          });
          resolve();
        };
        
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to load from storage:', error);
    }
  }

  // 获取 IndexedDB 实例
  async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('audioStorage', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('audioFiles')) {
          db.createObjectStore('audioFiles', { keyPath: 'id' });
        }
      };
    });
  }

  // 存储音频文件
  async store(id, blob, metadata = {}) {
    const url = URL.createObjectURL(blob);
    const fullMetadata = {
      ...metadata,
      duration: metadata.duration || 0
    };
    
    this.pool.set(id, { blob, url, metadata: fullMetadata });

    // 保存到 IndexedDB
    const db = await this.getDB();
    const tx = db.transaction('audioFiles', 'readwrite');
    const store = tx.objectStore('audioFiles');
    await store.put({ id, blob, metadata: fullMetadata });

    return url;
  }

  get(id) {
    return this.pool.get(id);
  }

  async delete(id) {
    const audio = this.pool.get(id);
    if (audio) {
      URL.revokeObjectURL(audio.url);
      this.pool.delete(id);

      // 从 IndexedDB 删除
      const db = await this.getDB();
      const tx = db.transaction('audioFiles', 'readwrite');
      const store = tx.objectStore('audioFiles');
      await store.delete(id);
    }
  }
}

export const audioStorage = new AudioStoragePool(); 