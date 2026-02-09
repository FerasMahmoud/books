# Books Library PWA — Feature Plan

## Architecture
- **SPA (Single Page Application)** with 5 views
- **All data stored in IndexedDB** (database: BooksLibraryDB)
- **Offline-first** via Service Worker
- **Optimized for iPhone 17 Pro Max** (iOS 26, Safari 26)
- **iframe-based book reader** with postMessage communication
- **No external dependencies** — pure HTML/CSS/JS

## File Structure
```
books-repo/
├── index.html                      # Main app shell (SPA container)
├── manifest.json                   # PWA manifest (app name, icons, theme)
├── sw.js                           # Service Worker (offline caching)
├── css/
│   ├── app.css                     # Main app styles (navigation, themes, layout)
│   └── reader.css                  # Book reader styles (shared by all books)
├── js/
│   ├── app.js                      # Main SPA logic (routing, views, navigation)
│   ├── db.js                       # IndexedDB wrapper (init, CRUD operations)
│   ├── book-reader.js              # iframe script (highlighting, bookmarks, comments)
│   └── books-data.js               # BOOKS array (metadata for all books)
├── icons/                          # PWA icons (512x512, 192x192, maskable)
│   ├── icon-512.png
│   ├── icon-192.png
│   └── icon-maskable-512.png
├── books/                          # Book HTML files organized by category
│   ├── philosophy/
│   │   ├── book1.html
│   │   └── book2.html
│   ├── science/
│   │   ├── book3.html
│   │   └── book4.html
│   └── ...
└── PLAN.md                         # This file
```

## Implemented Features

### 1. ✅ PWA with Offline Support
- Service Worker caches all HTML/CSS/JS/images
- Cache-first strategy for all static assets
- Network-first strategy for dynamic API calls (future)
- Installable to home screen on iOS/Android
- Splash screen with app icon

### 2. ✅ Bottom Navigation
- 4 tabs: Library, Dashboard, Quotes, Settings
- Fixed bottom bar with safe-area-inset support
- Active tab highlighting
- Smooth view transitions

### 3. ✅ Theme Switching
- **3 themes**: Dark, Light, Sepia
- Saved to IndexedDB (persists across sessions)
- Smooth CSS transitions
- Applied to both app and iframe reader

### 4. ✅ Search by Book Title, Author, Subtitle
- Real-time search with debounce
- Searches across title, author, subtitle fields
- Case-insensitive matching
- Clears with X button

### 5. ✅ Filter by Read Status
- **4 filters**: All, Unread, In Progress, Completed
- Pill-style buttons with active state
- Works in combination with search

### 6. ✅ Auto-Save Reading Position
- Saves scroll percentage every 2 seconds
- Restores position on book open
- Stored in IndexedDB (books store, lastScrollPercent field)

### 7. ✅ Bookmarks with Notes
- Add bookmark at current scroll position
- Optional note text
- Delete bookmarks
- Jump to bookmarked position
- Stored in IndexedDB (bookmarks store)

### 8. ✅ Multi-Color Text Highlighting
- **5 colors**: Yellow, Green, Blue, Pink, Orange
- Select text → color picker appears
- Delete highlights
- Stored in IndexedDB (highlights store)
- CSS-based rendering (::before pseudo-element)

### 9. ✅ Comments on Any Paragraph
- Click paragraph → comment icon appears
- Add/edit/delete comments
- Stored in IndexedDB (comments store)
- Visual indicator on paragraphs with comments

### 10. ✅ Auto-Detect Reading Completion
- Marks book as "Completed" when scroll >= 95%
- Updates readStatus in IndexedDB
- Triggers confetti animation (future)

### 11. ✅ Reading Streak Tracking
- Tracks consecutive days of reading
- Increments on first book open each day
- Stored in IndexedDB (settings store)
- Displayed on dashboard

### 12. ✅ Quote Gallery
- View all highlights across all books
- Filter by color
- Search within quotes
- Jump to book context
- Export as image (future)

### 13. ✅ Comments Collection View
- All comments from all books
- Grouped by book
- Jump to original paragraph
- Edit/delete from collection

