# 🌐 ABD-Motors Frontend

Interface utilisateur React moderne pour la gestion de véhicules et de dossiers de location/vente.

## 🛠️ Technologies

- React 18
- Material-UI (MUI) v5
- React Router v6
- Axios pour les requêtes HTTP
- JWT pour l'authentification
- Date-fns pour la gestion des dates
- React Context pour la gestion d'état

## 📋 Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Backend ABD-Motors en cours d'exécution
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

## ⚙️ Installation

1. **Clonez le repository** :
```bash
git clone https://github.com/beytullahsnk/ABD-Motors.git
cd ABD-Motors/frontend
```

2. **Installez les dépendances** :
```bash
npm install
# ou
yarn install
```

3. **Configurez les variables d'environnement** :
Créez un fichier `.env` à la racine du dossier frontend :
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## 🚀 Développement

1. **Lancez le serveur de développement** :
```bash
npm start
# ou
yarn start
```

2. **Accédez à l'application** :
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📚 Structure du projet

```
frontend/
├── public/           # Ressources statiques
├── src/
│   ├── components/  # Composants réutilisables
│   ├── contexts/    # Contextes React (auth, etc.)
│   ├── pages/       # Pages de l'application
│   ├── services/    # Services API
│   ├── utils/       # Utilitaires et helpers
│   ├── App.js       # Composant principal
│   └── index.js     # Point d'entrée
└── package.json
```

## 🎯 Composants principaux

### Pages
- `Login` : Authentification utilisateur
- `Register` : Inscription utilisateur
- `VehicleList` : Liste des véhicules avec filtres
- `VehicleDetail` : Détails d'un véhicule
- `Profile` : Gestion du profil utilisateur
- `FolderCreation` : Création de dossier
- `PurchaseCreation` : Création de dossier d'achat
- `GeniaPage` : Interface d'IA générative pour l'analyse de documents

### Composants
- `Navbar` : Navigation principale
- `VehicleCard` : Carte de présentation véhicule
- `ErrorAlert` : Affichage des erreurs
- `LoadingScreen` : Écran de chargement

## 🧠 Interface GenIA

L'interface GenIA est une fonctionnalité avancée permettant aux représentants commerciaux d'interroger des documents en langage naturel via une IA générative.

### Fonctionnalités
- Interface utilisateur intuitive pour uploader des documents
- Importation directe depuis AWS S3
- Formulaire de questions en langage naturel
- Affichage des réponses générées par l'IA
- Gestion des fichiers PDF (contrats, dossiers de vente/location)

### Implémentation technique
- Composant React dédié (`GeniaPage.jsx`)
- Utilisation des hooks React pour la gestion d'état
- Communication avec l'API backend via Axios
- Upload de fichiers avec FormData
- Authentification JWT pour sécuriser les requêtes

### Guide d'utilisation
1. **Upload de document** :
   - Cliquez sur "Choisir un fichier PDF"
   - Sélectionnez votre document
   - Cliquez sur "Uploader le document"
   
2. **Import depuis S3** :
   - Cliquez sur "Importer depuis S3"
   - Sélectionnez un document dans la liste
   - Cliquez sur "Importer"

3. **Interrogation de l'IA** :
   - Entrez votre question dans le champ de texte
   - Cliquez sur "Envoyer la question"
   - La réponse de l'IA s'affiche en dessous

### Flux de données
1. L'utilisateur upload un document PDF
2. Le backend extrait le texte et le stocke
3. L'utilisateur pose une question
4. Le backend envoie la question et le contexte à Ollama
5. La réponse est renvoyée et affichée à l'utilisateur

Cette interface simplifie considérablement l'analyse des documents contractuels, permettant aux commerciaux d'extraire rapidement des informations spécifiques sans avoir à parcourir l'intégralité des documents.

## 🎨 Styles et thème

L'application utilise Material-UI avec un thème personnalisé :

```javascript
const theme = {
  palette: {
    primary: {
      main: '#2C3E50',
      light: '#34495E',
      dark: '#1A252F',
    },
    secondary: {
      main: '#E74C3C',
      light: '#FF6B6B',
      dark: '#C0392B',
    }
  }
}
```

## 🔗 Services API

### authService
- `login(username, password)`
- `register(userData)`
- `logout()`
- `getCurrentUser()`

### vehicleService
- `getVehicles()`
- `getVehicleById(id)`
- `createVehicle(data)`
- `updateVehicle(id, data)`

### folderService
- `createFolder(data)`
- `getUserFolders()`
- `updateFolder(id, data)`

### geniaService
- `uploadDocument(formData)`
- `getDocuments()`
- `askQuestion(query, documentIds)`
- `listS3Documents()`
- `importFromS3(key, title, documentType)`

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture
npm test -- --coverage

# Lancer les tests en mode watch
npm test -- --watch
```

## 📦 Build de production

```bash
# Créer un build de production
npm run build
# ou
yarn build
```

Les fichiers de build seront générés dans le dossier `build/`.

## 🔒 Sécurité

- Utilisation de JWT pour l'authentification
- Validation des données côté client
- Protection des routes sensibles
- Gestion sécurisée des tokens
- Sanitization des entrées utilisateur

## 📝 Conventions de code

- Utilisez des composants fonctionnels et des hooks
- Suivez les principes de composition React
- Documentez les props avec PropTypes
- Utilisez des noms explicites pour les composants
- Respectez l'architecture des dossiers

## 🐛 Débogage

- Utilisez React Developer Tools
- Consultez la console du navigateur
- Vérifiez les logs des requêtes API
- Utilisez les outils de débogage de l'IDE

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📜 Licence

Ce projet est sous licence MIT.
