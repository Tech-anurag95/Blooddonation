import re
from django import forms
from django.core.exceptions import ValidationError
from .models import DonorUser, BloodRequest, Donation, Match, Message


class DonorUserForm(forms.ModelForm):
    class Meta:
        model  = DonorUser
        fields = '__all__'
        widgets = {
            'name':     forms.TextInput(attrs={'placeholder': 'e.g. Rahul Sharma'}),
            'email':    forms.EmailInput(attrs={'placeholder': 'e.g. rahul@email.com'}),
            'phone':    forms.TextInput(attrs={
                            'placeholder': '10-digit mobile number',
                            'maxlength': '10',
                            'pattern': r'\d{10}'
                        }),
            'age':      forms.NumberInput(attrs={'min': 18, 'max': 65, 'placeholder': '18 – 65'}),
            'weight':   forms.NumberInput(attrs={'min': 50, 'max': 200, 'step': '0.1', 'placeholder': '50 – 200 kg'}),
            'city':     forms.TextInput(attrs={'placeholder': 'e.g. Chennai'}),
            'state':    forms.TextInput(attrs={'placeholder': 'e.g. Tamil Nadu'}),
            'latitude': forms.NumberInput(attrs={'min': -90,  'max': 90,  'step': '0.000001', 'placeholder': '-90 to 90'}),
            'longitude':forms.NumberInput(attrs={'min': -180, 'max': 180, 'step': '0.000001', 'placeholder': '-180 to 180'}),
        }

    def clean_name(self):
        value = self.cleaned_data.get('name', '').strip()
        if not re.fullmatch(r"[A-Za-z\s\.\-']{2,100}", value):
            raise ValidationError('Name must be 2–100 characters. Only letters, spaces, dots, or hyphens allowed.')
        return value

    def clean_phone(self):
        value = self.cleaned_data.get('phone', '')
        if value:
            value = value.strip()
            if not re.fullmatch(r'\d{10}', value):
                raise ValidationError('Phone number must be exactly 10 digits (no spaces, dashes, or country code).')
        return value

    def clean_email(self):
        value = self.cleaned_data.get('email', '').strip().lower()
        if not re.fullmatch(r'^[\w\.\+\-]+@[\w\-]+\.[a-z]{2,}$', value):
            raise ValidationError('Enter a valid email address.')
        return value

    def clean_age(self):
        value = self.cleaned_data.get('age')
        if value is not None:
            if value < 18:
                raise ValidationError('Donor must be at least 18 years old.')
            if value > 65:
                raise ValidationError('Donor must be 65 years old or younger.')
        return value

    def clean_weight(self):
        value = self.cleaned_data.get('weight')
        if value is not None:
            if value < 50:
                raise ValidationError('Weight must be at least 50 kg.')
            if value > 200:
                raise ValidationError('Weight cannot exceed 200 kg.')
        return value

    def clean_city(self):
        value = self.cleaned_data.get('city', '')
        if value:
            value = value.strip()
            if not re.fullmatch(r"[A-Za-z\s\-]{2,100}", value):
                raise ValidationError('City must contain only letters and spaces (2–100 characters).')
        return value

    def clean_latitude(self):
        value = self.cleaned_data.get('latitude')
        if value is not None and not (-90 <= value <= 90):
            raise ValidationError('Latitude must be between -90 and 90.')
        return value

    def clean_longitude(self):
        value = self.cleaned_data.get('longitude')
        if value is not None and not (-180 <= value <= 180):
            raise ValidationError('Longitude must be between -180 and 180.')
        return value

    def clean_last_donation(self):
        from django.utils import timezone
        value = self.cleaned_data.get('last_donation')
        if value and value > timezone.now().date():
            raise ValidationError('Last donation date cannot be in the future.')
        return value

    def clean_role(self):
        value = self.cleaned_data.get('role')
        valid = [r[0] for r in DonorUser.ROLE_CHOICES]
        if value not in valid:
            raise ValidationError(f'Role must be one of: {", ".join(valid)}.')
        return value


