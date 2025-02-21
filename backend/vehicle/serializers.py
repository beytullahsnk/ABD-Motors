from rest_framework import serializers
from .models import Vehicle
from django.conf import settings

class VehicleSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = ['id', 'brand', 'model', 'year', 'mileage', 'sale_price', 
                 'rental_price', 'type_offer', 'state', 'description', 'image', 
                 'image_url', 'has_insurance', 'has_maintenance', 'date_added']
        read_only_fields = ('owner', 'renter')

    def get_image_url(self, obj):
        if obj.image:
            # Récupérer le nom du fichier sans le chemin
            image_name = obj.image.name
            if '/' in image_name:
                image_name = image_name.split('/')[-1]
            
            # Construire l'URL S3 complète
            s3_url = f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/media/vehicles/{image_name}"
            
            # Log pour déboguer
            print("Image details:")
            print(f"Original name: {obj.image.name}")
            print(f"S3 URL: {s3_url}")
            
            return s3_url
        return None 