from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('folder', '0002_file'),
    ]

    operations = [
        # S'assurer que la table est correctement nommée
        migrations.AlterModelTable(
            name='file',
            table='files',
        ),
    ] 