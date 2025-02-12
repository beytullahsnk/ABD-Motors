from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'year', 'type_offer', 'state', 'sale_price', 'rental_price')
    list_filter = ('type_offer', 'state', 'brand')
    search_fields = ('brand', 'model', 'description')
    ordering = ('-date_added',)
