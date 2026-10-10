from django.urls import path

from . import views

urlpatterns = [
    path('swipes/', views.SwipeView.as_view(), name='swipe-log'),
    path('tracker/', views.TrackerListCreateView.as_view(), name='tracker-list'),
    path('tracker/<int:pk>/', views.TrackerDetailView.as_view(), name='tracker-detail'),
]