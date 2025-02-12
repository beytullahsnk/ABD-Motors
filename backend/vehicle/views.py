from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Vehicle
from .serializers import VehicleSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from user.permissions import IsGestionnaireOrAdmin
from user.models import User
from django.db import models

# Create your views here.

class VehicleFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(method='filter_min_price')
    max_price = django_filters.NumberFilter(method='filter_max_price')
    min_year = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    max_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')

    def filter_min_price(self, queryset, name, value):
        return queryset.filter(
            models.Q(sale_price__gte=value) | 
            models.Q(rental_price__gte=value)
        )

    def filter_max_price(self, queryset, name, value):
        return queryset.filter(
            models.Q(sale_price__lte=value) | 
            models.Q(rental_price__lte=value)
        )

    class Meta:
        model = Vehicle
        fields = {
            'brand': ['exact', 'icontains'],
            'model': ['exact', 'icontains'],
            'type_offer': ['exact'],
            'state': ['exact'],
            'year': ['exact'],
            'mileage': ['exact'],
        }

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleFilter
    search_fields = ['brand', 'model', 'description']
    ordering_fields = ['sale_price', 'rental_price', 'year', 'mileage', 'date_added']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'switch_type']:
            return [IsAuthenticated(), IsGestionnaireOrAdmin()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['post'], permission_classes=[IsGestionnaireOrAdmin])
    def change_state(self, request, pk=None):
        vehicle = self.get_object()
        new_state = request.data.get('state')
        if new_state in dict(Vehicle.STATES):
            vehicle.state = new_state
            vehicle.save()
            return Response(self.get_serializer(vehicle).data)
        return Response(
            {'error': 'État invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'], permission_classes=[IsGestionnaireOrAdmin])
    def assign_owner(self, request, pk=None):
        vehicle = self.get_object()
        owner_id = request.data.get('owner_id')
        try:
            owner = User.objects.get(id=owner_id)
            vehicle.owner = owner
            vehicle.save()
            return Response(self.get_serializer(vehicle).data)
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur non trouvé'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'], permission_classes=[IsGestionnaireOrAdmin])
    def switch_type(self, request, pk=None):
        vehicle = self.get_object()
        current_type = vehicle.type_offer
        
        # Basculer entre SALE et RENTAL
        new_type = 'RENTAL' if current_type == 'SALE' else 'SALE'
        vehicle.type_offer = new_type
        
        # Réinitialiser l'état
        vehicle.state = 'AVAILABLE'
        
        # Réinitialiser les relations
        vehicle.owner = None
        vehicle.renter = None
        vehicle.rental_start_date = None
        vehicle.rental_end_date = None
        
        vehicle.save()
        return Response(self.get_serializer(vehicle).data)
