# Generated by Django 4.2.19 on 2025-02-13 15:35

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('folder', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file_type', models.CharField(choices=[('ID_CARD', "Carte d'identité"), ('DRIVER_LICENSE', 'Permis de conduire'), ('PROOF_ADDRESS', 'Justificatif de domicile'), ('INCOME_PROOF', 'Justificatif de revenus'), ('INSURANCE', "Attestation d'assurance"), ('OTHER', 'Autre document')], max_length=20)),
                ('file', models.FileField(upload_to='folder_files/%Y/%m/%d/')),
                ('description', models.TextField(blank=True)),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('folder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='folder.folder')),
            ],
            options={
                'db_table': 'files',
                'ordering': ['-uploaded_at'],
            },
        ),
    ]
