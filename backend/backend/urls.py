# from django.contrib import admin
# from django.urls import path,include

# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/', include('api.urls')),
# ]

# if settings.DEBUG:
#     urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

# ✅ Simple root endpoint to confirm the backend is running
def home(request):
    return JsonResponse({
        "message": "QuickAid API is running ✅",
        "status": "OK",
        "version": "1.0.0",
    })

urlpatterns = [
    path('', home, name='home'),  # Root endpoint for "/"
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),  # All API routes
]

# ✅ Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
