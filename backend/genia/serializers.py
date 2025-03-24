from rest_framework import serializers
from .models import Document, AIInteraction, Folder


class FolderSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le modèle Folder."""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    document_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'name', 'description', 's3_prefix',
            'created_by', 'created_by_username', 'created_at',
            'document_count'
        ]
        read_only_fields = ['created_by', 'created_at', 'document_count']
    
    def get_document_count(self, obj):
        return obj.documents.count()


class DocumentSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le modèle Document."""
    
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    folder_name = serializers.CharField(source='folder.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'document_type', 'document_type_display',
            'uploaded_by', 'uploaded_by_username', 'uploaded_at', 'content_text',
            'folder', 'folder_name'
        ]
        read_only_fields = ['uploaded_by', 'uploaded_at', 'content_text']


class AIInteractionSerializer(serializers.ModelSerializer):
    """Sérialiseur pour le modèle AIInteraction."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = AIInteraction
        fields = [
            'id', 'user', 'username', 'query', 'response',
            'documents', 'created_at'
        ]
        read_only_fields = ['user', 'created_at'] 