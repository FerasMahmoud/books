#!/usr/bin/env python3
"""
Personal Library Server
Automatically detects books and serves them over the network.
Run: python server.py
Access: http://localhost:5500 or http://YOUR_IP:5500
"""

import os
import re
import sys
import socket
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Configuration
PORT = 5500
BOOKS_DIR = Path(__file__).parent

# Book colors
COLORS = ['red', 'blue', 'orange', 'green', 'crimson', 'purple', 'teal', 'pink', 'amber', 'cyan']

def get_local_ip():
    """Get the local IP address for network access."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def extract_book_info(html_path):
    """Extract book metadata from HTML file."""
    try:
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extract title (Arabic)
        title_match = re.search(r'<h1[^>]*>([^<]+)</h1>', content)
        title = title_match.group(1).strip() if title_match else Path(html_path).stem

        # Extract subtitle (English)
        subtitle_match = re.search(r'class="subtitle"[^>]*>([^<]+)<', content)
        subtitle = subtitle_match.group(1).strip() if subtitle_match else ""

        # Extract author
        author_match = re.search(r'class="author"[^>]*>([^<]+)', content)
        if author_match:
            author = author_match.group(1).split('—')[0].strip()
        else:
            author = ""

        # Extract icon/emoji from hero
        icon_match = re.search(r'class="book-icon"[^>]*>([^<]+)<', content)
        icon = icon_match.group(1).strip() if icon_match else "&#128214;"

        # Extract description from intro or problem section
        desc_match = re.search(r'intro-section[^>]*>.*?<p[^>]*>([^<]{50,200})', content, re.DOTALL)
        if not desc_match:
            desc_match = re.search(r'problem-section[^>]*>.*?<p[^>]*>([^<]{50,200})', content, re.DOTALL)
        description = desc_match.group(1).strip()[:150] + "..." if desc_match else ""

        # Count chapters
        chapters = len(re.findall(r'class="chapter"', content))
        chapter_text = f"{chapters} فصل" if chapters > 0 else ""

        return {
            'title': title,
            'subtitle': subtitle,
            'author': author,
            'icon': icon,
            'description': description,
            'chapters': chapter_text
        }
    except Exception as e:
        print(f"Error reading {html_path}: {e}")
        return None

def scan_books():
    """Scan all book folders and return book data."""
    categories = {}

    for item in BOOKS_DIR.iterdir():
        if item.is_dir() and not item.name.startswith('.') and not item.name.startswith('__'):
            category_name = item.name
            books = []

            for html_file in item.glob('*.html'):
                if html_file.name != 'index.html':
                    info = extract_book_info(html_file)
                    if info:
                        info['path'] = f"{category_name}/{html_file.name}"
                        books.append(info)

            if books:
                categories[category_name] = books

    return categories

def generate_index_html(categories):
    """Generate the index.html with all discovered books."""

    # Category display names and icons
    category_display = {
        'المال-والاستثمار': ('&#128176;', 'المال والاستثمار'),
        'الإنتاجية-والتوازن': ('&#9889;', 'الإنتاجية والتوازن'),
        'التطوير-الذاتي': ('&#127793;', 'التطوير الذاتي'),
        'القيادة-والأعمال': ('&#128084;', 'القيادة والأعمال'),
        'الصحة-والعافية': ('&#127939;', 'الصحة والعافية'),
    }

    # Count total books
    total_books = sum(len(books) for books in categories.values())

    # Generate book cards HTML
    categories_html = ""
    color_index = 0

    for category_name, books in sorted(categories.items()):
        icon, display_name = category_display.get(category_name, ('&#128218;', category_name.replace('-', ' ')))

        books_html = ""
        for book in books:
            color = COLORS[color_index % len(COLORS)]
            color_index += 1

            books_html += f'''
      <a class="book-card" data-color="{color}" onclick="openBook('{book['path']}')">
        <div class="book-cover">{book['icon']}</div>
        <div class="book-info">
          <h3 class="book-title">{book['title']}</h3>
          <p class="book-subtitle">{book['subtitle']}</p>
          <p class="book-author">{book['author']}</p>
          <p class="book-description">{book['description']}</p>
          <span class="book-tag">{book['chapters']}</span>
        </div>
      </a>
'''

        categories_html += f'''
  <section class="category">
    <h2 class="category-title"><span>{icon}</span> {display_name}</h2>
    <div class="books-grid">
{books_html}
    </div>
  </section>
'''

    # Full HTML template
    html = f'''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>مكتبتي الشخصية</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap');

  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html {{ scroll-behavior: smooth; font-size: 16px; }}
  body {{
    font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;
    background-color: #0f0f1a;
    color: #e0e0e0;
    line-height: 1.8;
    min-height: 100vh;
  }}

  .header {{
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    padding: 40px 20px;
    text-align: center;
    border-bottom: 3px solid #e94560;
    position: sticky;
    top: 0;
    z-index: 100;
  }}

  .header h1 {{ font-size: 2.5rem; font-weight: 900; color: #fff; margin-bottom: 10px; }}
  .header p {{ color: #8888a0; font-size: 1.1rem; }}
  .header .book-count {{
    display: inline-block;
    background: #e94560;
    color: #fff;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    margin-top: 10px;
  }}

  .container {{ max-width: 1200px; margin: 0 auto; padding: 40px 20px; }}

  .category {{ margin-bottom: 50px; }}
  .category-title {{
    font-size: 1.5rem;
    color: #e94560;
    margin-bottom: 25px;
    padding-bottom: 10px;
    border-bottom: 2px solid rgba(233, 69, 96, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .category-title span {{ font-size: 1.5rem; }}

  .books-grid {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 25px;
  }}

  .book-card {{
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }}

  .book-card:hover {{
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border-color: rgba(233, 69, 96, 0.3);
  }}

  .book-cover {{
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
  }}

  .book-card[data-color="red"] .book-cover {{ background: linear-gradient(135deg, #e94560, #c0392b); }}
  .book-card[data-color="blue"] .book-cover {{ background: linear-gradient(135deg, #4a90a4, #357a8a); }}
  .book-card[data-color="orange"] .book-cover {{ background: linear-gradient(135deg, #e67e22, #d35400); }}
  .book-card[data-color="green"] .book-cover {{ background: linear-gradient(135deg, #1abc9c, #16a085); }}
  .book-card[data-color="crimson"] .book-cover {{ background: linear-gradient(135deg, #e74c3c, #c0392b); }}
  .book-card[data-color="purple"] .book-cover {{ background: linear-gradient(135deg, #9b59b6, #8e44ad); }}
  .book-card[data-color="teal"] .book-cover {{ background: linear-gradient(135deg, #00b894, #00a878); }}
  .book-card[data-color="pink"] .book-cover {{ background: linear-gradient(135deg, #fd79a8, #e84393); }}
  .book-card[data-color="amber"] .book-cover {{ background: linear-gradient(135deg, #fdcb6e, #f39c12); }}
  .book-card[data-color="cyan"] .book-cover {{ background: linear-gradient(135deg, #00cec9, #0984e3); }}

  .book-info {{ padding: 20px; }}
  .book-title {{ font-size: 1.3rem; font-weight: 800; color: #fff; margin-bottom: 5px; }}
  .book-subtitle {{ font-size: 0.85rem; color: #e94560; font-style: italic; margin-bottom: 8px; direction: ltr; text-align: right; }}
  .book-author {{ font-size: 0.9rem; color: #8888a0; margin-bottom: 12px; }}
  .book-description {{ font-size: 0.9rem; color: #a0a0b0; line-height: 1.7; }}
  .book-tag {{
    display: inline-block;
    background: rgba(233, 69, 96, 0.1);
    color: #e94560;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 0.75rem;
    margin-top: 12px;
  }}

  .footer {{
    text-align: center;
    padding: 30px;
    color: #666680;
    font-size: 0.9rem;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }}

  .back-button {{
    position: fixed;
    top: 20px;
    right: 20px;
    background: #e94560;
    color: #fff;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(233, 69, 96, 0.4);
    transition: all 0.3s ease;
    display: none;
    align-items: center;
    justify-content: center;
  }}
  .back-button:hover {{ background: #c0392b; transform: scale(1.1); }}
  .back-button.visible {{ display: flex; }}

  .book-viewer {{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #0f0f1a;
    z-index: 999;
    display: none;
  }}
  .book-viewer.active {{ display: block; }}
  .book-viewer iframe {{ width: 100%; height: 100%; border: none; }}

  @media (max-width: 768px) {{
    .header h1 {{ font-size: 1.8rem; }}
    .header {{ padding: 30px 15px; }}
    .container {{ padding: 25px 15px; }}
    .books-grid {{ grid-template-columns: 1fr; gap: 20px; }}
    .book-cover {{ height: 150px; font-size: 3.5rem; }}
    .book-title {{ font-size: 1.2rem; }}
    .category-title {{ font-size: 1.3rem; }}
  }}
</style>
</head>
<body>

<button class="back-button" id="backBtn" onclick="closeBook()">&#10005;</button>

<div class="book-viewer" id="bookViewer">
  <iframe id="bookFrame" src=""></iframe>
</div>

<header class="header" id="header">
  <h1>&#128218; مكتبتي الشخصية</h1>
  <p>ملخصات الكتب باللغة العربية</p>
  <span class="book-count">{total_books} كتب</span>
</header>

<main class="container" id="library">
{categories_html}
</main>

<footer class="footer">
  <p>مكتبة شخصية للملخصات العربية | يتم التحديث تلقائيا</p>
</footer>

<script>
  function openBook(bookPath) {{
    const viewer = document.getElementById('bookViewer');
    const frame = document.getElementById('bookFrame');
    const backBtn = document.getElementById('backBtn');
    const header = document.getElementById('header');
    const library = document.getElementById('library');

    frame.src = bookPath;
    viewer.classList.add('active');
    backBtn.classList.add('visible');
    header.style.display = 'none';
    library.style.display = 'none';
    document.body.style.overflow = 'hidden';
    history.pushState({{book: bookPath}}, '', '#' + bookPath);
  }}

  function closeBook() {{
    const viewer = document.getElementById('bookViewer');
    const frame = document.getElementById('bookFrame');
    const backBtn = document.getElementById('backBtn');
    const header = document.getElementById('header');
    const library = document.getElementById('library');

    viewer.classList.remove('active');
    backBtn.classList.remove('visible');
    frame.src = '';
    header.style.display = 'block';
    library.style.display = 'block';
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
    history.pushState({{}}, '', window.location.pathname);
  }}

  window.addEventListener('popstate', function(event) {{
    if (document.getElementById('bookViewer').classList.contains('active')) {{
      closeBook();
    }}
  }});

  window.addEventListener('load', function() {{
    if (window.location.hash) {{
      const bookPath = window.location.hash.substring(1);
      if (bookPath) openBook(decodeURIComponent(bookPath));
    }}
  }});
</script>

</body>
</html>'''

    return html

def update_index():
    """Scan books and update index.html."""
    print("[*] Scanning for books...")
    categories = scan_books()

    total = sum(len(books) for books in categories.values())
    print(f"    Found {total} books in {len(categories)} categories")

    for cat, books in categories.items():
        print(f"    [{cat}]: {len(books)} books")

    print("\n[*] Generating index.html...")
    html = generate_index_html(categories)

    index_path = BOOKS_DIR / 'index.html'
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"    Updated {index_path}")
    return total

class LibraryHandler(SimpleHTTPRequestHandler):
    """Custom handler that updates index on each request to root."""

    def do_GET(self):
        # Update index when accessing root
        if self.path == '/' or self.path == '/index.html':
            update_index()
        return super().do_GET()

    def log_message(self, format, *args):
        # Cleaner logging
        pass  # Suppress default logging

def main():
    os.chdir(BOOKS_DIR)

    local_ip = get_local_ip()

    print("\n" + "="*50)
    print("  Personal Library Server")
    print("="*50)

    # Initial scan
    total = update_index()

    print(f"\n[*] Server starting on port {PORT}...")
    print(f"\n    Local:   http://localhost:{PORT}")
    print(f"    Network: http://{local_ip}:{PORT}")
    print(f"\n[!] Open the Network URL on your phone!")
    print(f"\n[i] Add new books to any category folder and refresh.")
    print(f"    Press Ctrl+C to stop the server.\n")
    print("="*50 + "\n")

    try:
        server = HTTPServer(('', PORT), LibraryHandler)
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped. Goodbye!")
    except OSError as e:
        if "10048" in str(e) or "Address already in use" in str(e):
            print(f"\n[!] Port {PORT} is already in use!")
            print(f"    Try stopping other servers first.")
        else:
            raise

if __name__ == '__main__':
    main()
