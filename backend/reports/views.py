from django.db import connection
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from .models import Report
from .serializers import ReportSerializer, ReportStatusSerializer


class ReportCreateView(generics.CreateAPIView):
    serializer_class = ReportSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReportAdminListView(generics.ListAPIView):
    serializer_class = ReportSerializer
    permission_classes = [IsAdmin]
    queryset = Report.objects.select_related('course')


class ReportAdminDetailView(generics.UpdateAPIView):
    serializer_class = ReportStatusSerializer
    permission_classes = [IsAdmin]
    queryset = Report.objects.all()
    http_method_names = ['patch', 'head', 'options']


ISSUE_TYPES = [
    'No longer free',
    'Link broken',
    'Certificate requires payment',
    'Other',
]

COLUMN_TO_ISSUE_TYPE = {
    'no_longer_free': 'No longer free',
    'link_broken': 'Link broken',
    'cert_requires_payment': 'Certificate requires payment',
    'other_reports': 'Other',
}


def callproc_rows(sp_name: str, args=None) -> list[dict]:
    with connection.cursor() as cursor:
        cursor.callproc(sp_name, args or [])
        columns = [c[0] for c in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


class SummaryView(APIView):
    """GET /api/analytics/summary/ — built entirely from stored procedures."""

    permission_classes = [IsAdmin]

    def get(self, request):
        totals = callproc_rows('sp_dashboard_totals')
        metrics = callproc_rows('sp_course_metrics')
        report_counts = callproc_rows('sp_report_counts')

        totals = totals[0] if totals else {}

        course_metrics = [
            {
                'courseId': str(row['course_id']),
                'title': row['title'],
                'interested': row['interested'],
                'inProgress': row['in_progress'],
                'completed': row['completed'],
                'completionRate': float(row['completion_rate'] or 0),
            }
            for row in metrics
        ]

        report_counts_payload = []
        for row in report_counts:
            by_type = {t: 0 for t in ISSUE_TYPES}
            for column, issue_type in COLUMN_TO_ISSUE_TYPE.items():
                by_type[issue_type] = int(row[column] or 0)
            report_counts_payload.append(
                {
                    'courseId': str(row['course_id']),
                    'title': row['title'],
                    'total': row['total'],
                    'byType': by_type,
                }
            )

        return Response(
            {
                'totalUsers': totals.get('total_users', 0),
                'activeUsers30d': totals.get('active_users_30d', 0),
                'totalSwipes': totals.get('total_swipes', 0),
                'avgSwipesPerUser': float(totals.get('avg_swipes_per_user', 0) or 0),
                'courseMetrics': course_metrics,
                'reportCounts': report_counts_payload,
            }
        )