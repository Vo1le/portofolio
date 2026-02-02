// GitHub Pages Local Storage System - Replacement for Netlify Blobs
// This file simulates backend API calls using localStorage

const STORAGE_KEYS = {
    ARTICLES: 'tipe_articles',
    TAGS: 'tipe_tags',
    ARTICLE_TAGS: 'tipe_article_tags',
    ADMIN_PASSWORD: 'tipe_admin_password'
};

// Default admin password (can be changed in admin panel)
const DEFAULT_PASSWORD = 'admin123';

// Initialize storage with default data if empty
function initializeStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.ARTICLES)) {
        const defaultArticles = {
            articles: [
                {
                    id: "introduction-tipe",
                    title: "Introduction au TIPE",
                    date: "15 janvier 2026",
                    summary: "Présentation générale du sujet de recherche",
                    content: "<p>Ce projet de TIPE porte sur l'analyse et la modélisation de systèmes complexes.</p><p>Les objectifs principaux sont :</p><ul><li>Étudier les propriétés émergentes</li><li>Développer un modèle de simulation</li><li>Valider expérimentalement les résultats</li></ul>",
                    createdAt: new Date('2026-01-15').toISOString()
                },
                {
                    id: "recherche-bibliographique",
                    title: "Recherche bibliographique",
                    date: "22 janvier 2026",
                    summary: "État de l'art et références principales",
                    content: "<h3>Principales références</h3><p>Après une recherche approfondie, j'ai identifié plusieurs articles clés dans le domaine.</p><p>Les travaux de référence incluent des publications de Nature et Science sur les systèmes multi-agents.</p>",
                    createdAt: new Date('2026-01-22').toISOString()
                }
            ]
        };
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify(defaultArticles));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TAGS)) {
        const defaultTags = {
            tags: [
                {
                    id: "recherche",
                    name: "Recherche",
                    color: "#007bff",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "implementation",
                    name: "Implémentation",
                    color: "#28a745",
                    createdAt: new Date().toISOString()
                },
                {
                    id: "resultats",
                    name: "Résultats",
                    color: "#dc3545",
                    createdAt: new Date().toISOString()
                }
            ]
        };
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(defaultTags));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ARTICLE_TAGS)) {
        const defaultArticleTags = {
            "introduction-tipe": ["recherche"],
            "recherche-bibliographique": ["recherche"]
        };
        localStorage.setItem(STORAGE_KEYS.ARTICLE_TAGS, JSON.stringify(defaultArticleTags));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD)) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, DEFAULT_PASSWORD);
    }
}

// Article API functions
const ArticlesAPI = {
    async getAll() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLES) || '{"articles":[]}');
        return data.articles;
    },

    async create(articleData) {
        const { title, date, summary, content } = articleData;

        if (!title || !title.trim()) {
            throw new Error('Le titre est requis');
        }
        if (!content || !content.trim()) {
            throw new Error('Le contenu est requis');
        }

        const articles = await this.getAll();
        const id = this.sanitizeId(title.trim());

        if (articles.some(a => a.id === id)) {
            throw new Error('Un article avec ce titre existe déjà');
        }

        const newArticle = {
            id,
            title: title.trim(),
            date: date || new Date().toLocaleDateString('fr-FR'),
            summary: summary?.trim() || '',
            content: content.trim(),
            createdAt: new Date().toISOString()
        };

        articles.push(newArticle);
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify({ articles }));
        return newArticle;
    },

    async update(articleId, articleData) {
        const articles = await this.getAll();
        const articleIndex = articles.findIndex(a => a.id === articleId);

        if (articleIndex === -1) {
            throw new Error('Article non trouvé');
        }

        const updatedArticle = {
            ...articles[articleIndex],
            ...(articleData.title && { title: articleData.title.trim() }),
            ...(articleData.date !== undefined && { date: articleData.date }),
            ...(articleData.summary !== undefined && { summary: articleData.summary?.trim() || '' }),
            ...(articleData.content && { content: articleData.content.trim() })
        };

        articles[articleIndex] = updatedArticle;
        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify({ articles }));
        return updatedArticle;
    },

    async delete(articleId) {
        const articles = await this.getAll();
        const filteredArticles = articles.filter(a => a.id !== articleId);

        if (filteredArticles.length === articles.length) {
            throw new Error('Article non trouvé');
        }

        localStorage.setItem(STORAGE_KEYS.ARTICLES, JSON.stringify({ articles: filteredArticles }));
        
        // Also remove article tags
        const articleTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLE_TAGS) || '{}');
        delete articleTags[articleId];
        localStorage.setItem(STORAGE_KEYS.ARTICLE_TAGS, JSON.stringify(articleTags));
        
        return { success: true };
    },

    sanitizeId(title) {
        return title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }
};

// Tags API functions
const TagsAPI = {
    async getAll() {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '{"tags":[]}');
        return data.tags;
    },

    async create(tagData) {
        const { name, color } = tagData;

        if (!name || !name.trim()) {
            throw new Error('Le nom est requis');
        }

        const tags = await this.getAll();

        if (tags.some(t => t.name.toLowerCase() === name.trim().toLowerCase())) {
            throw new Error('Une balise avec ce nom existe déjà');
        }

        const newTag = {
            id: this.generateId(),
            name: name.trim(),
            color: color || '#007bff',
            createdAt: new Date().toISOString()
        };

        tags.push(newTag);
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify({ tags }));
        return newTag;
    },

    async delete(tagId) {
        const tags = await this.getAll();
        const filteredTags = tags.filter(t => t.id !== tagId);

        if (filteredTags.length === tags.length) {
            throw new Error('Balise non trouvée');
        }

        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify({ tags: filteredTags }));
        
        // Also remove tag from all articles
        const articleTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLE_TAGS) || '{}');
        Object.keys(articleTags).forEach(articleId => {
            articleTags[articleId] = articleTags[articleId].filter(id => id !== tagId);
        });
        localStorage.setItem(STORAGE_KEYS.ARTICLE_TAGS, JSON.stringify(articleTags));
        
        return { success: true };
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
};

// Article-Tags API functions
const ArticleTagsAPI = {
    async getAll() {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.ARTICLE_TAGS) || '{}');
    },

    async update(articleId, tagIds) {
        if (!Array.isArray(tagIds)) {
            throw new Error('tagIds doit être un tableau');
        }

        const articleTags = await this.getAll();
        articleTags[articleId] = tagIds;
        localStorage.setItem(STORAGE_KEYS.ARTICLE_TAGS, JSON.stringify(articleTags));
        
        return { success: true, articleId, tagIds };
    }
};

// Auth API functions
const AuthAPI = {
    async verify(password) {
        const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_PASSWORD;
        
        if (password === storedPassword) {
            return { success: true };
        }
        
        throw new Error('Mot de passe incorrect');
    },

    async changePassword(oldPassword, newPassword) {
        const storedPassword = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD) || DEFAULT_PASSWORD;
        
        if (oldPassword !== storedPassword) {
            throw new Error('Ancien mot de passe incorrect');
        }

        localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD, newPassword);
        return { success: true };
    }
};

// Initialize storage on load
initializeStorage();

// Export API for use in other scripts
window.DataStorage = {
    Articles: ArticlesAPI,
    Tags: TagsAPI,
    ArticleTags: ArticleTagsAPI,
    Auth: AuthAPI
};
