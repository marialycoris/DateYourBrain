"""
Seed demo data mirroring the frontend mock: two accounts, seven courses,
tracker/swipe activity for the learner, and a couple of issue reports.

Idempotent — safe to re-run.
"""
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Role, User
from courses.models import Course
from paths.models import LearningPath
from reports.models import Report
from tracker.models import SwipeLog, TrackerEntry

DEMO_PASSWORD = 'password123'

DEMO_USER_EMAIL = 'grad@example.com'
DEMO_ADMIN_EMAIL = 'admin@dateyourbrain.app'

COURSES = [
    {
        'title': 'Google IT Support Professional Certificate',
        'outcome': 'Land help-desk and IT support roles, no degree needed.',
        'description': (
            'A five-course program covering troubleshooting, networking, OS, system '
            'administration, and security fundamentals. Financial aid removes the '
            'enrollment fee entirely, and the certificate is issued once every graded '
            'item is passed.'
        ),
        'issuer': 'Google (via Coursera)',
        'duration_hours': 140,
        'skills': ['Networking', 'Troubleshooting', 'System Admin'],
        'badges': ['Industry cert', 'Free cert'],
        'course_link': 'https://coursera.org/professional-certificates/google-it-support',
        'verification_notes': 'Apply for financial aid before enrolling — grants 100% off audit-to-certify.',
    },
    {
        'title': 'HubSpot Content Marketing Certification',
        'outcome': 'Prove you can plan, write, and measure content that converts.',
        'description': (
            'Self-paced lessons on content strategy, SEO basics, and distribution. Exam and '
            'certificate are free with no paywall — HubSpot Academy monetizes through its CRM, '
            'not its courses.'
        ),
        'issuer': 'HubSpot Academy',
        'duration_hours': 6,
        'skills': ['Content Strategy', 'SEO', 'Copywriting'],
        'badges': ['Industry cert', 'Free cert'],
        'course_link': 'https://academy.hubspot.com/courses/content-marketing',
        'verification_notes': 'Confirmed: exam retake is unlimited and free.',
    },
    {
        'title': 'freeCodeCamp Responsive Web Design',
        'outcome': 'Ship real layouts with HTML and CSS, backed by a verifiable cert.',
        'description': (
            'Project-based curriculum ending in five certifying projects. freeCodeCamp is a '
            'registered nonprofit — the certificate has always been free and publicly verifiable '
            'by URL.'
        ),
        'issuer': 'freeCodeCamp',
        'duration_hours': 60,
        'skills': ['HTML', 'CSS', 'Responsive Design'],
        'badges': ['Free cert'],
        'course_link': 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
        'verification_notes': 'Nonprofit-run, no institutional accreditation — flagged as such on the card.',
    },
    {
        'title': 'Meta Social Media Marketing Certificate',
        'outcome': 'Get job-ready for entry-level social and marketing roles.',
        'description': (
            'Seven courses on social strategy, paid ad basics, and analytics. Requires Coursera '
            'financial aid approval to remove the fee — approval takes 2–15 days, so apply early.'
        ),
        'issuer': 'Meta (via Coursera)',
        'duration_hours': 120,
        'skills': ['Social Media', 'Analytics', 'Paid Ads'],
        'badges': ['Industry cert', 'Free cert'],
        'course_link': 'https://coursera.org/professional-certificates/facebook-social-media-marketing',
        'verification_notes': 'Financial aid required — not free by default at checkout.',
    },
    {
        'title': 'IBM Data Fundamentals Badge',
        'outcome': 'Build a foundation in data literacy employers can verify instantly.',
        'description': (
            'A short badge program on data concepts, analysis basics, and AI ethics. Digital badge '
            'is issued via Credly on completion, free throughout with no financial-aid step.'
        ),
        'issuer': 'IBM SkillsBuild',
        'duration_hours': 10,
        'skills': ['Data Literacy', 'AI Ethics'],
        'badges': ['Industry cert', 'Free cert'],
        'course_link': 'https://skillsbuild.org/',
        'verification_notes': 'Badge is independently verifiable on Credly — no login wall.',
    },
    {
        'title': 'Alison Diploma in Customer Service',
        'outcome': 'Show frontline-ready customer service skills fast.',
        'description': (
            'Widely advertised as free, but the physical/PDF diploma requires a paid upgrade. The '
            'digital certificate itself is free to download once — flagged here so learners know '
            'what to expect.'
        ),
        'issuer': 'Alison',
        'duration_hours': 8,
        'skills': ['Customer Service', 'Communication'],
        'badges': ['Free cert'],
        'course_link': 'https://alison.com/',
        'verification_notes': 'Digital cert is free; PDF/physical copy is a paid upsell. Disclosed on course detail.',
    },
    {
        'title': 'Google Data Analytics Certificate',
        'outcome': 'Move into entry-level data analyst roles with a portfolio in hand.',
        'description': (
            'Eight-course program covering spreadsheets, SQL, Tableau, and R. Ends in a capstone '
            'project reviewable by employers. Financial aid removes cost entirely.'
        ),
        'issuer': 'Google (via Coursera)',
        'duration_hours': 180,
        'skills': ['SQL', 'Tableau', 'R', 'Data Cleaning'],
        'badges': ['Industry cert', 'Free cert'],
        'course_link': 'https://coursera.org/professional-certificates/google-data-analytics',
        'verification_notes': 'Apply for financial aid at enrollment — do not pay upfront.',
    },
]


