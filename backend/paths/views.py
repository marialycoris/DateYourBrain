from rest_framework import generics, permissions
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from .models import LearningPath
from .serializers import LearningPathSerializer


class PathCollectionView(generics.ListCreateAPIView):
    """GET: active learning paths for learners. POST (admin): create a path."""

    serializer_class = LearningPathSerializer

    def get_queryset(self):
        return LearningPath.objects.filter(status=LearningPath.Status.ACTIVE)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class PathAdminListView(generics.ListAPIView):
    """Admin: list every learning path, including inactive ones."""

    serializer_class = LearningPathSerializer
    permission_classes = [IsAdmin]
    queryset = LearningPath.objects.all()


class PathDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET: any learner. PATCH/DELETE: admin only. DELETE is a soft delete."""

    serializer_class = LearningPathSerializer
    queryset = LearningPath.objects.all()
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_permissions(self):
        if self.request.method in ('PATCH', 'DELETE'):
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.status = LearningPath.Status.INACTIVE
        instance.save(update_fields=['status', 'updated_at'])
        return Response(status=204)
