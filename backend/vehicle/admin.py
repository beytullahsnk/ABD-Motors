from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'year', 'daily_rate', 'is_available')
    list_filter = ('fuel_type', 'transmission', 'is_available')
    search_fields = ('brand', 'model', 'description')
    ordering = ('-created_at',)
