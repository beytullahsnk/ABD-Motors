from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'year', 'mileage', 'daily_rate',
            'fuel_type', 'transmission', 'seats', 'description', 'image',
            'is_available', 'has_insurance', 'has_technical_control',
            'has_maintenance', 'has_assistance', 'rental_start_date',
            'rental_end_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class VehicleDetailSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    renter_name = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand', 'model', 'year', 'mileage', 'daily_rate',
            'fuel_type', 'transmission', 'seats', 'description', 'image',
            'is_available', 'has_insurance', 'has_technical_control',
            'has_maintenance', 'has_assistance', 'owner', 'owner_name',
            'renter', 'renter_name', 'rental_start_date', 'rental_end_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}" if obj.owner else None

    def get_renter_name(self, obj):
        return f"{obj.renter.first_name} {obj.renter.last_name}" if obj.renter else None 