from django.contrib import admin

from .models import LearningPath, LearningPathCourse


class LearningPathCourseInline(admin.TabularInline):
    model = LearningPathCourse
    extra = 0


@admin.register(LearningPath)
class LearningPathAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'updated_at')
    list_filter = ('status',)
    search_fields = ('title',)
    inlines = [LearningPathCourseInline]
