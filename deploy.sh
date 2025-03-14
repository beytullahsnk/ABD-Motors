#!/bin/bash

# Variables
BACKEND_DIR="/home/ubuntu/backend"
FRONTEND_DIR="/home/ubuntu/frontend"

# Installation des dépendances système
echo "Installation des dépendances système..."
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nginx postgresql-client nodejs npm

# Configuration de l'environnement Python pour le backend
echo "Configuration de l'environnement Python..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

# Installation des dépendances frontend
echo "Installation des dépendances frontend..."
cd $FRONTEND_DIR
npm install
npm run build

# Configuration Nginx
echo "Configuration de Nginx..."
sudo bash -c 'cat > /etc/nginx/sites-available/abd-motors << EOL
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /home/ubuntu/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL'

sudo ln -sf /etc/nginx/sites-available/abd-motors /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

# Configuration Gunicorn
echo "Configuration de Gunicorn..."
sudo bash -c 'cat > /etc/systemd/system/gunicorn.service << EOL
[Unit]
Description=Gunicorn daemon for ABD Motors
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/backend
Environment="PATH=/home/ubuntu/backend/venv/bin"
ExecStart=/home/ubuntu/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 config.wsgi:application

[Install]
WantedBy=multi-user.target
EOL'

# Démarrage des services
echo "Démarrage des services..."
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl restart gunicorn

# Migrations Django
echo "Application des migrations Django..."
cd $BACKEND_DIR
source venv/bin/activate
python manage.py migrate

echo "Déploiement terminé !" 