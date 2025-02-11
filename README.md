# ABD-Motors
Hetic (Bachelor WEB3) Project

python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
python3 manage.py runserver

Se connecter à MySQL
mysql -u root -p
Créer la base de données et l'utilisateur
CREATE DATABASE abdmotors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mmotors_user'@'localhost' IDENTIFIED BY 'abdmotors';
GRANT ALL PRIVILEGES ON abdmotors. TO 'mmotors_user'@'localhost';
FLUSH PRIVILEGES;
exit;


### 5. Configuration des variables d'environnement
Créer un fichier `.env` à la racine du projet :

DJANGO_SECRET_KEY=votre_clé_secrète_ici
DEBUG=True
DB_NAME=abdmotors
DB_USER=mmotors_user
DB_PASSWORD=abdmotors
DB_HOST=localhost
DB_PORT=3306

### 6. Appliquer les migrations

python3 manage.py migrate


### 7. Créer un superutilisateur
python3 manage.py createsuperuser


### 8. Lancer le serveur

python3 manage.py runserver


## Accès
- Interface d'administration : http://127.0.0.1:8000/admin/
- API : http://127.0.0.1:8000/api/

## API Endpoints

### Authentication
- `POST /api/auth/token/` : Obtenir un token JWT
- `POST /api/auth/token/refresh/` : Rafraîchir un token JWT

### Utilisateurs
- `GET /api/auth/utilisateurs/` : Liste des utilisateurs
- `POST /api/auth/utilisateurs/` : Créer un utilisateur
- `GET /api/auth/utilisateurs/me/` : Profil de l'utilisateur connecté

### Véhicules
- `GET /api/vehicules/` : Liste des véhicules
- `POST /api/vehicules/` : Ajouter un véhicule
- `GET /api/vehicules/{id}/` : Détails d'un véhicule

### Dossiers
- `GET /api/dossiers/` : Liste des dossiers
- `POST /api/dossiers/` : Créer un dossier
- `GET /api/dossiers/{id}/` : Détails d'un dossier
- `POST /api/dossiers/{id}/change_status/` : Changer le statut d'un dossier