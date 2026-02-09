/**
 * Arabic Book Library PWA - Main Application
 * SPA architecture with 4 views + reader
 * Depends on window.DB from db.js
 */

(function () {
  'use strict';

  // ==================== BOOK DATA ====================

  const BOOKS = [
    { id: '4hww', title: '\u0623\u0633\u0628\u0648\u0639 \u0627\u0644\u0639\u0645\u0644 4 \u0633\u0627\u0639\u0627\u062A', subtitle: 'The 4-Hour Workweek', author: '\u062A\u064A\u0645 \u0641\u064A\u0631\u064A\u0633', authorEn: 'Tim Ferriss', category: 'productivity', categoryAr: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646', path: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629-\u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646/4-hour-workweek-summary.html', color: 'red', emoji: '\u23F0', chapters: 6 },
    { id: 'dw', title: '\u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0639\u0645\u064A\u0642', subtitle: 'Deep Work', author: '\u0643\u0627\u0644 \u0646\u064A\u0648\u0628\u0648\u0631\u062A', authorEn: 'Cal Newport', category: 'productivity', categoryAr: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646', path: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629-\u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646/deep-work-summary.html', color: 'blue', emoji: '\uD83E\uDDE0', chapters: 8 },
    { id: 'dwz', title: '\u0645\u062A \u0628\u0635\u0641\u0631', subtitle: 'Die With Zero', author: '\u0628\u064A\u0644 \u0628\u064A\u0631\u0643\u0646\u0632', authorEn: 'Bill Perkins', category: 'productivity', categoryAr: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646', path: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629-\u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646/die-with-zero-summary.html', color: 'orange', emoji: '\u231B', chapters: 9 },
    { id: 'ess', title: '\u0627\u0644\u062C\u0648\u0647\u0631\u064A\u0629', subtitle: 'Essentialism', author: '\u063A\u0631\u064A\u063A \u0645\u0627\u0643\u064A\u0648\u0646', authorEn: 'Greg McKeown', category: 'productivity', categoryAr: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646', path: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629-\u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646/essentialism-summary.html', color: 'green', emoji: '\u2728', chapters: 8 },
    { id: 'rest', title: '\u0627\u0644\u0631\u0627\u062D\u0629', subtitle: 'Rest', author: '\u0623\u0644\u064A\u0643\u0633 \u0633\u0648\u0646\u063A-\u0643\u064A\u0645 \u0628\u0627\u0646\u063A', authorEn: 'Alex Soojung-Kim Pang', category: 'productivity', categoryAr: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646', path: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629-\u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646/rest-book-summary.html', color: 'crimson', emoji: '\uD83C\uDF19', chapters: 12 },
    { id: 'pom', title: '\u0633\u064A\u0643\u0648\u0644\u0648\u062C\u064A\u0629 \u0627\u0644\u0645\u0627\u0644', subtitle: 'The Psychology of Money', author: '\u0645\u0648\u0631\u063A\u0627\u0646 \u0647\u0627\u0648\u0633\u0644', authorEn: 'Morgan Housel', category: 'finance', categoryAr: '\u0627\u0644\u0645\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631', path: '\u0627\u0644\u0645\u0627\u0644-\u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631/psychology-of-money-summary.html', color: 'purple', emoji: '\uD83D\uDCD6', chapters: 20 },
    { id: 'sj', title: '\u0633\u062A\u064A\u0641 \u062C\u0648\u0628\u0632', subtitle: 'Steve Jobs', author: '\u0648\u0627\u0644\u062A\u0631 \u0625\u064A\u0632\u0627\u0643\u0633\u0648\u0646', authorEn: 'Walter Isaacson', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/steve-jobs-summary.html', color: 'blue', emoji: '\uD83C\uDF4E', chapters: 8 },
    { id: 'em', title: '\u0625\u064A\u0644\u0648\u0646 \u0645\u0627\u0633\u0643', subtitle: 'Elon Musk', author: '\u0648\u0627\u0644\u062A\u0631 \u0625\u064A\u0632\u0627\u0643\u0633\u0648\u0646', authorEn: 'Walter Isaacson', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/elon-musk-summary.html', color: 'crimson', emoji: '\uD83D\uDE80', chapters: 8 },
    { id: 'ldv', title: '\u0644\u064A\u0648\u0646\u0627\u0631\u062F\u0648 \u062F\u0627\u0641\u0646\u0634\u064A', subtitle: 'Leonardo da Vinci', author: '\u0648\u0627\u0644\u062A\u0631 \u0625\u064A\u0632\u0627\u0643\u0633\u0648\u0646', authorEn: 'Walter Isaacson', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/leonardo-da-vinci-summary.html', color: 'amber', emoji: '\uD83C\uDFA8', chapters: 8 },
    { id: 'ein', title: '\u0623\u064A\u0646\u0634\u062A\u0627\u064A\u0646', subtitle: 'Einstein', author: '\u0648\u0627\u0644\u062A\u0631 \u0625\u064A\u0632\u0627\u0643\u0633\u0648\u0646', authorEn: 'Walter Isaacson', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/einstein-summary.html', color: 'teal', emoji: '\u269B\uFE0F', chapters: 8 },
    { id: 'bf', title: '\u0628\u0646\u062C\u0627\u0645\u064A\u0646 \u0641\u0631\u0627\u0646\u0643\u0644\u064A\u0646', subtitle: 'Benjamin Franklin', author: '\u0648\u0627\u0644\u062A\u0631 \u0625\u064A\u0632\u0627\u0643\u0633\u0648\u0646', authorEn: 'Walter Isaacson', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/benjamin-franklin-summary.html', color: 'navy', emoji: '\u26A1', chapters: 7 },
    { id: 'sd', title: '\u0634\u0648 \u062F\u0648\u062C', subtitle: 'Shoe Dog', author: '\u0641\u064A\u0644 \u0646\u0627\u064A\u062A', authorEn: 'Phil Knight', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/shoe-dog-summary.html', color: 'orange', emoji: '\uD83D\uDC5F', chapters: 8 },
    { id: 'rol', title: '\u0631\u062D\u0644\u0629 \u0627\u0644\u0639\u0645\u0631', subtitle: 'The Ride of a Lifetime', author: '\u0628\u0648\u0628 \u0625\u064A\u063A\u0631', authorEn: 'Bob Iger', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/ride-of-a-lifetime-summary.html', color: 'purple', emoji: '\uD83C\uDFF0', chapters: 8 },
    { id: 'titan', title: '\u062A\u0627\u064A\u062A\u0627\u0646', subtitle: 'Titan', author: '\u0631\u0648\u0646 \u0634\u064A\u0631\u0646\u0648', authorEn: 'Ron Chernow', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/titan-summary.html', color: 'red', emoji: '\uD83D\uDEE2\uFE0F', chapters: 8 },
    { id: 'wbba', title: '\u0639\u0646\u062F\u0645\u0627 \u064A\u0635\u0628\u062D \u0627\u0644\u0646\u064E\u0641\u064E\u0633 \u0647\u0648\u0627\u0621\u064B', subtitle: 'When Breath Becomes Air', author: '\u0628\u0648\u0644 \u0643\u0627\u0644\u0627\u0646\u064A\u062B\u064A', authorEn: 'Paul Kalanithi', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/when-breath-becomes-air-summary.html', color: 'cyan', emoji: '\uD83C\uDF2C\uFE0F', chapters: 7 },
    { id: 'gl', title: '\u0627\u0644\u0623\u0636\u0648\u0627\u0621 \u0627\u0644\u062E\u0636\u0631\u0627\u0621', subtitle: 'Greenlights', author: '\u0645\u0627\u062B\u064A\u0648 \u0645\u0627\u0643\u0648\u0646\u0647\u064A', authorEn: 'Matthew McConaughey', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/greenlights-summary.html', color: 'forest', emoji: '\uD83D\uDFE2', chapters: 7 },
    { id: 'cbs', title: '\u0623\u0639\u0631\u0641 \u0644\u0645\u0627\u0630\u0627 \u064A\u063A\u0631\u062F \u0627\u0644\u0637\u0627\u0626\u0631 \u0627\u0644\u062D\u0628\u064A\u0633', subtitle: 'I Know Why the Caged Bird Sings', author: '\u0645\u0627\u064A\u0627 \u0623\u0646\u062C\u064A\u0644\u0648', authorEn: 'Maya Angelou', category: 'biography', categoryAr: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', path: '\u0627\u0644\u0633\u064A\u0631-\u0627\u0644\u0630\u0627\u062A\u064A\u0629/caged-bird-sings-summary.html', color: 'pink', emoji: '\uD83D\uDC26', chapters: 7 },
  ];

  // Category metadata
  const CATEGORIES = [
    { id: 'productivity', ar: '\u0627\u0644\u0625\u0646\u062A\u0627\u062C\u064A\u0629 \u0648\u0627\u0644\u062A\u0648\u0627\u0632\u0646', icon: '\u26A1' },
    { id: 'finance', ar: '\u0627\u0644\u0645\u0627\u0644 \u0648\u0627\u0644\u0627\u0633\u062A\u062B\u0645\u0627\u0631', icon: '\uD83D\uDCB0' },
    { id: 'biography', ar: '\u0627\u0644\u0633\u064A\u0631 \u0627\u0644\u0630\u0627\u062A\u064A\u0629', icon: '\uD83D\uDC64' },
  ];

  // ==================== STATE ====================

  let currentView = 'library';
  let currentBookPath = null;
  let readingTimerStart = null;
  let readingTimerInterval = null;
  let currentFilter = 'all';
  let currentCategoryFilter = 'all';
  let currentSearchQuery = '';
  let currentHighlightColor = 'yellow';
  let highlightModeActive = false;
  let currentZoom = 1.0;
  let currentFontSize = 18;
  let currentFontFamily = 'Tajawal';
  let currentTheme = 'dark';
  let currentScrollPercent = 0;

  // ==================== INITIALIZATION ====================

  async function init() {
    try {
      await DB.init();
      console.log('DB initialized');

      // Load persisted settings
      const savedTheme = await DB.getSetting('theme');
      const savedFontSize = await DB.getSetting('fontSize');
      const savedFontFamily = await DB.getSetting('fontFamily');
      const savedZoom = await DB.getSetting('zoom');

      if (savedTheme) currentTheme = savedTheme;
      if (savedFontSize) currentFontSize = savedFontSize;
      if (savedFontFamily) currentFontFamily = savedFontFamily;
      if (savedZoom) currentZoom = savedZoom;

      applyTheme(currentTheme);
      await renderLibrary();
      setupBottomNav();
      setupEventListeners();
      await updateStreakBadge();
      registerServiceWorker();

      // Check if we should restore a book from hash
      if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash.startsWith('book:')) {
          const bookPath = decodeURIComponent(hash.substring(5));
          await openBook(bookPath);
        } else if (['dashboard', 'quotes', 'settings'].includes(hash)) {
          switchView(hash);
        }
      }

      console.log('App initialized');
    } catch (err) {
      console.error('App init failed:', err);
    }
  }

  // ==================== SERVICE WORKER ====================

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(
        (reg) => console.log('SW registered:', reg.scope),
        (err) => console.warn('SW registration failed:', err)
      );
    }
  }

  // ==================== THEME ====================

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    DB.setSetting('theme', theme);

    // Send to iframe if open
    const frame = document.getElementById('book-frame');
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({ type: 'SET_THEME', theme }, '*');
      } catch (e) { /* cross-origin */ }
    }
  }

  // ==================== VIEW NAVIGATION ====================

  function switchView(viewId) {
    const views = ['library', 'reader', 'dashboard', 'quotes', 'settings'];
    views.forEach((v) => {
      const el = document.getElementById('view-' + v);
      if (el) el.classList.remove('active');
    });

    const target = document.getElementById('view-' + viewId);
    if (target) target.classList.add('active');

    currentView = viewId;

    // Update bottom nav active state
    const navItems = document.querySelectorAll('#bottom-nav [data-view]');
    navItems.forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-view') === viewId);
    });

    // Show/hide bottom nav in reader
    const bottomNav = document.getElementById('bottom-nav');
    if (bottomNav) {
      bottomNav.style.display = viewId === 'reader' ? 'none' : '';
    }

    // Render view content on switch
    if (viewId === 'dashboard') renderDashboard();
    if (viewId === 'quotes') renderQuotes();
    if (viewId === 'settings') renderSettings();
    if (viewId === 'library') renderLibrary();

    // Update URL hash for non-reader views
    if (viewId !== 'reader' && viewId !== 'library') {
      history.pushState({ view: viewId }, '', '#' + viewId);
    } else if (viewId === 'library') {
      history.pushState({ view: 'library' }, '', window.location.pathname);
    }
  }

  // ==================== BOTTOM NAV ====================

  function setupBottomNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.innerHTML = `
      <button class="nav-item active" data-view="library">
        <span class="nav-icon">\uD83D\uDCDA</span>
        <span class="nav-label">\u0627\u0644\u0645\u0643\u062A\u0628\u0629</span>
      </button>
      <button class="nav-item" data-view="dashboard">
        <span class="nav-icon">\uD83D\uDCCA</span>
        <span class="nav-label">\u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A</span>
      </button>
      <button class="nav-item" data-view="quotes">
        <span class="nav-icon">\uD83D\uDCDD</span>
        <span class="nav-label">\u0627\u0644\u0627\u0642\u062A\u0628\u0627\u0633\u0627\u062A</span>
      </button>
      <button class="nav-item" data-view="settings">
        <span class="nav-icon">\u2699\uFE0F</span>
        <span class="nav-label">\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A</span>
      </button>
    `;

    nav.addEventListener('click', (e) => {
      const item = e.target.closest('[data-view]');
      if (item) {
        switchView(item.getAttribute('data-view'));
      }
    });
  }

  // ==================== EVENT LISTENERS ====================

  function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.trim();
        renderLibrary();
      });
    }

    // Filter tabs
    const filterTabs = document.getElementById('filter-tabs');
    if (filterTabs) {
      filterTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-filter]');
        if (tab) {
          currentFilter = tab.getAttribute('data-filter');
          filterTabs.querySelectorAll('[data-filter]').forEach((t) =>
            t.classList.toggle('active', t === tab)
          );
          renderLibrary();
        }
      });
    }

    // Reader close button
    const btnClose = document.getElementById('btn-close-reader');
    if (btnClose) {
      btnClose.addEventListener('click', () => closeBook());
    }

    // Reader bookmark button
    const btnBookmark = document.getElementById('btn-bookmark');
    if (btnBookmark) {
      btnBookmark.addEventListener('click', () => addBookmarkAtCurrentPosition());
    }

    // Reader highlight mode button
    const btnHighlight = document.getElementById('btn-highlight-mode');
    if (btnHighlight) {
      btnHighlight.addEventListener('click', () => toggleHighlightMode());
    }

    // Reader font settings button
    const btnFont = document.getElementById('btn-font-settings');
    if (btnFont) {
      btnFont.addEventListener('click', () => toggleFontPanel());
    }

    // Listen for messages from iframe
    window.addEventListener('message', handleIframeMessage);

    // History back button
    window.addEventListener('popstate', (event) => {
      if (currentView === 'reader') {
        closeBook();
      } else if (event.state && event.state.view) {
        switchView(event.state.view);
      } else {
        switchView('library');
      }
    });
  }

  // ==================== STREAK BADGE ====================

  async function updateStreakBadge() {
    const badge = document.getElementById('streak-badge');
    if (!badge) return;

    const streak = await DB.getStreak();
    if (streak > 0) {
      badge.textContent = streak + ' \uD83D\uDD25';
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ==================== LIBRARY VIEW ====================

  async function renderLibrary() {
    const grid = document.getElementById('books-grid');
    if (!grid) return;

    // Get all reading progress
    const allProgress = await DB.getAllProgress();
    const progressMap = {};
    allProgress.forEach((p) => { progressMap[p.bookPath] = p; });

    // Filter books
    let filtered = [...BOOKS];

    // Text search
    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      filtered = filtered.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.authorEn.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (currentFilter === 'unread') {
      filtered = filtered.filter((b) => !progressMap[b.path]);
    } else if (currentFilter === 'reading') {
      filtered = filtered.filter((b) => {
        const p = progressMap[b.path];
        return p && !p.isCompleted && p.scrollPercent > 0;
      });
    } else if (currentFilter === 'completed') {
      filtered = filtered.filter((b) => {
        const p = progressMap[b.path];
        return p && p.isCompleted;
      });
    }

    // Category filter
    if (currentCategoryFilter !== 'all') {
      filtered = filtered.filter((b) => b.category === currentCategoryFilter);
    }

    // Group by category
    const grouped = {};
    filtered.forEach((book) => {
      if (!grouped[book.category]) grouped[book.category] = [];
      grouped[book.category].push(book);
    });

    let html = '';
    let cardIndex = 0;

    // Render filter tabs if not already rendered
    const filterTabsEl = document.getElementById('filter-tabs');
    if (filterTabsEl && !filterTabsEl.hasChildNodes()) {
      filterTabsEl.innerHTML = `
        <button class="filter-tab active" data-filter="all">\u0627\u0644\u0643\u0644</button>
        <button class="filter-tab" data-filter="unread">\u0644\u0645 \u064A\u064F\u0642\u0631\u0623</button>
        <button class="filter-tab" data-filter="reading">\u0642\u064A\u062F \u0627\u0644\u0642\u0631\u0627\u0621\u0629</button>
        <button class="filter-tab" data-filter="completed">\u0645\u0643\u062A\u0645\u0644</button>
      `;
    }

    // Render category filter buttons
    html += '<div class="category-filters">';
    html += `<button class="cat-filter-btn ${currentCategoryFilter === 'all' ? 'active' : ''}" data-cat="all">\u0627\u0644\u0643\u0644</button>`;
    CATEGORIES.forEach((cat) => {
      html += `<button class="cat-filter-btn ${currentCategoryFilter === cat.id ? 'active' : ''}" data-cat="${cat.id}">${cat.icon} ${cat.ar}</button>`;
    });
    html += '</div>';

    // Render grouped books
    const categoryOrder = ['productivity', 'finance', 'biography'];
    categoryOrder.forEach((catId) => {
      const books = grouped[catId];
      if (!books || books.length === 0) return;

      const cat = CATEGORIES.find((c) => c.id === catId);
      html += `<section class="category-section">`;
      html += `<h2 class="category-heading"><span>${cat.icon}</span> ${cat.ar}</h2>`;
      html += `<div class="category-grid">`;

      books.forEach((book) => {
        const progress = progressMap[book.path];
        let statusBadge = '';
        let progressBar = '';

        if (progress && progress.isCompleted) {
          statusBadge = `<span class="status-badge completed">\u0645\u0643\u062A\u0645\u0644</span>`;
        } else if (progress && progress.scrollPercent > 0) {
          const pct = Math.round(progress.scrollPercent);
          statusBadge = `<span class="status-badge reading">\u064A\u064F\u0642\u0631\u0623 ${pct}%</span>`;
          progressBar = `<div class="card-progress"><div class="card-progress-fill" style="width:${pct}%"></div></div>`;
        }

        html += `
          <div class="book-card" data-color="${book.color}" style="--i:${cardIndex}" onclick="App.openBook('${book.path}')">
            <div class="book-cover">${book.emoji}</div>
            <div class="book-info">
              ${statusBadge}
              <h3 class="book-title">${book.title}</h3>
              <p class="book-subtitle">${book.subtitle}</p>
              <p class="book-author">${book.author}</p>
              <span class="book-tag">${book.chapters} \u0641\u0635\u0644</span>
              ${progressBar}
            </div>
          </div>
        `;
        cardIndex++;
      });

      html += `</div></section>`;
    });

    if (filtered.length === 0) {
      html += `<div class="empty-state"><p>\u0644\u0627 \u062A\u0648\u062C\u062F \u0643\u062A\u0628 \u0645\u0637\u0627\u0628\u0642\u0629</p></div>`;
    }

    grid.innerHTML = html;

    // Attach category filter listeners
    grid.querySelectorAll('.cat-filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        currentCategoryFilter = e.target.getAttribute('data-cat');
        renderLibrary();
      });
    });
  }

  // ==================== BOOK READER ====================

  async function openBook(bookPath) {
    currentBookPath = bookPath;
    switchView('reader');

    const frame = document.getElementById('book-frame');
    if (frame) {
      frame.src = bookPath;
    }

    // Update reader title
    const book = BOOKS.find((b) => b.path === bookPath);
    const readerTitle = document.getElementById('reader-title');
    if (readerTitle && book) {
      readerTitle.textContent = book.title;
    }

    // Save currently reading book
    await DB.setSetting('currentBook', bookPath);

    // Log book opened in daily stats
    await DB.logBookOpened(bookPath);

    // Start reading timer
    startReadingTimer();

    // Update streak
    await updateStreakBadge();

    // History
    history.pushState({ book: bookPath }, '', '#book:' + encodeURIComponent(bookPath));

    // Wait for iframe load to send settings
    if (frame) {
      frame.onload = async () => {
        await sendSettingsToIframe();
        await sendSavedDataToIframe(bookPath);
      };
    }
  }

  async function closeBook() {
    // Save final position
    if (currentBookPath && currentScrollPercent > 0) {
      await DB.saveProgress(currentBookPath, {
        scrollPercent: currentScrollPercent,
        lastReadAt: Date.now(),
      });
    }

    // Stop reading timer and log time
    stopReadingTimer();

    // Clear iframe
    const frame = document.getElementById('book-frame');
    if (frame) {
      frame.src = '';
      frame.onload = null;
    }

    currentBookPath = null;
    currentScrollPercent = 0;
    highlightModeActive = false;

    await DB.setSetting('currentBook', null);
    switchView('library');
  }

  async function sendSettingsToIframe() {
    const frame = document.getElementById('book-frame');
    if (!frame || !frame.contentWindow) return;

    try {
      frame.contentWindow.postMessage({
        type: 'SET_THEME',
        theme: currentTheme,
      }, '*');

      frame.contentWindow.postMessage({
        type: 'SET_FONT',
        fontSize: currentFontSize,
        fontFamily: currentFontFamily,
      }, '*');

      frame.contentWindow.postMessage({
        type: 'SET_ZOOM',
        zoom: currentZoom,
      }, '*');
    } catch (e) {
      console.warn('Failed to send settings to iframe:', e);
    }
  }

  async function sendSavedDataToIframe(bookPath) {
    const frame = document.getElementById('book-frame');
    if (!frame || !frame.contentWindow) return;

    try {
      // Send saved scroll position
      const progress = await DB.getProgress(bookPath);
      if (progress && progress.scrollPercent > 0) {
        frame.contentWindow.postMessage({
          type: 'RESTORE_POSITION',
          scrollPercent: progress.scrollPercent,
          scrollTop: progress.scrollTop,
        }, '*');
      }

      // Send saved highlights
      const highlights = await DB.getHighlights(bookPath);
      if (highlights.length > 0) {
        frame.contentWindow.postMessage({
          type: 'RESTORE_HIGHLIGHTS',
          highlights,
        }, '*');
      }

      // Send saved comments
      const comments = await DB.getComments(bookPath);
      if (comments.length > 0) {
        frame.contentWindow.postMessage({
          type: 'RESTORE_COMMENTS',
          comments,
        }, '*');
      }
    } catch (e) {
      console.warn('Failed to send saved data to iframe:', e);
    }
  }

  // ==================== IFRAME MESSAGE HANDLER ====================

  async function handleIframeMessage(event) {
    const data = event.data;
    if (!data || !data.type) return;

    switch (data.type) {
      case 'SCROLL_UPDATE':
        if (currentBookPath) {
          currentScrollPercent = data.scrollPercent || 0;
          await DB.saveProgress(currentBookPath, {
            scrollPercent: data.scrollPercent,
            scrollTop: data.scrollTop,
            lastReadAt: Date.now(),
          });
          // Update progress display
          const progressEl = document.getElementById('reader-progress');
          if (progressEl) {
            progressEl.textContent = Math.round(data.scrollPercent) + '%';
            progressEl.style.setProperty('--progress', data.scrollPercent + '%');
          }
        }
        break;

      case 'HIGHLIGHT_CREATED':
        if (currentBookPath) {
          const book = BOOKS.find((b) => b.path === currentBookPath);
          await DB.addHighlight({
            bookPath: currentBookPath,
            bookTitle: book ? book.title : '',
            text: data.text,
            color: data.color || currentHighlightColor,
            elementSelector: data.elementSelector || '',
          });
        }
        break;

      case 'COMMENT_CREATED':
        if (currentBookPath) {
          const book2 = BOOKS.find((b) => b.path === currentBookPath);
          await DB.addComment({
            bookPath: currentBookPath,
            bookTitle: book2 ? book2.title : '',
            text: data.text,
            elementSelector: data.elementSelector || '',
          });
        }
        break;

      case 'READING_COMPLETE':
        if (currentBookPath) {
          await DB.markCompleted(currentBookPath);
          showCelebration();
        }
        break;

      case 'CONTENT_LOADED':
        if (data.title) {
          const readerTitle = document.getElementById('reader-title');
          if (readerTitle) readerTitle.textContent = data.title;
        }
        break;
    }
  }

  // ==================== READER CONTROLS ====================

  async function addBookmarkAtCurrentPosition() {
    if (!currentBookPath) return;

    const book = BOOKS.find((b) => b.path === currentBookPath);
    await DB.addBookmark({
      bookPath: currentBookPath,
      bookTitle: book ? book.title : '',
      scrollPercent: currentScrollPercent,
      note: '',
    });

    // Visual feedback
    const btn = document.getElementById('btn-bookmark');
    if (btn) {
      btn.classList.add('bookmarked');
      setTimeout(() => btn.classList.remove('bookmarked'), 1500);
    }

    showToast('\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0639\u0644\u0627\u0645\u0629');
  }

  function toggleHighlightMode() {
    highlightModeActive = !highlightModeActive;

    const btn = document.getElementById('btn-highlight-mode');
    if (btn) {
      btn.classList.toggle('active', highlightModeActive);
    }

    const frame = document.getElementById('book-frame');
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({
          type: 'TOGGLE_HIGHLIGHT_MODE',
          active: highlightModeActive,
          color: currentHighlightColor,
        }, '*');
      } catch (e) { /* cross-origin */ }
    }
  }

  function toggleFontPanel() {
    let panel = document.getElementById('font-settings-panel');

    if (panel) {
      // Toggle visibility
      const isVisible = panel.classList.contains('visible');
      panel.classList.toggle('visible', !isVisible);
      return;
    }

    // Create panel
    panel = document.createElement('div');
    panel.id = 'font-settings-panel';
    panel.className = 'font-panel visible';
    panel.innerHTML = `
      <div class="font-panel-header">
        <span>\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u062E\u0637</span>
        <button class="font-panel-close" onclick="document.getElementById('font-settings-panel').classList.remove('visible')">\u2715</button>
      </div>
      <div class="font-panel-section">
        <label>\u062D\u062C\u0645 \u0627\u0644\u062E\u0637: <span id="font-size-value">${currentFontSize}px</span></label>
        <input type="range" id="font-size-slider" min="14" max="24" value="${currentFontSize}" step="1">
      </div>
      <div class="font-panel-section">
        <label>\u0646\u0648\u0639 \u0627\u0644\u062E\u0637</label>
        <div class="font-family-buttons">
          <button class="font-btn ${currentFontFamily === 'Tajawal' ? 'active' : ''}" data-font="Tajawal" style="font-family:Tajawal">Tajawal</button>
          <button class="font-btn ${currentFontFamily === 'Amiri' ? 'active' : ''}" data-font="Amiri" style="font-family:Amiri">\u0623\u0645\u064A\u0631\u064A</button>
          <button class="font-btn ${currentFontFamily === 'Noto Naskh Arabic' ? 'active' : ''}" data-font="Noto Naskh Arabic" style="font-family:'Noto Naskh Arabic'">\u0646\u0648\u062A\u0648 \u0646\u0633\u062E</button>
        </div>
      </div>
      <div class="font-panel-section">
        <label>\u062A\u0643\u0628\u064A\u0631 / \u062A\u0635\u063A\u064A\u0631</label>
        <div class="zoom-controls">
          <button class="zoom-btn" id="zoom-out">-</button>
          <span id="zoom-value">${Math.round(currentZoom * 100)}%</span>
          <button class="zoom-btn" id="zoom-in">+</button>
        </div>
      </div>
    `;

    document.getElementById('view-reader').appendChild(panel);

    // Font size slider
    const slider = panel.querySelector('#font-size-slider');
    slider.addEventListener('input', (e) => {
      currentFontSize = parseInt(e.target.value);
      panel.querySelector('#font-size-value').textContent = currentFontSize + 'px';
      DB.setSetting('fontSize', currentFontSize);
      sendFontToIframe();
    });

    // Font family buttons
    panel.querySelectorAll('.font-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        currentFontFamily = e.target.getAttribute('data-font');
        panel.querySelectorAll('.font-btn').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        DB.setSetting('fontFamily', currentFontFamily);
        sendFontToIframe();
      });
    });

    // Zoom controls
    panel.querySelector('#zoom-out').addEventListener('click', () => {
      currentZoom = Math.max(0.8, currentZoom - 0.1);
      updateZoom();
    });
    panel.querySelector('#zoom-in').addEventListener('click', () => {
      currentZoom = Math.min(1.5, currentZoom + 0.1);
      updateZoom();
    });
  }

  function sendFontToIframe() {
    const frame = document.getElementById('book-frame');
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({
          type: 'SET_FONT',
          fontSize: currentFontSize,
          fontFamily: currentFontFamily,
        }, '*');
      } catch (e) { /* cross-origin */ }
    }
  }

  function updateZoom() {
    const zoomValue = document.getElementById('zoom-value');
    if (zoomValue) zoomValue.textContent = Math.round(currentZoom * 100) + '%';

    DB.setSetting('zoom', currentZoom);

    const frame = document.getElementById('book-frame');
    if (frame && frame.contentWindow) {
      try {
        frame.contentWindow.postMessage({
          type: 'SET_ZOOM',
          zoom: currentZoom,
        }, '*');
      } catch (e) { /* cross-origin */ }
    }
  }

  // ==================== READING TIMER ====================

  function startReadingTimer() {
    readingTimerStart = Date.now();
    // Also update reading time in the book's progress every minute
    readingTimerInterval = setInterval(async () => {
      if (currentBookPath && readingTimerStart) {
        const elapsedMs = Date.now() - readingTimerStart;
        await DB.saveProgress(currentBookPath, {
          totalReadTimeMs: elapsedMs,
        });
      }
    }, 60000); // every minute
  }

  function stopReadingTimer() {
    if (readingTimerStart) {
      const elapsedMs = Date.now() - readingTimerStart;
      const minutes = Math.max(1, Math.round(elapsedMs / 60000));
      DB.logReadingTime(minutes);
      readingTimerStart = null;
    }
    if (readingTimerInterval) {
      clearInterval(readingTimerInterval);
      readingTimerInterval = null;
    }
  }

  // ==================== CELEBRATION ====================

  function showCelebration() {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration-content">
        <div class="celebration-emoji">\uD83C\uDF89</div>
        <h2>\u0645\u0628\u0631\u0648\u0643!</h2>
        <p>\u0623\u0643\u0645\u0644\u062A \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0643\u062A\u0627\u0628</p>
        <button class="celebration-btn" onclick="this.closest('.celebration-overlay').remove()">\u0645\u0645\u062A\u0627\u0632!</button>
      </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('visible'), 10);
  }

  // ==================== TOAST ====================

  function showToast(message) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2000);
  }

  // ==================== DASHBOARD VIEW ====================

  async function renderDashboard() {
    const dashSection = document.getElementById('view-dashboard');
    if (!dashSection) return;

    const allProgress = await DB.getAllProgress();
    const completed = allProgress.filter((p) => p.isCompleted);
    const inProgress = allProgress.filter((p) => !p.isCompleted && p.scrollPercent > 0);
    const streak = await DB.getStreak();

    // Calculate best streak
    let bestStreak = streak;
    let tempStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateKey = formatDateKey(checkDate);
      const stats = await DB.getDailyStats(dateKey);
      if (stats && (stats.booksOpened.length > 0 || stats.minutesRead > 0)) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Total reading time
    let totalMinutes = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startKey = formatDateKey(thirtyDaysAgo);
    const endKey = formatDateKey(today);
    const statsRange = await DB.getStatsRange(startKey, endKey);
    statsRange.forEach((s) => { totalMinutes += s.minutesRead || 0; });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMins = totalMinutes % 60;
    const avgPerDay = statsRange.length > 0 ? Math.round(totalMinutes / 30) : 0;

    // Calendar dots for last 30 days
    let calendarHtml = '<div class="calendar-dots">';
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dKey = formatDateKey(d);
      const dayStat = statsRange.find((s) => s.date === dKey);
      const active = dayStat && (dayStat.booksOpened.length > 0 || dayStat.minutesRead > 0);
      const dayLabel = d.getDate();
      calendarHtml += `<div class="calendar-dot ${active ? 'active' : ''}" title="${dKey}"><span>${dayLabel}</span></div>`;
    }
    calendarHtml += '</div>';

    // Category breakdown
    const catCounts = {};
    CATEGORIES.forEach((c) => { catCounts[c.id] = { total: 0, read: 0 }; });
    BOOKS.forEach((b) => {
      catCounts[b.category].total++;
      const p = allProgress.find((pr) => pr.bookPath === b.path);
      if (p && p.isCompleted) catCounts[b.category].read++;
    });

    let catBarsHtml = '';
    CATEGORIES.forEach((cat) => {
      const c = catCounts[cat.id];
      const pct = c.total > 0 ? Math.round((c.read / c.total) * 100) : 0;
      catBarsHtml += `
        <div class="cat-bar-row">
          <span class="cat-bar-label">${cat.icon} ${cat.ar}</span>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width:${pct}%"></div>
          </div>
          <span class="cat-bar-count">${c.read}/${c.total}</span>
        </div>
      `;
    });

    // Recent activity
    const recentBooks = allProgress
      .filter((p) => p.lastReadAt)
      .sort((a, b) => b.lastReadAt - a.lastReadAt)
      .slice(0, 5);

    let recentHtml = '';
    recentBooks.forEach((p) => {
      const book = BOOKS.find((b) => b.path === p.bookPath);
      if (!book) return;
      const date = new Date(p.lastReadAt);
      const dateStr = date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
      recentHtml += `
        <div class="recent-item" onclick="App.openBook('${book.path}')">
          <span class="recent-emoji">${book.emoji}</span>
          <div class="recent-info">
            <span class="recent-title">${book.title}</span>
            <span class="recent-date">${dateStr}</span>
          </div>
          <span class="recent-pct">${Math.round(p.scrollPercent)}%</span>
        </div>
      `;
    });

    // Mind Map: group by author
    const authorGroups = {};
    BOOKS.forEach((b) => {
      if (!authorGroups[b.author]) {
        authorGroups[b.author] = { authorEn: b.authorEn, books: [] };
      }
      authorGroups[b.author].books.push(b);
    });

    // Only show authors with 2+ books for the mind map
    const multiAuthors = Object.entries(authorGroups).filter(([, g]) => g.books.length >= 2);
    let mindMapHtml = '';
    if (multiAuthors.length > 0) {
      mindMapHtml += '<div class="mind-map">';
      multiAuthors.forEach(([authorAr, group]) => {
        const authorColor = group.books[0].color;
        mindMapHtml += `
          <div class="mind-map-cluster">
            <div class="mind-map-center" style="--cluster-color: var(--color-${authorColor}, #e94560)">
              <span class="mind-map-author">${authorAr}</span>
              <span class="mind-map-author-en">${group.authorEn}</span>
              <span class="mind-map-count">${group.books.length} \u0643\u062A\u0628</span>
            </div>
            <div class="mind-map-books">
        `;
        group.books.forEach((book, idx) => {
          const angle = (360 / group.books.length) * idx;
          mindMapHtml += `
            <div class="mind-map-book" style="--angle:${angle}deg; --book-color: var(--color-${book.color}, #e94560)" onclick="App.openBook('${book.path}')">
              <div class="mind-map-line"></div>
              <span class="mind-map-book-emoji">${book.emoji}</span>
              <span class="mind-map-book-title">${book.title}</span>
            </div>
          `;
        });
        mindMapHtml += `</div></div>`;
      });
      mindMapHtml += '</div>';
    }

    dashSection.innerHTML = `
      <div class="dashboard-content">
        <h2 class="dash-title">\uD83D\uDCCA \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A</h2>

        <div class="streak-section" id="streak-section">
          <div class="streak-main">
            <span class="streak-number">${streak}</span>
            <span class="streak-fire">\uD83D\uDD25</span>
          </div>
          <p class="streak-label">\u0633\u0644\u0633\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629</p>
          <p class="streak-best">\u0623\u0641\u0636\u0644 \u0633\u0644\u0633\u0644\u0629: ${bestStreak} \u064A\u0648\u0645</p>
          ${calendarHtml}
        </div>

        <div class="stats-grid" id="stats-section">
          <div class="stat-card">
            <span class="stat-value">${completed.length}</span>
            <span class="stat-label">\u0643\u062A\u0628 \u0645\u0643\u062A\u0645\u0644\u0629</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${inProgress.length}</span>
            <span class="stat-label">\u0642\u064A\u062F \u0627\u0644\u0642\u0631\u0627\u0621\u0629</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${totalHours > 0 ? totalHours + '\u0633' : ''} ${remainingMins}\u062F</span>
            <span class="stat-label">\u0648\u0642\u062A \u0627\u0644\u0642\u0631\u0627\u0621\u0629</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">${avgPerDay} \u062F</span>
            <span class="stat-label">\u0645\u0639\u062F\u0644 \u064A\u0648\u0645\u064A</span>
          </div>
        </div>

        <div class="dash-section" id="category-chart">
          <h3 class="dash-section-title">\u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A</h3>
          ${catBarsHtml}
        </div>

        ${recentBooks.length > 0 ? `
        <div class="dash-section">
          <h3 class="dash-section-title">\u0627\u0644\u0646\u0634\u0627\u0637 \u0627\u0644\u0623\u062E\u064A\u0631</h3>
          <div class="recent-list">${recentHtml}</div>
        </div>
        ` : ''}

        ${mindMapHtml ? `
        <div class="dash-section" id="mind-map-section">
          <h3 class="dash-section-title">\u062E\u0631\u064A\u0637\u0629 \u0627\u0644\u0645\u0624\u0644\u0641\u064A\u0646</h3>
          ${mindMapHtml}
        </div>
        ` : ''}
      </div>
    `;
  }

  // ==================== QUOTES VIEW ====================

  async function renderQuotes() {
    const quotesContent = document.getElementById('quotes-content') || document.getElementById('view-quotes');
    if (!quotesContent) return;

    // Get all data
    const highlights = await DB.getHighlights();
    const comments = await DB.getComments();
    const bookmarks = await DB.getBookmarks();

    // Determine which sub-tab is active (default: highlights)
    let activeTab = quotesContent.getAttribute('data-active-tab') || 'highlights';

    let tabsHtml = `
      <div class="quotes-tabs" id="quotes-tabs">
        <button class="quotes-tab ${activeTab === 'highlights' ? 'active' : ''}" data-qtab="highlights">\u0627\u0642\u062A\u0628\u0627\u0633\u0627\u062A</button>
        <button class="quotes-tab ${activeTab === 'comments' ? 'active' : ''}" data-qtab="comments">\u062A\u0639\u0644\u064A\u0642\u0627\u062A</button>
        <button class="quotes-tab ${activeTab === 'bookmarks' ? 'active' : ''}" data-qtab="bookmarks">\u0639\u0644\u0627\u0645\u0627\u062A</button>
      </div>
    `;

    let contentHtml = '';

    if (activeTab === 'highlights') {
      contentHtml = renderHighlightsList(highlights);
    } else if (activeTab === 'comments') {
      contentHtml = renderCommentsList(comments);
    } else if (activeTab === 'bookmarks') {
      contentHtml = renderBookmarksList(bookmarks);
    }

    // Determine the target element
    const targetEl = document.getElementById('view-quotes');
    if (targetEl) {
      targetEl.innerHTML = `
        <div class="quotes-view-content">
          <h2 class="quotes-title">\uD83D\uDCDD \u0645\u0644\u0627\u062D\u0638\u0627\u062A\u064A</h2>
          ${tabsHtml}
          <div class="quotes-list" id="quotes-list">${contentHtml}</div>
        </div>
      `;
      targetEl.setAttribute('data-active-tab', activeTab);

      // Tab click handlers
      targetEl.querySelectorAll('.quotes-tab').forEach((tab) => {
        tab.addEventListener('click', (e) => {
          targetEl.setAttribute('data-active-tab', e.target.getAttribute('data-qtab'));
          renderQuotes();
        });
      });

      // Delete handlers
      targetEl.querySelectorAll('[data-delete-highlight]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-delete-highlight'));
          await DB.deleteHighlight(id);
          renderQuotes();
        });
      });

      targetEl.querySelectorAll('[data-delete-comment]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-delete-comment'));
          await DB.deleteComment(id);
          renderQuotes();
        });
      });

      targetEl.querySelectorAll('[data-delete-bookmark]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = parseInt(btn.getAttribute('data-delete-bookmark'));
          await DB.deleteBookmark(id);
          renderQuotes();
        });
      });

      // Share handlers
      targetEl.querySelectorAll('[data-share-text]').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const text = btn.getAttribute('data-share-text');
          await shareText(text);
        });
      });
    }
  }

  function renderHighlightsList(highlights) {
    if (highlights.length === 0) {
      return `<div class="empty-state"><p>\u0644\u0627 \u062A\u0648\u062C\u062F \u0627\u0642\u062A\u0628\u0627\u0633\u0627\u062A \u0628\u0639\u062F</p></div>`;
    }

    // Group by book
    const grouped = {};
    highlights.forEach((h) => {
      if (!grouped[h.bookPath]) grouped[h.bookPath] = [];
      grouped[h.bookPath].push(h);
    });

    let html = '';
    Object.entries(grouped).forEach(([bookPath, items]) => {
      const book = BOOKS.find((b) => b.path === bookPath);
      const bookTitle = book ? book.title : items[0].bookTitle || bookPath;
      html += `<div class="quotes-group"><h4 class="quotes-group-title">${bookTitle}</h4>`;
      items.sort((a, b) => b.createdAt - a.createdAt).forEach((h) => {
        const date = new Date(h.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
        html += `
          <div class="quote-item highlight-${h.color || 'yellow'}">
            <p class="quote-text">${escapeHtml(h.text)}</p>
            <div class="quote-meta">
              <span class="quote-date">${date}</span>
              <div class="quote-actions">
                <button class="quote-action-btn" data-share-text="${escapeAttr(h.text)}">\u0645\u0634\u0627\u0631\u0643\u0629</button>
                <button class="quote-action-btn delete" data-delete-highlight="${h.id}">\u062D\u0630\u0641</button>
              </div>
            </div>
          </div>
        `;
      });
      html += '</div>';
    });
    return html;
  }

  function renderCommentsList(comments) {
    if (comments.length === 0) {
      return `<div class="empty-state"><p>\u0644\u0627 \u062A\u0648\u062C\u062F \u062A\u0639\u0644\u064A\u0642\u0627\u062A \u0628\u0639\u062F</p></div>`;
    }

    const grouped = {};
    comments.forEach((c) => {
      if (!grouped[c.bookPath]) grouped[c.bookPath] = [];
      grouped[c.bookPath].push(c);
    });

    let html = '';
    Object.entries(grouped).forEach(([bookPath, items]) => {
      const book = BOOKS.find((b) => b.path === bookPath);
      const bookTitle = book ? book.title : items[0].bookTitle || bookPath;
      html += `<div class="quotes-group"><h4 class="quotes-group-title">${bookTitle}</h4>`;
      items.sort((a, b) => b.createdAt - a.createdAt).forEach((c) => {
        const date = new Date(c.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
        html += `
          <div class="quote-item comment-item">
            <p class="quote-text">${escapeHtml(c.text)}</p>
            <div class="quote-meta">
              <span class="quote-date">${date}</span>
              <button class="quote-action-btn delete" data-delete-comment="${c.id}">\u062D\u0630\u0641</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    });
    return html;
  }

  function renderBookmarksList(bookmarks) {
    if (bookmarks.length === 0) {
      return `<div class="empty-state"><p>\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0644\u0627\u0645\u0627\u062A \u0628\u0639\u062F</p></div>`;
    }

    const grouped = {};
    bookmarks.forEach((bm) => {
      if (!grouped[bm.bookPath]) grouped[bm.bookPath] = [];
      grouped[bm.bookPath].push(bm);
    });

    let html = '';
    Object.entries(grouped).forEach(([bookPath, items]) => {
      const book = BOOKS.find((b) => b.path === bookPath);
      const bookTitle = book ? book.title : items[0].bookTitle || bookPath;
      html += `<div class="quotes-group"><h4 class="quotes-group-title">${bookTitle}</h4>`;
      items.sort((a, b) => b.createdAt - a.createdAt).forEach((bm) => {
        const date = new Date(bm.createdAt).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
        html += `
          <div class="quote-item bookmark-item" onclick="App.openBook('${bookPath}')">
            <p class="quote-text">\uD83D\uDD16 \u0639\u0646\u062F ${Math.round(bm.scrollPercent)}%${bm.note ? ' \u2014 ' + escapeHtml(bm.note) : ''}</p>
            <div class="quote-meta">
              <span class="quote-date">${date}</span>
              <button class="quote-action-btn delete" data-delete-bookmark="${bm.id}">\u062D\u0630\u0641</button>
            </div>
          </div>
        `;
      });
      html += '</div>';
    });
    return html;
  }

  async function shareText(text) {
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (e) {
        // User cancelled or share failed, fall back to clipboard
        copyToClipboard(text);
      }
    } else {
      copyToClipboard(text);
    }
  }

  function copyToClipboard(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        showToast('\u062A\u0645 \u0627\u0644\u0646\u0633\u062E');
      });
    } else {
      // Fallback for older browsers / iOS Safari
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        document.execCommand('copy');
        showToast('\u062A\u0645 \u0627\u0644\u0646\u0633\u062E');
      } catch (e) {
        showToast('\u0641\u0634\u0644 \u0627\u0644\u0646\u0633\u062E');
      }
      document.body.removeChild(ta);
    }
  }

  // ==================== SETTINGS VIEW ====================

  async function renderSettings() {
    const settingsEl = document.getElementById('view-settings');
    if (!settingsEl) return;

    settingsEl.innerHTML = `
      <div class="settings-content" id="settings-content">
        <h2 class="settings-title">\u2699\uFE0F \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A</h2>

        <div class="settings-section">
          <h3>\u0627\u0644\u0645\u0638\u0647\u0631</h3>
          <div class="theme-buttons">
            <button class="theme-btn ${currentTheme === 'dark' ? 'active' : ''}" data-theme="dark">
              <span class="theme-preview" style="background:#0f0f1a;color:#e0e0e0">\u0623</span>
              <span>\u062F\u0627\u0643\u0646</span>
            </button>
            <button class="theme-btn ${currentTheme === 'light' ? 'active' : ''}" data-theme="light">
              <span class="theme-preview" style="background:#f5f5f5;color:#2c2c2c">\u0623</span>
              <span>\u0641\u0627\u062A\u062D</span>
            </button>
            <button class="theme-btn ${currentTheme === 'sepia' ? 'active' : ''}" data-theme="sepia">
              <span class="theme-preview" style="background:#f4f1ea;color:#5c4b37">\u0623</span>
              <span>\u0628\u0646\u064A</span>
            </button>
          </div>
        </div>

        <div class="settings-section">
          <h3>\u062D\u062C\u0645 \u0627\u0644\u062E\u0637: <span id="settings-font-size-val">${currentFontSize}px</span></h3>
          <input type="range" id="settings-font-slider" class="settings-slider" min="14" max="24" value="${currentFontSize}" step="1">
        </div>

        <div class="settings-section">
          <h3>\u0646\u0648\u0639 \u0627\u0644\u062E\u0637</h3>
          <div class="font-family-buttons">
            <button class="font-btn ${currentFontFamily === 'Tajawal' ? 'active' : ''}" data-sfont="Tajawal" style="font-family:Tajawal">Tajawal</button>
            <button class="font-btn ${currentFontFamily === 'Amiri' ? 'active' : ''}" data-sfont="Amiri" style="font-family:Amiri">\u0623\u0645\u064A\u0631\u064A</button>
            <button class="font-btn ${currentFontFamily === 'Noto Naskh Arabic' ? 'active' : ''}" data-sfont="Noto Naskh Arabic" style="font-family:'Noto Naskh Arabic'">\u0646\u0648\u062A\u0648 \u0646\u0633\u062E</button>
          </div>
        </div>

        <div class="settings-section">
          <h3>\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A</h3>
          <div class="data-buttons">
            <button class="data-btn" id="btn-export">\uD83D\uDCE4 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A</button>
            <label class="data-btn" id="btn-import-label">
              \uD83D\uDCE5 \u0627\u0633\u062A\u064A\u0631\u0627\u062F
              <input type="file" id="btn-import" accept=".json" style="display:none">
            </label>
            <button class="data-btn danger" id="btn-clear">\uD83D\uDDD1\uFE0F \u0645\u0633\u062D \u0627\u0644\u0643\u0644</button>
          </div>
        </div>

        <div class="settings-section about-section">
          <h3>\u062D\u0648\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642</h3>
          <p>\u0645\u0643\u062A\u0628\u062A\u064A \u0627\u0644\u0634\u062E\u0635\u064A\u0629</p>
          <p class="version">\u0627\u0644\u0625\u0635\u062F\u0627\u0631 1.0.0</p>
        </div>
      </div>
    `;

    // Theme buttons
    settingsEl.querySelectorAll('.theme-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        applyTheme(theme);
        settingsEl.querySelectorAll('.theme-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Font size slider
    const fontSlider = settingsEl.querySelector('#settings-font-slider');
    if (fontSlider) {
      fontSlider.addEventListener('input', (e) => {
        currentFontSize = parseInt(e.target.value);
        settingsEl.querySelector('#settings-font-size-val').textContent = currentFontSize + 'px';
        DB.setSetting('fontSize', currentFontSize);
      });
    }

    // Font family
    settingsEl.querySelectorAll('[data-sfont]').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFontFamily = btn.getAttribute('data-sfont');
        settingsEl.querySelectorAll('[data-sfont]').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        DB.setSetting('fontFamily', currentFontFamily);
      });
    });

    // Export
    const btnExport = settingsEl.querySelector('#btn-export');
    if (btnExport) {
      btnExport.addEventListener('click', async () => {
        const data = await DB.exportAll();
        if (data) {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'maktabati-backup-' + formatDateKey(new Date()) + '.json';
          a.click();
          URL.revokeObjectURL(url);
          showToast('\u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A');
        }
      });
    }

    // Import
    const btnImport = settingsEl.querySelector('#btn-import');
    if (btnImport) {
      btnImport.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const data = JSON.parse(text);
          await DB.importAll(data);
          showToast('\u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A');
          renderLibrary();
        } catch (err) {
          showToast('\u0641\u0634\u0644 \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F: ' + err.message);
        }
      });
    }

    // Clear all
    const btnClear = settingsEl.querySelector('#btn-clear');
    if (btnClear) {
      btnClear.addEventListener('click', async () => {
        if (confirm('\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0645\u0633\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621.')) {
          await DB.clearAll();
          showToast('\u062A\u0645 \u0645\u0633\u062D \u062C\u0645\u064A\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A');
          renderLibrary();
        }
      });
    }
  }

  // ==================== UTILITIES ====================

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ==================== PUBLIC API ====================

  window.App = {
    init,
    openBook,
    closeBook,
    switchView,
    BOOKS,
    CATEGORIES,
  };

})();
