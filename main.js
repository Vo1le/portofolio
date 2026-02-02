// Main page scripts - GitHub Pages version with localStorage
let allArticles = [];
let allTags = [];
let allArticleTags = {};
let tagsById = {};
let collapsedSections = {};

async function loadArticlesAndTags() {
    try {
        // Load data from localStorage via DataStorage API
        allArticles = await window.DataStorage.Articles.getAll();
        allTags = await window.DataStorage.Tags.getAll();
        allArticleTags = await window.DataStorage.ArticleTags.getAll();

        tagsById = {};
        allTags.forEach(tag => {
            tagsById[tag.id] = tag;
        });

        // Populate tag filter dropdown
        const tagFilter = document.getElementById('tag-filter');
        tagFilter.innerHTML = '<option value="">Toutes les balises</option>' +
            allTags.map(tag => `<option value="${tag.id}">${tag.name}</option>`).join('');

        renderArticles();

    } catch (error) {
        console.error('Erreur:', error);
        document.getElementById('articles-container').innerHTML = '<p class="error-message">Erreur lors du chargement des articles.</p>';
    }
}

function toggleSection(articleId, sectionIndex) {
    const key = `${articleId}-${sectionIndex}`;
    collapsedSections[key] = !collapsedSections[key];
    renderArticles();
}

function toggleAllSections(articleId, expand) {
    const article = allArticles.find(a => a.id === articleId);
    if (!article) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    const sections = tempDiv.querySelectorAll('p, h3, h4, ul, ol, pre, blockquote');

    sections.forEach((_, index) => {
        const key = `${articleId}-${index}`;
        collapsedSections[key] = !expand;
    });

    renderArticles();
}

function parseContentIntoSections(content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const sections = [];

    const children = tempDiv.children;
    for (let i = 0; i < children.length; i++) {
        const el = children[i];
        const tagName = el.tagName.toLowerCase();
        const text = el.textContent.trim();

        let preview = text.substring(0, 50);
        if (text.length > 50) preview += '...';

        sections.push({
            html: el.outerHTML,
            preview: preview,
            tagName: tagName,
            isHeading: ['h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)
        });
    }

    return sections;
}

function renderArticles() {
    const container = document.getElementById('articles-container');
    const sortValue = document.getElementById('sort-select').value;
    const tagFilterValue = document.getElementById('tag-filter').value;

    let filteredArticles = [...allArticles];

    // Filter by tag if selected
    if (tagFilterValue) {
        filteredArticles = filteredArticles.filter(article => {
            const articleTagIds = allArticleTags[article.id] || [];
            return articleTagIds.includes(tagFilterValue);
        });
    }

    // Sort articles
    filteredArticles.sort((a, b) => {
        switch (sortValue) {
            case 'date-desc':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date-asc':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'title-asc':
                return a.title.localeCompare(b.title, 'fr');
            case 'title-desc':
                return b.title.localeCompare(a.title, 'fr');
            default:
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    });

    if (filteredArticles.length === 0) {
        if (allArticles.length === 0) {
            container.innerHTML = '<p class="no-articles">Aucun article pour le moment.</p>';
        } else {
            container.innerHTML = '<p class="no-articles">Aucun article ne correspond aux filtres sélectionnés.</p>';
        }
        return;
    }

    container.innerHTML = filteredArticles.map(article => {
        const tagIds = allArticleTags[article.id] || [];
        const tagsHtml = tagIds
            .filter(id => tagsById[id])
            .map(id => {
                const tag = tagsById[id];
                return `<span class="tag" style="background-color: ${tag.color}20; color: ${tag.color}; border: 1px solid ${tag.color};">${tag.name}</span>`;
            })
            .join('');

        // Parse content into collapsible sections
        const sections = parseContentIntoSections(article.content);

        let contentHtml = '';
        if (sections.length > 0) {
            contentHtml = `
                <div class="article-fold-controls">
                    <button class="fold-btn fold-all" onclick="toggleAllSections('${article.id}', false)" title="Replier tout">
                        <span class="fold-icon">&#x25BC;</span> Replier tout
                    </button>
                    <button class="fold-btn expand-all" onclick="toggleAllSections('${article.id}', true)" title="Déplier tout">
                        <span class="fold-icon">&#x25B6;</span> Déplier tout
                    </button>
                </div>
            `;

            sections.forEach((section, index) => {
                const key = `${article.id}-${index}`;
                const isCollapsed = collapsedSections[key];

                if (section.isHeading) {
                    contentHtml += section.html;
                } else {
                    contentHtml += `
                        <div class="collapsible-section ${isCollapsed ? 'collapsed' : ''}">
                            <div class="section-header" onclick="toggleSection('${article.id}', ${index})">
                                <span class="collapse-icon">${isCollapsed ? '&#x25B6;' : '&#x25BC;'}</span>
                                <span class="section-preview">${isCollapsed ? section.preview : ''}</span>
                            </div>
                            <div class="section-content" ${isCollapsed ? 'style="display: none;"' : ''}>
                                ${section.html}
                            </div>
                        </div>
                    `;
                }
            });
        } else {
            contentHtml = article.content;
        }

        const summaryHtml = article.summary ?
            `<div class="article-summary"><strong>Résumé:</strong> ${article.summary}</div>` : '';

        return `
            <article data-article-id="${article.id}">
                <h2>${article.title}</h2>
                <p class="date">${article.date}</p>
                <div class="article-tags">${tagsHtml}</div>
                ${summaryHtml}
                <div class="article-content">${contentHtml}</div>
            </article>
        `;
    }).join('');
}

// Event listeners for filters
document.getElementById('sort-select').addEventListener('change', renderArticles);
document.getElementById('tag-filter').addEventListener('change', renderArticles);

// Wait for DataStorage to be ready, then load data
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadArticlesAndTags);
} else {
    loadArticlesAndTags();
}
