# ABD-Motors

### Projet Hetic (Bachelor WEB3)

### Prérequis
- Python 3 installé
- MySQL installé et configuré
- Pip et Virtualenv installés

---

### Installation et Configuration

#### 1. Création et activation de l'environnement virtuel
```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate  # Windows
```

#### 2. Installation des dépendances
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### 3. Configuration de la base de données MySQL
Se connecter à MySQL :
```bash
mysql -u root -p
```
Créer la base de données et l'utilisateur :
```sql
CREATE DATABASE abdmotors CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mmotors_user'@'localhost' IDENTIFIED BY 'abdmotors';
GRANT ALL PRIVILEGES ON abdmotors.* TO 'mmotors_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. Configuration des variables d'environnement
Créer un fichier .env à la racine du projet et y ajouter les informations suivantes :
```ini
DJANGO_SECRET_KEY=votre_clé_secrète_ici
DEBUG=True
DB_NAME=abdmotors
DB_USER=mmotors_user
DB_PASSWORD=abdmotors
DB_HOST=localhost
DB_PORT=3306
```

#### 5. Appliquer les migrations
```bash
python3 manage.py migrate
```

#### 6. Création d'un superutilisateur
```bash
python3 manage.py createsuperuser
```

#### 7. Lancer le serveur
```bash
python3 manage.py runserver
```

---

### Accès au projet
- Interface d'administration : http://127.0.0.1:8000/admin/
- API : http://127.0.0.1:8000/api/
  
---

### Endpoints de l'API
#### Authentification
- POST /api/auth/token/ : Obtenir un token JWT
- POST /api/auth/token/refresh/ : Rafraîchir un token JWT
#### Utilisateurs
- GET /api/auth/utilisateurs/ : Liste des utilisateurs
- POST /api/auth/utilisateurs/ : Créer un utilisateur
- GET /api/auth/utilisateurs/me/ : Profil de l'utilisateur connecté
#### Véhicules
- GET /api/vehicules/ : Liste des véhicules
- POST /api/vehicules/ : Ajouter un véhicule
- GET /api/vehicules/{id}/ : Détails d'un véhicule
#### Dossiers
- GET /api/dossiers/ : Liste des dossiers
- POST /api/dossiers/ : Créer un dossier
- GET /api/dossiers/{id}/ : Détails d'un dossier
- POST /api/dossiers/{id}/change_status/ : Changer le statut d'un dossier

---

<<<<<<< HEAD
### Notes
- Assurez-vous que votre base de données MySQL est en cours d'exécution.
- Vérifiez que le fichier .env est bien configuré.
- En cas de problème avec les dépendances, utilisez pip freeze > requirements.txt pour mettre à jour la liste des packages nécessaires.
=======
### Utilisateurs
- `GET /api/auth/utilisateurs/` : Liste des utilisateurs
- `POST /api/auth/utilisateurs/` : Créer un utilisateur
- `GET /api/auth/utilisateurs/me/` : Profil de l'utilisateur connecté

### Véhicules
- `GET /api/vehicles/` : Liste des véhicules
- `POST /api/vehicles/` : Ajouter un véhicule
- `GET /api/vehicles/{id}/` : Détails d'un véhicule

### Dossiers
- `GET /api/dossiers/` : Liste des dossiers
- `POST /api/dossiers/` : Créer un dossier
- `GET /api/dossiers/{id}/` : Détails d'un dossier
- `POST /api/dossiers/{id}/change_status/` : Changer le statut d'un dossier
>>>>>>> abd
