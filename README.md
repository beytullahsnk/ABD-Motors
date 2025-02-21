# 🚗 ABD-Motors - Application de Gestion de Véhicules

Application web complète pour la gestion de véhicules, incluant la location et la vente, développée pour ABD-Motors.

## 🌟 Vue d'ensemble

ABD-Motors est une application full-stack permettant de gérer un parc de véhicules et les dossiers associés (location/vente). Elle comprend une interface utilisateur moderne et une API REST robuste.

## 🚀 Fonctionnalités principales

- Gestion complète des véhicules (ajout, modification, suppression)
- Système de location et de vente
- Gestion des dossiers clients
- Interface d'administration
- Authentification et gestion des rôles
- Upload et stockage de documents sur AWS S3
- Interface responsive et moderne

## 🏗️ Architecture

Le projet est divisé en deux parties principales :

- **Frontend** : Application React avec Material-UI
- **Backend** : API REST Django avec PostgreSQL

## 📚 Documentation détaillée

- [Documentation Frontend](frontend/README.md)
- [Documentation Backend](backend/README.md)

## 🛠️ Stack technique

### Frontend
- React 18
- Material-UI v5
- React Router v6
- Axios
- JWT Authentication

### Backend
- Python 3.13
- Django 4.2.19
- Django REST Framework
- PostgreSQL
- JWT Authentication
- AWS S3 pour le stockage

### Infrastructure
- AWS RDS pour la base de données
- AWS S3 pour le stockage des fichiers
- AWS Lightsail pour l'hébergement

## 🚦 Prérequis

- Python 3.13+
- Node.js 16+
- PostgreSQL
- Compte AWS (S3 et RDS)

## 🔧 Installation rapide

1. **Clonez le repository**
```bash
git clone https://github.com/beytullahsnk/ABD-Motors.git
cd ABD-Motors
```

2. **Installez et lancez le backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` sous Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

3. **Installez et lancez le frontend**
```bash
cd frontend
npm install
npm start
```

Pour des instructions d'installation détaillées, consultez les README respectifs du [frontend](frontend/README.md) et du [backend](backend/README.md).

## 🌍 Environnement de développement

1. Configurez les variables d'environnement (voir `.env.example`)
2. Assurez-vous que PostgreSQL est en cours d'exécution
3. Configurez vos credentials AWS

## 🚀 Déploiement

Le projet est configuré pour être déployé sur AWS Lightsail. Consultez le guide de déploiement dans la documentation du backend pour plus de détails.

## 👥 Équipe

### Groupe 9 - HETIC

- **Elijah TRAORE** -
- **Abdallah SAOUD** - 
- **Beytullah SONKAYA** - 
- **Juan Manoel NDEGUE** - 
- **Siaka K. DOUMBIA** - 
- **Yanis ABBAR** - 

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md) pour commencer.
