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
    const res = await fetch(contentPath);
    if (!res.ok) throw new Error(`Failed to fetch ${contentPath}: ${res.status}`);

    const raw = await res.text();
    const { attributes, body } = fm(raw);

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
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