LEARNING_PATHS = [
    {
        'title': 'Launch Your Tech Career',
        'description': (
            'A guided sequence from absolute beginner to job-ready. Take the courses '
            'in order — each one builds on the last, ending in a certificate employers '
            'can verify.'
        ),
        'course_titles': [
            'Google IT Support Professional Certificate',
            'freeCodeCamp Responsive Web Design',
            'IBM Data Fundamentals Badge',
            'Google Data Analytics Certificate',
            'Meta Social Media Marketing Certificate',
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed demo data (users, courses, tracker activity, reports).'

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            email=DEMO_ADMIN_EMAIL,
            defaults={
                'role': Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin.set_password(DEMO_PASSWORD)
        admin.save()

        learner, _ = User.objects.get_or_create(
            email=DEMO_USER_EMAIL,
            defaults={'role': Role.USER},
        )
        learner.set_password(DEMO_PASSWORD)
        learner.save()
        self.stdout.write(f'Accounts ready: {DEMO_ADMIN_EMAIL} / {DEMO_USER_EMAIL} (pw: {DEMO_PASSWORD})')

        created = 0
        for data in COURSES:
            defaults = {**data, 'status': Course.Status.ACTIVE}
            _, was_created = Course.objects.get_or_create(title=data['title'], defaults=defaults)
            created += int(was_created)
        self.stdout.write(f'Courses: {created} created, {len(COURSES) - created} already present.')

        courses = list(Course.objects.all())

        created_paths = 0
        for data in LEARNING_PATHS:
            path, was_created = LearningPath.objects.get_or_create(
                title=data['title'],
                defaults={'description': data['description'], 'status': LearningPath.Status.ACTIVE},
            )
            created_paths += int(was_created)
            if not path.path_courses.exists():
                for index, title in enumerate(data['course_titles']):
                    course = next((c for c in courses if c.title == title), None)
                    if course:
                        path.path_courses.create(course=course, order=index)
        self.stdout.write(f'Learning paths: {created_paths} created.')

        tracker_state = {
            'Google IT Support Professional Certificate': TrackerEntry.Status.ONGOING,
            'HubSpot Content Marketing Certification': TrackerEntry.Status.COMPLETED,
            'IBM Data Fundamentals Badge': TrackerEntry.Status.COMPLETED,
            'freeCodeCamp Responsive Web Design': TrackerEntry.Status.ONGOING,
        }
        notes = {
            'Google IT Support Professional Certificate': 'On module 3 — networking. Aiming to finish before September.',
            'IBM Data Fundamentals Badge': 'Badge visible on Credly at my profile URL.',
        }
        created_tracker = 0
        for course in courses:
            if course.title in tracker_state:
                entry, was_created = TrackerEntry.objects.get_or_create(
                    user=learner,
                    course=course,
                    defaults={
                        'status': tracker_state[course.title],
                        'notes': notes.get(course.title, ''),
                    },
                )
                created_tracker += int(was_created)
        self.stdout.write(f'Tracker entries: {created_tracker} created.')

        if not SwipeLog.objects.exists():
            for course in courses:
                SwipeLog.objects.create(user=learner, course=course, direction='right')
            SwipeLog.objects.create(user=learner, course=courses[0], direction='left')
            self.stdout.write('Swipe log: seeded.')

        if not Report.objects.exists():
            meta = next(c for c in courses if c.title == 'Meta Social Media Marketing Certificate')
            alison = next(c for c in courses if c.title == 'Alison Diploma in Customer Service')
            Report.objects.create(
                user=learner,
                course=meta,
                issue_type=Report.IssueType.CERT_REQUIRES_PAYMENT,
                comment='Financial aid was denied this term — is this still classifiable as free?',
                status=Report.Status.OPEN,
            )
            Report.objects.create(
                user=learner,
                course=alison,
                issue_type=Report.IssueType.CERT_REQUIRES_PAYMENT,
                comment='Upgrade prompt pushed hard for the PDF diploma before showing the free cert.',
                status=Report.Status.REVIEWED,
            )
            Report.objects.create(
                user=learner,
                course=meta,
                issue_type=Report.IssueType.OTHER,
                comment='Syllabus mentions a discount code that no longer works.',
                status=Report.Status.RESOLVED,
            )
            self.stdout.write('Reports: 3 seeded.')

        self.stdout.write(self.style.SUCCESS('Seed complete.'))