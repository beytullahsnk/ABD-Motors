from django.db import models
from user.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import logging
from django.conf import settings

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
    
    FUEL_TYPES = (
        ('ESSENCE', 'Essence'),
        ('DIESEL', 'Diesel'),
        ('HYBRIDE', 'Hybride'),
        ('ELECTRIQUE', 'Électrique')
    )
    
    TRANSMISSION_TYPES = (
        ('MANUELLE', 'Manuelle'),
        ('AUTOMATIQUE', 'Automatique')
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
    
    # Statut et vérifications
    has_insurance = models.BooleanField(default=True)
    has_technical_control = models.BooleanField(default=True)
    has_maintenance = models.BooleanField(default=True)
    has_assistance = models.BooleanField(default=True)
    
    # Caractéristiques techniques
    engine_size = models.CharField(max_length=50, null=True, blank=True)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPES, null=True, blank=True)
    maintenance_book = models.BooleanField(default=False, null=True, blank=True)
    power = models.IntegerField(null=True, blank=True)
    technical_control = models.DateField(null=True, blank=True)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_TYPES, null=True, blank=True)
    
    # Relations
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='owned_vehicles'
    )
    renter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='rented_vehicles'
    )
    rental_start_date = models.DateField(null=True, blank=True)
    rental_end_date = models.DateField(null=True, blank=True)

    class Meta:
        db_table = 'vehicles'
        ordering = ['-date_added']

    def __str__(self):
        return f"{self.brand} {self.model} ({self.type_offer})"

    # Propriété calculée pour la compatibilité avec le frontend
    @property
    def is_available(self):
        """
        Retourne True si le véhicule est disponible (state = 'AVAILABLE'), False sinon.
        Cette propriété est utilisée par le frontend mais n'est pas stockée dans la base de données.
        """
        return self.state == 'AVAILABLE'
    
    # Propriétés calculées pour la compatibilité avec les anciens sérialiseurs
    @property
    def created_at(self):
        """
        Retourne date_added pour assurer la compatibilité avec les anciens sérialiseurs.
        """
        return self.date_added
    
    @property
    def updated_at(self):
        """
        Retourne date_added pour assurer la compatibilité avec les anciens sérialiseurs.
        """
        return self.date_added

    def save(self, *args, **kwargs):
        # Log avant la sauvegarde
        if self.image:
            logger.info(f"Saving vehicle {self.brand} {self.model} with image: {self.image.name}")
        
        super().save(*args, **kwargs)
        
        # Log après la sauvegarde
        if self.image:
            logger.info(f"Vehicle saved. Image URL: {self.image.url}")
