from django.contrib import admin
from .models import Folder, File

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('user', 'vehicle', 'document_type', 'uploaded_at', 'is_verified')
    list_filter = ('document_type', 'is_verified')
    search_fields = ('user__email', 'vehicle__brand', 'vehicle__model')
    ordering = ('-uploaded_at',)

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('client', 'vehicle', 'type_folder', 'status', 'creation_date')
    list_filter = ('type_folder', 'status')
    search_fields = ('client__email', 'vehicle__brand', 'vehicle__model')
    ordering = ('-creation_date',)