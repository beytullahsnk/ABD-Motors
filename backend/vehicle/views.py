from django.shortcuts import render
from rest_framework import viewsets, filters, status, permissions
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as django_filters
from .models import Vehicle
from .serializers import VehicleSerializer, VehicleDetailSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from user.permissions import IsGestionnaireOrAdmin
from user.models import User
from django.db import models
from django.utils import timezone

# Create your views here.

class VehicleFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='daily_rate', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='daily_rate', lookup_expr='lte')
    min_year = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    max_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')

    class Meta:
        model = Vehicle
        fields = {
            'brand': ['exact', 'icontains'],
            'model': ['exact', 'icontains'],
            'fuel_type': ['exact'],
            'transmission': ['exact'],
            'is_available': ['exact'],
            'year': ['exact'],
            'mileage': ['exact'],
        }

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = VehicleFilter
    search_fields = ['brand', 'model', 'description']
    ordering_fields = ['sale_price', 'rental_price', 'year', 'mileage', 'date_added']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VehicleDetailSerializer
        return VehicleSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'switch_type']:
            return [IsAuthenticated(), IsGestionnaireOrAdmin()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

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

    @action(detail=False, methods=['get'])
    def available(self, request):
        """Liste tous les véhicules disponibles à la location"""
        current_date = timezone.now().date()
        vehicles = self.queryset.filter(
            is_available=True
        ).exclude(
            rental_start_date__lte=current_date,
            rental_end_date__gte=current_date
        )
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reserve(self, request, pk=None):
        """Réserve un véhicule pour les dates spécifiées"""
        vehicle = self.get_object()
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not start_date or not end_date:
            return Response(
                {'error': 'Les dates de début et de fin sont requises'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not vehicle.is_available:
            return Response(
                {'error': 'Ce véhicule n\'est pas disponible'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier si les dates sont disponibles
        conflicting_reservations = Vehicle.objects.filter(
            id=vehicle.id,
            rental_start_date__lte=end_date,
            rental_end_date__gte=start_date
        ).exists()

        if conflicting_reservations:
            return Response(
                {'error': 'Le véhicule n\'est pas disponible pour ces dates'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mettre à jour le véhicule
        vehicle.renter = request.user
        vehicle.rental_start_date = start_date
        vehicle.rental_end_date = end_date
        vehicle.is_available = False
        vehicle.save()

        serializer = VehicleDetailSerializer(vehicle)
        return Response(serializer.data)
