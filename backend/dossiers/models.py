from django.db import models
from comptes.models import Utilisateur
from vehicules.models import Vehicule

class Dossier(models.Model):
    STATUTS = (
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours de traitement'),
        ('VALIDE', 'Validé'),
        ('REFUSE', 'Refusé'),
    )
    TYPE_DOSSIER = (
        ('ACHAT', 'Dossier d\'achat'),
        ('LOCATION', 'Dossier de location'),
    )
    
    client = models.ForeignKey(Utilisateur, on_delete=models.CASCADE)
    vehicule = models.ForeignKey(Vehicule, on_delete=models.CASCADE)
    type_dossier = models.CharField(max_length=20, choices=TYPE_DOSSIER)
    statut = models.CharField(max_length=20, choices=STATUTS)
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'dossiers'

    def __str__(self):
        return f"Dossier {self.type_dossier} - {self.client.username}"
