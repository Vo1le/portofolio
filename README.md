# Suivi de TIPE - Version GitHub Pages

Cette version du site de suivi de TIPE a été adaptée pour fonctionner sur **GitHub Pages** sans avoir besoin de Netlify Functions ou Netlify Blobs.

## 🎯 Fonctionnalités conservées

✅ **Toutes les fonctionnalités originales sont préservées :**
- Création, modification et suppression d'articles
- Gestion des balises (tags) avec couleurs personnalisées
- Attribution de balises aux articles
- Filtrage et tri des articles
- Sections pliables/dépliables dans les articles
- Résumés d'articles
- Interface d'administration avec authentification
- Design responsive et élégant

## 🔄 Changements techniques

### Remplacement de Netlify Blobs par localStorage

Au lieu d'utiliser Netlify Blobs pour stocker les données côté serveur, cette version utilise le **localStorage** du navigateur. Cela signifie que :

- ✅ Les données persistent entre les sessions
- ✅ Aucun backend n'est nécessaire
- ✅ Fonctionne entièrement en mode statique
- ⚠️ Les données sont stockées localement dans le navigateur (pas de synchronisation entre appareils)
- ⚠️ Si vous effacez le cache du navigateur, les données seront perdues

### Structure des fichiers

**Fichiers principaux pour GitHub Pages :**
- `index.html` → Page d'accueil (renommée depuis `index-github.html`)
- `admin.html` → Page d'administration (renommée depuis `admin-github.html`)
- `main.js` → Script principal (renommé depuis `main-github.js`)
- `admin.js` → Script d'administration (renommé depuis `admin-github.js`)
- `data-storage.js` → Nouveau fichier qui remplace les fonctions Netlify
- `style.css` → Styles CSS (inchangé)

## 📦 Installation sur GitHub Pages

### 1. Créer un dépôt GitHub

```bash
# Dans votre terminal
git init
git add .
git commit -m "Initial commit - Version GitHub Pages"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
git push -u origin main
```

### 2. Activer GitHub Pages

1. Allez dans **Settings** → **Pages** de votre dépôt
2. Sous **Source**, sélectionnez **main** branch
3. Cliquez sur **Save**
4. Votre site sera disponible à : `https://VOTRE-USERNAME.github.io/VOTRE-REPO/`

### 3. Renommer les fichiers

**Important :** Avant de déployer, renommez les fichiers :

```bash
mv index-github.html index.html
mv admin-github.html admin.html
mv main-github.js main.js
mv admin-github.js admin.js
```

## 🔐 Authentification

### Mot de passe par défaut
Le mot de passe administrateur par défaut est : **`admin123`**

### Changer le mot de passe

Le mot de passe est stocké dans le localStorage. Pour le changer :

1. Ouvrez la console du navigateur (F12)
2. Tapez :
```javascript
localStorage.setItem('tipe_admin_password', 'VOTRE_NOUVEAU_MOT_DE_PASSE');
```

**Note :** L'authentification est côté client uniquement. Pour une vraie sécurité, vous devriez utiliser un backend avec authentification serveur.

## 📊 Données pré-chargées

Le site contient des données d'exemple pour démarrer :

**Articles :**
- Introduction au TIPE
- Recherche bibliographique

**Balises :**
- Recherche (bleu)
- Implémentation (vert)
- Résultats (rouge)

Ces données peuvent être modifiées ou supprimées depuis l'interface d'administration.

## 🛠️ Personnalisation

### Modifier les données initiales

Éditez le fichier `data-storage.js`, section `initializeStorage()` :

```javascript
const defaultArticles = {
    articles: [
        {
            id: "votre-id",
            title: "Votre titre",
            date: "Votre date",
            summary: "Votre résumé",
            content: "<p>Votre contenu HTML</p>",
            createdAt: new Date().toISOString()
        }
    ]
};
```

### Modifier le style

Éditez le fichier `style.css` pour personnaliser l'apparence.

## 💾 Sauvegarde des données

### Exporter les données

Pour sauvegarder vos données, ouvrez la console (F12) et tapez :

```javascript
// Exporter tous les articles
console.log(JSON.stringify(localStorage.getItem('tipe_articles')));

// Exporter toutes les balises
console.log(JSON.stringify(localStorage.getItem('tipe_tags')));

// Exporter les relations article-tags
console.log(JSON.stringify(localStorage.getItem('tipe_article_tags')));
```

Copiez le résultat et sauvegardez-le dans un fichier texte.

### Importer des données

Pour restaurer des données sauvegardées :

```javascript
localStorage.setItem('tipe_articles', 'VOTRE_JSON_ARTICLES');
localStorage.setItem('tipe_tags', 'VOTRE_JSON_TAGS');
localStorage.setItem('tipe_article_tags', 'VOTRE_JSON_ARTICLE_TAGS');
```

Puis rechargez la page.

## 🌐 Compatibilité des navigateurs

- ✅ Chrome / Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

**Note :** localStorage doit être activé dans le navigateur.

## ⚙️ Limitations

1. **Pas de synchronisation multi-appareils** : Les données sont stockées localement
2. **Taille limitée** : localStorage a une limite d'environ 5-10 MB selon le navigateur
3. **Pas de gestion collaborative** : Un seul utilisateur à la fois
4. **Authentification basique** : Pas de vraie sécurité côté serveur

## 🚀 Améliorations possibles

Pour aller plus loin, vous pourriez :
- Ajouter une synchronisation avec Firebase ou Supabase
- Implémenter une vraie authentification avec un backend
- Ajouter l'export/import automatique des données
- Créer une API REST personnalisée
- Utiliser IndexedDB pour plus de capacité de stockage

## 📝 License

Ce projet est open-source. Vous êtes libre de l'utiliser et de le modifier.

## 👤 Auteur

Natan Ruiz - Étudiant en MPI

---

**Bon courage pour votre TIPE ! 🎓**
