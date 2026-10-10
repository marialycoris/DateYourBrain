from django.urls import path

from . import views

urlpatterns = [
    path('', views.CourseCollectionView.as_view(), name='course-list-active'),
    path('all/', views.CourseAdminListView.as_view(), name='course-list-all'),
    path('<int:pk>/', views.CourseDetailView.as_view(), name='course-detail'),
]