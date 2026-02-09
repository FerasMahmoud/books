/**
 * Turso Cloud Sync for Books Library
 * Syncs IndexedDB data to Turso SQLite for cross-device access.
 * Offline-first: works without network, syncs when available.
 */

(function () {
  'use strict';

  const TURSO_URL = 'https://islamic-sync-ferasmahmoud.aws-eu-west-1.turso.io/v2/pipeline';
  const TURSO_TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NzA1NTUzODAsImlkIjoiMjBkNzQyZDAtZmRlMi00YWI3LTgzZmEtNjA5ZWQyZDUzN2QxIiwicmlkIjoiZjY1MjY4ZmUtZTNlNi00Y2UxLTg5MDMtZjI0ZGQzOTVmNWY2In0.sT3mdvCjT76rr15kbOgv9JFLeR0xeTiXq4NzAEnBupwN1gE7pwPuY_vF2WRuxBSx2t166YLiwtX1MmB9PZS9DQ';

  // Debounce timers for progress saves (avoid spamming on scroll)
  const _debounceTimers = {};

  // ==================== TURSO HTTP API ====================

  async function tursoExec(statements) {
    const requests = statements.map((s) => ({
      type: 'execute',
      stmt: s.args
        ? { sql: s.sql, args: s.args.map(_toTursoArg) }
        : { sql: s.sql },
    }));
    requests.push({ type: 'close' });

    try {
      const resp = await fetch(TURSO_URL, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + TURSO_TOKEN,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      });

      if (!resp.ok) {
        console.warn('[Sync] Turso HTTP error:', resp.status);
        return null;
      }

      const data = await resp.json();
      return data.results;
    } catch (e) {
      console.warn('[Sync] Turso unreachable:', e.message);
      return null;
    }
  }

  async function tursoQuery(sql, args = []) {
    const results = await tursoExec([{ sql, args }]);
    if (!results || results[0].type === 'error') return null;
    return results[0].response.result;
  }

  function _toTursoArg(val) {
    if (val === null || val === undefined) return { type: 'null', value: null };
    if (typeof val === 'number' && Number.isInteger(val)) return { type: 'integer', value: String(val) };
    if (typeof val === 'number') return { type: 'float', value: String(val) };
    return { type: 'text', value: String(val) };
  }

  function _rowsToObjects(result) {
    if (!result || !result.rows) return [];
    return result.rows.map((row) =>
      Object.fromEntries(result.cols.map((col, i) => {
        let val = row[i].value;
        if (row[i].type === 'integer') val = parseInt(val, 10);
        if (row[i].type === 'float') val = parseFloat(val);
        return [col.name, val];
      }))
    );
  }

  // ==================== SYNC: PROGRESS ====================

  async function pushProgress(bookPath, data) {
    // Debounce: only sync progress every 5 seconds per book
    const key = 'progress:' + bookPath;
    if (_debounceTimers[key]) clearTimeout(_debounceTimers[key]);

    _debounceTimers[key] = setTimeout(async () => {
      delete _debounceTimers[key];
      const now = Date.now();
      await tursoQuery(
        `INSERT INTO book_progress (book_path, scroll_percent, is_completed, last_read_at, total_read_time_ms, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(book_path) DO UPDATE SET
           scroll_percent = CASE WHEN excluded.updated_at > book_progress.updated_at THEN excluded.scroll_percent ELSE book_progress.scroll_percent END,
           is_completed = CASE WHEN excluded.is_completed = 1 THEN 1 ELSE book_progress.is_completed END,
           last_read_at = MAX(excluded.last_read_at, book_progress.last_read_at),
           total_read_time_ms = MAX(excluded.total_read_time_ms, book_progress.total_read_time_ms),
           updated_at = MAX(excluded.updated_at, book_progress.updated_at)`,
        [
          bookPath,
          data.scrollPercent || 0,
          data.isCompleted ? 1 : 0,
          data.lastReadAt || now,
          data.totalReadTimeMs || 0,
          now,
        ]
      );
    }, 5000);
  }

  async function pushProgressImmediate(bookPath, data) {
    const now = Date.now();
    await tursoQuery(
      `INSERT INTO book_progress (book_path, scroll_percent, is_completed, last_read_at, total_read_time_ms, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(book_path) DO UPDATE SET
         scroll_percent = CASE WHEN excluded.updated_at > book_progress.updated_at THEN excluded.scroll_percent ELSE book_progress.scroll_percent END,
         is_completed = CASE WHEN excluded.is_completed = 1 THEN 1 ELSE book_progress.is_completed END,
         last_read_at = MAX(excluded.last_read_at, book_progress.last_read_at),
         total_read_time_ms = MAX(excluded.total_read_time_ms, book_progress.total_read_time_ms),
         updated_at = MAX(excluded.updated_at, book_progress.updated_at)`,
      [
        bookPath,
        data.scrollPercent || 0,
        data.isCompleted ? 1 : 0,
        data.lastReadAt || now,
        data.totalReadTimeMs || 0,
        now,
      ]
    );
  }

  async function pullAllProgress() {
    const result = await tursoQuery('SELECT * FROM book_progress');
    if (!result) return [];
    return _rowsToObjects(result).map((row) => ({
      bookPath: row.book_path,
      scrollPercent: row.scroll_percent,
      isCompleted: row.is_completed === 1,
      lastReadAt: row.last_read_at,
      totalReadTimeMs: row.total_read_time_ms,
      updatedAt: row.updated_at,
    }));
  }

  // ==================== SYNC: HIGHLIGHTS ====================

  async function pushHighlight(highlight) {
    await tursoQuery(
      `INSERT INTO book_highlights (book_path, book_title, text, color, element_selector, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        highlight.bookPath,
        highlight.bookTitle || '',
        highlight.text,
        highlight.color || 'yellow',
        highlight.elementSelector || '',
        highlight.createdAt || Date.now(),
      ]
    );
  }

  async function pullAllHighlights() {
    const result = await tursoQuery('SELECT * FROM book_highlights ORDER BY created_at DESC');
    if (!result) return [];
    return _rowsToObjects(result).map((row) => ({
      cloudId: row.id,
      bookPath: row.book_path,
      bookTitle: row.book_title,
      text: row.text,
      color: row.color,
      elementSelector: row.element_selector,
      createdAt: row.created_at,
    }));
  }

  async function deleteHighlightCloud(createdAt, bookPath) {
    await tursoQuery(
      'DELETE FROM book_highlights WHERE created_at = ? AND book_path = ?',
      [createdAt, bookPath]
    );
  }

  // ==================== SYNC: COMMENTS ====================

  async function pushComment(comment) {
    await tursoQuery(
      `INSERT INTO book_comments (book_path, book_title, text, element_selector, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        comment.bookPath,
        comment.bookTitle || '',
        comment.text,
        comment.elementSelector || '',
        comment.createdAt || Date.now(),
      ]
    );
  }

  async function pullAllComments() {
    const result = await tursoQuery('SELECT * FROM book_comments ORDER BY created_at DESC');
    if (!result) return [];
    return _rowsToObjects(result).map((row) => ({
      cloudId: row.id,
      bookPath: row.book_path,
      bookTitle: row.book_title,
      text: row.text,
      elementSelector: row.element_selector,
      createdAt: row.created_at,
    }));
  }

  async function deleteCommentCloud(createdAt, bookPath) {
    await tursoQuery(
      'DELETE FROM book_comments WHERE created_at = ? AND book_path = ?',
      [createdAt, bookPath]
    );
  }

  // ==================== SYNC: BOOKMARKS ====================

  async function pushBookmark(bookmark) {
    await tursoQuery(
      `INSERT INTO book_bookmarks (book_path, book_title, scroll_percent, note, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        bookmark.bookPath,
        bookmark.bookTitle || '',
        bookmark.scrollPercent || 0,
        bookmark.note || '',
        bookmark.createdAt || Date.now(),
      ]
    );
  }

  async function pullAllBookmarks() {
    const result = await tursoQuery('SELECT * FROM book_bookmarks ORDER BY created_at DESC');
    if (!result) return [];
    return _rowsToObjects(result).map((row) => ({
      cloudId: row.id,
      bookPath: row.book_path,
      bookTitle: row.book_title,
      scrollPercent: row.scroll_percent,
      note: row.note,
      createdAt: row.created_at,
    }));
  }

  async function deleteBookmarkCloud(createdAt, bookPath) {
    await tursoQuery(
      'DELETE FROM book_bookmarks WHERE created_at = ? AND book_path = ?',
      [createdAt, bookPath]
    );
  }

  // ==================== SYNC: SETTINGS ====================

  async function pushSetting(key, value) {
    const now = Date.now();
    await tursoQuery(
      `INSERT INTO book_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, JSON.stringify(value), now]
    );
  }

  async function pullAllSettings() {
    const result = await tursoQuery('SELECT * FROM book_settings');
    if (!result) return [];
    return _rowsToObjects(result).map((row) => {
      let val = row.value;
      try { val = JSON.parse(val); } catch (e) { /* keep as string */ }
      return { key: row.key, value: val, updatedAt: row.updated_at };
    });
  }

  // ==================== FULL SYNC (pull cloud → merge local) ====================

  async function fullSync() {
    if (!navigator.onLine) {
      console.log('[Sync] Offline, skipping sync');
      return false;
    }

    console.log('[Sync] Starting full sync...');

    try {
      // 1. Pull all cloud data
      const [cloudProgress, cloudHighlights, cloudComments, cloudBookmarks, cloudSettings] =
        await Promise.all([
          pullAllProgress(),
          pullAllHighlights(),
          pullAllComments(),
          pullAllBookmarks(),
          pullAllSettings(),
        ]);

      // 2. Merge progress (cloud wins if newer)
      const localProgress = await DB.getAllProgress();
      const localMap = {};
      localProgress.forEach((p) => { localMap[p.bookPath] = p; });

      for (const cp of cloudProgress) {
        const local = localMap[cp.bookPath];
        if (!local) {
          // Cloud has data we don't have locally
          await DB.saveProgress(cp.bookPath, {
            scrollPercent: cp.scrollPercent,
            isCompleted: cp.isCompleted,
            lastReadAt: cp.lastReadAt,
            totalReadTimeMs: cp.totalReadTimeMs,
          });
        } else {
          // Merge: take the latest
          const cloudNewer = (cp.updatedAt || 0) > (local.lastReadAt || 0);
          if (cloudNewer) {
            await DB.saveProgress(cp.bookPath, {
              scrollPercent: cp.scrollPercent,
              isCompleted: cp.isCompleted || local.isCompleted,
              lastReadAt: cp.lastReadAt,
              totalReadTimeMs: Math.max(cp.totalReadTimeMs || 0, local.totalReadTimeMs || 0),
            });
          } else {
            // Local is newer - push to cloud
            await pushProgressImmediate(local.bookPath || cp.bookPath, local);
          }
        }
      }

      // Push local progress not in cloud
      for (const lp of localProgress) {
        const inCloud = cloudProgress.find((cp) => cp.bookPath === lp.bookPath);
        if (!inCloud) {
          await pushProgressImmediate(lp.bookPath, lp);
        }
      }

      // 3. Merge highlights (additive: add cloud items not in local)
      const localHighlights = await DB.getHighlights();
      for (const ch of cloudHighlights) {
        const exists = localHighlights.find(
          (lh) => lh.createdAt === ch.createdAt && lh.bookPath === ch.bookPath
        );
        if (!exists) {
          await DB.addHighlight({
            bookPath: ch.bookPath,
            bookTitle: ch.bookTitle,
            text: ch.text,
            color: ch.color,
            elementSelector: ch.elementSelector,
            createdAt: ch.createdAt,
            _fromSync: true,
          });
        }
      }
      // Push local highlights not in cloud
      for (const lh of localHighlights) {
        const exists = cloudHighlights.find(
          (ch) => ch.createdAt === lh.createdAt && ch.bookPath === lh.bookPath
        );
        if (!exists) {
          await pushHighlight(lh);
        }
      }

      // 4. Merge comments
      const localComments = await DB.getComments();
      for (const cc of cloudComments) {
        const exists = localComments.find(
          (lc) => lc.createdAt === cc.createdAt && lc.bookPath === cc.bookPath
        );
        if (!exists) {
          await DB.addComment({
            bookPath: cc.bookPath,
            bookTitle: cc.bookTitle,
            text: cc.text,
            elementSelector: cc.elementSelector,
            createdAt: cc.createdAt,
            _fromSync: true,
          });
        }
      }
      for (const lc of localComments) {
        const exists = cloudComments.find(
          (cc) => cc.createdAt === lc.createdAt && cc.bookPath === lc.bookPath
        );
        if (!exists) {
          await pushComment(lc);
        }
      }

      // 5. Merge bookmarks
      const localBookmarks = await DB.getBookmarks();
      for (const cb of cloudBookmarks) {
        const exists = localBookmarks.find(
          (lb) => lb.createdAt === cb.createdAt && lb.bookPath === cb.bookPath
        );
        if (!exists) {
          await DB.addBookmark({
            bookPath: cb.bookPath,
            bookTitle: cb.bookTitle,
            scrollPercent: cb.scrollPercent,
            note: cb.note,
            createdAt: cb.createdAt,
            _fromSync: true,
          });
        }
      }
      for (const lb of localBookmarks) {
        const exists = cloudBookmarks.find(
          (cb) => cb.createdAt === lb.createdAt && cb.bookPath === lb.bookPath
        );
        if (!exists) {
          await pushBookmark(lb);
        }
      }

      // 6. Merge settings (cloud wins if newer)
      for (const cs of cloudSettings) {
        const localVal = await DB.getSetting(cs.key);
        // Only overwrite if we don't have a local value or cloud is authoritative
        if (localVal === null || localVal === undefined) {
          await DB.setSetting(cs.key, cs.value);
        }
      }

      console.log('[Sync] Full sync complete');
      return true;
    } catch (e) {
      console.warn('[Sync] Full sync failed:', e);
      return false;
    }
  }

  // ==================== PUBLIC API ====================

  window.CloudSync = {
    fullSync,
    pushProgress,
    pushProgressImmediate,
    pushHighlight,
    pushComment,
    pushBookmark,
    pushSetting,
    deleteHighlightCloud,
    deleteCommentCloud,
    deleteBookmarkCloud,
  };

})();