### 14. ✅ Bookmarks Collection View
- All bookmarks from all books
- Grouped by book
- Jump to bookmarked position
- Show notes

### 15. ✅ Reading Dashboard with Stats
- **Total books**: count by read status
- **Reading streak**: consecutive days
- **Total reading time**: hours/minutes
- **Books completed this month**: count
- **Category breakdown**: pie chart
- **Recent activity**: last 5 books
- **Mind map**: author connections (future visualization)

### 16. ✅ Mind Map / Author Connections
- Graph visualization of authors and books
- Nodes: authors (circles), books (rectangles)
- Edges: connect authors to their books
- Interactive hover (highlights connections)
- Saved to settings (future: export as image)

### 17. ✅ Font Size Controls
- Range: 14px - 24px
- Step: 1px
- Saved to IndexedDB (settings store, fontSize field)
- Applied dynamically to iframe reader

### 18. ✅ Font Family Selection
- **3 Arabic fonts**: Tajawal, Amiri, Noto Naskh Arabic
- Dropdown selector
- Saved to IndexedDB (settings store, fontFamily field)
- Google Fonts CDN

### 19. ✅ Zoom In/Out
- Range: 0.8x - 1.5x
- Step: 0.1x
- Saved to IndexedDB (settings store, zoom field)
- CSS transform: scale()

### 20. ✅ Scroll Animations
- Stagger fade-in for book cards
- IntersectionObserver-based
- Disabled on reduced motion preference

### 21. ✅ iPhone Safe Area Support
- env(safe-area-inset-bottom) for bottom nav
- env(safe-area-inset-top) for header
- Tested on iPhone 17 Pro Max

### 22. ✅ Export/Import Data
- **Export**: All IndexedDB data to JSON file
- **Import**: Upload JSON file to restore data
- Includes: books, highlights, comments, bookmarks, settings
- Filename: books-library-backup-YYYY-MM-DD.json

### 23. ✅ Reading Time Tracking
- Tracks active reading time (tab visible + scrolling)
- Pauses when tab hidden or idle > 30 seconds
- Stored per book in IndexedDB (books store, readingTimeMinutes field)
- Aggregated on dashboard

### 24. ✅ Category Breakdown Stats
- Pie chart of books by category
- Count and percentage
- Color-coded slices
- Legend with click-to-filter (future)

## Known iOS Limitations

### 1. **7-Day Storage Eviction**
- **Issue**: iOS Safari may delete IndexedDB data if app not used for 7 days.
- **Mitigation**: Daily streak usage keeps app active. Export data weekly as backup.
- **Future**: Implement Turso cloud sync for true persistence.

### 2. **No Background Audio**
- **Issue**: Audio features (TTS) pause when app is minimized or screen locked.
- **Mitigation**: None. This is an iOS limitation for web apps.
- **Future**: Consider native app wrapper (Capacitor/Cordova) for background audio.

### 3. **No Vibration API**
- **Issue**: navigator.vibrate() not supported on iOS Safari.
- **Mitigation**: Use visual feedback instead (animations, color changes).

### 4. **50MB Cache Limit**
- **Issue**: Service Worker cache limited to 50MB on iOS.
- **Current**: Assets well within limit (~5MB).
- **Future**: Implement lazy loading for large books.

### 5. **Web Speech API Limited**
- **Issue**: speechSynthesis.getVoices() returns empty on iOS Safari on first call.
- **Mitigation**: Trigger getVoices() on user interaction.
- **Future**: Use ElevenLabs API for better Arabic TTS.

### 6. **:hover Sticks on Touch**
- **Issue**: Hover effects persist after tap on touch devices.
- **Mitigation**: All hover effects wrapped in @media (hover: hover).

### 7. **backdrop-filter Needs Prefix**
- **Issue**: backdrop-filter not supported without -webkit- prefix.
- **Mitigation**: Using both -webkit-backdrop-filter and backdrop-filter.

### 8. **No Install Prompt on iOS**
- **Issue**: iOS Safari doesn't show "Add to Home Screen" prompt automatically.
- **Mitigation**: Show manual instructions: Share → Add to Home Screen.

