import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Create admin user if doesn't exist
if not User.objects.filter(email='admin@blooddonation.com').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@blooddonation.com',
        password='admin123',
        blood_type='O+',
        city='Admin City',
        verified=True
    )
    print(f"✅ Admin user created successfully!")
    print(f"Email: admin@blooddonation.com")
    print(f"Password: admin123")
else:
    print("⚠️ Admin user already exists")
    print("Email: admin@blooddonation.com")
    print("Password: admin123")
