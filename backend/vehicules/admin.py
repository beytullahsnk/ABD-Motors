from django.contrib import admin
from .models import Vehicule

@admin.register(Vehicule)
class VehiculeAdmin(admin.ModelAdmin):
    list_display = ('marque', 'modele', 'annee', 'type_offre', 'etat', 'prix_vente', 'prix_location')
    list_filter = ('type_offre', 'etat', 'marque')
    search_fields = ('marque', 'modele', 'description')
    ordering = ('-date_ajout',)
