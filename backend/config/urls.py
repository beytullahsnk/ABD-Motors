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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import psycopg2
import datetime

def api_root(request):
    return JsonResponse({
        'auth': request.build_absolute_uri('/api/auth/'),
        'vehicles': request.build_absolute_uri('/api/vehicles/'),
        'folders': request.build_absolute_uri('/api/folders/'),
        'genia': request.build_absolute_uri('/api/genia/'),
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Check if the application is healthy:
    - Database is accessible
    - API server is running
    """
    status = {
        'status': 'ok',
        'timestamp': datetime.datetime.now().isoformat(),
        'services': {
            'api': 'up',
            'database': 'unknown'
        }
    }
    
    # Check database connection
    try:
        db_settings = settings.DATABASES['default']
        conn = psycopg2.connect(
            host=db_settings['HOST'],
            database=db_settings['NAME'],
            user=db_settings['USER'],
            password=db_settings['PASSWORD'],
            port=db_settings['PORT']
        )
        conn.close()
        status['services']['database'] = 'up'
    except Exception as e:
        status['services']['database'] = 'down'
        status['status'] = 'degraded'
        status['error'] = str(e)
    
    return JsonResponse(status)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('user.urls')),
    path('api/vehicles/', include('vehicle.urls')),
    path('api/folders/', include('folder.urls')),
    path('api/genia/', include('genia.urls')),
    path('health/', health_check, name='health_check'),
    # Rediriger la racine vers l'admin
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) \
  + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
