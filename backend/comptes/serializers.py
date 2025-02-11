from rest_framework import serializers
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'telephone', 'adresse']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Utilisateur.objects.create_user(**validated_data)
        return user 