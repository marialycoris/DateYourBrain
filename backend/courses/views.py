from rest_framework import generics, permissions
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from .models import Course
from .serializers import CourseSerializer


class CourseCollectionView(generics.ListCreateAPIView):
    """GET: active courses for the swipe deck. POST (admin): create a course."""

    serializer_class = CourseSerializer

    def get_queryset(self):
        qs = Course.objects.filter(status=Course.Status.ACTIVE)
        exclude_ids = []
        for chunk in self.request.query_params.getlist('exclude'):
            exclude_ids.extend(str(chunk).split(','))
        ids = [int(i) for i in exclude_ids if str(i).isdigit()]
        if ids:
            qs = qs.exclude(pk__in=ids)
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class CourseAdminListView(generics.ListAPIView):
    """Admin: list every course, including inactive ones."""

    serializer_class = CourseSerializer
    permission_classes = [IsAdmin]
    queryset = Course.objects.all()


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET: any learner. PATCH/DELETE: admin only. DELETE is a soft delete."""

    serializer_class = CourseSerializer
    queryset = Course.objects.all()
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in ('PATCH', 'DELETE'):
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = Course.Status.INACTIVE
        instance.save(update_fields=['status', 'updated_at'])
        return Response(status=204)