from django.urls import path

from . import views

urlpatterns = [
    path('', views.PathCollectionView.as_view(), name='path-list-active'),
    path('all/', views.PathAdminListView.as_view(), name='path-list-all'),
    path('<int:pk>/', views.PathDetailView.as_view(), name='path-detail'),
]
