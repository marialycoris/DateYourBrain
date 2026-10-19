"""
Root URLconf for the Date Your Brain API.

All endpoints live under /api/. The React frontend's API layer (src/lib/api.ts)
maps 1:1 to these routes.
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/', include('tracker.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/paths/', include('paths.urls')),
]