# 🔧 ABD-Motors Backend

API REST Django pour la gestion de véhicules et de dossiers de location/vente.

## 🛠️ Technologies

- Python 3.13
- Django 4.2.19
- Django REST Framework
- PostgreSQL (AWS RDS)
- JWT pour l'authentification
- AWS S3 pour le stockage des fichiers
- Swagger/OpenAPI pour la documentation
- Gunicorn pour le serveur WSGI
- NGINX pour le serveur proxy

## 📋 Prérequis

- Python 3.13+
- PostgreSQL
- Compte AWS (S3 et RDS)
- pip ou poetry
- Virtualenv

## ⚙️ Installation

1. **Créez l'environnement virtuel** :
```bash
python -m venv venv
source venv/bin/activate  # Sur macOS/Linux
# ou
venv\Scripts\activate  # Sur Windows
```

2. **Installez les dépendances** :
```bash
pip install -r requirements.txt
```

3. **Configurez les variables d'environnement** :
Créez un fichier `.env` à la racine du dossier backend :
```env
# Django
DJANGO_SECRET_KEY=votre_clé_secrète
DEBUG=True
USE_S3=True

# Base de données
DB_NAME=votre_db_name
DB_USER=votre_db_user
DB_PASSWORD=votre_db_password
DB_HOST=votre_db_host
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=votre_access_key_id
AWS_SECRET_ACCESS_KEY=votre_secret_access_key
AWS_STORAGE_BUCKET_NAME=votre_bucket_name
AWS_S3_REGION_NAME=eu-west-3

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1
```

4. **Appliquez les migrations** :
```bash
python manage.py migrate
python manage.py createsuperuser
```

## 🚀 Développement

1. **Lancez le serveur** :
```bash
python manage.py runserver
```

2. **Accédez aux interfaces** :
- Admin : http://localhost:8000/admin/
- API : http://localhost:8000/api/
- Documentation API : http://localhost:8000/api/docs/

## 📚 Structure du projet

```
backend/
├── config/             # Configuration Django
├── user/              # Application gestion utilisateurs
├── vehicle/           # Application gestion véhicules
├── folder/            # Application gestion dossiers
├── utils/             # Utilitaires partagés
├── manage.py          # Script de gestion Django
└── requirements.txt   # Dépendances du projet
```

## 🔗 API Endpoints

### Authentification
- POST `/api/auth/token/` - Obtenir un token JWT
- POST `/api/auth/register/` - Créer un compte
- GET `/api/auth/users/me/` - Profil utilisateur

### Véhicules
- GET `/api/vehicles/` - Liste des véhicules
- POST `/api/vehicles/` - Créer un véhicule
- GET `/api/vehicles/{id}/` - Détails d'un véhicule
- PUT `/api/vehicles/{id}/` - Modifier un véhicule
- DELETE `/api/vehicles/{id}/` - Supprimer un véhicule
- POST `/api/vehicles/{id}/change_state/` - Changer l'état
- POST `/api/vehicles/{id}/assign_owner/` - Assigner un propriétaire

### Dossiers
- GET `/api/folders/` - Liste des dossiers
- POST `/api/folders/` - Créer un dossier
- GET `/api/folders/{id}/` - Détails d'un dossier
- PUT `/api/folders/{id}/` - Modifier un dossier
- DELETE `/api/folders/{id}/` - Supprimer un dossier
- POST `/api/folders/{id}/files/` - Ajouter des fichiers

## 💾 Gestion du stockage

Le projet supporte deux modes de stockage :

1. **Local** (développement) :
```env
DEBUG=True
USE_S3=False
```

2. **AWS S3** (production) :
```env
DEBUG=False
USE_S3=True
```

## 🧪 Tests

```bash
# Lancer tous les tests
python manage.py test

# Lancer les tests d'une application spécifique
python manage.py test vehicle

# Lancer les tests avec couverture
coverage run manage.py test
coverage report
```

## 📦 Déploiement

1. **Préparez l'environnement de production** :
```bash
# Collectez les fichiers statiques
python manage.py collectstatic --noinput

# Appliquez les migrations
python manage.py migrate
```

2. **Configurez le serveur web** (exemple avec Gunicorn) :
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

3. **Configurez NGINX** :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /chemin/vers/staticfiles/;
    }

    location /media/ {
        alias /chemin/vers/mediafiles/;
    }
}
```

## 🔒 Sécurité

- Utilisez des variables d'environnement pour les informations sensibles
- Activez HTTPS en production
- Configurez CORS correctement
- Utilisez des tokens JWT avec une durée de vie limitée
- Validez toutes les entrées utilisateur
- Implémentez la limitation de taux (rate limiting)
- Utilisez des en-têtes de sécurité appropriés

## 📝 Conventions de code

- Suivez PEP 8
- Utilisez des noms explicites pour les variables et fonctions
- Commentez le code complexe
- Documentez les API avec des docstrings
- Utilisez le type hinting
- Gardez les vues et les modèles séparés
- Suivez les principes DRY et SOLID

## 🐛 Débogage

- Utilisez Django Debug Toolbar
- Activez les logs détaillés
- Utilisez ipdb pour le débogage interactif
- Surveillez les performances avec Django Silk
- Vérifiez les requêtes SQL générées

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📜 Licence

Ce projet est sous licence MIT. 