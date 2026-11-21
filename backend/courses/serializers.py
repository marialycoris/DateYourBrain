from rest_framework import serializers

from .models import Course


class CourseSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='courseID', read_only=True)
    skills = serializers.SlugRelatedField(source='skill_rows', many=True, read_only=True, slug_field='skill')
    badges = serializers.SlugRelatedField(source='badge_rows', many=True, read_only=True, slug_field='badge')
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