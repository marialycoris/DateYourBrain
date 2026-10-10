from django.db import connection
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TrackerEntry
from .serializers import SwipeSerializer, TrackerSerializer


class SwipeView(APIView):
    """Log a swipe. Direction 'right' also creates an 'Interested' tracker entry.

    The whole insert is delegated to the MySQL stored procedure `sp_log_swipe`
    so the database owns the transaction + dedupe logic.
    """

    def post(self, request):
        serializer = SwipeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with connection.cursor() as cursor:
            cursor.callproc(
                'sp_log_swipe',
                [data['userId'], data['courseId'], data['direction']],
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class TrackerListCreateView(generics.ListAPIView):
    serializer_class = TrackerSerializer

    def get_queryset(self):
        return TrackerEntry.objects.filter(user=self.request.user).select_related('course')


class TrackerDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = TrackerSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return TrackerEntry.objects.filter(user=self.request.user)