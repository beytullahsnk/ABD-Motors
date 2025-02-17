# ABD-Motors Backend

Backend Django pour le projet ABD-Motors (Groupe 9). Cette API gère les véhicules, les dossiers et les utilisateurs.

## Technologies

- Python 3.13
- Django 4.2.19
- PostgreSQL (AWS RDS)
- AWS S3 pour le stockage des fichiers
- JWT pour l'authentification

## Configuration

1. Créez un environnement virtuel :
```bash
python -m venv venv
source venv/bin/activate  # Sur macOS/Linux
```

2. Installez les dépendances :
```bash
pip install -r requirements.txt
```

3. Créez un fichier `.env` à la racine :
```env
# Django
DJANGO_SECRET_KEY=votre_clé_secrète_ici
DEBUG=True

# Base de données RDS
DB_NAME=abdmotors_groupe_9
DB_USER=groupe9
DB_PASSWORD=groupe9@
DB_HOST=hetic.cd5ufp6fsve3.us-east-1.rds.amazonaws.com
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=votre_access_key_id_ici
AWS_SECRET_ACCESS_KEY=votre_secret_access_key_ici
AWS_STORAGE_BUCKET_NAME=abdmotors-groupe9
AWS_S3_REGION_NAME=eu-west-3

# Allowed Hosts
ALLOWED_HOSTS=localhost,127.0.0.1
```

4. Appliquez les migrations :
```bash
cd backend
python manage.py migrate
```

5. Créez un superutilisateur :
```bash
python manage.py createsuperuser
```

## Structure du Projet

```
backend/
├── config/             # Configuration Django
├── user/              # Gestion des utilisateurs
├── vehicle/           # Gestion des véhicules
└── folder/            # Gestion des dossiers
```

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

## Stockage des Fichiers

Les fichiers sont stockés sur AWS S3 :
- En développement : stockage local
- En production : bucket S3 `abdmotors-groupe9`

## Développement

1. Lancez le serveur :
```bash
python manage.py runserver
```

2. Accédez à :
- API : http://localhost:8000/api/
- Admin : http://localhost:8000/admin/

## Production

1. Configurez les variables d'environnement :
```env
DEBUG=False
ALLOWED_HOSTS=votre-domaine.com
```

2. Collectez les fichiers statiques :
```bash
python manage.py collectstatic --noinput
```

## Contribution

1. Créez une branche pour votre fonctionnalité
2. Committez vos changements
3. Créez une Pull Request

## Auteurs

- Groupe 9 - HETIC
