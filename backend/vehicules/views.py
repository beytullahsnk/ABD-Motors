from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vehicule
from .serializers import VehiculeSerializer

# Create your views here.

class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type_offre', 'etat', 'marque']
    search_fields = ['marque', 'modele', 'description']
    ordering_fields = ['prix_vente', 'prix_location', 'date_ajout']
