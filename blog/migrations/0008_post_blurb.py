# Generated by Django 3.1.1 on 2020-12-01 18:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0007_auto_20201201_0214'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='blurb',
            field=models.TextField(blank=True, max_length=100),
        ),
    ]
