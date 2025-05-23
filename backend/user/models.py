from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('CLIENT', 'Client'),
        ('GESTIONNAIRE', 'Gestionnaire'),
        ('ADMIN', 'Administrateur')
    )
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLES, default='CLIENT')
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    # Ajout des related_name pour résoudre les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='user_set',
        blank=True,
        verbose_name='groups',
        help_text='The groups this user belongs to.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='user_set',
        blank=True,
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )

    class Meta:
        db_table = 'users'
        swappable = 'AUTH_USER_MODEL'
        managed = False  # Django ne tentera pas de gérer cette table

    def __str__(self):
        return f"{self.email} - {self.role}"
