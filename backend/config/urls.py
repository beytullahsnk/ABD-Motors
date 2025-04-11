"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView
from django.http import JsonResponse
# from health_check.views import MainView

def api_root(request):
    return JsonResponse({
        'auth': request.build_absolute_uri('/api/auth/'),
        'vehicles': request.build_absolute_uri('/api/vehicles/'),
        'folders': request.build_absolute_uri('/api/folders/'),
        'genia': request.build_absolute_uri('/api/genia/'),
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('user.urls')),
    path('api/vehicles/', include('vehicle.urls')),
    path('api/folders/', include('folder.urls')),
    path('api/genia/', include('genia.urls')),
    # path('health/', MainView.as_view(), name='health_check'),  # Pour Lightsail
    # Rediriger la racine vers l'admin
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