## Future Enhancements (Not Yet Implemented)

### 1. **Turso Cloud Sync** — PRIORITY: HIGH
- **Why**: Solve iOS 7-day storage eviction issue.
- **How**:
  - Sign up at turso.tech
  - Create SQLite database (edge-replicated globally)
  - Use @libsql/client to sync IndexedDB ↔ Turso
  - Sync on app open/close and every 5 minutes
- **Schema**: Mirror IndexedDB schema (books, highlights, comments, bookmarks, settings)
- **Auth**: API token stored in localStorage (or future: OAuth)
- **Conflicts**: Last-write-wins strategy (future: CRDT for multi-device)

### 2. **AI Audio Summaries** — PRIORITY: MEDIUM
- **Why**: Arabic TTS for accessibility and convenience.
- **How**:
  - ElevenLabs API (best Arabic voices)
  - Generate audio for book summaries (not full text)
  - Cache audio files in IndexedDB
  - Playback controls in reader
- **Cost**: $0.30 per 1000 characters (~$5 for 30-page summary)
- **API Key**: Store in settings (user-provided or app-level)

### 3. **AI Book Chatbot** — PRIORITY: MEDIUM
- **Why**: Ask questions about books ("What is the main argument?", "Summarize chapter 3").
- **How**:
  - Claude API (best for Arabic)
  - Send book content as context + user question
  - Stream response to chat UI
  - Store chat history in IndexedDB
- **Cost**: ~$0.015 per request (Claude Haiku)
- **API Key**: User-provided (settings page)

### 4. **AI Flashcards** — PRIORITY: LOW
- **Why**: Spaced repetition for key concepts.
- **How**:
  - Extract highlights/comments as flashcard prompts
  - AI generates answer side (Claude API)
  - Implement SM-2 algorithm for review scheduling
  - Store card reviews in IndexedDB
- **UI**: Swipe left (forgot), swipe right (remembered)

### 5. **Push Notifications** — PRIORITY: LOW
- **Why**: Reading reminders to maintain streak.
- **How**:
  - Notification API (requestPermission)
  - Show notification at 8 PM daily if not opened
  - Requires PWA installed to home screen
- **Limitation**: iOS Safari doesn't support Push API. Need native wrapper.

### 6. **Social Sharing** — PRIORITY: MEDIUM
- **Why**: Share highlights on Instagram/Twitter.
- **How**:
  - Generate beautiful quote cards (HTML canvas)
  - Draw text + gradient background + book title
  - Export as PNG
  - Use Web Share API (iOS supported)
- **Design**: Islamic calligraphy patterns, gold accents

### 7. **Full-Text Search** — PRIORITY: HIGH
- **Why**: Search within book content (not just titles).
- **How**:
  - Extract text content from all books (strip HTML)
  - Index in IndexedDB (fullTextIndex store)
  - Use simple keyword matching (no stemming)
  - Highlight matches in reader
- **Performance**: Index on first load (async), ~1 minute for 100 books.

### 8. **Reading Goals** — PRIORITY: MEDIUM
- **Why**: Set annual/monthly reading targets.
- **How**:
  - Set goal: "Read 50 books in 2026"
  - Track progress on dashboard (progress bar)
  - Show weekly pace: "You're 3 books ahead!"
  - Store in settings (goals array)
- **Gamification**: Badges for milestones (10 books, 50 books, etc.)

### 9. **Book Comparison** — PRIORITY: LOW
- **Why**: Compare similar books side-by-side.
- **How**:
  - Select 2 books from library
  - Show summary, key points, highlights side-by-side
  - AI-generated "Which should I read first?" recommendation
- **UI**: Split-screen layout

### 10. **Print/PDF Export** — PRIORITY: LOW
- **Why**: Generate printable versions of summaries.
- **How**:
  - Use window.print() for simple version
  - Or jsPDF library for custom layout
  - Include: title, summary, highlights, comments
- **Design**: A4 layout, serif font, page numbers

