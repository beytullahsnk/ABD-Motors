from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('folder', '0003_auto_match_database_schema'),
    ]

    operations = [
        # Mise à jour des options de Meta pour File
        migrations.AlterModelOptions(
            name='file',
            options={'managed': False, 'ordering': ['-uploaded_at']},
        ),
        
        # Retire la relation user du modèle File car la colonne n'existe pas dans la base de données
        migrations.RemoveField(
            model_name='file',
            name='user',
        ),
    ] 