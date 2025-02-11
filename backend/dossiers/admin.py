from django.contrib import admin
from .models import Dossier

@admin.register(Dossier)
class DossierAdmin(admin.ModelAdmin):
    list_display = ('client', 'vehicule', 'type_dossier', 'statut', 'date_creation')
    list_filter = ('type_dossier', 'statut')
    search_fields = ('client__username', 'vehicule__marque', 'vehicule__modele')
    ordering = ('-date_creation',)
