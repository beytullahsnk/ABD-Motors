from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Utilisateur

class UtilisateurAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'telephone', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Informations supplémentaires', {'fields': ('role', 'telephone', 'adresse')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations supplémentaires', {'fields': ('role', 'telephone', 'adresse')}),
    )
    search_fields = ('username', 'email', 'telephone')
    ordering = ('username',)

admin.site.register(Utilisateur, UtilisateurAdmin)
