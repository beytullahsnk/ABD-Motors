from rest_framework import serializers
from .models import Folder, File
from user.serializers import UserSerializer
from vehicle.serializers import VehicleSerializer
from vehicle.models import Vehicle

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = '__all__'
        read_only_fields = ('folder',)

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
        fields = '__all__'
        read_only_fields = ('client',) 