from django.db import models

from accounts.models import User
from courses.models import Course


class SwipeLog(models.Model):
    class Direction(models.TextChoices):
        LEFT = 'Left', 'Left'
        RIGHT = 'Right', 'Right'

    SLNUM = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID', related_name='swipes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='courseID', related_name='swipes')
    direction = models.CharField(max_length=8, choices=Direction.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} {self.direction} {self.course.title}'


class TrackerEntry(models.Model):
    class Status(models.TextChoices):
        INTERESTED = 'Interested', 'Interested'
        ONGOING = 'Ongoing', 'Ongoing'
        COMPLETED = 'Completed', 'Completed'

    trackerID = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID', related_name='tracker_entries')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='courseID', related_name='tracker_entries')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.INTERESTED)
    notes = models.TextField(blank=True, default='')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(fields=['user', 'course'], name='uniq_tracker_user_course')
        ]

    def __str__(self):
        return f'{self.user.email} — {self.course.title} ({self.status})'
