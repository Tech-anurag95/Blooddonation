"""
Custom validators for the blood donation platform.
Provides validation for phone numbers, email, coordinates, and blood type compatibility.
"""
import re
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator


# Phone number validator - exactly 10 digits
phone_validator = RegexValidator(
    regex=r'^\d{10}$',
    message='Phone number must be exactly 10 digits',
    code='invalid_phone'
)


def validate_coordinates(latitude, longitude):
    """
    Validate geographic coordinates.
    
    Args:
        latitude (float): Latitude value
        longitude (float): Longitude value
        
    Raises:
        ValidationError: If coordinates are out of valid range
    """
    if not (-90 <= latitude <= 90):
        raise ValidationError('Latitude must be between -90 and 90')
    if not (-180 <= longitude <= 180):
        raise ValidationError('Longitude must be between -180 and 180')


def validate_blood_type_compatibility(donor_type, recipient_type):
    """
    Check if donor can give blood to recipient based on blood type compatibility.
    
    Args:
        donor_type (str): Donor's blood type (e.g., 'O+', 'A-')
        recipient_type (str): Recipient's blood type
        
    Returns:
        bool: True if compatible, False otherwise
    """
    # Blood type compatibility matrix
    # Key: donor type, Value: list of compatible recipient types
    compatibility_matrix = {
        'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],  # Universal donor
        'O+': ['O+', 'A+', 'B+', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B+', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB+']  # Universal recipient (can only donate to AB+)
    }
    
    return recipient_type in compatibility_matrix.get(donor_type, [])


def validate_phone_format(phone):
    """
    Validate phone number format (exactly 10 digits).
    
    Args:
        phone (str): Phone number to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    return bool(re.match(r'^\d{10}$', phone))


def validate_email_format(email):
    """
    Validate email format.
    
    Args:
        email (str): Email address to validate
        
    Returns:
        bool: True if valid, False otherwise
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))
