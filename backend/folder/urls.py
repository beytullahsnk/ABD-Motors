from django.urls import path, include
from rest_framework_nested import routers
from .views import FolderViewSet, FileViewSet

router = routers.DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')

folders_router = routers.NestedDefaultRouter(router, r'folders', lookup='folder')
folders_router.register(r'files', FileViewSet, basename='folder-files')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(folders_router.urls)),
]