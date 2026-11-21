from django.db import models


class Course(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    courseID = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=200)
    outcome = models.CharField(max_length=200)
    description = models.TextField()
    issuer = models.CharField(max_length=200)
    duration_hours = models.PositiveIntegerField(default=0)
    course_link = models.URLField()
    verification_notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class CourseSkill(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='courseID', related_name='skill_rows')
    skill = models.CharField(max_length=200)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['course', 'skill'], name='uniq_course_skill')
        ]

    def __str__(self):
        return f'{self.course.title}: {self.skill}'


class CourseBadge(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, db_column='courseID', related_name='badge_rows')
    badge = models.CharField(max_length=200)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['course', 'badge'], name='uniq_course_badge')
        ]

    def __str__(self):
        return f'{self.course.title}: {self.badge}'
