from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from user.permissions import IsGestionnaireOrAdmin, IsOwnerOrStaff
from .models import Folder
from .serializers import FolderSerializer

# Create your views here.

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['type_folder', 'status']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwnerOrStaff()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['GESTIONNAIRE', 'ADMIN']:
            return Folder.objects.all()
        return Folder.objects.filter(client=user)
    
    def perform_create(self, serializer):
        serializer.save(client=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsGestionnaireOrAdmin])
    def change_status(self, request, pk=None):
        folder = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Folder.STATUS):
            folder.status = new_status
            folder.save()
            return Response(self.get_serializer(folder).data)
        return Response(
            {'error': 'Statut invalide'},
            status=status.HTTP_400_BAD_REQUEST
        )
