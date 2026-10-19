from rest_framework import serializers

from .models import TrackerEntry


class TrackerSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    # Strings to match Course.id (serialized as CharField) — the frontend joins
    # tracker entries to courses with strict equality on these ids.
    courseId = serializers.CharField(source='course_id', read_only=True)
    userId = serializers.CharField(source='user_id', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = TrackerEntry
        fields = ['id', 'courseId', 'userId', 'status', 'notes', 'updatedAt']

    def update(self, instance, validated_data):
        # Completed is terminal: status may never change out of it (notes still can).
        new_status = validated_data.get('status')
        if (
            new_status is not None
            and new_status != instance.status
            and instance.status == TrackerEntry.Status.COMPLETED
        ):
            raise serializers.ValidationError(
                {'status': 'A course marked Completed cannot change status.'}
            )
        return super().update(instance, validated_data)


class SwipeSerializer(serializers.Serializer):
    courseId = serializers.IntegerField()
    userId = serializers.IntegerField()
    direction = serializers.ChoiceField(choices=['left', 'right'])