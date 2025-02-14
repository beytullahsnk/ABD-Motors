from rest_framework import serializers
from .models import Folder, File
from user.serializers import UserSerializer
from vehicle.serializers import VehicleSerializer
from vehicle.models import Vehicle

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file_type', 'file', 'uploaded_at', 'description']

class FolderSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    vehicle = VehicleSerializer(read_only=True)
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        write_only=True,
        source='vehicle'
    )
    files = FileSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = ['id', 'client', 'vehicle', 'vehicle_id', 'type_folder', 
                 'status', 'creation_date', 'modification_date', 'files']
        read_only_fields = ['client', 'creation_date', 'modification_date'] 