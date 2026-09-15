import re
from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_phone(value):
    """Exactly 10 digits, no spaces or symbols. Allow empty/None for optional fields."""
    if not value:  # Allow empty/None
        return
    if not re.fullmatch(r'\d{10}', str(value)):
        raise ValidationError('Phone number must be exactly 10 digits (numbers only).')


def validate_age(value):
    if value is None:  # Allow None for optional fields
        return
    if value < 18:
        raise ValidationError('Donor must be at least 18 years old.')
    if value > 65:
        raise ValidationError('Donor must be 65 years old or younger.')


def validate_weight(value):
    if value is None:  # Allow None for optional fields
        return
    if value < 50:
        raise ValidationError('Donor weight must be at least 50 kg.')
    if value > 200:
        raise ValidationError('Weight cannot exceed 200 kg.')


def validate_quantity(value):
    if value is None:  # Allow None for optional fields
        return
    if value < 100:
        raise ValidationError('Quantity must be at least 100 ml.')
    if value > 1000:
        raise ValidationError('Quantity cannot exceed 1000 ml.')


def validate_latitude(value):
    if value is None:  # Allow None for optional fields
        return
    if value < -90 or value > 90:
        raise ValidationError('Latitude must be between -90 and 90.')


def validate_longitude(value):
    if value is None:  # Allow None for optional fields
        return
    if value < -180 or value > 180:
        raise ValidationError('Longitude must be between -180 and 180.')


def validate_last_donation(value):
    if value and value > timezone.now().date():
        raise ValidationError('Last donation date cannot be in the future.')


def validate_name(value):
    if not value:  # Allow empty for optional fields
        return
    # More lenient name validation - allow more characters
    if not re.fullmatch(r"[A-Za-z\s\.\-']{1,100}", value):
        raise ValidationError(
            'Name must be 1–100 characters and contain only letters, spaces, dots, or hyphens.'
        )


def validate_city(value):
    if not value:  # Allow empty for optional fields
        return
    # More lenient city validation
    if not re.fullmatch(r"[A-Za-z\s\-]{1,100}", value):
        raise ValidationError('City must contain only letters and spaces (1–100 characters).')


def validate_hospital(value):
    if not value:  # Allow empty for optional fields
        return
    if len(value.strip()) < 1:
        raise ValidationError('Hospital name must be at least 1 character.')
    if len(value) > 300:
        raise ValidationError('Hospital name cannot exceed 300 characters.')