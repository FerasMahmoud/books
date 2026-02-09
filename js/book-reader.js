/**
 * Book Reader Script
 * Runs inside each book HTML (in iframe)
 * Provides highlighting, comments, scroll tracking, and theme/font overrides
 */

(function() {
    'use strict';

    // State
    let highlightMode = {
        enabled: false,
        color: 'yellow'
    };
    let isReadingComplete = false;
    let lastScrollUpdate = 0;
    let lastScrollTop = 0;
    let scrollDirection = 'up';
    const SCROLL_THROTTLE = 500; // ms

    // UI Elements (created dynamically)
    let selectionPopup = null;
    let commentDialog = null;
    let currentSelection = null;

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupScrollTracking();
        setupTextSelection();
        setupTapActions();
        createUI();
        notifyContentLoaded();
    });

    // Listen for messages from parent
    window.addEventListener('message', (event) => {
        // Security: verify origin if needed
        const { type, ...data } = event.data;

        switch (type) {
            case 'INIT':
                handleInit(data);
                break;
            case 'SET_THEME':
                setTheme(data.theme);
                break;
            case 'SET_FONT_SIZE':
                setFontSize(data.size);
                break;
            case 'SET_FONT_FAMILY':
                setFontFamily(data.family);
                break;
            case 'SET_ZOOM':
                setZoom(data.zoom);
                break;
            case 'SCROLL_TO':
                scrollToPercent(data.percent);
                break;
            case 'TOGGLE_HIGHLIGHT_MODE':
                toggleHighlightMode(data.enabled, data.color);
                break;
        }
    });

    function init() {
        // Any initial setup
    }

    function notifyContentLoaded() {
        const title = document.title || 'كتاب';
        const totalHeight = document.documentElement.scrollHeight;

        sendToParent({
            type: 'CONTENT_LOADED',
            title,
            totalHeight
        });
    }

    // === Scroll Tracking ===
    function setupScrollTracking() {
        // Throttled for progress saving (500ms)
        window.addEventListener('scroll', throttle(handleScroll, SCROLL_THROTTLE), { passive: true });
        // Scroll direction detection removed - header always visible
    }

    function handleScrollDirection() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const delta = scrollTop - lastScrollTop;
        if (Math.abs(delta) > 8) {
            const newDir = delta > 0 ? 'down' : 'up';
            if (newDir !== scrollDirection) {
                scrollDirection = newDir;
                sendToParent({ type: 'SCROLL_DIRECTION', direction: scrollDirection });
            }
            lastScrollTop = scrollTop;
        }
    }

    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const maxScroll = scrollHeight - clientHeight;

        const scrollPercent = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

        sendToParent({
            type: 'SCROLL_UPDATE',
            scrollPercent,
            scrollTop
        });

        // Reading complete
        if (scrollPercent >= 95 && !isReadingComplete) {
            isReadingComplete = true;
            sendToParent({ type: 'READING_COMPLETE' });
        }
    }

    function scrollToPercent(percent) {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const maxScroll = scrollHeight - clientHeight;
        const targetScroll = (percent / 100) * maxScroll;

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }

    // === Text Selection ===
    function setupTextSelection() {
        document.addEventListener('mouseup', handleTextSelection);
        document.addEventListener('touchend', handleTextSelection);
    }

    function handleTextSelection(e) {
        setTimeout(() => {
            const selection = window.getSelection();
            if (!selection || selection.isCollapsed || !selection.toString().trim()) {
                hideSelectionPopup();
                return;
            }

            currentSelection = {
                text: selection.toString().trim(),
                range: selection.getRangeAt(0),
                element: selection.anchorNode.parentElement
            };

            if (highlightMode.enabled) {
                // In highlight mode: immediately create highlight
                createHighlight(currentSelection, highlightMode.color);
                selection.removeAllRanges();
                hideSelectionPopup();
            } else {
                // Not in highlight mode: show selection popup
                showSelectionPopup(e);
            }
        }, 10);
    }

    // === Tap-to-Act (single tap on paragraph) ===
    let tapActionBar = null;
    let tappedElement = null;
    let tapTimeout = null;

    function setupTapActions() {
        document.addEventListener('click', handleTapAction);
    }

    function handleTapAction(e) {
        // Ignore if tapping on popup/dialog/action-bar UI
        if (selectionPopup && selectionPopup.contains(e.target)) return;
        if (commentDialog && commentDialog.contains(e.target)) return;
        if (tapActionBar && tapActionBar.contains(e.target)) return;
        if (e.target.closest('.comment-indicator')) return;
        if (e.target.closest('.comment-popup')) return;
        if (e.target.closest('.dehighlight-bar')) return;

        // Ignore if text is selected (let the selection popup handle it)
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) return;

        // Check if tapping on a highlighted mark element
        const markEl = e.target.closest('mark[class^="highlight-"]');
        if (markEl) {
            showDehighlightBar(markEl);
            return;
        }

        // Hide dehighlight bar if tapping elsewhere
        hideDehighlightBar();

        // Find the closest content element
        const el = e.target.closest('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th');
        if (!el) {
            hideTapActionBar();
            return;
        }

        const text = el.textContent.trim();
        if (!text || text.length < 2) {
            hideTapActionBar();
            return;
        }

        // Clear any previous tap timeout
        if (tapTimeout) clearTimeout(tapTimeout);

        // If tapping the same element, toggle off
        if (tappedElement === el && tapActionBar && tapActionBar.style.display === 'flex') {
            hideTapActionBar();
            return;
        }

        // Remove previous highlight
        if (tappedElement) {
            tappedElement.style.removeProperty('outline');
            tappedElement.style.removeProperty('outline-offset');
            tappedElement.style.removeProperty('border-radius');
        }

        tappedElement = el;

        // Highlight tapped element
        el.style.outline = '2px solid rgba(233, 69, 96, 0.5)';
        el.style.outlineOffset = '4px';
        el.style.borderRadius = '4px';

        showTapActionBar(text);
    }

    function showTapActionBar(text) {
        if (!tapActionBar) {
            tapActionBar = document.createElement('div');
            tapActionBar.className = 'tap-action-bar';
            tapActionBar.style.cssText = `
                position: fixed;
                bottom: calc(12px + env(safe-area-inset-bottom, 0px));
                left: 50%;
                transform: translateX(-50%);
                display: none;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(30, 30, 50, 0.95);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                z-index: 10002;
                direction: rtl;
                align-items: center;
            `;

            const btnStyle = `
                padding: 10px 16px;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-size: 14px;
                font-family: inherit;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
                white-space: nowrap;
                transition: all 0.2s ease;
            `;

            tapActionBar.innerHTML = `
                <button class="tap-copy-btn" style="${btnStyle} background: #2a2a40; color: #e0e0e0;">نسخ</button>
                <button class="tap-highlight-btn" style="${btnStyle} background: rgba(255,215,0,0.25); color: #ffd700;">تظليل</button>
                <button class="tap-comment-btn" style="${btnStyle} background: rgba(33,150,243,0.2); color: #64b5f6;">تعليق</button>
            `;

            document.body.appendChild(tapActionBar);

            // Copy
            tapActionBar.querySelector('.tap-copy-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (!tappedElement) return;
                const t = tappedElement.textContent.trim();
                navigator.clipboard.writeText(t).catch(() => {
                    const ta = document.createElement('textarea');
                    ta.value = t;
                    ta.style.cssText = 'position:fixed;opacity:0';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                });
                // Visual feedback
                const btn = tapActionBar.querySelector('.tap-copy-btn');
                btn.textContent = 'تم!';
                btn.style.background = '#4caf50';
                btn.style.color = 'white';
                setTimeout(() => {
                    btn.textContent = 'نسخ';
                    btn.style.background = '#2a2a40';
                    btn.style.color = '#e0e0e0';
                    hideTapActionBar();
                }, 800);
            });

            // Highlight
            tapActionBar.querySelector('.tap-highlight-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (!tappedElement) return;
                const t = tappedElement.textContent.trim();
                const color = highlightMode.color || 'yellow';

                // Wrap entire element content in mark
                const mark = document.createElement('mark');
                mark.className = `highlight-${color}`;
                mark.style.cssText = `background-color: ${getColorValue(color)}; padding: 2px 0;`;

                // Move all children into the mark
                while (tappedElement.firstChild) {
                    mark.appendChild(tappedElement.firstChild);
                }
                tappedElement.appendChild(mark);

                sendToParent({
                    type: 'HIGHLIGHT_CREATED',
                    text: t,
                    color,
                    elementSelector: generateElementSelector(tappedElement)
                });

                hideTapActionBar();
            });

            // Comment
            tapActionBar.querySelector('.tap-comment-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (!tappedElement) return;
                currentSelection = {
                    text: tappedElement.textContent.trim(),
                    range: null,
                    element: tappedElement
                };
                showCommentDialog();
                hideTapActionBar();
            });
        }

        tapActionBar.style.display = 'flex';

        // Auto-hide after 6 seconds
        if (tapTimeout) clearTimeout(tapTimeout);
        tapTimeout = setTimeout(() => hideTapActionBar(), 6000);
    }

    function hideTapActionBar() {
        if (tapActionBar) {
            tapActionBar.style.display = 'none';
        }
        if (tappedElement) {
            tappedElement.style.removeProperty('outline');
            tappedElement.style.removeProperty('outline-offset');
            tappedElement.style.removeProperty('border-radius');
            tappedElement = null;
        }
        if (tapTimeout) {
            clearTimeout(tapTimeout);
            tapTimeout = null;
        }
    }

    // === De-highlight ===
    let dehighlightBar = null;
    let dehighlightTarget = null;

    function showDehighlightBar(markEl) {
        hideTapActionBar();
        dehighlightTarget = markEl;

        // Outline the highlight
        markEl.style.outline = '2px solid #e94560';
        markEl.style.outlineOffset = '2px';
        markEl.style.borderRadius = '3px';

        if (!dehighlightBar) {
            dehighlightBar = document.createElement('div');
            dehighlightBar.className = 'dehighlight-bar';
            dehighlightBar.style.cssText = `
                position: fixed;
                bottom: calc(12px + env(safe-area-inset-bottom, 0px));
                left: 50%;
                transform: translateX(-50%);
                display: none;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(30, 30, 50, 0.95);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                z-index: 10002;
                direction: rtl;
                align-items: center;
            `;

            dehighlightBar.innerHTML = `
                <button class="dehighlight-remove-btn" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-family: inherit;
                    font-weight: 600;
                    background: rgba(233,69,96,0.25);
                    color: #e94560;
                    white-space: nowrap;
                ">إزالة التظليل</button>
                <button class="dehighlight-cancel-btn" style="
                    padding: 10px 16px;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 14px;
                    font-family: inherit;
                    font-weight: 600;
                    background: #2a2a40;
                    color: #e0e0e0;
                    white-space: nowrap;
                ">إلغاء</button>
            `;

            document.body.appendChild(dehighlightBar);

            dehighlightBar.querySelector('.dehighlight-remove-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (!dehighlightTarget) return;
                const text = dehighlightTarget.textContent;
                const parent = dehighlightTarget.parentNode;

                // Unwrap: replace mark with its text content
                const textNode = document.createTextNode(text);
                parent.replaceChild(textNode, dehighlightTarget);
                parent.normalize();

                // Notify parent to delete from DB
                sendToParent({
                    type: 'HIGHLIGHT_REMOVED',
                    text: text
                });

                hideDehighlightBar();
            });

            dehighlightBar.querySelector('.dehighlight-cancel-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                hideDehighlightBar();
            });
        }

        dehighlightBar.style.display = 'flex';
    }

    function hideDehighlightBar() {
        if (dehighlightBar) {
            dehighlightBar.style.display = 'none';
        }
        if (dehighlightTarget) {
            dehighlightTarget.style.removeProperty('outline');
            dehighlightTarget.style.removeProperty('outline-offset');
            dehighlightTarget.style.removeProperty('border-radius');
            dehighlightTarget = null;
        }
    }

    // === Selection Popup ===
    function createUI() {
        createSelectionPopup();
        createCommentDialog();
    }

    function createSelectionPopup() {
        selectionPopup = document.createElement('div');
        selectionPopup.className = 'selection-popup';
        selectionPopup.style.cssText = `
            position: absolute;
            display: none;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 8px;
            z-index: 10000;
            direction: rtl;
        `;

        selectionPopup.innerHTML = `
            <div class="popup-buttons" style="display: flex; gap: 8px; align-items: center;">
                <button class="popup-btn highlight-btn" style="padding: 8px 12px; border: none; background: #f0f0f0; border-radius: 6px; cursor: pointer; font-size: 14px;">تظليل</button>
                <button class="popup-btn comment-btn" style="padding: 8px 12px; border: none; background: #f0f0f0; border-radius: 6px; cursor: pointer; font-size: 14px;">تعليق</button>
                <button class="popup-btn copy-btn" style="padding: 8px 12px; border: none; background: #f0f0f0; border-radius: 6px; cursor: pointer; font-size: 14px;">نسخ</button>
            </div>
            <div class="color-picker" style="display: none; gap: 6px; margin-top: 8px; justify-content: center;">
                <div class="color-dot" data-color="yellow" style="width: 28px; height: 28px; border-radius: 50%; background: #ffd700; cursor: pointer; border: 2px solid #ddd;"></div>
                <div class="color-dot" data-color="green" style="width: 28px; height: 28px; border-radius: 50%; background: #90ee90; cursor: pointer; border: 2px solid #ddd;"></div>
                <div class="color-dot" data-color="blue" style="width: 28px; height: 28px; border-radius: 50%; background: #add8e6; cursor: pointer; border: 2px solid #ddd;"></div>
                <div class="color-dot" data-color="pink" style="width: 28px; height: 28px; border-radius: 50%; background: #ffb6c1; cursor: pointer; border: 2px solid #ddd;"></div>
                <div class="color-dot" data-color="orange" style="width: 28px; height: 28px; border-radius: 50%; background: #ffa500; cursor: pointer; border: 2px solid #ddd;"></div>
            </div>
        `;

        document.body.appendChild(selectionPopup);

        // Event listeners
        selectionPopup.querySelector('.highlight-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleColorPicker();
        });

        selectionPopup.querySelector('.comment-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            showCommentDialog();
        });

        selectionPopup.querySelector('.copy-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            copyToClipboard();
        });

        selectionPopup.querySelectorAll('.color-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                const color = dot.dataset.color;
                if (currentSelection) {
                    createHighlight(currentSelection, color);
                }
                hideSelectionPopup();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!selectionPopup.contains(e.target)) {
                hideSelectionPopup();
            }
        });
    }

    function showSelectionPopup(event) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        selectionPopup.style.display = 'block';

        // Position above selection, centered
        const popupRect = selectionPopup.getBoundingClientRect();
        const left = rect.left + (rect.width / 2) - (popupRect.width / 2);
        const top = rect.top + window.pageYOffset - popupRect.height - 10;

        selectionPopup.style.left = `${Math.max(10, left)}px`;
        selectionPopup.style.top = `${top}px`;

        // Hide color picker by default
        selectionPopup.querySelector('.color-picker').style.display = 'none';
        selectionPopup.querySelector('.popup-buttons').style.display = 'flex';
    }

    function hideSelectionPopup() {
        if (selectionPopup) {
            selectionPopup.style.display = 'none';
        }
    }

    function toggleColorPicker() {
        const picker = selectionPopup.querySelector('.color-picker');
        const buttons = selectionPopup.querySelector('.popup-buttons');

        if (picker.style.display === 'none') {
            picker.style.display = 'flex';
            buttons.style.display = 'none';
        } else {
            picker.style.display = 'none';
            buttons.style.display = 'flex';
        }
    }

    function copyToClipboard() {
        if (!currentSelection) return;

        navigator.clipboard.writeText(currentSelection.text).then(() => {
            // Visual feedback
            const copyBtn = selectionPopup.querySelector('.copy-btn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'تم النسخ!';
            copyBtn.style.background = '#4caf50';
            copyBtn.style.color = 'white';

            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#f0f0f0';
                copyBtn.style.color = 'black';
                hideSelectionPopup();
            }, 1000);
        }).catch(() => {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = currentSelection.text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            hideSelectionPopup();
        });
    }

    // === Comment Dialog ===
    function createCommentDialog() {
        commentDialog = document.createElement('div');
        commentDialog.className = 'comment-dialog';
        commentDialog.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            display: none;
            z-index: 10001;
        `;

        commentDialog.innerHTML = `
            <div class="comment-backdrop" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5);"></div>
            <div class="comment-content" style="position: relative; background: white; border-radius: 16px 16px 0 0; padding: 20px; padding-bottom: calc(20px + env(safe-area-inset-bottom)); direction: rtl;">
                <h3 style="margin: 0 0 12px 0; font-size: 18px; text-align: right;">إضافة تعليق</h3>
                <div class="selected-text-ref" style="background: #f5f5f5; padding: 10px; border-radius: 8px; margin-bottom: 12px; font-size: 14px; color: #666; max-height: 60px; overflow-y: auto;"></div>
                <textarea class="comment-textarea" placeholder="اكتب تعليقك هنا..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; font-family: inherit; resize: vertical; direction: rtl;"></textarea>
                <div class="comment-actions" style="display: flex; gap: 10px; margin-top: 12px; justify-content: flex-end;">
                    <button class="comment-cancel" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 8px; cursor: pointer; font-size: 16px;">إلغاء</button>
                    <button class="comment-save" style="padding: 10px 20px; border: none; background: #2196f3; color: white; border-radius: 8px; cursor: pointer; font-size: 16px;">حفظ</button>
                </div>
            </div>
        `;

        document.body.appendChild(commentDialog);

        // Event listeners
        commentDialog.querySelector('.comment-backdrop').addEventListener('click', hideCommentDialog);
        commentDialog.querySelector('.comment-cancel').addEventListener('click', hideCommentDialog);
        commentDialog.querySelector('.comment-save').addEventListener('click', saveComment);
    }

    function showCommentDialog() {
        if (!currentSelection) return;

        commentDialog.querySelector('.selected-text-ref').textContent = currentSelection.text;
        commentDialog.querySelector('.comment-textarea').value = '';
        commentDialog.style.display = 'block';

        // Focus textarea
        setTimeout(() => {
            commentDialog.querySelector('.comment-textarea').focus();
        }, 100);

        hideSelectionPopup();
    }

    function hideCommentDialog() {
        commentDialog.style.display = 'none';
    }

    function saveComment() {
        const commentText = commentDialog.querySelector('.comment-textarea').value.trim();
        if (!commentText || !currentSelection) return;

        const elementSelector = generateElementSelector(currentSelection.element);

        sendToParent({
            type: 'COMMENT_CREATED',
            text: commentText,
            elementSelector,
            selectedText: currentSelection.text
        });

        // Add comment indicator
        addCommentIndicator(currentSelection.element, commentText);

        hideCommentDialog();
        window.getSelection().removeAllRanges();
    }

    function addCommentIndicator(element, commentText) {
        // Check if indicator already exists
        if (element.querySelector('.comment-indicator')) return;

        const indicator = document.createElement('div');
        indicator.className = 'comment-indicator';
        indicator.style.cssText = `
            display: inline-block;
            width: 20px;
            height: 20px;
            margin-right: 4px;
            cursor: pointer;
            vertical-align: middle;
        `;
        indicator.innerHTML = '💬';
        indicator.title = commentText;

        // Insert at beginning of element
        element.insertBefore(indicator, element.firstChild);

        // Show comment on click
        indicator.addEventListener('click', (e) => {
            e.stopPropagation();
            showCommentPopup(indicator, commentText);
        });
    }

    function showCommentPopup(indicator, text) {
        // Remove existing popups
        document.querySelectorAll('.comment-popup').forEach(p => p.remove());

        const popup = document.createElement('div');
        popup.className = 'comment-popup';
        popup.style.cssText = `
            position: absolute;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            direction: rtl;
            font-size: 14px;
        `;
        popup.textContent = text;

        document.body.appendChild(popup);

        const rect = indicator.getBoundingClientRect();
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.bottom + window.pageYOffset + 5}px`;

        // Close on outside click
        const closePopup = (e) => {
            if (!popup.contains(e.target) && e.target !== indicator) {
                popup.remove();
                document.removeEventListener('click', closePopup);
            }
        };
        setTimeout(() => document.addEventListener('click', closePopup), 10);
    }

    // === Highlighting ===
    function toggleHighlightMode(enabled, color) {
        highlightMode.enabled = enabled;
        highlightMode.color = color || 'yellow';

        if (enabled) {
            document.body.classList.add('highlight-mode-active');
            document.body.style.setProperty('--current-highlight-color', getColorValue(color));
        } else {
            document.body.classList.remove('highlight-mode-active');
        }
    }

    function createHighlight(selection, color) {
        try {
            const range = selection.range;
            const mark = document.createElement('mark');
            mark.className = `highlight-${color}`;
            mark.style.cssText = `
                background-color: ${getColorValue(color)};
                padding: 2px 0;
            `;

            range.surroundContents(mark);

            const elementSelector = generateElementSelector(selection.element);

            sendToParent({
                type: 'HIGHLIGHT_CREATED',
                text: selection.text,
                color,
                elementSelector
            });

            window.getSelection().removeAllRanges();
        } catch (error) {
            console.error('Failed to create highlight:', error);
        }
    }

    function getColorValue(colorName) {
        const colors = {
            yellow: '#ffd700',
            green: '#90ee90',
            blue: '#add8e6',
            pink: '#ffb6c1',
            orange: '#ffa500'
        };
        return colors[colorName] || colors.yellow;
    }

    // === Apply Saved Highlights ===
    function applyHighlights(highlights) {
        highlights.forEach(h => {
            try {
                const element = document.querySelector(h.elementSelector);
                if (!element) return;

                highlightTextInElement(element, h.text, h.color);
            } catch (error) {
                console.error('Failed to apply highlight:', error);
            }
        });
    }

    function highlightTextInElement(element, text, color) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        for (const node of textNodes) {
            const index = node.textContent.indexOf(text);
            if (index !== -1) {
                const range = document.createRange();
                range.setStart(node, index);
                range.setEnd(node, index + text.length);

                const mark = document.createElement('mark');
                mark.className = `highlight-${color}`;
                mark.style.cssText = `
                    background-color: ${getColorValue(color)};
                    padding: 2px 0;
                `;

                try {
                    range.surroundContents(mark);
                    return; // Found and highlighted
                } catch (error) {
                    console.error('Failed to wrap text:', error);
                }
            }
        }
    }

    // === Apply Saved Comments ===
    function applyComments(comments) {
        comments.forEach(c => {
            try {
                const element = document.querySelector(c.elementSelector);
                if (element) {
                    addCommentIndicator(element, c.text);
                }
            } catch (error) {
                console.error('Failed to apply comment:', error);
            }
        });
    }

    // === Theme/Font/Zoom ===
    function handleInit(data) {
        if (data.theme) setTheme(data.theme);
        if (data.fontSize) setFontSize(data.fontSize);
        if (data.fontFamily) setFontFamily(data.fontFamily);
        if (data.zoom) setZoom(data.zoom);
        if (data.scrollPercent !== undefined) scrollToPercent(data.scrollPercent);
        if (data.highlights) applyHighlights(data.highlights);
        if (data.comments) applyComments(data.comments);
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.removeAttribute('data-reader-theme');
        } else {
            document.body.setAttribute('data-reader-theme', theme);
        }
    }

    function setFontSize(size) {
        document.body.style.setProperty('--reader-font-size', `${size}px`);
    }

    function setFontFamily(family) {
        document.body.style.setProperty('--reader-font', family);
    }

    function setZoom(zoom) {
        const container = document.querySelector('.container') || document.body;
        container.style.transform = `scale(${zoom})`;
        container.style.transformOrigin = 'top right'; // RTL
        // Contain width to prevent horizontal overflow
        if (zoom > 1) {
            document.body.style.width = `${100 / zoom}%`;
        } else {
            document.body.style.width = '100%';
        }
        document.body.style.overflowX = 'hidden';
    }

    // === Utilities ===
    function generateElementSelector(element) {
        // Try to generate a unique selector
        if (element.id) {
            return `#${element.id}`;
        }

        const tagName = element.tagName.toLowerCase();
        const parent = element.parentElement;

        if (!parent) {
            return tagName;
        }

        const siblings = Array.from(parent.children).filter(e => e.tagName === element.tagName);
        if (siblings.length === 1) {
            return `${tagName}`;
        }

        const index = siblings.indexOf(element) + 1;

        // Use nth-of-type for common elements
        if (['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div'].includes(tagName)) {
            return `${tagName}:nth-of-type(${index})`;
        }

        return `${tagName}:nth-child(${Array.from(parent.children).indexOf(element) + 1})`;
    }

    function sendToParent(message) {
        window.parent.postMessage(message, '*');
    }

    function throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Add CSS for highlight mode cursor + prevent horizontal scroll
    const style = document.createElement('style');
    style.textContent = `
        html, body {
            overflow-x: hidden !important;
            max-width: 100vw !important;
        }
        body {
            -webkit-overflow-scrolling: touch;
        }
        img, video, iframe, table, pre, code, canvas, svg {
            max-width: 100% !important;
            height: auto;
        }
        .hero, .container, .problem-section, .toc, .chapter, section, footer {
            max-width: 100vw !important;
            overflow-x: hidden !important;
        }
        body.highlight-mode-active {
            cursor: crosshair;
        }
        .comment-indicator {
            transition: transform 0.2s;
        }
        .comment-indicator:hover {
            transform: scale(1.2);
        }
    `;
    document.head.appendChild(style);

})();
