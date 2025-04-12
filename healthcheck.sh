#!/bin/bash

# Ce script vérifie l'état des services requis pour l'application ABD-Motors
# Il peut être configuré comme une tâche cron pour des vérifications régulières

LOG_FILE="/home/ubuntu/healthcheck.log"
PUBLIC_IP=$(curl -s ifconfig.me)
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Fonction pour logger les messages
log_message() {
    echo "$TIMESTAMP: $1" | tee -a $LOG_FILE
}

log_message "Démarrage de la vérification d'état du système..."

# Vérification de Nginx
if systemctl is-active --quiet nginx; then
    log_message "✅ Nginx est en cours d'exécution"
else
    log_message "❌ Nginx n'est PAS en cours d'exécution. Tentative de redémarrage..."
    sudo systemctl restart nginx
    if systemctl is-active --quiet nginx; then
        log_message "✅ Nginx a été redémarré avec succès"
    else
        log_message "❌ ERREUR: Impossible de redémarrer Nginx. Vérifiez manuellement avec 'sudo systemctl status nginx'"
    fi
fi

# Vérification de Gunicorn
if systemctl is-active --quiet gunicorn; then
    log_message "✅ Gunicorn est en cours d'exécution"
else
    log_message "❌ Gunicorn n'est PAS en cours d'exécution. Tentative de redémarrage..."
    sudo systemctl restart gunicorn
    if systemctl is-active --quiet gunicorn; then
        log_message "✅ Gunicorn a été redémarré avec succès"
    else
        log_message "❌ ERREUR: Impossible de redémarrer Gunicorn. Vérifiez manuellement avec 'sudo systemctl status gunicorn'"
    fi
fi

# Vérification d'Ollama
if systemctl is-active --quiet ollama; then
    log_message "✅ Ollama est en cours d'exécution"
    
    # Vérification de l'API Ollama
    if curl -s -f -m 5 http://localhost:11434/api/tags > /dev/null; then
        log_message "✅ L'API Ollama répond correctement"
    else
        log_message "❌ L'API Ollama ne répond pas. Tentative de redémarrage d'Ollama..."
        sudo systemctl restart ollama
        sleep 5
        if curl -s -f -m 5 http://localhost:11434/api/tags > /dev/null; then
            log_message "✅ L'API Ollama répond maintenant correctement après redémarrage"
        else
            log_message "❌ ERREUR: L'API Ollama ne répond toujours pas après redémarrage"
        fi
    fi
else
    log_message "❌ Ollama n'est PAS en cours d'exécution. Tentative de redémarrage..."
    sudo systemctl restart ollama
    sleep 5
    if systemctl is-active --quiet ollama; then
        log_message "✅ Ollama a été redémarré avec succès"
    else
        log_message "❌ ERREUR: Impossible de redémarrer Ollama. Vérifiez manuellement avec 'sudo systemctl status ollama'"
    fi
fi

# Vérification du healthcheck de l'API
API_HEALTH_URL="http://$PUBLIC_IP/health/"
if curl -s -f -m 10 "$API_HEALTH_URL" > /dev/null; then
    log_message "✅ L'API répond correctement à l'URL de santé"
else
    log_message "❌ L'API ne répond pas à l'URL de santé ($API_HEALTH_URL)"
fi

# Vérification de l'accès à S3
# Ce test nécessite les outils AWS CLI, l'installera si nécessaire
if ! command -v aws &> /dev/null; then
    log_message "Installation d'AWS CLI pour les tests S3..."
    sudo apt-get update && sudo apt-get install -y awscli
fi

if [ -f "/home/ubuntu/ABD-Motors/.env" ]; then
    source /home/ubuntu/ABD-Motors/.env
    if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ] && [ -n "$AWS_STORAGE_BUCKET_NAME" ]; then
        export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
        export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
        
        if aws s3 ls "s3://$AWS_STORAGE_BUCKET_NAME" --region "$AWS_S3_REGION_NAME" &> /dev/null; then
            log_message "✅ Connexion à AWS S3 établie avec succès"
        else
            log_message "❌ Impossible de se connecter à AWS S3"
        fi
    else
        log_message "⚠️ Informations d'identification AWS manquantes dans .env, test S3 ignoré"
    fi
else
    log_message "⚠️ Fichier .env introuvable, test S3 ignoré"
fi

# Vérification de l'espace disque
DISK_USAGE=$(df -h / | grep -v Filesystem | awk '{print $5}' | tr -d '%')
if [ "$DISK_USAGE" -lt 90 ]; then
    log_message "✅ Espace disque suffisant: $DISK_USAGE%"
else
    log_message "⚠️ Espace disque critique: $DISK_USAGE%"
fi

# Vérification de la mémoire
FREE_MEM=$(free -m | grep Mem | awk '{print $4}')
if [ "$FREE_MEM" -gt 500 ]; then
    log_message "✅ Mémoire libre suffisante: ${FREE_MEM}MB"
else
    log_message "⚠️ Mémoire libre basse: ${FREE_MEM}MB"
fi

log_message "Vérification d'état terminée"

# Pour configurer en tant que tâche cron:
# sudo crontab -e
# Puis ajouter: 
# */15 * * * * /home/ubuntu/ABD-Motors/healthcheck.sh > /dev/null 2>&1 