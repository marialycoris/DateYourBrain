from rest_framework import generics

from accounts.permissions import IsAdmin
from .models import Report
from .serializers import ReportSerializer, ReportStatusSerializer


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportAdminListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin]
    queryset = Report.objects.select_related('course')


class ReportAdminDetailView(generics.UpdateAPIView):
    serializer_class = ReportStatusSerializer
    permission_classes = [IsAdmin]
    queryset = Report.objects.all()
    http_method_names = ['patch', 'head', 'options']