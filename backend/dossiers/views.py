from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Dossier
from .serializers import DossierSerializer

# Create your views here.

class DossierViewSet(viewsets.ModelViewSet):
    serializer_class = DossierSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'CLIENT':
            return Dossier.objects.filter(client=user)
        return Dossier.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
