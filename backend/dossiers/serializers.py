from rest_framework import serializers
from .models import Dossier
from comptes.serializers import UtilisateurSerializer
from vehicules.serializers import VehiculeSerializer
from vehicules.models import Vehicule

class DossierSerializer(serializers.ModelSerializer):
    client = UtilisateurSerializer(read_only=True)
    vehicule = VehiculeSerializer(read_only=True)
    vehicule_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicule.objects.all(),
        write_only=True,
        source='vehicule'
    )

    class Meta:
        model = Dossier
        fields = ['id', 'client', 'vehicule', 'vehicule_id', 'type_dossier', 
                 'statut', 'date_creation', 'date_modification']
        read_only_fields = ['client', 'date_creation', 'date_modification'] 