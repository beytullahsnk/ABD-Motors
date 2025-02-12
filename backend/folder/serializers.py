from rest_framework import serializers
from .models import Folder
from user.serializers import UserSerializer
from vehicle.serializers import VehicleSerializer
from vehicle.models import Vehicle

class FolderSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        write_only=True,
        source='vehicle'
    )

    class Meta:
        model = Folder
        fields = ['id', 'client', 'vehicle', 'vehicle_id', 'type_folder', 
                 'status', 'creation_date', 'modification_date']
        read_only_fields = ['client', 'creation_date', 'modification_date'] 