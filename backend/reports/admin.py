from django.contrib import admin

from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('course', 'issue_type', 'status', 'user', 'created_at')
    list_filter = ('status', 'issue_type')