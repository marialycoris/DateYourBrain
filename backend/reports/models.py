from django.conf import settings
from django.db import models


class Report(models.Model):
    class IssueType(models.TextChoices):
        NO_LONGER_FREE = 'No longer free', 'No longer free'
        LINK_BROKEN = 'Link broken', 'Link broken'
        CERT_REQUIRES_PAYMENT = 'Certificate requires payment', 'Certificate requires payment'
        OTHER = 'Other', 'Other'

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        REVIEWED = 'reviewed', 'Reviewed'
        RESOLVED = 'resolved', 'Resolved'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports')
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='reports')
    issue_type = models.CharField(max_length=64, choices=IssueType.choices)
    comment = models.TextField(blank=True, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.course_id} — {self.issue_type}'