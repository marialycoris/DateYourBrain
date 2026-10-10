from rest_framework import serializers

from .models import TrackerEntry


class TrackerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    courseId = serializers.IntegerField(source='course_id', read_only=True)
    userId = serializers.IntegerField(source='user_id', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = TrackerEntry
        fields = ['id', 'courseId', 'userId', 'status', 'notes', 'updatedAt']


class SwipeSerializer(serializers.Serializer):
    courseId = serializers.IntegerField()
    userId = serializers.IntegerField()
    direction = serializers.ChoiceField(choices=['left', 'right'])