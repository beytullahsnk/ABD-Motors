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
from django.conf import settings
import boto3

# Create your views here.

class VehicleFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='rental_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='rental_price', lookup_expr='lte')
    min_year = django_filters.NumberFilter(field_name='year', lookup_expr='gte')
    max_year = django_filters.NumberFilter(field_name='year', lookup_expr='lte')
    min_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='gte')
    max_mileage = django_filters.NumberFilter(field_name='mileage', lookup_expr='lte')

    class Meta:
        model = Vehicle
        fields = {
            'brand': ['exact', 'icontains'],
            'model': ['exact', 'icontains'],
            'type_offer': ['exact'],
            'state': ['exact'],
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

    @action(detail=True, methods=['get'])
    def check_image(self, request, pk=None):
        vehicle = self.get_object()
        if not vehicle.image:
            return Response({
                'status': 'error',
                'message': 'Pas d\'image pour ce véhicule'
            })

        # Vérifier si l'image existe dans S3
        if hasattr(settings, 'USE_S3') and settings.USE_S3:
            try:
                s3 = boto3.client('s3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_S3_REGION_NAME
                )
                
                # Construire le chemin S3
                s3_path = f"media/vehicles/{vehicle.image.name.split('/')[-1]}"
                
                try:
                    s3.head_object(Bucket=settings.AWS_STORAGE_BUCKET_NAME, Key=s3_path)
                    exists_in_s3 = True
                except Exception as e:
                    exists_in_s3 = False
                    print(f"Erreur de vérification S3: {str(e)}")

                return Response({
                    'status': 'success',
                    'image_name': vehicle.image.name,
                    'image_url': vehicle.image.url,
                    'exists_in_s3': exists_in_s3,
                    's3_path': s3_path if exists_in_s3 else None
                })
            except Exception as e:
                print(f"Erreur S3: {str(e)}")
                return Response({
                    'status': 'warning',
                    'message': f"Erreur lors de la vérification S3: {str(e)}",
                    'image_name': vehicle.image.name,
                    'image_url': vehicle.image.url
                })
        
        return Response({
            'status': 'success',
            'image_name': vehicle.image.name,
            'image_url': vehicle.image.url,
            'storage': 'local'
        })
