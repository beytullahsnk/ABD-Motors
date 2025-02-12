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
