from django.db import models


class LearningPath(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title


class LearningPathCourse(models.Model):
    path = models.ForeignKey(LearningPath, on_delete=models.CASCADE, related_name='path_courses')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='learning_paths')
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('path', 'course')
        ordering = ['order']

    def __str__(self):
        return f'{self.path_id} #{self.order} -> {self.course_id}'
