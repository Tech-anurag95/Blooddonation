#!/usr/bin/env python
"""
Startup script that ensures users are correct before starting Django server.
This prevents the password reset issue.
"""
import os
import sys
import subprocess

def main():
    print("=" * 60)
    print("  Blood Donation Platform - Django Server Startup")
    print("=" * 60)
    print()
    
    # Ensure users have correct passwords
    print("Ensuring all users have correct passwords...")
    result = subprocess.run([sys.executable, 'manage.py', 'ensure_users'], 
                          capture_output=False)
    
    if result.returncode != 0:
        print("\n⚠️  Warning: Could not ensure users, but continuing anyway...")
    
    print()
    print("=" * 60)
    print("  Starting Django development server on port 5000...")
    print("=" * 60)
    print()
    
    # Start Django server
    os.execvp(sys.executable, [sys.executable, 'manage.py', 'runserver', '5000'])

if __name__ == '__main__':
    main()
