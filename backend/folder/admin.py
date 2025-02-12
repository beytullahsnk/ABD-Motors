from django.contrib import admin
from .models import Folder

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('client', 'vehicle', 'type_folder', 'status', 'creation_date')
    list_filter = ('type_folder', 'status')
    search_fields = ('client__username', 'vehicle__brand', 'vehicle__model')
    ordering = ('-creation_date',)
