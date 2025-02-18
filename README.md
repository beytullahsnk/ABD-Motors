# ABD-Motors Backend

Backend Django pour le projet ABD-Motors (Groupe 9). Cette API gère les véhicules, les dossiers et les utilisateurs.

## Prérequis

- Python 3.13
- PostgreSQL
- Un compte AWS avec accès S3
- Git

## Installation

### Sur macOS

1. **Installation de Python** :
    ```bash
    # Installer Homebrew si ce n'est pas déjà fait
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Installer Python
    brew install python
    
    # Vérifier l'installation
    python3 --version
    ```

### Sur Windows
- Téléchargez et installez Python depuis [python.org](https://www.python.org/downloads/)

### Sur Linux
```bash
sudo apt-get update
sudo apt-get install python3 python3-pip
```

### Configuration du projet

1. **Clonez le repository** :
    ```bash
    git clone https://github.com/beytullahsnk/ABD-Motors.git
    cd ABD-Motors
    ```

2. **Créez et activez l'environnement virtuel** :
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate
    
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3. **Installez les dépendances** :
    ```bash
    pip install -r requirements.txt
    ```

4. **Configuration de l'environnement** :
    Créez un fichier `.env` à la racine avec :
    ```env
    # Django
    DJANGO_SECRET_KEY=votre_clé_secrète
    DEBUG=True
    USE_S3=True
    
    # Base de données RDS
    DB_NAME=votre_db_name
    DB_USER=votre_db_user
    DB_PASSWORD=votre_db_password
    DB_HOST=votre_db_host
    DB_PORT=5432

    # AWS S3
    AWS_ACCESS_KEY_ID=votre_access_key_id
    AWS_SECRET_ACCESS_KEY=votre_secret_access_key
    AWS_STORAGE_BUCKET_NAME=abdmotors-groupe9
    AWS_S3_REGION_NAME=eu-west-3
   
    # Allowed Hosts
    ALLOWED_HOSTS=localhost,127.0.0.1
    ```

5. **Initialisation de la base de données** :
    ```bash
    cd backend
    python manage.py makemigrations
    python manage.py migrate
    python manage.py createsuperuser
    ```

6. **Collecte des fichiers statiques** (si USE_S3=True) :
    ```bash
    python manage.py collectstatic --noinput
    ```

7. **Lancement du serveur** :
    ```bash
    python manage.py runserver
    ```

## Configuration du stockage

Le projet supporte deux modes de stockage :

1. **Stockage Local** (développement) :
   ```env
   DEBUG=True
   USE_S3=False
   ```

2. **Stockage S3** (production) :
   ```env
   DEBUG=False  # En production
   USE_S3=True
   ```
   - Assurez-vous que vos credentials AWS sont corrects
   - Exécutez `python manage.py collectstatic`

## Utilisation

### Accès aux interfaces
- **Admin** : http://localhost:8000/admin/
- **API** : http://localhost:8000/api/

### API Endpoints

#### Authentification
- POST `/api/auth/token/` - Obtenir un token JWT
- POST `/api/auth/register/` - Créer un compte

#### Véhicules
- GET `/api/vehicles/` - Liste des véhicules
- POST `/api/vehicles/` - Créer un véhicule
- GET `/api/vehicles/{id}/` - Détails d'un véhicule

#### Dossiers
- GET `/api/folders/` - Liste des dossiers
- POST `/api/folders/` - Créer un dossier
- GET `/api/folders/{id}/` - Détails d'un dossier

## Déploiement

Pour déployer en production :
```bash
chmod +x deploy.sh
./deploy.sh
```

## Support

Pour toute question ou problème, veuillez créer une issue dans le repository.
