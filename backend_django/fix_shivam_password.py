import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User

# Find and reset Shivam's password
try:
    user = User.objects.get(email='shivam@gmail.com')
    print(f'Found user: {user.username} ({user.email})')
    
    # Set password using Django's set_password method
    user.set_password('shivam123')
    user.save()
    
    print('✅ Password set successfully!')
    
    # Verify the password works
    if user.check_password('shivam123'):
        print('✅ Password verification successful!')
        print(f'\n📧 Email: {user.email}')
        print(f'🔑 Password: shivam123')
        print('\nYou can now login with these credentials!')
    else:
        print('❌ Password verification failed!')
        
except User.DoesNotExist:
    print('❌ User not found!')
except Exception as e:
    print(f'❌ Error: {e}')
