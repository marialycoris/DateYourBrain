from django.conf import settings
from django.db import models


class SwipeLog(models.Model):
    class Direction(models.TextChoices):
        LEFT = 'left', 'Left'
        RIGHT = 'right', 'Right'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='swipes')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='swipes')
    direction = models.CharField(max_length=8, choices=Direction.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user_id} {self.direction} {self.course_id}'


class TrackerEntry(models.Model):
    class Status(models.TextChoices):
        INTERESTED = 'Interested', 'Interested'
        IN_PROGRESS = 'In Progress', 'In Progress'
        COMPLETED = 'Completed', 'Completed'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tracker_entries')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='tracker_entries')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.INTERESTED)
    notes = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'course')
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.user_id} -> {self.course_id} ({self.status})'