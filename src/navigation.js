/**
 * Navigation system — reads config/navigation.json,
 * renders header nav + overlay menus/content pages.
 */

let navData = null;
let navStack = []; // breadcrumb history

// DOM refs
const headerNav = document.getElementById('header-nav');
const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
const overlayBack = document.getElementById('overlay-back');
const overlayClose = document.getElementById('overlay-close');
const overlayBreadcrumb = document.getElementById('overlay-breadcrumb');
const mobileToggle = document.getElementById('mobile-menu-toggle');

/**
 * Load navigation config and render header items
 */
export async function initNavigation() {
    const configPath = 'config/navigation.json';
    console.log(`[Navigation] Fetching config from: ${configPath} (Relative to ${window.location.href})`);

    try {
        // Using a completely relative path ('config/...') instead of prepending BASE_URL.
        // On GitHub Pages (https://user.github.io/repo/), index.html is at /repo/.
        // Fetching 'config/navigation.json' from /repo/ will resolve to /repo/config/navigation.json.
        const res = await fetch(configPath);

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status} at ${res.url}`);
        }

        navData = await res.json();
        console.log('[Navigation] Config loaded successfully:', navData);
        renderHeaderNav(navData.navigation);
        bindGlobalEvents();
    } catch (err) {
        console.error('[Navigation] Failed to load navigation config:', err);
        // Fallback or retry logic could go here if needed.
    }
}

/**
 * Render top-level nav items in the header
 */
function renderHeaderNav(items) {
    headerNav.innerHTML = '';
    items.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = 'nav-item';
        btn.textContent = item.label;
        btn.setAttribute('aria-label', item.label);
        btn.addEventListener('click', () => handleNavItem(item));
        headerNav.appendChild(btn);
    });
}

/**
 * Handle clicking a nav item based on its type
 */
function handleNavItem(item) {
    switch (item.type) {
        case 'link':
            window.open(item.url, '_blank', 'noopener');
            break;
        case 'menu':
            navStack = [{ label: item.label, item }];
            showMenu(item);
            break;
        case 'page':
            navStack = [{ label: item.label, item }];
            showContentPage(item);
            break;
    }
}

/**
 * Show a menu overlay with list of children
 */
function showMenu(item) {
    updateBreadcrumb();
    updateBackButton();

    let html = '<ul class="menu-list">';

    if (item.children && item.children.length > 0) {
        item.children.forEach((child) => {
            if (child.type === 'header') {
                html += `<div class="menu-header">${child.label}</div>`;
                return;
            }
            if (child.type === 'divider') {
                html += `<div class="menu-divider"></div>`;
                return;
            }

            // Arrow for everything except headers/dividers
            const arrow = child.type === 'menu' || child.type === 'page'
                ? '<svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                : child.type === 'link'
                    ? '<svg class="arrow" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
                    : '';

            html += `<li><button class="menu-list-item" data-id="${child.id}">
        <span>${child.label}</span>
        ${arrow}
      </button></li>`;
        });
    } else {
        html += '<li class="menu-list-item" style="cursor:default;color:var(--color-text-muted);font-style:italic;">No items yet</li>';
    }

    html += '</ul>';
    overlayContent.innerHTML = html;

    // Bind child click events
    overlayContent.querySelectorAll('.menu-list-item[data-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const childId = btn.dataset.id;
            const child = findItemById(childId, item.children);
            if (child) {
                if (child.type === 'link') {
                    window.open(child.url, '_blank', 'noopener');
                } else if (child.type === 'menu') {
                    navStack.push({ label: child.label, item: child });
                    showMenu(child);
                } else if (child.type === 'page') {
                    navStack.push({ label: child.label, item: child });
                    showContentPage(child);
                }
            }
        });
    });

    openOverlay();
}

/**
 * Show a content page overlay (loads markdown)
 */
async function showContentPage(item) {
    updateBreadcrumb();
    updateBackButton();

    overlayContent.innerHTML = '<div class="content-page"><p style="color:var(--color-text-muted)">Loading…</p></div>';
    openOverlay();

    try {
        const { renderContent } = await import('./content.js');
        const html = await renderContent(item.content);
        overlayContent.innerHTML = `<div class="content-page">${html}</div>`;
    } catch (err) {
        overlayContent.innerHTML = `<div class="content-page"><p>Failed to load content.</p></div>`;
        console.error('Content load error:', err);
    }
}

/**
 * Overlay visibility
 */
function openOverlay() {
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    navStack = [];
}

/**
 * Breadcrumb + back button logic
 */
function updateBreadcrumb() {
    overlayBreadcrumb.textContent = navStack.map((s) => s.label).join(' / ');
}

function updateBackButton() {
    if (navStack.length <= 1) {
        overlayBack.classList.add('hidden-btn');
    } else {
        overlayBack.classList.remove('hidden-btn');
    }
}

/**
 * Go back one level in the nav stack
 */
function goBack() {
    if (navStack.length <= 1) {
        closeOverlay();
        return;
    }
    navStack.pop();
    const current = navStack[navStack.length - 1];
    if (current.item.type === 'menu') {
        showMenu(current.item);
    } else {
        showContentPage(current.item);
    }
}

/**
 * Find item by ID in a list of items
 */
function findItemById(id, items) {
    for (const item of items) {
        if (item.id === id) return item;
        if (item.children) {
            const found = findItemById(id, item.children);
            if (found) return found;
        }
    }
    return null;
}

/**
 * Global event bindings
 */
function bindGlobalEvents() {
    overlayClose.addEventListener('click', closeOverlay);
    overlayBack.addEventListener('click', goBack);

    // Click backdrop to close
    overlay.querySelector('.overlay-backdrop').addEventListener('click', closeOverlay);

    // Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
            closeOverlay();
        }
    });

    // Mobile menu toggle — opens a menu with all top-level items
    mobileToggle.addEventListener('click', () => {
        const isOpen = mobileToggle.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
            closeOverlay();
            mobileToggle.setAttribute('aria-expanded', 'false');
        } else {
            navStack = [{ label: 'Menu', item: { type: 'menu', label: 'Menu', children: navData.navigation } }];
            showMenu(navStack[0].item);
            mobileToggle.setAttribute('aria-expanded', 'true');
        }
    });

    // Reset mobile toggle when overlay closes
    const observer = new MutationObserver(() => {
        if (overlay.classList.contains('hidden')) {
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    });
    observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
}
