from rest_framework import serializers

from courses.models import Course
from courses.serializers import CourseSerializer

from .models import LearningPath


class LearningPathSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    courseIds = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), source='courses', many=True, write_only=True
    )
    courses = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = LearningPath
        fields = [
            'id',
            'title',
            'description',
            'status',
            'courseIds',
            'courses',
            'createdAt',
            'updatedAt',
        ]

    def get_courses(self, obj) -> list:
        ordered = [pc.course for pc in obj.path_courses.select_related('course')]
        return CourseSerializer(ordered, many=True).data

    def validate_courseIds(self, courses):
        if not courses:
            raise serializers.ValidationError('A learning path needs at least one course.')
        seen = set()
        unique = []
        for course in courses:
            if course.pk not in seen:
                seen.add(course.pk)
                unique.append(course)
        return unique

    def create(self, validated_data):
        courses = validated_data.pop('courses', [])
        path = LearningPath.objects.create(**validated_data)
        self._sync_courses(path, courses)
        return path

    def update(self, instance, validated_data):
        courses = validated_data.pop('courses', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if courses is not None:
            self._sync_courses(instance, courses)
        return instance

    @staticmethod
    def _sync_courses(path, courses):
        path.path_courses.all().delete()
        for index, course in enumerate(courses):
            path.path_courses.create(course=course, order=index)