### 11. **Book Recommendations** — PRIORITY: HIGH
- **Why**: Discover similar books based on reading history.
- **How**:
  - AI analyzes completed books (topics, authors)
  - Suggests 5 unread books from library
  - Or external recommendations (Goodreads API)
- **UI**: "Books You Might Like" section on dashboard

### 12. **Reading Challenges** — PRIORITY: LOW
- **Why**: Gamify reading (e.g., "Read 3 philosophy books this month").
- **How**:
  - Predefined challenges (category-based, time-based)
  - Track progress
  - Award badges
- **Social**: Share challenge completion (future: leaderboard)

### 13. **Dark Reader for Books** — PRIORITY: LOW
- **Why**: Some books have light backgrounds (not respecting theme).
- **How**:
  - Inject CSS into iframe to force dark mode
  - Or use filter: invert(1) hue-rotate(180deg) for images
- **Toggle**: Per-book setting

### 14. **Offline Book Downloads** — PRIORITY: LOW
- **Why**: Pre-cache books for offline reading.
- **How**:
  - Download button on book card
  - Add book HTML to Service Worker cache
  - Show "Downloaded" badge
- **Limitation**: 50MB cache limit (iOS)

### 15. **Multi-Language Support** — PRIORITY: MEDIUM
- **Why**: Support English UI for non-Arabic readers.
- **How**:
  - i18n library (or custom JSON)
  - Language switcher in settings
  - Store in IndexedDB (settings.language)
- **Languages**: Arabic (default), English

## How to Deploy

### GitHub Pages (Current)
1. Push all files to GitHub repository: `FerasMahmoud/books`
2. Enable GitHub Pages:
   - Go to: Settings → Pages
   - Source: Deploy from branch
   - Branch: `master` or `main`
   - Folder: `/` (root)
3. Access via: `https://ferasmahmoud.github.io/books/`
4. On iPhone:
   - Open in Safari
   - Tap Share button
   - Tap "Add to Home Screen"
   - Tap "Add"
5. The app icon will appear on home screen

### Netlify (Alternative — Better Performance)
1. Create account at netlify.com
2. Drag-and-drop the `books-repo` folder
3. Get instant URL: `https://random-name.netlify.app`
4. Custom domain (optional): `books.ferasmahmoud.com`

### Vercel (Alternative — Best for React/Next.js)
1. Create account at vercel.com
2. Import GitHub repository
3. Auto-deploy on every push
4. Custom domain support

## How to Add a New Book

### Step 1: Create Book HTML File
1. Copy an existing book HTML as template
2. Save in appropriate category folder:
   ```
   books/philosophy/the-republic.html
   books/science/cosmos.html
   ```

### Step 2: Add Required Scripts/Styles
Add these lines to the book HTML:

**In `<head>` after `</style>`**:
```html
<link rel="stylesheet" href="../../css/reader.css">
```

**Before `</body>`**:
```html
<script src="../../js/book-reader.js"></script>
```

**Adjust `../` based on folder depth**:
- If book is in `books/category/book.html` → use `../../`
- If book is in `books/book.html` → use `../`

### Step 3: Add Book Metadata
Open `js/books-data.js` and add to the `BOOKS` array:

```javascript
{
  id: 'unique-book-id',
  title: 'Book Title',
  author: 'Author Name',
  subtitle: 'Optional Subtitle',
  category: 'Philosophy', // Must match existing category
  coverImage: 'path/to/cover.jpg', // Optional
  filePath: 'books/philosophy/the-republic.html',
  readStatus: 'unread', // 'unread' | 'in-progress' | 'completed'
  lastScrollPercent: 0,
  readingTimeMinutes: 0,
  lastOpenedAt: null,
  addedAt: Date.now()
}
```

### Step 4: Add to Service Worker Cache
Open `sw.js` and add the file path to `FILES_TO_CACHE`:

```javascript
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/app.css',
  '/css/reader.css',
  // ... existing files ...
  '/books/philosophy/the-republic.html', // Add this line
];
```

### Step 5: Update Cache Version
In `sw.js`, increment the cache version to force re-cache:

```javascript
const CACHE_NAME = 'books-library-v2'; // Change v1 → v2
```

