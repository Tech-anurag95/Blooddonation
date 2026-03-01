#!/usr/bin/env python
"""
Django management command to ensure all default users exist with correct passwords.
This runs automatically on server startup to fix the password reset issue.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Ensure all default users exist with correct passwords'

    def handle(self, *args, **options):
        users_to_ensure = [
            {
                'username': 'admin',
                'email': 'admin@blooddonation.com',
                'password': 'admin123',
                'is_staff': True,
                'is_superuser': True,
                'blood_type': 'O+',
                'city': 'Mumbai'
            },
            {
                'username': 'shivam',
                'email': 'shivam@gmail.com',
                'password': 'shivam123',
                'is_staff': False,
                'is_superuser': False,
                'blood_type': 'A+',
                'city': 'Delhi',
                'phone': '9876543210'
            },
            {
                'username': 'testuser',
                'email': 'test@test.com',
                'password': 'test123',
                'is_staff': False,
                'is_superuser': False,
                'blood_type': 'B+',
                'city': 'Bangalore'
            }
        ]

        for user_data in users_to_ensure:
            email = user_data['email']
            password = user_data.pop('password')
            
            try:
                user = User.objects.get(email=email)
                # User exists - verify password is correct
                if not user.check_password(password):
                    self.stdout.write(f'Fixing password for {email}...')
                    user.set_password(password)
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f'✓ Password fixed for {email}'))
                else:
                    self.stdout.write(f'✓ {email} password is correct')
            except User.DoesNotExist:
                # User doesn't exist - create it
                self.stdout.write(f'Creating user {email}...')
                user = User.objects.create_user(**user_data)
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f'✓ Created user {email}'))

        self.stdout.write(self.style.SUCCESS('\n✓ All users ensured with correct passwords'))
