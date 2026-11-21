import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_rename_user_id'),
        ('courses', '0002_normalize_course_fields'),
        ('tracker', '0002_alter_trackerentry_status'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='swipelog',
            options={'ordering': ['-created_at']},
        ),
        migrations.RenameField(
            model_name='swipelog',
            old_name='id',
            new_name='SLNUM',
        ),
        migrations.RenameField(
            model_name='trackerentry',
            old_name='id',
            new_name='trackerID',
        ),
        migrations.AlterField(
            model_name='swipelog',
            name='SLNUM',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='trackerentry',
            name='trackerID',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='swipelog',
            name='direction',
            field=models.CharField(choices=[('Left', 'Left'), ('Right', 'Right')], max_length=8),
        ),
        migrations.AlterField(
            model_name='swipelog',
            name='user',
            field=models.ForeignKey(db_column='userID', on_delete=django.db.models.deletion.CASCADE, related_name='swipes', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='swipelog',
            name='course',
            field=models.ForeignKey(db_column='courseID', on_delete=django.db.models.deletion.CASCADE, related_name='swipes', to='courses.course'),
        ),
        migrations.AlterField(
            model_name='trackerentry',
            name='user',
            field=models.ForeignKey(db_column='userID', on_delete=django.db.models.deletion.CASCADE, related_name='tracker_entries', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='trackerentry',
            name='course',
            field=models.ForeignKey(db_column='courseID', on_delete=django.db.models.deletion.CASCADE, related_name='tracker_entries', to='courses.course'),
        ),
        migrations.AlterUniqueTogether(
            name='trackerentry',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='trackerentry',
            constraint=models.UniqueConstraint(fields=('user', 'course'), name='uniq_tracker_user_course'),
        ),
    ]
