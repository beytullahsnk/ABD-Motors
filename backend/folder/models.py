from django.db import models
from user.models import User
from vehicle.models import Vehicle
from django.conf import settings

class Folder(models.Model):
    STATUS = (
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In progress'),
        ('VALIDATED', 'Validated'),
        ('REJECTED', 'Rejected'),
    )
    TYPE_FOLDER = (
        ('PURCHASE', 'Folder of purchase'),
        ('RENTAL', 'Folder of rental'),
    )
    
    client = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE)
    type_folder = models.CharField(max_length=20, choices=TYPE_FOLDER)
    status = models.CharField(max_length=20, choices=STATUS, default='PENDING')
    creation_date = models.DateTimeField(auto_now_add=True)
    modification_date = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'folders'

    def __str__(self):
        return f"Folder {self.type_folder} - {self.client.username}"

class File(models.Model):
    DOCUMENT_TYPES = (
        ('ID_CARD', 'Carte d\'identité'),
        ('DRIVING_LICENSE', 'Permis de conduire'),
        ('SIGNED_CONTRACT', 'Contrat signé'),
        ('OTHER', 'Autre')
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    folder = models.ForeignKey(
        Folder,
        on_delete=models.CASCADE,
        related_name='files',
        null=True,
        blank=True
    )
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES, default='OTHER')
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'files'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.user.email}"
