from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('CLIENT', 'Client'),
        ('MANAGER', 'Manager'),
        ('ADMIN', 'Administrator')
    )
    role = models.CharField(max_length=20, choices=ROLES, default='CLIENT')
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.TextField(null=True, blank=True)

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

    def __str__(self):
        return f"{self.username} - {self.role}"
