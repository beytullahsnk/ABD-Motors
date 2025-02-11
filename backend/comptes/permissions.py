from rest_framework import permissions

class IsGestionnaireOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['GESTIONNAIRE', 'ADMIN']

class IsOwnerOrStaff(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['GESTIONNAIRE', 'ADMIN']:
            return True
        return obj.client == request.user 