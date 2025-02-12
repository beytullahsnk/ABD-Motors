from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from .models import Vehicle
from .serializers import VehicleSerializer

# Create your views here.

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type_offer', 'state', 'brand']
    search_fields = ['brand', 'model', 'description']
    ordering_fields = ['sale_price', 'rental_price', 'date_added']
