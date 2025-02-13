# ABD-Motors

### Projet Hetic (Bachelor WEB3)

### Prérequis
- Python 3 installé
- MySQL installé et configuré
- Pip et Virtualenv installés

---

### 1. Cloner le projet
```bash
git clone [url-du-projet]
cd ABD-Motors
```

### 2. Environnement virtuel
```bash
# Création
python3 -m venv venv

# Activation
# Sur macOS/Linux :
source venv/bin/activate
# Sur Windows :
venv\Scripts\activate
```

### 3. Dépendances
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Base de données MySQL
```sql
CREATE DATABASE abdmotors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mmotors_user'@'localhost' IDENTIFIED BY 'abdmotors';
GRANT ALL PRIVILEGES ON abdmotors.* TO 'mmotors_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Configuration
Créer un fichier `.env` à la racine du projet :
```ini
DJANGO_SECRET_KEY=votre_clé_secrète_ici
DEBUG=True
DB_NAME=abdmotors
DB_USER=mmotors_user
DB_PASSWORD=abdmotors
DB_HOST=localhost
DB_PORT=3306
```

### 6. Migrations
```bash
cd backend
python manage.py migrate
```

### 7. Créer un superutilisateur
```bash
python manage.py createsuperuser
```

### 8. Lancer le serveur
```bash
python manage.py runserver
```

## Structure de l'API

### Authentification
- `POST /api/auth/token/` : Obtention du token JWT
- `POST /api/auth/token/refresh/` : Rafraîchissement du token

### Véhicules
- `GET /api/vehicles/` : Liste des véhicules
- `POST /api/vehicles/` : Création d'un véhicule
- `GET /api/vehicles/{id}/` : Détails d'un véhicule
- `PUT/PATCH /api/vehicles/{id}/` : Modification
- `DELETE /api/vehicles/{id}/` : Suppression
- `POST /api/vehicles/{id}/change_state/` : Changement d'état
- `POST /api/vehicles/{id}/assign_owner/` : Attribution d'un propriétaire
- `POST /api/vehicles/{id}/switch_type/` : Changement de type (vente/location)

### Dossiers
- `GET /api/folders/` : Liste des dossiers
- `POST /api/folders/` : Création d'un dossier
- `GET /api/folders/{id}/` : Détails d'un dossier
- `PUT/PATCH /api/folders/{id}/` : Modification
- `DELETE /api/folders/{id}/` : Suppression
- `POST /api/folders/{id}/change_status/` : Changement de statut

### Fichiers
- `GET /api/folders/{folder_id}/files/` : Liste des fichiers
- `POST /api/folders/{folder_id}/files/` : Ajout d'un fichier
- `GET /api/folders/{folder_id}/files/{id}/` : Détails d'un fichier
- `DELETE /api/folders/{folder_id}/files/{id}/` : Suppression d'un fichier

## Filtres disponibles

### Véhicules
- Marque (`brand`)
- Modèle (`model`)
- Type d'offre (`type_offer`)
- État (`state`)
- Année (`year`, `min_year`, `max_year`)
- Kilométrage (`mileage`, `min_mileage`, `max_mileage`)
- Prix (`min_price`, `max_price`)

### Dossiers
- Type de dossier (`type_folder`)
- Statut (`status`)

## Accès
- Interface d'administration : `http://127.0.0.1:8000/admin/`
- API Root : `http://127.0.0.1:8000/api/`

## Rôles et Permissions
- **Admin** : Accès complet
- **Gestionnaire** : Gestion des véhicules et dossiers
- **Client** : Consultation et création de dossiers

## Notes de développement
- L'API utilise Django REST Framework
- Authentification via JWT (JSON Web Tokens)
- Support CORS activé pour le développement
- Filtrage et recherche disponibles sur les véhicules
- Upload de fichiers supporté pour les dossiers

## Sécurité
- Les tokens JWT expirent après 1 jour
- Les tokens de rafraîchissement sont valides 7 jours
- CORS configuré pour accepter toutes les origines en développement
