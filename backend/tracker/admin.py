from django.contrib import admin

from .models import SwipeLog, TrackerEntry


@admin.register(TrackerEntry)
class TrackerEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'status', 'updated_at')
    list_filter = ('status',)


@admin.register(SwipeLog)
class SwipeLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'direction', 'created_at')
    list_filter = ('direction',)