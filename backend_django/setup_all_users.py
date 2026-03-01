import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from api.models import User

print("Setting up all user passwords...\n")

users_to_setup = [
    ('test@test.com', 'testuser', 'test123'),
    ('admin@blooddonation.com', 'admin', 'admin123'),
    ('shivam@gmail.com', 'shivam', 'shivam123'),
    ('mihir@gmail.com', 'mihir', 'mihir123'),
    ('madhur@gmail.com', 'madhur', 'madhur123'),
]

for email, username, password in users_to_setup:
    try:
        user = User.objects.get(email=email)
        user.set_password(password)
        user.save()
        
        # Verify
        if user.check_password(password):
            print(f'✅ {username}: {email} / {password}')
        else:
            print(f'❌ {username}: Password verification failed!')
    except User.DoesNotExist:
        print(f'⚠️  {username}: User not found, skipping...')

print('\n✅ All passwords set successfully!')
print('\nYou can now login with any of these accounts!')
