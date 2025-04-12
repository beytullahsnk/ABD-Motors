#!/bin/bash

# Variables
BACKEND_DIR="/home/ubuntu/ABD-Motors/backend"
FRONTEND_DIR="/home/ubuntu/ABD-Motors/frontend"
LOG_FILE="/home/ubuntu/deploy.log"

# Fonction pour logger les messages
log_message() {
    echo "$(date): $1" | tee -a $LOG_FILE
}

echo "================================" | tee -a $LOG_FILE
log_message "Préparation du déploiement..."
echo "================================" | tee -a $LOG_FILE

# Création du dossier du projet s'il n'existe pas
sudo mkdir -p /home/ubuntu/ABD-Motors
sudo chown -R ubuntu:ubuntu /home/ubuntu/ABD-Motors

# Installation des dépendances système
log_message "Installation des dépendances système..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nginx postgresql-client curl

# Installation de Node.js (méthode compatible avec Ubuntu 22.04 et 24.04)
log_message "Installation de Node.js..."
if ! command -v nodejs &> /dev/null; then
    # Use NodeSource pour installer une version récente de Node.js
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Installation d'Ollama pour GenIA
log_message "Installation d'Ollama pour l'API GenIA..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.com/install.sh | sudo sh
fi

# Répertoires pour les logs
sudo mkdir -p /var/log/ollama
sudo chmod 755 /var/log/ollama
sudo chown -R ubuntu:ubuntu /var/log/ollama

# Démarrage d'Ollama
log_message "Démarrage d'Ollama en arrière-plan..."
if ! pgrep -x "ollama" > /dev/null; then
    nohup ollama serve > /var/log/ollama/ollama.log 2> /var/log/ollama/ollama.err.log &
    sleep 5  # Attendre que le service démarre
fi

# Vérifier si Ollama est accessible
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    log_message "AVERTISSEMENT: Ollama ne semble pas répondre. Vérification des logs..."
    tail -n 20 /var/log/ollama/ollama.err.log | tee -a $LOG_FILE
else
    log_message "Ollama est en cours d'exécution."
fi

# Téléchargement du modèle llama2 pour Ollama
log_message "Téléchargement du modèle llama2..."
ollama pull llama2

# Configuration de l'environnement Python pour le backend
log_message "Configuration de l'environnement Python..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn Pillow  # Ajout explicite de Pillow pour garantir son installation

# Mise à jour des variables d'environnement pour la production
log_message "Mise à jour des variables d'environnement pour la production..."
if [ -f "$BACKEND_DIR/.env" ]; then
    # Modifier la variable DEBUG à False si elle existe
    sed -i 's/DEBUG=True/DEBUG=False/g' $BACKEND_DIR/.env
fi

# Installation des dépendances frontend avec permissions correctes
log_message "Installation des dépendances frontend..."
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

# Mise à jour de l'URL de l'API dans .env
if [ -f "$FRONTEND_DIR/.env" ]; then
    # Obtenir l'IP publique
    PUBLIC_IP=$(curl -s ifconfig.me)
    log_message "Configuration de l'URL de l'API avec l'IP publique: $PUBLIC_IP"
    echo "REACT_APP_API_URL=http://$PUBLIC_IP/api" > $FRONTEND_DIR/.env
fi

# Installation des dépendances et construction avec un timeout plus long
log_message "npm install --no-fund --no-audit"
npm install --no-fund --no-audit
log_message "npm run build"
npm run build

# Ajuster les permissions du dossier build pour Nginx
log_message "Ajustement des permissions pour Nginx..."
sudo chown -R ubuntu:www-data $FRONTEND_DIR/build
sudo chmod -R 755 $FRONTEND_DIR/build