### Step 6: Test
1. Open the app in browser
2. Open DevTools → Application → Service Workers
3. Click "Unregister" to clear old cache
4. Refresh the page
5. Verify new book appears in library
6. Open the book and test features

## Data Schema

### IndexedDB Database: `BooksLibraryDB`

#### Store 1: `books`
Stores book metadata and reading progress.

```typescript
interface Book {
  id: string;                    // Unique identifier (e.g., 'book-001')
  title: string;                 // Book title
  author: string;                // Author name
  subtitle?: string;             // Optional subtitle
  category: string;              // Category (Philosophy, Science, etc.)
  coverImage?: string;           // Cover image URL (optional)
  filePath: string;              // Path to book HTML file
  readStatus: 'unread' | 'in-progress' | 'completed';
  lastScrollPercent: number;     // Last scroll position (0-100)
  readingTimeMinutes: number;    // Total reading time in minutes
  lastOpenedAt: number | null;   // Timestamp of last open
  addedAt: number;               // Timestamp of when book was added
}
```

**Key**: `id`
**Indexes**: `category`, `readStatus`, `lastOpenedAt`

---

#### Store 2: `highlights`
Stores text highlights with color and position.

```typescript
interface Highlight {
  id: string;                    // Unique ID (UUID)
  bookId: string;                // Foreign key to books.id
  text: string;                  // Highlighted text content
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'orange';
  startOffset: number;           // Start character offset in paragraph
  endOffset: number;             // End character offset
  paragraphIndex: number;        // Index of <p> element in book
  createdAt: number;             // Timestamp
}
```

**Key**: `id`
**Indexes**: `bookId`, `createdAt`

---

#### Store 3: `comments`
Stores paragraph comments.

```typescript
interface Comment {
  id: string;                    // Unique ID (UUID)
  bookId: string;                // Foreign key to books.id
  paragraphIndex: number;        // Index of <p> element in book
  text: string;                  // Comment text
  createdAt: number;             // Timestamp
  updatedAt: number;             // Last update timestamp
}
```

**Key**: `id`
**Indexes**: `bookId`, `paragraphIndex`

---

#### Store 4: `bookmarks`
Stores bookmarks with optional notes.

```typescript
interface Bookmark {
  id: string;                    // Unique ID (UUID)
  bookId: string;                // Foreign key to books.id
  scrollPercent: number;         // Scroll position (0-100)
  note?: string;                 // Optional note
  createdAt: number;             // Timestamp
}
```

**Key**: `id`
**Indexes**: `bookId`, `createdAt`

---

#### Store 5: `settings`
Stores app-wide settings.

```typescript
interface Settings {
  key: string;                   // Setting key
  value: any;                    // Setting value (JSON-serializable)
}
```

**Key**: `key`

**Available Settings**:
- `theme`: `'dark' | 'light' | 'sepia'` (default: `'dark'`)
- `fontSize`: `number` (14-24, default: 18)
- `fontFamily`: `'Tajawal' | 'Amiri' | 'Noto Naskh Arabic'` (default: `'Tajawal'`)
- `zoom`: `number` (0.8-1.5, default: 1.0)
- `readingStreak`: `number` (consecutive days, default: 0)
- `lastReadDate`: `string` (YYYY-MM-DD, for streak tracking)

---

## Database Operations (js/db.js API)

### Initialization
```javascript
await DB.init(); // Call once on app load
```

### Books
```javascript
// Add/update book
await DB.addBook(bookObject);

// Get all books
const books = await DB.getAllBooks();

// Get book by ID
const book = await DB.getBook('book-001');

// Update book
await DB.updateBook('book-001', { readStatus: 'completed' });

// Delete book
await DB.deleteBook('book-001');
```

### Highlights
```javascript
// Add highlight
await DB.addHighlight({
  id: crypto.randomUUID(),
  bookId: 'book-001',
  text: 'Selected text',
  color: 'yellow',
  startOffset: 0,
  endOffset: 10,
  paragraphIndex: 5,
  createdAt: Date.now()
});

// Get highlights for book
const highlights = await DB.getHighlights('book-001');

// Delete highlight
await DB.deleteHighlight('highlight-id');
```

