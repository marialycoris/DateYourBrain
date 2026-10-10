from django.db import models


class Course(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    title = models.CharField(max_length=200)
    outcome = models.CharField(max_length=200)
    description = models.TextField()
    issuer = models.CharField(max_length=200)
    duration_hours = models.PositiveIntegerField(default=0)
    skills = models.JSONField(default=list)
    badges = models.JSONField(default=list)
    course_link = models.URLField()
    verification_notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title