# Generated by Django 3.1.1 on 2020-12-01 10:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0006_auto_20201201_0211'),
        ('polls', '0005_auto_20201117_1343'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='question',
            name='category',
        ),
        migrations.DeleteModel(
            name='Category',
        ),
    ]
