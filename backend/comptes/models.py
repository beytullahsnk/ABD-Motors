from django.contrib.auth.models import AbstractUser
from django.db import models

class Utilisateur(AbstractUser):
    ROLES = (
        ('CLIENT', 'Client'),
        ('GESTIONNAIRE', 'Gestionnaire'),
        ('ADMIN', 'Administrateur')
    )
    role = models.CharField(max_length=20, choices=ROLES, default='CLIENT')
    telephone = models.CharField(max_length=15, null=True, blank=True)
    adresse = models.TextField(null=True, blank=True)

    # Ajout des related_name pour résoudre les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='utilisateur_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='utilisateur_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    class Meta:
        db_table = 'utilisateurs'
        swappable = 'AUTH_USER_MODEL'

    def __str__(self):
        return f"{self.username} - {self.role}"
