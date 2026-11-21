from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user',
            old_name='id',
            new_name='userID',
        ),
        migrations.AlterField(
            model_name='user',
            name='userID',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]
