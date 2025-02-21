from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ('brand', 'model', 'type_offer', 'state', 'date_added', 'get_image_url')
    list_filter = ('type_offer', 'state', 'brand')
    search_fields = ('brand', 'model')

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return "Pas d'image"
    get_image_url.short_description = "URL de l'image"
