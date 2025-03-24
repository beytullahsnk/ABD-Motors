from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, FolderViewSet, QueryView, AIInteractionViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'interactions', AIInteractionViewSet, basename='interactions')

urlpatterns = [
    path('', include(router.urls)),
    path('query/', QueryView.as_view(), name='query'),
    path('documents/list_s3_documents/', DocumentViewSet.as_view({'get': 'list_s3_documents'}), name='list_s3_documents'),
    path('documents/import_from_s3/', DocumentViewSet.as_view({'post': 'import_from_s3'}), name='import_from_s3'),
] 