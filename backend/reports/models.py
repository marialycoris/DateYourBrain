from django.db import models

from accounts.models import User
from courses.models import Course


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

    reportNUM = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userID', related_name='reports')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='courseID', related_name='reports')
    issue_type = models.CharField(max_length=64, choices=IssueType.choices)
    comment = models.TextField(blank=True, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.issue_type} — {self.course.title}'
