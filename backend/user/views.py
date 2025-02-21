from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User
from .serializers import UserSerializer

# Create your views here.

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get', 'patch'])
    def me(self, request):
        try:
            if request.method == 'GET':
                serializer = self.get_serializer(request.user)
                return Response(serializer.data)
            elif request.method == 'PATCH':
                serializer = self.get_serializer(request.user, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
                return Response(
                    {
                        'detail': 'Données invalides',
                        'errors': serializer.errors
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {
                    'detail': str(e),
                    'message': 'Une erreur est survenue lors de la mise à jour du profil'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
