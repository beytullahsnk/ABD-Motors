from django.db import models
from django.conf import settings

# Models vehicle.

class Vehicle(models.Model):
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
    year = models.IntegerField()
    mileage = models.IntegerField()
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPES)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_TYPES)
    seats = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='vehicles/', blank=True, null=True)
    
    # Statut et vérifications
    is_available = models.BooleanField(default=True)
    has_insurance = models.BooleanField(default=True)
    has_technical_control = models.BooleanField(default=True)
    has_maintenance = models.BooleanField(default=True)
    has_assistance = models.BooleanField(default=True)
    
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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"

    def update_availability(self):
        """Met à jour la disponibilité du véhicule en fonction des dates de location"""
        from django.utils import timezone
        current_date = timezone.now().date()
        
        if self.rental_start_date and self.rental_end_date:
            self.is_available = current_date < self.rental_start_date or current_date > self.rental_end_date
        else:
            self.is_available = True
        
        self.save()
