// Admin page scripts - GitHub Pages version with localStorage
const SESSION_KEY = 'admin_authenticated';

let ARTICLES = [];

// Authentication functions
function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
}

function setAuthenticated(value) {
    if (value) {
        sessionStorage.setItem(SESSION_KEY, 'true');
    } else {
        sessionStorage.removeItem(SESSION_KEY);
    }
}

function showAdminSection() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-section').classList.remove('hidden');
    loadData();
}

function showLoginSection() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-section').classList.add('hidden');
}

function logout() {
    setAuthenticated(false);
    showLoginSection();
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    try {
        await window.DataStorage.Auth.verify(password);
        setAuthenticated(true);
        errorEl.style.display = 'none';
        showAdminSection();
    } catch (error) {
        errorEl.style.display = 'block';
        errorEl.textContent = error.message;
    }
});

// Check authentication on page load
if (isAuthenticated()) {
    showAdminSection();
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
    setTimeout(() => {
        messageEl.className = 'message';
    }, 3000);
}

// Articles API functions (using DataStorage)
async function fetchArticles() {
    try {
        return await window.DataStorage.Articles.getAll();
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

async function createArticle(title, date, summary, content) {
    try {
        return await window.DataStorage.Articles.create({ title, date, summary, content });
    } catch (error) {
        throw error;
    }
}

async function updateArticle(articleId, title, date, summary, content) {
    try {
        return await window.DataStorage.Articles.update(articleId, { title, date, summary, content });
    } catch (error) {
        throw error;
    }
}

async function deleteArticle(articleId) {
    try {
        await window.DataStorage.Articles.delete(articleId);
        return true;
    } catch (error) {
        throw error;
    }
}

// Tags API functions
async function fetchTags() {
    try {
        return await window.DataStorage.Tags.getAll();
    } catch (error) {
        console.error('Erreur:', error);
        return [];
    }
}

async function fetchArticleTags() {
    try {
        return await window.DataStorage.ArticleTags.getAll();
    } catch (error) {
        console.error('Erreur:', error);
        return {};
    }
}

async function createTag(name, color) {
    try {
        return await window.DataStorage.Tags.create({ name, color });
    } catch (error) {
        throw error;
    }
}

async function deleteTag(tagId) {
    try {
        await window.DataStorage.Tags.delete(tagId);
        return true;
    } catch (error) {
        throw error;
    }
}

async function updateArticleTags(articleId, tagIds) {
    try {
        return await window.DataStorage.ArticleTags.update(articleId, tagIds);
    } catch (error) {
        throw error;
    }
}

// Edit modal functions
function openEditModal(articleId) {
    const article = ARTICLES.find(a => a.id === articleId);
    if (!article) return;

    document.getElementById('edit-article-id').value = article.id;
    document.getElementById('edit-article-title').value = article.title;
    document.getElementById('edit-article-date').value = article.date;
    document.getElementById('edit-article-summary').value = article.summary || '';
    document.getElementById('edit-article-content').value = article.content;

    // Populate edit modal tags
    renderEditArticleTags(articleId);

    document.getElementById('edit-modal').classList.remove('hidden');
}

function renderEditArticleTags(articleId) {
    const container = document.getElementById('edit-article-tags');
    const currentTagIds = ALL_ARTICLE_TAGS[articleId] || [];

    if (ALL_TAGS.length === 0) {
        container.innerHTML = '<em>Aucune balise disponible. Créez des balises d\'abord.</em>';
        return;
    }
    container.innerHTML = ALL_TAGS.map(tag => {
        const isSelected = currentTagIds.includes(tag.id);
        return `<button type="button" class="tag-button ${isSelected ? 'selected' : ''}" data-tag-id="${tag.id}" data-context="edit"
            style="--tag-color: ${tag.color};"
            onclick="toggleEditTagSelection('${tag.id}')">${tag.name}</button>`;
    }).join('');
}

function toggleEditTagSelection(tagId) {
    const button = document.querySelector(`.tag-button[data-context="edit"][data-tag-id="${tagId}"]`);
    if (button) {
        button.classList.toggle('selected');
    }
}

function getSelectedEditTags() {
    const buttons = document.querySelectorAll('.tag-button[data-context="edit"].selected');
    return Array.from(buttons).map(btn => btn.dataset.tagId);
}

function closeEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

// Edit form handler
document.getElementById('edit-article-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const articleId = document.getElementById('edit-article-id').value;
    const title = document.getElementById('edit-article-title').value.trim();
    const date = document.getElementById('edit-article-date').value.trim();
    const summary = document.getElementById('edit-article-summary').value.trim();
    const content = document.getElementById('edit-article-content').value.trim();
    const selectedTagIds = getSelectedEditTags();

    try {
        await updateArticle(articleId, title, date, summary, content);
        await updateArticleTags(articleId, selectedTagIds);
        showMessage('Article modifié avec succès!', 'success');
        closeEditModal();
        loadData();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Close modal when clicking outside
document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) {
        closeEditModal();
    }
});

// Render functions
function renderArticlesList(articles) {
    const container = document.getElementById('articles-list');
    document.getElementById('articles-list-loading').style.display = 'none';

    if (articles.length === 0) {
        container.innerHTML = '<p>Aucun article créé pour le moment.</p>';
        return;
    }

    container.innerHTML = articles.map(article => {
        const summaryHtml = article.summary ?
            `<div class="article-item-summary">${article.summary}</div>` : '';

        return `
            <div class="article-item">
                <div class="article-item-header">
                    <div>
                        <div class="article-item-title">${article.title}</div>
                        <div class="article-item-date">${article.date}</div>
                    </div>
                </div>
                ${summaryHtml}
                <div class="article-item-content">${article.content.substring(0, 200)}${article.content.length > 200 ? '...' : ''}</div>
                <div class="article-item-actions">
                    <button class="btn btn-primary btn-small" onclick="openEditModal('${article.id}')">Modifier</button>
                    <button class="btn btn-danger btn-small" onclick="handleDeleteArticle('${article.id}')">Supprimer</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderTags(tags) {
    const container = document.getElementById('tags-list');
    document.getElementById('tags-loading').style.display = 'none';

    if (tags.length === 0) {
        container.innerHTML = '<p>Aucune balise créée pour le moment.</p>';
        return;
    }

    container.innerHTML = tags.map(tag => `
        <div class="tag-item" style="background-color: ${tag.color}20; border: 2px solid ${tag.color};">
            <span class="tag-name" style="color: ${tag.color};">${tag.name}</span>
            <button class="btn btn-danger btn-small" onclick="handleDeleteTag('${tag.id}')">Supprimer</button>
        </div>
    `).join('');
}

function renderArticlesForTags(tags, articleTags) {
    const container = document.getElementById('articles-container');
    document.getElementById('articles-loading').style.display = 'none';

    if (ARTICLES.length === 0) {
        container.innerHTML = '<p>Aucun article disponible.</p>';
        return;
    }

    container.innerHTML = ARTICLES.map(article => {
        const currentTagIds = articleTags[article.id] || [];

        return `
            <div class="article-row">
                <div class="article-title">${article.title}</div>
                <div class="article-tag-selector">
                    <strong>Balises:</strong>
                    <div class="tag-buttons" id="tag-buttons-${article.id}">
                        ${tags.map(tag => {
                            const isSelected = currentTagIds.includes(tag.id);
                            return `<button type="button" class="tag-button ${isSelected ? 'selected' : ''}"
                                data-tag-id="${tag.id}"
                                data-article-id="${article.id}"
                                style="--tag-color: ${tag.color};"
                                onclick="toggleTagSelection('${article.id}', '${tag.id}')">${tag.name}</button>`;
                        }).join('')}
                        ${tags.length === 0 ? '<em>Aucune balise disponible</em>' : ''}
                    </div>
                    <p class="help-text">Cliquez sur les balises pour les sélectionner ou désélectionner (plusieurs balises possibles).</p>
                </div>
            </div>
        `;
    }).join('');
}

function toggleTagSelection(articleId, tagId) {
    const button = document.querySelector(`.tag-button[data-article-id="${articleId}"][data-tag-id="${tagId}"]`);
    if (button) {
        button.classList.toggle('selected');
        saveArticleTags(articleId);
    }
}

async function saveArticleTags(articleId) {
    const buttons = document.querySelectorAll(`.tag-button[data-article-id="${articleId}"].selected`);
    const selectedTagIds = Array.from(buttons).map(btn => btn.dataset.tagId);

    try {
        await updateArticleTags(articleId, selectedTagIds);
        showMessage('Balises mises à jour!', 'success');
    } catch (error) {
        showMessage('Erreur lors de la mise à jour', 'error');
        loadData(); // Reload to restore previous state
    }
}

let ALL_TAGS = [];
let ALL_ARTICLE_TAGS = {};

async function loadData() {
    const [articles, tags, articleTags] = await Promise.all([
        fetchArticles(),
        fetchTags(),
        fetchArticleTags()
    ]);

    ARTICLES = articles;
    ALL_TAGS = tags;
    ALL_ARTICLE_TAGS = articleTags;

    renderArticlesList(articles);
    renderTags(tags);
    renderArticlesForTags(tags, articleTags);
    renderCreateArticleTags(tags);
}

function renderCreateArticleTags(tags) {
    const container = document.getElementById('create-article-tags');
    if (tags.length === 0) {
        container.innerHTML = '<em>Aucune balise disponible. Créez des balises ci-dessous.</em>';
        return;
    }
    container.innerHTML = tags.map(tag =>
        `<button type="button" class="tag-button" data-tag-id="${tag.id}" data-context="create"
            style="--tag-color: ${tag.color};"
            onclick="toggleCreateTagSelection('${tag.id}')">${tag.name}</button>`
    ).join('');
}

function toggleCreateTagSelection(tagId) {
    const button = document.querySelector(`.tag-button[data-context="create"][data-tag-id="${tagId}"]`);
    if (button) {
        button.classList.toggle('selected');
    }
}

function getSelectedCreateTags() {
    const buttons = document.querySelectorAll('.tag-button[data-context="create"].selected');
    return Array.from(buttons).map(btn => btn.dataset.tagId);
}

function clearCreateTagSelection() {
    const buttons = document.querySelectorAll('.tag-button[data-context="create"].selected');
    buttons.forEach(btn => btn.classList.remove('selected'));
}

// Article form handler
document.getElementById('create-article-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('article-title').value.trim();
    const date = document.getElementById('article-date').value.trim();
    const summary = document.getElementById('article-summary').value.trim();
    const content = document.getElementById('article-content').value.trim();
    const selectedTagIds = getSelectedCreateTags();

    if (!title) {
        showMessage('Veuillez entrer un titre pour l\'article', 'error');
        return;
    }

    if (!content) {
        showMessage('Veuillez entrer du contenu pour l\'article', 'error');
        return;
    }

    try {
        const article = await createArticle(title, date, summary, content);
        // Assign selected tags to the new article
        if (selectedTagIds.length > 0) {
            await updateArticleTags(article.id, selectedTagIds);
        }
        showMessage('Article créé avec succès!', 'success');
        document.getElementById('article-title').value = '';
        document.getElementById('article-date').value = '';
        document.getElementById('article-summary').value = '';
        document.getElementById('article-content').value = '';
        clearCreateTagSelection();
        loadData();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Tag form handler
document.getElementById('create-tag-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('tag-name').value.trim();
    const color = document.getElementById('tag-color').value;

    if (!name) {
        showMessage('Veuillez entrer un nom pour la balise', 'error');
        return;
    }

    try {
        await createTag(name, color);
        showMessage('Balise créée avec succès!', 'success');
        document.getElementById('tag-name').value = '';
        loadData();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

document.getElementById('tag-color').addEventListener('input', (e) => {
    document.getElementById('color-preview').style.backgroundColor = e.target.value;
});

async function handleDeleteArticle(articleId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article?')) return;

    try {
        await deleteArticle(articleId);
        showMessage('Article supprimé avec succès!', 'success');
        loadData();
    } catch (error) {
        showMessage('Erreur lors de la suppression', 'error');
    }
}

async function handleDeleteTag(tagId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette balise?')) return;

    try {
        await deleteTag(tagId);
        showMessage('Balise supprimée avec succès!', 'success');
        loadData();
    } catch (error) {
        showMessage('Erreur lors de la suppression', 'error');
    }
}

async function handleUpdateArticleTags(articleId) {
    const select = document.getElementById(`tag-select-${articleId}`);
    const selectedTagIds = Array.from(select.selectedOptions).map(opt => opt.value);

    try {
        await updateArticleTags(articleId, selectedTagIds);
        showMessage('Balises mises à jour!', 'success');
        loadData();
    } catch (error) {
        showMessage('Erreur lors de la mise à jour', 'error');
    }
}
