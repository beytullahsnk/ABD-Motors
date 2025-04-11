#!/bin/bash

# Variables
BACKEND_DIR="/home/ubuntu/ABD-Motors/backend"
FRONTEND_DIR="/home/ubuntu/ABD-Motors/frontend"

echo "================================"
echo "Préparation du déploiement..."
echo "================================"

# Création du dossier du projet s'il n'existe pas
sudo mkdir -p /home/ubuntu/ABD-Motors
sudo chown -R ubuntu:ubuntu /home/ubuntu/ABD-Motors

# Installation des dépendances système
echo "Installation des dépendances système..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nginx postgresql-client curl

# Installation de Node.js (méthode compatible avec Ubuntu 22.04 et 24.04)
echo "Installation de Node.js..."
if ! command -v nodejs &> /dev/null; then
    # Use NodeSource pour installer une version récente de Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Installation d'Ollama pour GenIA
echo "Installation d'Ollama pour l'API GenIA..."
curl -fsSL https://ollama.com/install.sh | sudo sh
# Démarrage d'Ollama
ollama serve > /home/ubuntu/ollama.log 2>&1 &
# Téléchargement du modèle llama2 pour Ollama
echo "Téléchargement du modèle llama2..."
ollama pull llama2

# Configuration de l'environnement Python pour le backend
echo "Configuration de l'environnement Python..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn Pillow  # Ajout explicite de Pillow pour garantir son installation

# Installation des dépendances frontend avec permissions correctes
echo "Installation des dépendances frontend..."
cd $FRONTEND_DIR

# Nettoyage préalable pour éviter les problèmes de permission
if [ -d "node_modules" ]; then
    sudo rm -rf node_modules
fi

if [ -d "build" ]; then
    sudo rm -rf build
fi

# S'assurer que l'utilisateur ubuntu est propriétaire du répertoire frontend
sudo chown -R ubuntu:ubuntu $FRONTEND_DIR

# Installation des dépendances et construction avec un timeout plus long
echo "npm install --no-fund --no-audit"
npm install --no-fund --no-audit
echo "npm run build"
npm run build

# Ajuster les permissions du dossier build pour Nginx
echo "Ajustement des permissions pour Nginx..."
sudo chown -R ubuntu:www-data $FRONTEND_DIR/build
sudo chmod -R 755 $FRONTEND_DIR/build

# Configuration Nginx
echo "Configuration de Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/abd-motors << EOL
server {
    listen 80;
    server_name _;
    
    # Log files
    access_log /var/log/nginx/abdmotors.access.log;
    error_log /var/log/nginx/abdmotors.error.log;

    # Frontend
    location / {
        root /home/ubuntu/ABD-Motors/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
    }
}
EOL'

sudo ln -sf /etc/nginx/sites-available/abd-motors /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
# Test de la configuration Nginx avant de redémarrer
echo "Test de la configuration Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# Ajuster les permissions du groupe
echo "Ajout de l'utilisateur www-data au groupe ubuntu..."
sudo usermod -a -G ubuntu www-data
sudo chmod 755 /home/ubuntu
sudo chmod 755 /home/ubuntu/ABD-Motors

# Configuration Gunicorn
echo "Configuration de Gunicorn..."
sudo bash -c 'cat > /etc/systemd/system/gunicorn.service << EOL
[Unit]
Description=Gunicorn daemon for ABD Motors
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/ABD-Motors/backend
Environment="PATH=/home/ubuntu/ABD-Motors/backend/venv/bin"
ExecStart=/home/ubuntu/ABD-Motors/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 config.wsgi:application
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/gunicorn/access.log
StandardError=append:/var/log/gunicorn/error.log

[Install]
WantedBy=multi-user.target
EOL'

# Création des répertoires de log pour Gunicorn
sudo mkdir -p /var/log/gunicorn
sudo chown -R ubuntu:ubuntu /var/log/gunicorn

# Configuration du service Ollama pour le démarrage automatique
echo "Configuration du service Ollama..."
sudo bash -c 'cat > /etc/systemd/system/ollama.service << EOL
[Unit]
Description=Ollama AI Service
After=network.target

[Service]
User=ubuntu
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10
StandardOutput=append:/var/log/ollama.log
StandardError=append:/var/log/ollama.err.log

[Install]
WantedBy=multi-user.target
EOL'

# Démarrage des services
echo "Démarrage des services..."
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl restart gunicorn
sudo systemctl enable ollama
sudo systemctl restart ollama

# Migrations Django
echo "Application des migrations Django..."
cd $BACKEND_DIR
source venv/bin/activate

# Marquer les migrations comme appliquées sans les appliquer réellement
# Cela permet d'éviter les conflits avec la base de données existante
echo "Configuration des migrations Django pour correspondre à la base de données existante..."
python manage.py migrate --fake vehicle 0004_alter_vehicle_mileage_alter_vehicle_year
python manage.py migrate --fake vehicle 0005_auto_match_database_schema
python manage.py migrate --fake folder 0002_file
python manage.py migrate --fake folder 0003_auto_match_database_schema

# Vérification si des migrations sont encore nécessaires
python manage.py showmigrations

# N'appliquer que les migrations réellement nécessaires et non marquées comme appliquées
echo "Application des autres migrations si nécessaire..."
python manage.py migrate --plan
python manage.py migrate

# Vérification du fonctionnement d'Ollama
echo "Vérification d'Ollama..."
curl -s http://localhost:11434/api/tags || echo "ATTENTION: Ollama n'est pas accessible. Vérifiez son état avec 'sudo systemctl status ollama'"

# Vérification des services
echo "Vérification de l'état des services..."
echo "État de Gunicorn:"
sudo systemctl status gunicorn --no-pager
echo "État de Nginx:"
sudo systemctl status nginx --no-pager
echo "État d'Ollama:"
sudo systemctl status ollama --no-pager

echo "================================"
echo "Déploiement terminé !"
echo "================================"
echo "Votre site devrait être accessible à l'adresse: http://$(curl -s ifconfig.me)"
echo ""
echo "Si vous rencontrez des problèmes, vérifiez les logs avec:"
echo "  - Nginx: sudo tail -n 100 /var/log/nginx/abdmotors.error.log"
echo "  - Gunicorn: sudo tail -n 100 /var/log/gunicorn/error.log"
echo "  - Ollama: sudo tail -n 100 /var/log/ollama.err.log"
echo ""
echo "Pour redémarrer les services:"
echo "  - sudo systemctl restart nginx"
echo "  - sudo systemctl restart gunicorn"
echo "  - sudo systemctl restart ollama" 