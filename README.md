# ABD-Motors Backend

API Django pour la gestion de véhicules et de dossiers de location/vente pour ABD-Motors.

## Technologies

- Python 3.13
- Django 4.2.19
- PostgreSQL (AWS RDS)
- AWS S3 pour le stockage des fichiers
- JWT pour l'authentification

## Fonctionnalités

- 🚗 Gestion des véhicules (vente et location)
- 📁 Gestion des dossiers clients
- 👥 Gestion des utilisateurs et des rôles
- 🔐 Authentification JWT
- 📸 Upload d'images sur AWS S3
- 🔍 Filtrage et recherche avancés

## Installation

1. **Clonez le repository** :
```bash
git clone https://github.com/beytullahsnk/ABD-Motors.git
cd ABD-Motors
```

2. **Créez l'environnement virtuel** :
```bash
python3 -m venv venv
source venv/bin/activate  # Sur macOS/Linux
# ou
venv\Scripts\activate  # Sur Windows
```

3. **Installez les dépendances** :
```bash
pip install -r requirements.txt
```

4. **Configurez les variables d'environnement** :
Créez un fichier `.env` à la racine :
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

5. **Appliquez les migrations** :
```bash
cd backend
python3 manage.py migrate
python3 manage.py createsuperuser
```

## Développement

1. **Lancez le serveur** :
```bash
python3 manage.py runserver
```

2. **Accédez aux interfaces** :
- Admin : http://localhost:8000/admin/
- API : http://localhost:8000/api/

## API Endpoints

### Authentification
- POST `/api/auth/token/` - Obtenir un token JWT
- POST `/api/auth/register/` - Créer un compte

### Véhicules
- GET `/api/vehicles/` - Liste des véhicules
- POST `/api/vehicles/` - Créer un véhicule
- GET `/api/vehicles/{id}/` - Détails d'un véhicule
- PUT `/api/vehicles/{id}/` - Modifier un véhicule
- DELETE `/api/vehicles/{id}/` - Supprimer un véhicule

### Dossiers
- GET `/api/folders/` - Liste des dossiers
- POST `/api/folders/` - Créer un dossier
- GET `/api/folders/{id}/` - Détails d'un dossier
- PUT `/api/folders/{id}/` - Modifier un dossier
- DELETE `/api/folders/{id}/` - Supprimer un dossier

## Configuration du stockage

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

## Tests

```bash
python3 manage.py test
```

## Déploiement

1. **Configurez les variables de production**
2. **Collectez les fichiers statiques** :
```bash
python3 manage.py collectstatic --noinput
```
3. **Appliquez les migrations** :
```bash
python3 manage.py migrate
```

## Auteurs

### Groupe 9 - HETIC :

- Elijah TRAORE
- Abdallah SAOUD
- Beytullah SONKAYA
- Juan Manoel NDEGUE
- Siaka K. DOUMBIA 
- Yanis ABBAR

## Licence

Ce projet est sous licence MIT.
