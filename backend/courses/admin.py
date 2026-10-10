from django.contrib import admin

from .models import Course


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'issuer', 'status', 'duration_hours', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title', 'issuer')