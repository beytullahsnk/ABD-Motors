from django.db import migrations, models
import django.core.validators

class Migration(migrations.Migration):

    dependencies = [
        ('vehicle', '0004_alter_vehicle_mileage_alter_vehicle_year'),
    ]

    operations = [
        
        # Ajouter les champs qui existent dans la base de données mais pas dans le modèle
        migrations.AddField(
            model_name='vehicle',
            name='engine_size',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='fuel_type',
            field=models.CharField(blank=True, choices=[('ESSENCE', 'Essence'), ('DIESEL', 'Diesel'), ('HYBRIDE', 'Hybride'), ('ELECTRIQUE', 'Électrique')], max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='maintenance_book',
            field=models.BooleanField(blank=True, default=False, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='power',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='technical_control',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='vehicle',
            name='transmission',
            field=models.CharField(blank=True, choices=[('MANUELLE', 'Manuelle'), ('AUTOMATIQUE', 'Automatique')], max_length=20, null=True),
        ),
        
        # Nous ne supprimons plus ces champs car ils sont remplacés par des propriétés calculées
        # migrations.RemoveField(
        #     model_name='vehicle',
        #     name='created_at',
        # ),
        # migrations.RemoveField(
        #     model_name='vehicle',
        #     name='updated_at',
        # ),
        
        # S'assurer que la table est correctement nommée
        migrations.AlterModelTable(
            name='vehicle',
            table='vehicles',
        ),
        
        # Mettre à jour l'option ordering pour utiliser date_added au lieu de created_at
        migrations.AlterModelOptions(
            name='vehicle',
            options={'ordering': ['-date_added']},
        ),
    ] 