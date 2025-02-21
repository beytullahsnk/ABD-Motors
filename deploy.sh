#!/bin/bash

# Installation des dépendances système
sudo apt-get update
sudo apt-get install -y python3-pip python3-venv nginx postgresql-client

# Configuration de l'environnement Python
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Configuration Nginx
sudo bash -c 'cat > /etc/nginx/sites-available/django << EOL
server {
    listen 80;
    server_name _;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
    
    location /static/ {
        alias /var/www/static/;
    }
    
    location /media/ {
        alias /var/www/media/;
    }
}
EOL'

sudo ln -sf /etc/nginx/sites-available/django /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx

# Configuration Gunicorn
sudo bash -c 'cat > /etc/systemd/system/gunicorn.service << EOL
[Unit]
Description=Gunicorn daemon for Django
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/home/ubuntu/app
ExecStart=/home/ubuntu/app/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 config.wsgi:application

[Install]
WantedBy=multi-user.target
EOL'

# Démarrage des services
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn

# Collecte des fichiers statiques et migrations
python manage.py collectstatic --noinput
python manage.py migrate 