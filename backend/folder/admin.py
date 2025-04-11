from django.contrib import admin
from django.utils.html import format_html
from .models import Folder, File

class FileInline(admin.TabularInline):
    model = File
    extra = 1
    readonly_fields = ('uploaded_at', 'file_preview')
    fields = ('document_type', 'file', 'verification_notes', 'uploaded_at', 'file_preview')
    fk_name = 'folder'  # Liaison avec le folder, pas vehicle

    def file_preview(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">Voir le fichier</a>', obj.file.url)
        return "Pas de fichier"
    file_preview.short_description = "Aperçu"

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('client', 'vehicle', 'type_folder', 'status', 'creation_date')
    list_filter = ('type_folder', 'status')
    search_fields = ('client__username', 'vehicle__brand', 'vehicle__model')
    ordering = ('-creation_date',)
    inlines = [FileInline]

    def file_count(self, obj):
        return obj.files.count()
    file_count.short_description = "Nombre de fichiers"

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'uploaded_at')
    list_filter = ('document_type',)
    search_fields = ('user__username', 'vehicle__brand', 'verification_notes')
    readonly_fields = ('uploaded_at', 'file_preview')

    def file_preview(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">Voir le fichier</a>', obj.file.url)
        return "Pas de fichier"
    file_preview.short_description = "Aperçu"