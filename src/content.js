/**
 * Content renderer — fetches markdown files, parses frontmatter,
 * and renders as HTML with download buttons.
 */

import { marked } from 'marked';
import fm from 'front-matter';

/**
 * Fetch and render a markdown content file.
 * Returns an HTML string.
 */
export async function renderContent(contentPath) {
    // Strip leading slash if present to make it purely relative
    const relativePath = contentPath.startsWith('/') ? contentPath.slice(1) : contentPath;

    console.log(`[Content] Fetching content from: ${relativePath} (Relative to ${window.location.href})`);

    try {
        const res = await fetch(relativePath);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status} at ${res.url}`);
        }

        const raw = await res.text();
        const { attributes, body } = fm(raw);
        console.log('[Content] Parsed frontmatter:', attributes);

        let html = '';

        // Title
        if (attributes.title) {
            html += `<h1>${escapeHtml(attributes.title)}</h1>`;
        }

        // Featured image
        if (attributes.image) {
            html += `<img src="${escapeHtml(attributes.image)}" alt="${escapeHtml(attributes.title || '')}" loading="lazy" />`;
        }

        // Markdown body
        html += marked.parse(body);

        // 3D Models
        if (attributes.models && Array.isArray(attributes.models)) {
            html += '<div class="models-container">';
            for (const model of attributes.models) {
                const viewerId = `viewer-${Math.random().toString(36).substr(2, 9)}`;
                html += `
                    <div class="viewer-container" id="${viewerId}" data-url="${escapeHtml(model.url)}">
                        <div class="viewer-overlay"></div>
                        <div class="viewer-label">${escapeHtml(model.label || '3D Model')}</div>
                    </div>`;

                // We'll initialize these after the HTML is added to DOM
                setTimeout(async () => {
                    try {
                        const { initViewer } = await import('./viewer.js');
                        const container = document.getElementById(viewerId);
                        if (container) initViewer(container, model.url);
                    } catch (err) {
                        console.error('[Content] Failed to init 3D viewer:', err);
                    }
                }, 100);
            }
            html += '</div>';
        }

        // Image Gallery
        if (attributes.gallery && Array.isArray(attributes.gallery)) {
            html += '<div class="gallery-container"><div class="gallery-grid">';
            for (const item of attributes.gallery) {
                html += `
                    <div class="gallery-item" data-url="${escapeHtml(item.url)}">
                        <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.label || '')}" loading="lazy" />
                    </div>`;
            }
            html += '</div></div>';

            // Bind zoom events
            setTimeout(() => {
                const zoomModal = document.getElementById('zoom-modal');
                const zoomImg = zoomModal?.querySelector('img');
                const modelModal = document.getElementById('model-modal');
                const modelContainer = document.getElementById('model-viewer-container');
                const modelClose = modelModal?.querySelector('.modal-close');

                document.querySelectorAll('.gallery-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const url = item.dataset.url;
                        if (zoomImg) zoomImg.src = url;
                        zoomModal?.classList.remove('hidden');
                        zoomModal?.setAttribute('aria-hidden', 'false');
                    });
                });

                document.querySelectorAll('.viewer-container').forEach(container => {
                    container.addEventListener('click', () => {
                        const url = container.dataset.url;
                        modelModal?.classList.remove('hidden');
                        modelModal?.setAttribute('aria-hidden', 'false');
                        if (modelContainer) modelContainer.innerHTML = '';

                        import('./viewer.js').then(({ initViewer }) => {
                            if (modelContainer) initViewer(modelContainer, url, true);
                        });
                    });
                });

                const closeModals = () => {
                    zoomModal?.classList.add('hidden');
                    zoomModal?.setAttribute('aria-hidden', 'true');
                    modelModal?.classList.add('hidden');
                    modelModal?.setAttribute('aria-hidden', 'true');
                    if (modelContainer) modelContainer.innerHTML = '';
                };

                zoomModal?.addEventListener('click', closeModals);
                modelClose?.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeModals();
                });
            }, 100);
        }

        // Download / action buttons
        if (attributes.downloads && Array.isArray(attributes.downloads)) {
            html += '<div class="download-links">';
            for (const dl of attributes.downloads) {
                if (dl.url) {
                    html += `<a href="${escapeHtml(dl.url)}" target="_blank" rel="noopener" class="download-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${escapeHtml(dl.label)}
        </a>`;
                } else if (dl.file) {
                    html += `<a href="${escapeHtml(dl.file)}" download class="download-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V11M8 11L5 8M8 11L11 8M3 13H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          ${escapeHtml(dl.label)}
        </a>`;
                }
            }
            html += '</div>';
        }

        return html;
    } catch (err) {
        console.error('[Content] Failed to load content:', err);
        throw err;
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