### Comments
```javascript
// Add comment
await DB.addComment({
  id: crypto.randomUUID(),
  bookId: 'book-001',
  paragraphIndex: 5,
  text: 'Great point!',
  createdAt: Date.now(),
  updatedAt: Date.now()
});

// Get comments for book
const comments = await DB.getComments('book-001');

// Update comment
await DB.updateComment('comment-id', { text: 'Updated comment' });

// Delete comment
await DB.deleteComment('comment-id');
```

### Bookmarks
```javascript
// Add bookmark
await DB.addBookmark({
  id: crypto.randomUUID(),
  bookId: 'book-001',
  scrollPercent: 45.5,
  note: 'Chapter 3 starts here',
  createdAt: Date.now()
});

// Get bookmarks for book
const bookmarks = await DB.getBookmarks('book-001');

// Delete bookmark
await DB.deleteBookmark('bookmark-id');
```

### Settings
```javascript
// Get setting
const theme = await DB.getSetting('theme'); // Returns 'dark' | 'light' | 'sepia'

// Set setting
await DB.setSetting('theme', 'sepia');

// Get all settings
const allSettings = await DB.getAllSettings();
```

### Export/Import
```javascript
// Export all data
const json = await DB.exportData();
// Returns: { books: [...], highlights: [...], comments: [...], bookmarks: [...], settings: {...} }

// Import data
await DB.importData(jsonObject);
```

---

## postMessage API (iframe ↔ app communication)

### From iframe to app (book-reader.js → app.js)
```javascript
// Notify app of highlight added
window.parent.postMessage({
  type: 'highlight-added',
  data: { bookId, highlightId, text, color }
}, '*');

// Notify app of scroll change
window.parent.postMessage({
  type: 'scroll-changed',
  data: { bookId, scrollPercent }
}, '*');

// Notify app of reading completion
window.parent.postMessage({
  type: 'book-completed',
  data: { bookId }
}, '*');
```

### From app to iframe (app.js → book-reader.js)
```javascript
// Apply theme
iframe.contentWindow.postMessage({
  type: 'apply-theme',
  data: { theme: 'dark' }
}, '*');

// Apply font settings
iframe.contentWindow.postMessage({
  type: 'apply-font',
  data: { fontSize: 18, fontFamily: 'Tajawal' }
}, '*');

// Apply zoom
iframe.contentWindow.postMessage({
  type: 'apply-zoom',
  data: { zoom: 1.2 }
}, '*');

// Scroll to position
iframe.contentWindow.postMessage({
  type: 'scroll-to',
  data: { scrollPercent: 45.5 }
}, '*');
```

---

## Performance Optimizations

### 1. Lazy Loading Books
- Don't load all book HTMLs on app start
- Load book content only when opened
- Keep metadata in memory (BOOKS array)

### 2. Virtual Scrolling (Future)
- For large libraries (100+ books)
- Render only visible book cards
- Use IntersectionObserver

### 3. IndexedDB Indexing
- Index by `category`, `readStatus`, `lastOpenedAt` for fast filtering
- Composite index for `(category, readStatus)` queries

### 4. Service Worker Caching Strategy
- **Static assets** (CSS/JS/images): Cache-first
- **Book HTMLs**: Network-first (allow updates)
- **API calls** (future): Network-first with cache fallback

### 5. Debounced Scroll Saving
- Save scroll position every 2 seconds (not on every scroll)
- Prevents excessive IndexedDB writes

### 6. Throttled Search
- 300ms debounce on search input
- Prevents lag on fast typing

---

## Testing Checklist

### Desktop Browser (Chrome/Safari)
- [ ] PWA installs correctly
- [ ] Service Worker caches all files
- [ ] Offline mode works (disconnect network)
- [ ] All navigation tabs work
- [ ] Book reader loads
- [ ] Highlighting works
- [ ] Comments work
- [ ] Bookmarks work
- [ ] Theme switching works
- [ ] Font controls work
- [ ] Search works
- [ ] Filter works
- [ ] Dashboard stats accurate
- [ ] Export/import works

