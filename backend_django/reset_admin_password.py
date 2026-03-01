import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User

# Reset admin password
try:
    admin = User.objects.get(username='admin')
    admin.set_password('admin123')
    admin.save()
    print('✅ Admin password reset successfully!')
    print(f'\n📧 Email: {admin.email}')
    print(f'👤 Username: admin')
    print(f'🔑 Password: admin123')
except User.DoesNotExist:
    print('❌ Admin user not found')

# Also reset shivam's password
try:
    shivam = User.objects.get(email='shivam@gmail.com')
    shivam.set_password('shivam123')
    shivam.save()
    print('\n✅ Shivam password reset successfully!')
    print(f'\n📧 Email: {shivam.email}')
    print(f'👤 Username: shivam')
    print(f'🔑 Password: shivam123')
except User.DoesNotExist:
    print('❌ Shivam user not found')