class BloodRequestForm(forms.ModelForm):
    class Meta:
        model  = BloodRequest
        fields = '__all__'
        widgets = {
            'hospital': forms.TextInput(attrs={'placeholder': 'e.g. Apollo Hospital, Chennai'}),
            'city':     forms.TextInput(attrs={'placeholder': 'e.g. Chennai'}),
            'phone':    forms.TextInput(attrs={
                            'placeholder': '10-digit contact number',
                            'maxlength': '10',
                            'pattern': r'\d{10}'
                        }),
            'quantity': forms.NumberInput(attrs={'min': 100, 'max': 1000, 'step': 50, 'placeholder': '100 – 1000 ml'}),
            'reason':   forms.Textarea(attrs={'rows': 3, 'maxlength': 500, 'placeholder': 'Reason for blood requirement (max 500 chars)'}),
            'latitude': forms.NumberInput(attrs={'min': -90,  'max': 90,  'step': '0.000001'}),
            'longitude':forms.NumberInput(attrs={'min': -180, 'max': 180, 'step': '0.000001'}),
        }

    def clean_phone(self):
        value = self.cleaned_data.get('phone', '')
        if value:
            value = value.strip()
            if not re.fullmatch(r'\d{10}', value):
                raise ValidationError('Contact number must be exactly 10 digits.')
        return value

    def clean_quantity(self):
        value = self.cleaned_data.get('quantity')
        if value is not None:
            if value < 100:
                raise ValidationError('Quantity must be at least 100 ml.')
            if value > 1000:
                raise ValidationError('Quantity cannot exceed 1000 ml.')
        return value

    def clean_hospital(self):
        value = self.cleaned_data.get('hospital', '').strip()
        if len(value) < 3:
            raise ValidationError('Hospital name must be at least 3 characters.')
        return value

    def clean_city(self):
        value = self.cleaned_data.get('city', '')
        if value:
            value = value.strip()
            if not re.fullmatch(r"[A-Za-z\s\-]{2,100}", value):
                raise ValidationError('City must contain only letters and spaces (2–100 characters).')
        return value

    def clean_reason(self):
        value = self.cleaned_data.get('reason', '')
        if value and len(value) > 500:
            raise ValidationError('Reason cannot exceed 500 characters.')
        return value

    def clean_latitude(self):
        value = self.cleaned_data.get('latitude')
        if value is not None and not (-90 <= value <= 90):
            raise ValidationError('Latitude must be between -90 and 90.')
        return value

    def clean_longitude(self):
        value = self.cleaned_data.get('longitude')
        if value is not None and not (-180 <= value <= 180):
            raise ValidationError('Longitude must be between -180 and 180.')
        return value

    def clean(self):
        cleaned = super().clean()
        status      = cleaned.get('status')
        accepted_by = cleaned.get('accepted_by')
        if status == 'accepted' and not accepted_by:
            raise ValidationError('Please select the donor who accepted this request.')
        return cleaned


class DonationForm(forms.ModelForm):
    class Meta:
        model  = Donation
        fields = '__all__'
        widgets = {
            'recipient_name': forms.TextInput(attrs={'placeholder': 'e.g. Priya Patel'}),
            'quantity':       forms.NumberInput(attrs={'min': 100, 'max': 1000, 'step': 50, 'placeholder': '100 – 1000 ml'}),
            'location':       forms.TextInput(attrs={'placeholder': 'e.g. Apollo Hospital, Chennai'}),
            'notes':          forms.Textarea(attrs={'rows': 3, 'maxlength': 500, 'placeholder': 'Additional notes (max 500 chars)'}),
        }

    def clean_recipient_name(self):
        value = self.cleaned_data.get('recipient_name', '')
        if value:
            value = value.strip()
            if not re.fullmatch(r"[A-Za-z\s\.\-']{2,100}", value):
                raise ValidationError('Recipient name must be 2–100 characters. Only letters, spaces, dots, or hyphens.')
        return value

    def clean_quantity(self):
        value = self.cleaned_data.get('quantity')
        if value is not None:
            if value < 100:
                raise ValidationError('Quantity must be at least 100 ml.')
            if value > 1000:
                raise ValidationError('Quantity cannot exceed 1000 ml.')
        return value

    def clean_notes(self):
        value = self.cleaned_data.get('notes', '')
        if value and len(value) > 500:
            raise ValidationError('Notes cannot exceed 500 characters.')
        return value

    def clean(self):
        cleaned        = super().clean()
        scheduled_date = cleaned.get('scheduled_date')
        completed_date = cleaned.get('completed_date')
        status         = cleaned.get('status')

        if completed_date and scheduled_date and completed_date < scheduled_date:
            raise ValidationError('Completed date cannot be before the scheduled date.')

        if status == 'completed' and not completed_date:
            raise ValidationError('Please provide the completed date for a completed donation.')

        return cleaned


class MatchForm(forms.ModelForm):
    class Meta:
        model  = Match
        fields = '__all__'

    def clean(self):
        cleaned   = super().clean()
        donor     = cleaned.get('donor')
        recipient = cleaned.get('recipient')

        if donor and recipient:
            if donor == recipient:
                raise ValidationError('Donor and recipient cannot be the same person.')
            if donor.role != 'donor':
                raise ValidationError(f'"{donor.name}" does not have the role "donor". Please select a valid donor.')
            if recipient.role != 'recipient':
                raise ValidationError(f'"{recipient.name}" does not have the role "recipient". Please select a valid recipient.')

        return cleaned


class MessageForm(forms.ModelForm):
    class Meta:
        model  = Message
        fields = '__all__'
        widgets = {
            'message': forms.Textarea(attrs={
                'rows': 4,
                'maxlength': 2000,
                'placeholder': 'Type your message here (max 2000 characters)...'
            }),
            'room': forms.TextInput(attrs={'placeholder': 'e.g. room_123'}),
        }

    def clean_message(self):
        value = self.cleaned_data.get('message', '').strip()
        if not value:
            raise ValidationError('Message cannot be empty.')
        if len(value) > 2000:
            raise ValidationError('Message cannot exceed 2000 characters.')
        return value

    def clean(self):
        cleaned  = super().clean()
        sender   = cleaned.get('sender')
        receiver = cleaned.get('receiver')
        if sender and receiver and sender == receiver:
            raise ValidationError('Sender and receiver cannot be the same person.')
        return cleaned
