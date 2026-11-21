import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0002_normalize_course_fields'),
        ('paths', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='learningpath',
            old_name='id',
            new_name='pathID',
        ),
        migrations.RenameField(
            model_name='learningpathcourse',
            old_name='id',
            new_name='LPCNUM',
        ),
        migrations.AlterField(
            model_name='learningpath',
            name='pathID',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='learningpathcourse',
            name='LPCNUM',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='learningpathcourse',
            name='path',
            field=models.ForeignKey(db_column='pathID', on_delete=django.db.models.deletion.CASCADE, related_name='path_courses', to='paths.learningpath'),
        ),
        migrations.AlterField(
            model_name='learningpathcourse',
            name='course',
            field=models.ForeignKey(db_column='courseID', on_delete=django.db.models.deletion.CASCADE, related_name='learning_paths', to='courses.course'),
        ),
        migrations.AlterUniqueTogether(
            name='learningpathcourse',
            unique_together=set(),
        ),
        migrations.AddConstraint(
            model_name='learningpathcourse',
            constraint=models.UniqueConstraint(fields=('path', 'course'), name='uniq_learning_path_course'),
        ),
    ]