# Configuration Nginx
log_message "Configuration de Nginx..."
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
        try_files \$uri \$uri/ /index.html;
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

    # Endpoint de santé
    location /health/ {
        proxy_pass http://127.0.0.1:8000/health/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOL'

sudo ln -sf /etc/nginx/sites-available/abd-motors /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
# Test de la configuration Nginx avant de redémarrer
log_message "Test de la configuration Nginx..."
sudo nginx -t && sudo systemctl restart nginx

# Ajuster les permissions du groupe
log_message "Ajout de l'utilisateur www-data au groupe ubuntu..."
sudo usermod -a -G ubuntu www-data
sudo chmod 755 /home/ubuntu
sudo chmod 755 /home/ubuntu/ABD-Motors

# Configuration Gunicorn
log_message "Configuration de Gunicorn..."
sudo mkdir -p /var/log/gunicorn
sudo chown -R ubuntu:ubuntu /var/log/gunicorn

sudo bash -c 'cat > /etc/systemd/system/gunicorn.service << EOL
[Unit]
Description=Gunicorn daemon for ABD Motors
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/ABD-Motors/backend
Environment="PATH=/home/ubuntu/ABD-Motors/backend/venv/bin"
Environment="DEBUG=False"
Environment="PYTHONUNBUFFERED=1"
ExecStart=/home/ubuntu/ABD-Motors/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 config.wsgi:application
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/gunicorn/access.log
StandardError=append:/var/log/gunicorn/error.log

[Install]
WantedBy=multi-user.target
EOL'

# Configuration du service Ollama pour le démarrage automatique
log_message "Configuration du service Ollama..."
sudo bash -c 'cat > /etc/systemd/system/ollama.service << EOL
[Unit]
Description=Ollama AI Service
After=network.target

[Service]
User=ubuntu
ExecStart=/usr/local/bin/ollama serve
Restart=always
RestartSec=10
StandardOutput=append:/var/log/ollama/ollama.log
StandardError=append:/var/log/ollama/ollama.err.log

[Install]
WantedBy=multi-user.target
EOL'

# Démarrage des services
log_message "Démarrage des services..."
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl restart gunicorn
sudo systemctl enable ollama
sudo systemctl restart ollama

# Migrations Django
log_message "Application des migrations Django..."
cd $BACKEND_DIR
source venv/bin/activate

# Marquer les migrations comme appliquées sans les appliquer réellement
log_message "Configuration des migrations Django pour correspondre à la base de données existante..."
python manage.py migrate --fake vehicle 0004_alter_vehicle_mileage_alter_vehicle_year
python manage.py migrate --fake vehicle 0005_auto_match_database_schema
python manage.py migrate --fake folder 0002_file
python manage.py migrate --fake folder 0003_auto_match_database_schema

# Vérification si des migrations sont encore nécessaires
python manage.py showmigrations

# N'appliquer que les migrations réellement nécessaires et non marquées comme appliquées
log_message "Application des autres migrations si nécessaire..."
python manage.py migrate --plan
python manage.py migrate

# Collecte des fichiers statiques
log_message "Collecte des fichiers statiques..."
python manage.py collectstatic --noinput

# Vérification du fonctionnement d'Ollama
log_message "Vérification d'Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    log_message "ATTENTION: Ollama n'est pas accessible. Tentative de redémarrage..."
    sudo systemctl restart ollama
    sleep 5
    if ! curl -s http://localhost:11434/api/tags > /dev/null; then
        log_message "ERREUR: Ollama n'est toujours pas accessible après redémarrage."
    else
        log_message "Ollama est maintenant accessible après redémarrage."
    fi
else
    log_message "Ollama est accessible."
fi

# Vérification des services
log_message "Vérification de l'état des services..."
SERVICE_STATUS=""
SERVICE_STATUS+="État de Gunicorn: $(systemctl is-active gunicorn)\n"
SERVICE_STATUS+="État de Nginx: $(systemctl is-active nginx)\n"
SERVICE_STATUS+="État d'Ollama: $(systemctl is-active ollama)\n"
echo -e $SERVICE_STATUS | tee -a $LOG_FILE

echo "================================" | tee -a $LOG_FILE
log_message "Déploiement terminé !"
echo "================================" | tee -a $LOG_FILE
log_message "Votre site devrait être accessible à l'adresse: http://$(curl -s ifconfig.me)"
log_message ""
log_message "Si vous rencontrez des problèmes, vérifiez les logs avec:"
log_message "  - Nginx: sudo tail -n 100 /var/log/nginx/abdmotors.error.log"
log_message "  - Gunicorn: sudo tail -n 100 /var/log/gunicorn/error.log"
log_message "  - Ollama: sudo tail -n 100 /var/log/ollama/ollama.err.log"
log_message ""
log_message "Pour redémarrer les services:"
log_message "  - sudo systemctl restart nginx"
log_message "  - sudo systemctl restart gunicorn"
log_message "  - sudo systemctl restart ollama" 