from django.urls import path

from . import views

urlpatterns = [
    path('', views.ReportCreateView.as_view(), name='report-create'),
    path('admin/', views.ReportAdminListView.as_view(), name='report-admin-list'),
    path('admin/<int:pk>/', views.ReportAdminDetailView.as_view(), name='report-admin-detail'),
]