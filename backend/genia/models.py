from django.db import models
from django.conf import settings


class Folder(models.Model):
    """Modèle pour les dossiers de l'application."""
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    s3_prefix = models.CharField(max_length=255, blank=True, null=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='genia_folders', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name


class Document(models.Model):
    """Modèle pour les documents pouvant être interrogés par l'IA."""
    
    TYPE_CHOICES = (
        ('location', 'Dossier de location'),
        ('vente', 'Dossier de vente'),
    )
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='documents/')
    document_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    s3_key = models.CharField(max_length=255, blank=True, null=True)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    content_text = models.TextField(blank=True, null=True)  # Texte extrait pour l'IA
    folder = models.ForeignKey(Folder, related_name='documents', null=True, blank=True, on_delete=models.SET_NULL)
    
    def __str__(self):
        return self.title


class AIInteraction(models.Model):
    """Modèle pour stocker les interactions avec l'IA."""
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    query = models.TextField()
    response = models.TextField()
    documents = models.ManyToManyField(Document, related_name='interactions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Query by {self.user.username} at {self.created_at}" 