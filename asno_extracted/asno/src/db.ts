import { Page, AppSettings, Automation } from './types';

const DB_NAME = 'asno_db';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB database');
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pages')) {
        db.createObjectStore('pages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('automations')) {
        db.createObjectStore('automations', { keyPath: 'id' });
      }
    };
  });
};

export const getPagesFromDB = async (): Promise<Page[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pages', 'readonly');
    const store = transaction.objectStore('pages');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const savePagesToDB = async (pages: Page[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('pages', 'readwrite');
    const store = transaction.objectStore('pages');

    // Clear existing pages first to handle deletions
    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      let completed = 0;
      if (pages.length === 0) {
        resolve();
        return;
      }

      pages.forEach((page) => {
        const putReq = store.put(page);
        putReq.onsuccess = () => {
          completed++;
          if (completed === pages.length) {
            resolve();
          }
        };
        putReq.onerror = () => {
          reject(putReq.error);
        };
      });
    };

    clearRequest.onerror = () => {
      reject(clearRequest.error);
    };
  });
};

export const getSettingsFromDB = async (): Promise<AppSettings | null> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get('app_settings');

    request.onsuccess = () => {
      resolve(request.result ? (request.result.value as AppSettings) : null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const saveSettingsToDB = async (settings: AppSettings): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key: 'app_settings', value: settings });

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const getAutomationsFromDB = async (): Promise<Automation[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('automations', 'readonly');
    const store = transaction.objectStore('automations');
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result || []);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export const saveAutomationsToDB = async (automations: Automation[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('automations', 'readwrite');
    const store = transaction.objectStore('automations');

    const clearRequest = store.clear();

    clearRequest.onsuccess = () => {
      let completed = 0;
      if (automations.length === 0) {
        resolve();
        return;
      }

      automations.forEach((automation) => {
        const putReq = store.put(automation);
        putReq.onsuccess = () => {
          completed++;
          if (completed === automations.length) {
            resolve();
          }
        };
        putReq.onerror = () => {
          reject(putReq.error);
        };
      });
    };

    clearRequest.onerror = () => {
      reject(clearRequest.error);
    };
  });
};
