# Generated migration to create default admin user
from django.db import migrations

def create_default_admin(apps, schema_editor):
    User = apps.get_model('settings_app', 'User')
    # Create default admin user if it doesn't exist
    if not User.objects.filter(email='inventory@gmail.com').exists():
        User.objects.create(
            name='Admin User',
            email='inventory@gmail.com',
            password='1234'
        )

def remove_default_admin(apps, schema_editor):
    User = apps.get_model('settings_app', 'User')
    User.objects.filter(email='inventory@gmail.com').delete()

class Migration(migrations.Migration):

    dependencies = [
        ('settings_app', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, remove_default_admin),
    ]

