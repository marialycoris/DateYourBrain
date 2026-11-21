import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0002_rename_user_id'),
        ('courses', '0002_normalize_course_fields'),
        ('reports', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='report',
            old_name='id',
            new_name='reportNUM',
        ),
        migrations.AlterField(
            model_name='report',
            name='reportNUM',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='report',
            name='user',
            field=models.ForeignKey(db_column='userID', on_delete=django.db.models.deletion.CASCADE, related_name='reports', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='report',
            name='course',
            field=models.ForeignKey(db_column='courseID', on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='courses.course'),
        ),
    ]
