// IndexedDB service for storing user preferences
export class PreferenceDB {
  private dbName = 'FortranInjectorDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for preferences
        if (!db.objectStoreNames.contains('preferences')) {
          const store = db.createObjectStore('preferences', { keyPath: 'key' });
          store.createIndex('key', 'key', { unique: true });
        }
      };
    });
  }

  async setPreference(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getPreference(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value || null);
    });
  }

  async getAllPreferences(): Promise<Record<string, any>> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readonly');
      const store = transaction.objectStore('preferences');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const preferences: Record<string, any> = {};
        request.result.forEach(item => {
          preferences[item.key] = item.value;
        });
        resolve(preferences);
      };
    });
  }

  async clearPreferences(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['preferences'], 'readwrite');
      const store = transaction.objectStore('preferences');
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

// Preference keys
export const PREFERENCE_KEYS = {
  WORKSPACE_PATH: 'workspacePath',
  OUTPUT_PATH: 'outputPath',
  THEME_MODE: 'themeMode',
  FUNCTION_NAME: 'lastFunctionName'
} as const;
