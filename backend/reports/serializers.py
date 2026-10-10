from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    courseId = serializers.IntegerField(source='course_id')
    userId = serializers.IntegerField(source='user_id', read_only=True)
    issueType = serializers.CharField(source='issue_type')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'courseId', 'userId', 'issueType', 'comment', 'status', 'createdAt']


class ReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['status']