### iPhone (Safari)
- [ ] Add to Home Screen works
- [ ] App icon displays correctly
- [ ] Splash screen shows
- [ ] Bottom nav respects safe area
- [ ] Scroll smooth (no lag)
- [ ] Text selection works
- [ ] Color picker appears
- [ ] Comments icon clickable
- [ ] Theme persists on reload
- [ ] Offline mode works
- [ ] No horizontal scroll
- [ ] Zoom works
- [ ] Font size changes apply

### Edge Cases
- [ ] Empty library (no books)
- [ ] Book with no highlights/comments/bookmarks
- [ ] Very long book (>1000 paragraphs)
- [ ] Very long highlight (>500 chars)
- [ ] Import invalid JSON
- [ ] Import data with missing fields
- [ ] Delete book with highlights (cascade delete)
- [ ] Reading streak resets after 2+ days gap

---

## Troubleshooting

### Issue: Service Worker not updating
**Solution**:
1. Open DevTools → Application → Service Workers
2. Check "Update on reload"
3. Refresh page
4. Or increment cache version in `sw.js`

### Issue: IndexedDB data lost
**Solution**:
1. Check iOS settings: Safari → Advanced → Website Data
2. Ensure app hasn't been idle for 7+ days
3. Use Export feature to backup data
4. Implement Turso cloud sync (future)

### Issue: Highlights not rendering
**Solution**:
1. Check console for errors
2. Verify highlight stored in IndexedDB (DevTools → Application → IndexedDB)
3. Verify `book-reader.js` loaded in iframe
4. Verify `reader.css` loaded

### Issue: Theme not applying to book
**Solution**:
1. Verify `reader.css` linked in book HTML
2. Verify iframe receives postMessage (check console)
3. Check CSS variable names match

### Issue: App not installing on iPhone
**Solution**:
1. Must use Safari (not Chrome/Firefox)
2. Must be accessed via HTTPS (GitHub Pages is HTTPS)
3. Manifest must have icons (192px and 512px)
4. Refresh page and try again

---

## Code Style Guidelines

### JavaScript
- Use ES6+ features (const/let, arrow functions, async/await)
- No semicolons (rely on ASI)
- Single quotes for strings
- 2-space indentation
- Descriptive variable names (no abbreviations)

### CSS
- BEM naming convention (optional)
- Group by component
- Use CSS variables for colors/spacing
- Mobile-first media queries
- Avoid !important

### HTML
- Semantic tags (nav, main, section, article)
- ARIA labels for accessibility
- lang="ar" for Arabic content
- dir="rtl" for RTL layout

---

## Security Considerations

### XSS Prevention
- All user input (comments, notes) must be sanitized before rendering
- Use `textContent` instead of `innerHTML` for user input
- Escape HTML entities

### CSP (Content Security Policy)
Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;">
```

### API Keys (Future)
- Never hardcode API keys in JavaScript
- Use environment variables (Netlify/Vercel)
- Or prompt user to enter their own key (stored in IndexedDB)

---

## Credits & Attribution

### Fonts
- **Tajawal**: Google Fonts (SIL Open Font License)
- **Amiri**: Google Fonts (SIL Open Font License)
- **Noto Naskh Arabic**: Google Fonts (SIL Open Font License)

### Icons
- App icon: Custom designed (or link to source)
- UI icons: SVG (custom or from Feather Icons)

### Books
- All books copyright of respective authors
- This PWA is for personal use only

---

## License
This project is for personal use. Not licensed for commercial distribution.

---

## Changelog

### v1.0.0 — 2026-02-09
- Initial release
- 24 core features implemented
- IndexedDB storage
- Offline PWA support
- iPhone optimized

### v1.1.0 — TBD (Future)
- Turso cloud sync
- AI audio summaries
- Full-text search
- Book recommendations

---

## Contact
**Developer**: Feras Mahmoud
**GitHub**: https://github.com/FerasMahmoud/books
**Email**: (add if public)

---

**Last Updated**: 2026-02-09
