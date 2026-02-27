#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

# Now import after Django is set up
from django.core.management import call_command
from api.models import User
import requests

# Run migrations
print("Running migrations...")
call_command('migrate')

# Clean up test user if exists
User.objects.filter(email='test@example.com').delete()

# Test registration
print("\nTesting registration endpoint...")
test_data = {
    'name': 'John Doe',
    'email': 'test@example.com',
    'password': 'testpass123',
    'phone': '9876543210',
    'bloodType': 'O+',
    'city': 'New York',
    'role': 'donor'
}

try:
    response = requests.post('http://localhost:8000/api/auth/register/', json=test_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
    print("\nManually checking registration via Django ORM...")
    # Try creating directly
    from api.serializers import RegisterSerializer
    serializer = RegisterSerializer(data=test_data)
    if serializer.is_valid():
        user = serializer.save()
        print(f"User created: {user.email}")
    else:
        print(f"Validation errors: {serializer.errors}")
