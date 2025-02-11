from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from comptes.permissions import IsGestionnaireOrAdmin, IsOwnerOrStaff
from .models import Dossier
from .serializers import DossierSerializer

# Create your views here.

class DossierViewSet(viewsets.ModelViewSet):
    serializer_class = DossierSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type_dossier', 'statut']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrStaff()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['GESTIONNAIRE', 'ADMIN']:
            return Dossier.objects.all()
        return Dossier.objects.filter(client=user)
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsGestionnaireOrAdmin])
    def change_status(self, request, pk=None):
        dossier = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Dossier.STATUTS):
            dossier.statut = new_status
            dossier.save()
            return Response(self.get_serializer(dossier).data)
        return Response(
            {'error': 'Statut invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )
