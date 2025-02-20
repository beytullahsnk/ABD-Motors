from django.db import models
from user.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import logging

logger = logging.getLogger(__name__)

# Models vehicle.

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
    year = models.IntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(2100)
        ]
    )
    mileage = models.IntegerField(
        validators=[MinValueValidator(0)]
    )
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    rental_price = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    type_offer = models.CharField(max_length=20, choices=TYPES)
    state = models.CharField(max_length=20, choices=STATES)
    description = models.TextField()
    image = models.ImageField(upload_to='vehicles/', null=True, blank=True)
    date_added = models.DateTimeField(auto_now_add=True)
    
    # Nouvelles options de location
    has_insurance = models.BooleanField(default=False)
    has_assistance = models.BooleanField(default=False)
    has_maintenance = models.BooleanField(default=False)
    has_technical_control = models.BooleanField(default=False)
    
    # Relations avec les utilisateurs
    owner = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='owned_vehicles'
    )
    renter = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='rented_vehicles'
    )
    rental_start_date = models.DateTimeField(null=True, blank=True)
    rental_end_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'vehicles'

    def __str__(self):
        return f"{self.brand} {self.model} ({self.type_offer})"

    def save(self, *args, **kwargs):
        # Log avant la sauvegarde
        if self.image:
            logger.info(f"Saving vehicle {self.brand} {self.model} with image: {self.image.name}")
        
        super().save(*args, **kwargs)
        
        # Log après la sauvegarde
        if self.image:
            logger.info(f"Vehicle saved. Image URL: {self.image.url}")
