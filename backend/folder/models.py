from django.db import models
from user.models import User
from vehicle.models import Vehicle

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
    FILE_TYPES = (
        ('ID_CARD', 'Carte d\'identité'),
        ('DRIVER_LICENSE', 'Permis de conduire'),
        ('PROOF_ADDRESS', 'Justificatif de domicile'),
        ('INCOME_PROOF', 'Justificatif de revenus'),
        ('INSURANCE', 'Attestation d\'assurance'),
        ('OTHER', 'Autre document'),
    )
    
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE, related_name='files')
    file_type = models.CharField(max_length=20, choices=FILE_TYPES)
    file = models.FileField(upload_to='folder_files/%Y/%m/%d/')
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'files'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.get_file_type_display()} - {self.folder}"
