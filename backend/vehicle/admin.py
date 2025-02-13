from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'type_offer', 'state', 'date_added')
    list_filter = ('type_offer', 'state', 'brand')
    search_fields = ('brand', 'model')
