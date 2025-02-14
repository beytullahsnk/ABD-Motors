#!/bin/bash

# Mettre à jour le système
sudo apt-get update
sudo apt-get upgrade -y

# Installer les dépendances
sudo apt-get install -y python3-pip python3-venv nginx

# Créer un environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dépendances Python
pip install -r requirements.txt

# Collecter les fichiers statiques
python manage.py collectstatic --noinput

# Configuration Gunicorn
sudo nano /etc/systemd/system/gunicorn.service 