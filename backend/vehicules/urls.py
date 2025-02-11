from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VehiculeViewSet

router = DefaultRouter()
router.register(r'', VehiculeViewSet, basename='vehicules')

urlpatterns = [
    path('', include(router.urls)),
] 