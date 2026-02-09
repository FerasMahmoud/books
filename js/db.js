/**
 * IndexedDB Wrapper for Arabic Book Library PWA
 * Database: BooksLibraryDB v1
 *
 * Stores: reading_progress, bookmarks, highlights, comments, daily_stats, settings
 */

(function() {
  'use strict';

  const DB_NAME = 'BooksLibraryDB';
  const DB_VERSION = 1;
  let db = null;

  /**
   * Initialize database and create object stores
   */
  async function init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        db = request.result;
        console.log('Database initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        console.log('Upgrading database schema...');

        // 1. Reading Progress Store
        if (!db.objectStoreNames.contains('reading_progress')) {
          const progressStore = db.createObjectStore('reading_progress', { keyPath: 'bookPath' });
          progressStore.createIndex('isCompleted', 'isCompleted', { unique: false });
          progressStore.createIndex('lastReadAt', 'lastReadAt', { unique: false });
        }

        // 2. Bookmarks Store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
          bookmarksStore.createIndex('bookPath', 'bookPath', { unique: false });
        }

        // 3. Highlights Store
        if (!db.objectStoreNames.contains('highlights')) {
          const highlightsStore = db.createObjectStore('highlights', { keyPath: 'id', autoIncrement: true });
          highlightsStore.createIndex('bookPath', 'bookPath', { unique: false });
          highlightsStore.createIndex('color', 'color', { unique: false });
        }

        // 4. Comments Store
        if (!db.objectStoreNames.contains('comments')) {
          const commentsStore = db.createObjectStore('comments', { keyPath: 'id', autoIncrement: true });
          commentsStore.createIndex('bookPath', 'bookPath', { unique: false });
        }

        // 5. Daily Stats Store
        if (!db.objectStoreNames.contains('daily_stats')) {
          db.createObjectStore('daily_stats', { keyPath: 'date' });
        }

        // 6. Settings Store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Get current date in YYYY-MM-DD format
   */
  function getTodayKey() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==================== READING PROGRESS ====================

  async function getProgress(bookPath) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reading_progress'], 'readonly');
        const store = transaction.objectStore('reading_progress');
        const request = store.get(bookPath);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getProgress error:', error);
      return null;
    }
  }

  async function saveProgress(bookPath, data) {
    try {
      return new Promise(async (resolve, reject) => {
        // Get existing data to merge
        const existing = await getProgress(bookPath);

        const merged = {
          bookPath,
          scrollPercent: data.scrollPercent !== undefined ? data.scrollPercent : (existing?.scrollPercent || 0),
          scrollTop: data.scrollTop !== undefined ? data.scrollTop : (existing?.scrollTop || 0),
          lastReadAt: data.lastReadAt !== undefined ? data.lastReadAt : Date.now(),
          isCompleted: data.isCompleted !== undefined ? data.isCompleted : (existing?.isCompleted || false),
          totalReadTimeMs: data.totalReadTimeMs !== undefined
            ? data.totalReadTimeMs
            : (existing?.totalReadTimeMs || 0)
        };

        const transaction = db.transaction(['reading_progress'], 'readwrite');
        const store = transaction.objectStore('reading_progress');
        const request = store.put(merged);

        request.onsuccess = () => {
          // Cloud sync (fire-and-forget)
          if (window.CloudSync) {
            CloudSync.pushProgress(bookPath, merged);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('saveProgress error:', error);
    }
  }

  async function getAllProgress() {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reading_progress'], 'readonly');
        const store = transaction.objectStore('reading_progress');
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getAllProgress error:', error);
      return [];
    }
  }

  async function markCompleted(bookPath) {
    try {
      return saveProgress(bookPath, { isCompleted: true });
    } catch (error) {
      console.error('markCompleted error:', error);
    }
  }

  async function getCompletedBooks() {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reading_progress'], 'readonly');
        const store = transaction.objectStore('reading_progress');
        const index = store.index('isCompleted');
        const request = index.getAll(true);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getCompletedBooks error:', error);
      return [];
    }
  }

  async function getInProgressBooks() {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['reading_progress'], 'readonly');
        const store = transaction.objectStore('reading_progress');
        const index = store.index('isCompleted');
        const request = index.getAll(false);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getInProgressBooks error:', error);
      return [];
    }
  }

  // ==================== BOOKMARKS ====================

  async function addBookmark(bookmark) {
    try {
      return new Promise((resolve, reject) => {
        const data = {
          bookPath: bookmark.bookPath,
          bookTitle: bookmark.bookTitle,
          scrollPercent: bookmark.scrollPercent,
          note: bookmark.note || '',
          createdAt: bookmark.createdAt || Date.now()
        };

        const transaction = db.transaction(['bookmarks'], 'readwrite');
        const store = transaction.objectStore('bookmarks');
        const request = store.add(data);

        request.onsuccess = () => {
          if (window.CloudSync && !bookmark._fromSync) {
            CloudSync.pushBookmark(data);
          }
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('addBookmark error:', error);
      return null;
    }
  }

  async function getBookmarks(bookPath = null) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['bookmarks'], 'readonly');
        const store = transaction.objectStore('bookmarks');

        if (bookPath) {
          const index = store.index('bookPath');
          const request = index.getAll(bookPath);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        } else {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        }
      });
    } catch (error) {
      console.error('getBookmarks error:', error);
      return [];
    }
  }

  async function deleteBookmark(id) {
    try {
      // Get bookmark data before deleting (for cloud sync)
      const bookmark = await new Promise((resolve) => {
        const tx = db.transaction(['bookmarks'], 'readonly');
        const s = tx.objectStore('bookmarks');
        const r = s.get(id);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => resolve(null);
      });

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['bookmarks'], 'readwrite');
        const store = transaction.objectStore('bookmarks');
        const request = store.delete(id);

        request.onsuccess = () => {
          if (window.CloudSync && bookmark) {
            CloudSync.deleteBookmarkCloud(bookmark.createdAt, bookmark.bookPath);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('deleteBookmark error:', error);
    }
  }

  // ==================== HIGHLIGHTS ====================

  async function addHighlight(highlight) {
    try {
      return new Promise((resolve, reject) => {
        const data = {
          bookPath: highlight.bookPath,
          bookTitle: highlight.bookTitle,
          text: highlight.text,
          color: highlight.color,
          elementSelector: highlight.elementSelector,
          createdAt: highlight.createdAt || Date.now()
        };

        const transaction = db.transaction(['highlights'], 'readwrite');
        const store = transaction.objectStore('highlights');
        const request = store.add(data);

        request.onsuccess = () => {
          if (window.CloudSync && !highlight._fromSync) {
            CloudSync.pushHighlight(data);
          }
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('addHighlight error:', error);
      return null;
    }
  }

  async function getHighlights(bookPath = null) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['highlights'], 'readonly');
        const store = transaction.objectStore('highlights');

        if (bookPath) {
          const index = store.index('bookPath');
          const request = index.getAll(bookPath);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        } else {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        }
      });
    } catch (error) {
      console.error('getHighlights error:', error);
      return [];
    }
  }

  async function deleteHighlight(id) {
    try {
      // Get highlight data before deleting (for cloud sync)
      const highlight = await new Promise((resolve) => {
        const tx = db.transaction(['highlights'], 'readonly');
        const s = tx.objectStore('highlights');
        const r = s.get(id);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => resolve(null);
      });

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['highlights'], 'readwrite');
        const store = transaction.objectStore('highlights');
        const request = store.delete(id);

        request.onsuccess = () => {
          if (window.CloudSync && highlight) {
            CloudSync.deleteHighlightCloud(highlight.createdAt, highlight.bookPath);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('deleteHighlight error:', error);
    }
  }

  // ==================== COMMENTS ====================

  async function addComment(comment) {
    try {
      return new Promise((resolve, reject) => {
        const data = {
          bookPath: comment.bookPath,
          bookTitle: comment.bookTitle,
          text: comment.text,
          elementSelector: comment.elementSelector,
          createdAt: comment.createdAt || Date.now()
        };

        const transaction = db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const request = store.add(data);

        request.onsuccess = () => {
          if (window.CloudSync && !comment._fromSync) {
            CloudSync.pushComment(data);
          }
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('addComment error:', error);
      return null;
    }
  }

  async function getComments(bookPath = null) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['comments'], 'readonly');
        const store = transaction.objectStore('comments');

        if (bookPath) {
          const index = store.index('bookPath');
          const request = index.getAll(bookPath);
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        } else {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        }
      });
    } catch (error) {
      console.error('getComments error:', error);
      return [];
    }
  }

  async function deleteComment(id) {
    try {
      // Get comment data before deleting (for cloud sync)
      const comment = await new Promise((resolve) => {
        const tx = db.transaction(['comments'], 'readonly');
        const s = tx.objectStore('comments');
        const r = s.get(id);
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => resolve(null);
      });

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        const request = store.delete(id);

        request.onsuccess = () => {
          if (window.CloudSync && comment) {
            CloudSync.deleteCommentCloud(comment.createdAt, comment.bookPath);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('deleteComment error:', error);
    }
  }

  // ==================== DAILY STATS ====================

  async function getDailyStats(date = null) {
    try {
      const dateKey = date || getTodayKey();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['daily_stats'], 'readonly');
        const store = transaction.objectStore('daily_stats');
        const request = store.get(dateKey);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getDailyStats error:', error);
      return null;
    }
  }

  async function logBookOpened(bookPath) {
    try {
      return new Promise(async (resolve, reject) => {
        const dateKey = getTodayKey();
        const existing = await getDailyStats(dateKey);

        const booksOpened = existing?.booksOpened || [];
        if (!booksOpened.includes(bookPath)) {
          booksOpened.push(bookPath);
        }

        const data = {
          date: dateKey,
          booksOpened,
          minutesRead: existing?.minutesRead || 0,
          scrollDistance: existing?.scrollDistance || 0
        };

        const transaction = db.transaction(['daily_stats'], 'readwrite');
        const store = transaction.objectStore('daily_stats');
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('logBookOpened error:', error);
    }
  }

  async function logReadingTime(minutes) {
    try {
      return new Promise(async (resolve, reject) => {
        const dateKey = getTodayKey();
        const existing = await getDailyStats(dateKey);

        const data = {
          date: dateKey,
          booksOpened: existing?.booksOpened || [],
          minutesRead: (existing?.minutesRead || 0) + minutes,
          scrollDistance: existing?.scrollDistance || 0
        };

        const transaction = db.transaction(['daily_stats'], 'readwrite');
        const store = transaction.objectStore('daily_stats');
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('logReadingTime error:', error);
    }
  }

  async function getStatsRange(startDate, endDate) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['daily_stats'], 'readonly');
        const store = transaction.objectStore('daily_stats');
        const range = IDBKeyRange.bound(startDate, endDate);
        const request = store.getAll(range);

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getStatsRange error:', error);
      return [];
    }
  }

  async function getStreak() {
    try {
      let streak = 0;
      const today = new Date();

      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);

        const year = checkDate.getFullYear();
        const month = String(checkDate.getMonth() + 1).padStart(2, '0');
        const day = String(checkDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;

        const stats = await getDailyStats(dateKey);

        if (!stats || (stats.booksOpened.length === 0 && stats.minutesRead === 0)) {
          break;
        }

        streak++;
      }

      return streak;
    } catch (error) {
      console.error('getStreak error:', error);
      return 0;
    }
  }

  // ==================== SETTINGS ====================

  async function getSetting(key) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('getSetting error:', error);
      return null;
    }
  }

  async function setSetting(key, value) {
    try {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ key, value });

        request.onsuccess = () => {
          // Sync important settings to cloud
          if (window.CloudSync && ['theme', 'fontSize', 'fontFamily', 'zoom'].includes(key)) {
            CloudSync.pushSetting(key, value);
          }
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('setSetting error:', error);
    }
  }

  // ==================== EXPORT/IMPORT ====================

  async function exportAll() {
    try {
      const data = {
        version: DB_VERSION,
        exportedAt: Date.now(),
        reading_progress: await getAllProgress(),
        bookmarks: await getBookmarks(),
        highlights: await getHighlights(),
        comments: await getComments(),
        daily_stats: [],
        settings: []
      };

      // Export all daily stats
      const statsTransaction = db.transaction(['daily_stats'], 'readonly');
      const statsStore = statsTransaction.objectStore('daily_stats');
      const statsRequest = statsStore.getAll();
      data.daily_stats = await new Promise((resolve) => {
        statsRequest.onsuccess = () => resolve(statsRequest.result || []);
        statsRequest.onerror = () => resolve([]);
      });

      // Export all settings
      const settingsTransaction = db.transaction(['settings'], 'readonly');
      const settingsStore = settingsTransaction.objectStore('settings');
      const settingsRequest = settingsStore.getAll();
      data.settings = await new Promise((resolve) => {
        settingsRequest.onsuccess = () => resolve(settingsRequest.result || []);
        settingsRequest.onerror = () => resolve([]);
      });

      return data;
    } catch (error) {
      console.error('exportAll error:', error);
      return null;
    }
  }

  async function importAll(data) {
    try {
      if (!data || data.version !== DB_VERSION) {
        throw new Error('Invalid import data or version mismatch');
      }

      // Clear existing data
      await clearAll();

      // Import reading progress
      if (data.reading_progress) {
        for (const item of data.reading_progress) {
          await saveProgress(item.bookPath, item);
        }
      }

      // Import bookmarks
      if (data.bookmarks) {
        const transaction = db.transaction(['bookmarks'], 'readwrite');
        const store = transaction.objectStore('bookmarks');
        for (const item of data.bookmarks) {
          const { id, ...itemWithoutId } = item;
          store.add(itemWithoutId);
        }
      }

      // Import highlights
      if (data.highlights) {
        const transaction = db.transaction(['highlights'], 'readwrite');
        const store = transaction.objectStore('highlights');
        for (const item of data.highlights) {
          const { id, ...itemWithoutId } = item;
          store.add(itemWithoutId);
        }
      }

      // Import comments
      if (data.comments) {
        const transaction = db.transaction(['comments'], 'readwrite');
        const store = transaction.objectStore('comments');
        for (const item of data.comments) {
          const { id, ...itemWithoutId } = item;
          store.add(itemWithoutId);
        }
      }

      // Import daily stats
      if (data.daily_stats) {
        const transaction = db.transaction(['daily_stats'], 'readwrite');
        const store = transaction.objectStore('daily_stats');
        for (const item of data.daily_stats) {
          store.put(item);
        }
      }

      // Import settings
      if (data.settings) {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        for (const item of data.settings) {
          store.put(item);
        }
      }

      console.log('Import completed successfully');
    } catch (error) {
      console.error('importAll error:', error);
      throw error;
    }
  }

  async function clearAll() {
    try {
      const storeNames = ['reading_progress', 'bookmarks', 'highlights', 'comments', 'daily_stats', 'settings'];

      for (const storeName of storeNames) {
        await new Promise((resolve, reject) => {
          const transaction = db.transaction([storeName], 'readwrite');
          const store = transaction.objectStore(storeName);
          const request = store.clear();

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }

      console.log('All data cleared successfully');
    } catch (error) {
      console.error('clearAll error:', error);
    }
  }

  // ==================== EXPOSE API ====================

  window.DB = {
    init,

    // Reading Progress
    getProgress,
    saveProgress,
    getAllProgress,
    markCompleted,
    getCompletedBooks,
    getInProgressBooks,

    // Bookmarks
    addBookmark,
    getBookmarks,
    deleteBookmark,

    // Highlights
    addHighlight,
    getHighlights,
    deleteHighlight,

    // Comments
    addComment,
    getComments,
    deleteComment,

    // Daily Stats
    logBookOpened,
    logReadingTime,
    getDailyStats,
    getStatsRange,
    getStreak,

    // Settings
    getSetting,
    setSetting,

    // Export/Import
    exportAll,
    importAll,
    clearAll
  };

})();
