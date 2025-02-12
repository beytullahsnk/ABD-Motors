from django.db import models

# Create your models here.

class Vehicle(models.Model):
    TYPES = (
        ('SALE', 'À vendre'),
        ('RENTAL', 'À louer'),
    )
    STATES = (
        ('AVAILABLE', 'Disponible'),
        ('RESERVED', 'Réservé'),
        ('SOLD', 'Vendu'),
        ('RENTED', 'Loué'),
    )
    
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    mileage = models.IntegerField()
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    rental_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    type_offer = models.CharField(max_length=20, choices=TYPES)
    state = models.CharField(max_length=20, choices=STATES)
    description = models.TextField()
    date_added = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicles'

    def __str__(self):
        return f"{self.brand} {self.model} ({self.type_offer})"
