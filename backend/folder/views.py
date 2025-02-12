from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from user.permissions import IsGestionnaireOrAdmin, IsOwnerOrStaff
from .models import Folder, File
from .serializers import FolderSerializer, FileSerializer
from rest_framework.parsers import MultiPartParser, FormParser


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

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAuthenticated, IsOwnerOrStaff]

    def get_queryset(self):
        return File.objects.filter(folder_id=self.kwargs['folder_pk'])

    def perform_create(self, serializer):
        folder = Folder.objects.get(id=self.kwargs['folder_pk'])
        if not IsOwnerOrStaff().has_object_permission(self.request, self, folder):
            raise PermissionDenied()
        serializer.save(folder=folder)

    def perform_update(self, serializer):
        if not IsOwnerOrStaff().has_object_permission(self.request, self, serializer.instance.folder):
            raise PermissionDenied()
        serializer.save()
