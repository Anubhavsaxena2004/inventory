# Generated migration for CustomerProduct model
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('settings_app', '0002_create_default_admin'),
        ('customers', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomerProduct',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('customer', models.ForeignKey(on_delete=models.deletion.CASCADE, to='customers.customer')),
                ('product', models.ForeignKey(on_delete=models.deletion.CASCADE, to='settings_app.product')),
            ],
            options={
                'unique_together': {('customer', 'product')},
            },
        ),
    ]
