from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DossierViewSet

router = DefaultRouter()
router.register(r'', DossierViewSet, basename='dossiers')

urlpatterns = [
    path('', include(router.urls)),
] 