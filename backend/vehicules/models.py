from django.db import models

# Create your models here.

class Vehicule(models.Model):
    TYPES = (
        ('VENTE', 'À vendre'),
        ('LOCATION', 'À louer'),
    )
    ETATS = (
        ('DISPONIBLE', 'Disponible'),
        ('RESERVE', 'Réservé'),
        ('VENDU', 'Vendu'),
        ('LOUE', 'Loué'),
    )
    
    marque = models.CharField(max_length=100)
    modele = models.CharField(max_length=100)
    annee = models.IntegerField()
    kilometrage = models.IntegerField()
    prix_vente = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    prix_location = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    type_offre = models.CharField(max_length=20, choices=TYPES)
    etat = models.CharField(max_length=20, choices=ETATS)
    description = models.TextField()
    date_ajout = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vehicules'

    def __str__(self):
        return f"{self.marque} {self.modele} ({self.type_offre})"
