#!/usr/bin/env python
"""
Test the actual API endpoint using requests library.
"""
import requests
import json

API_URL = 'http://localhost:5000/api/auth/login/'

def test_login_api(email, password):
    print(f"\n{'='*60}")
    print(f"Testing API endpoint: {API_URL}")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            API_URL,
            json={'email': email, 'password': password},
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body:")
        try:
            print(json.dumps(response.json(), indent=2))
        except:
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("✗ ERROR: Cannot connect to server. Is Django running on port 5000?")
    except Exception as e:
        print(f"✗ ERROR: {e}")

if __name__ == '__main__':
    # Test with known credentials
    test_login_api('shivam@gmail.com', 'shivam123')
    test_login_api('test@test.com', 'test123')
    test_login_api('wrong@email.com', 'wrongpass')
