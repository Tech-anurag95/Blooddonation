#!/usr/bin/env python
"""
Direct test of login authentication without going through API.
This will help us understand where the authentication is failing.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_django.settings')
django.setup()

from django.contrib.auth import get_user_model, authenticate
from api.views import EmailTokenObtainPairSerializer

User = get_user_model()

def test_user_login(email, password):
    print(f"\n{'='*60}")
    print(f"Testing login for: {email}")
    print(f"{'='*60}")
    
    # Step 1: Check if user exists
    try:
        user = User.objects.get(email__iexact=email)
        print(f"✓ User found: {user.username} (ID: {user.id})")
        print(f"  Email: {user.email}")
        print(f"  Is active: {user.is_active}")
        print(f"  Is staff: {user.is_staff}")
    except User.DoesNotExist:
        print(f"✗ User with email '{email}' does not exist")
        return
    
    # Step 2: Check password
    password_valid = user.check_password(password)
    print(f"  Password check: {'✓ VALID' if password_valid else '✗ INVALID'}")
    
    if not password_valid:
        print(f"\n  Trying to set password to '{password}' and test again...")
        user.set_password(password)
        user.save()
        user.refresh_from_db()
        password_valid = user.check_password(password)
        print(f"  After reset - Password check: {'✓ VALID' if password_valid else '✗ INVALID'}")
    
    # Step 3: Test Django authenticate
    print(f"\n  Testing Django authenticate()...")
    auth_user = authenticate(username=email, password=password)
    print(f"  Result: {'✓ SUCCESS' if auth_user else '✗ FAILED'}")
    
    # Step 4: Test serializer
    print(f"\n  Testing EmailTokenObtainPairSerializer...")
    serializer = EmailTokenObtainPairSerializer(data={'email': email, 'password': password})
    try:
        if serializer.is_valid():
            validated_data = serializer.validated_data
            print(f"  ✓ Serializer validation SUCCESS")
            print(f"  Access token: {validated_data.get('access', 'N/A')[:50]}...")
            print(f"  Refresh token: {validated_data.get('refresh', 'N/A')[:50]}...")
        else:
            print(f"  ✗ Serializer validation FAILED")
            print(f"  Errors: {serializer.errors}")
    except Exception as e:
        print(f"  ✗ Serializer exception: {e}")

if __name__ == '__main__':
    # Test all known users
    test_cases = [
        ('shivam@gmail.com', 'shivam123'),
        ('test@test.com', 'test123'),
        ('admin@blooddonation.com', 'admin123'),
    ]
    
    for email, password in test_cases:
        test_user_login(email, password)
    
    print(f"\n{'='*60}")
    print("All tests completed")
    print(f"{'='*60}\n")
