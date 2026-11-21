import json

from django.db import migrations, models
import django.db.models.deletion


def _as_values(value):
    if not value:
        return []
    if isinstance(value, (list, tuple)):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return []
        try:
            parsed = json.loads(text)
        except ValueError:
            return [text]
        if isinstance(parsed, (list, tuple)):
            return [str(item).strip() for item in parsed if str(item).strip()]
        return [str(parsed).strip()] if str(parsed).strip() else []
    return [str(value).strip()] if str(value).strip() else []


def normalize_skill_badge_rows(apps, schema_editor):
    Course = apps.get_model('courses', 'Course')
    CourseSkill = apps.get_model('courses', 'CourseSkill')
    CourseBadge = apps.get_model('courses', 'CourseBadge')

    for course in Course.objects.all():
        for skill in _as_values(course.skills):
            CourseSkill.objects.get_or_create(course=course, skill=skill)
        for badge in _as_values(course.badges):
            CourseBadge.objects.get_or_create(course=course, badge=badge)


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='course',
            old_name='id',
            new_name='courseID',
        ),
        migrations.AlterField(
            model_name='course',
            name='courseID',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.CreateModel(
            name='CourseSkill',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('skill', models.CharField(max_length=200)),
                ('course', models.ForeignKey(db_column='courseID', on_delete=django.db.models.deletion.CASCADE, related_name='skill_rows', to='courses.course')),
            ],
        ),
        migrations.CreateModel(
            name='CourseBadge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('badge', models.CharField(max_length=200)),
                ('course', models.ForeignKey(db_column='courseID', on_delete=django.db.models.deletion.CASCADE, related_name='badge_rows', to='courses.course')),
            ],
        ),
        migrations.RunPython(normalize_skill_badge_rows, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name='course',
            name='skills',
        ),
        migrations.RemoveField(
            model_name='course',
            name='badges',
        ),
        migrations.AddConstraint(
            model_name='courseskill',
            constraint=models.UniqueConstraint(fields=('course', 'skill'), name='uniq_course_skill'),
        ),
        migrations.AddConstraint(
            model_name='coursebadge',
            constraint=models.UniqueConstraint(fields=('course', 'badge'), name='uniq_course_badge'),
        ),
    ]
