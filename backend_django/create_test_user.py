import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User

# Create or update test user
try:
    user = User.objects.get(email='test@test.com')
    user.set_password('test123')
    user.save()
    print('✅ Updated existing test user')
except User.DoesNotExist:
    user = User.objects.create_user(
        username='testuser',
        email='test@test.com',
        password='test123',
        blood_type='O+',
        phone='1234567890',
        city='Test City',
        age=25,
        weight=70
    )
    print('✅ Created new test user')

print(f'\n📧 Email: test@test.com')
print(f'🔑 Password: test123')
print(f'\nYou can now login with these credentials!')
