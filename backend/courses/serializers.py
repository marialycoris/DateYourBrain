from rest_framework import serializers

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    durationHours = serializers.IntegerField(source='duration_hours')
    courseLink = serializers.URLField(source='course_link')
    verificationNotes = serializers.CharField(source='verification_notes', required=False, allow_blank=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Course
        fields = [
            'id',
            'title',
            'outcome',
            'description',
            'issuer',
            'durationHours',
            'skills',
            'badges',
            'courseLink',
            'verificationNotes',
            'status',
            'createdAt',
            'updatedAt',
        ]