from django.db import models
from django.core.validators import EmailValidator
from .validators import (
    validate_phone, validate_age, validate_weight,
    validate_quantity, validate_latitude, validate_longitude,
    validate_last_donation, validate_name, validate_city, validate_hospital
)


BLOOD_TYPE_CHOICES = [
    ('O+', 'O+'), ('O-', 'O-'),
    ('A+', 'A+'), ('A-', 'A-'),
    ('B+', 'B+'), ('B-', 'B-'),
    ('AB+', 'AB+'), ('AB-', 'AB-'),
]


class DonorUser(models.Model):
    ROLE_CHOICES = [
        ('donor',     'Donor'),
        ('recipient', 'Recipient'),
        ('admin',     'Admin'),
    ]

    mongo_id = models.CharField(
        max_length=50, unique=True, blank=True, null=True,
        help_text='MongoDB ObjectId — auto-synced from Node.js backend'
    )
    name = models.CharField(
        max_length=100,
        validators=[validate_name],
        help_text='Full name (letters, spaces, dots, hyphens only — 2 to 100 chars)'
    )
    email = models.EmailField(
        unique=True,
        validators=[EmailValidator(message='Enter a valid email address.')],
        help_text='Valid email address (must be unique)'
    )
    phone = models.CharField(
        max_length=10,
        validators=[validate_phone],
        blank=True, null=True,
        help_text='Exactly 10 digits, no spaces or symbols'
    )
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='recipient',
        help_text='User role on the platform'
    )
    blood_type = models.CharField(
        max_length=5,
        choices=BLOOD_TYPE_CHOICES,
        blank=True, null=True,
        help_text='ABO blood group'
    )
    city = models.CharField(
        max_length=100,
        validators=[validate_city],
        blank=True, null=True,
        help_text='City name (letters and spaces only)'
    )
    state = models.CharField(
        max_length=100,
        blank=True, null=True,
        help_text='State / Province'
    )
    age = models.IntegerField(
        validators=[validate_age],
        blank=True, null=True,
        help_text='Age must be between 18 and 65'
    )
    weight = models.FloatField(
        validators=[validate_weight],
        blank=True, null=True,
        help_text='Weight in kg (50 – 200 kg)'
    )
    latitude = models.FloatField(
        validators=[validate_latitude],
        blank=True, null=True,
        help_text='Latitude (-90 to 90)'
    )
    longitude = models.FloatField(
        validators=[validate_longitude],
        blank=True, null=True,
        help_text='Longitude (-180 to 180)'
    )
    verified = models.BooleanField(
        default=False,
        help_text='Has this user been verified by admin?'
    )
    available_to_donate = models.BooleanField(
        default=False,
        help_text='Is the donor currently available to donate?'
    )
    last_donation = models.DateField(
        validators=[validate_last_donation],
        blank=True, null=True,
        help_text='Date of last donation (cannot be in the future)'
    )
    profile_picture = models.CharField(
        max_length=500,
        blank=True, null=True,
        help_text='URL or file path to profile picture'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'User'
        verbose_name_plural = 'Users'
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.blood_type or '?'}) — {self.role}"


class BloodRequest(models.Model):
    URGENCY_CHOICES = [
        ('normal',   'Normal'),
        ('urgent',   'Urgent'),
        ('critical', 'Critical'),
    ]
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('matched',   'Matched'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    mongo_id = models.CharField(
        max_length=50, unique=True, blank=True, null=True,
        help_text='MongoDB ObjectId — auto-synced'
    )
    requester = models.ForeignKey(
        DonorUser,
        on_delete=models.CASCADE,
        related_name='requests',
        null=True, blank=True,
        help_text='User who posted this request'
    )
    blood_type = models.CharField(
        max_length=5,
        choices=BLOOD_TYPE_CHOICES,
        help_text='Required blood group'
    )
    quantity = models.IntegerField(
        default=450,
        validators=[validate_quantity],
        help_text='Amount needed in ml (100 – 1000 ml)'
    )
    urgency = models.CharField(
        max_length=20,
        choices=URGENCY_CHOICES,
        default='normal',
        help_text='How urgent is this request?'
    )
    reason = models.TextField(
        blank=True, null=True,
        max_length=500,
        help_text='Reason for blood requirement (max 500 characters)'
    )
    hospital = models.CharField(
        max_length=300,
        validators=[validate_hospital],
        help_text='Hospital name (at least 3 characters)'
    )
    city = models.CharField(
        max_length=100,
        validators=[validate_city],
        blank=True, null=True,
        help_text='City where blood is needed'
    )
    phone = models.CharField(
        max_length=10,
        validators=[validate_phone],
        blank=True, null=True,
        help_text='Contact number — exactly 10 digits'
    )
    latitude = models.FloatField(
        validators=[validate_latitude],
        blank=True, null=True,
        help_text='Latitude (-90 to 90)'
    )
    longitude = models.FloatField(
        validators=[validate_longitude],
        blank=True, null=True,
        help_text='Longitude (-180 to 180)'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Current status of this request'
    )
    accepted_by = models.ForeignKey(
        DonorUser,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='accepted_requests',
        help_text='Donor who accepted this request'
    )
    created_at   = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        verbose_name        = 'Blood Request'
        verbose_name_plural = 'Blood Requests'
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.blood_type} — {self.urgency.upper()} — {self.hospital} [{self.status}]"


class Donation(models.Model):
    STATUS_CHOICES = [
        ('accepted',  'Accepted'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    CERTIFICATE_STATUS_CHOICES = [
        ('not_requested',  'Not Requested'),
        ('pending_review', 'Pending Review'),
        ('approved',       'Approved'),
        ('rejected',       'Rejected'),
    ]

    mongo_id = models.CharField(
        max_length=50, unique=True, blank=True, null=True,
        help_text='MongoDB ObjectId — auto-synced'
    )
    donor = models.ForeignKey(
        DonorUser,
        on_delete=models.CASCADE,
        related_name='donations',
        help_text='Donor who made this donation'
    )
    request = models.ForeignKey(
        BloodRequest,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text='Linked blood request (optional)'
    )
    recipient_name = models.CharField(
        max_length=200,
        validators=[validate_name],
        blank=True, null=True,
        help_text='Name of the recipient (letters only, 2–100 chars)'
    )
    blood_type = models.CharField(
        max_length=5,
        choices=BLOOD_TYPE_CHOICES,
        blank=True, null=True,
        help_text='Blood type donated'
    )
    quantity = models.IntegerField(
        default=450,
        validators=[validate_quantity],
        help_text='Amount donated in ml (100 – 1000 ml)'
    )
    location = models.CharField(
        max_length=300,
        blank=True, null=True,
        help_text='Hospital or location where donation took place'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='accepted',
        help_text='Current status of this donation'
    )
    scheduled_date = models.DateTimeField(
        blank=True, null=True,
        help_text='Scheduled date and time for donation'
    )
    completed_date = models.DateTimeField(
        blank=True, null=True,
        help_text='Actual date and time donation was completed'
    )
    notes = models.TextField(
        blank=True, null=True,
        max_length=500,
        help_text='Additional notes (max 500 characters)'
    )
    certificate_status = models.CharField(
        max_length=20,
        choices=CERTIFICATE_STATUS_CHOICES,
        default='not_requested',
        help_text='Admin must approve before donor can download certificate'
    )
    rejection_reason = models.TextField(
        blank=True, null=True,
        help_text='Reason for rejection (shown to donor in real-time)'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Donation'
        verbose_name_plural = 'Donations'
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.donor.name} → {self.recipient_name or 'Unknown'} ({self.blood_type}) [{self.status}]"


class UploadedCertificate(models.Model):
    STATUS_CHOICES = [
        ('pending',  'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    mongo_id   = models.CharField(max_length=50, unique=True, blank=True, null=True)
    donor      = models.ForeignKey(
        DonorUser, on_delete=models.CASCADE,
        related_name='uploaded_certificates', null=True, blank=True
    )
    donor_email     = models.EmailField(blank=True, null=True, help_text='Email of the donor')
    donor_name      = models.CharField(max_length=200, blank=True, null=True)
    hospital_name   = models.CharField(max_length=300)
    donation_date   = models.DateField()
    blood_type      = models.CharField(max_length=5, choices=BLOOD_TYPE_CHOICES, blank=True, null=True)
    quantity        = models.IntegerField(default=450)
    file_url        = models.CharField(max_length=500, blank=True, null=True, help_text='URL to uploaded file')
    file_type       = models.CharField(max_length=20, blank=True, null=True, help_text='image or pdf')
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    reviewed_at     = models.DateTimeField(blank=True, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Uploaded Certificate'
        verbose_name_plural = 'Uploaded Certificates'
        ordering            = ['-created_at']

    def __str__(self):
        return f"{self.donor_name or 'Unknown'} — {self.hospital_name} [{self.status.upper()}]"


class Match(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Pending'),
        ('accepted',  'Accepted'),
        ('rejected',  'Rejected'),
        ('completed', 'Completed'),
    ]

    donor = models.ForeignKey(
        DonorUser,
        on_delete=models.CASCADE,
        related_name='matches_as_donor',
        help_text='Donor in this match'
    )
    recipient = models.ForeignKey(
        DonorUser,
        on_delete=models.CASCADE,
        related_name='matches_as_recipient',
        help_text='Recipient in this match'
    )
    request = models.ForeignKey(
        BloodRequest,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        help_text='Linked blood request (optional)'
    )
    blood_type = models.CharField(
        max_length=5,
        choices=BLOOD_TYPE_CHOICES,
        blank=True, null=True,
        help_text='Blood type for this match'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text='Current match status'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Match'
        verbose_name_plural = 'Matches'
        ordering            = ['-created_at']

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.donor == self.recipient:
            raise ValidationError('Donor and recipient cannot be the same person.')
        if self.donor.role != 'donor':
            raise ValidationError('Selected donor must have the role "donor".')
        if self.recipient.role != 'recipient':
            raise ValidationError('Selected recipient must have the role "recipient".')

    def __str__(self):
        return f"{self.donor.name} ↔ {self.recipient.name} [{self.status}]"


class Message(models.Model):
    sender = models.ForeignKey(
        DonorUser,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        help_text='User who sent this message'
    )
    receiver = models.ForeignKey(
        DonorUser,
        on_delete=models.CASCADE,
        related_name='received_messages',
        help_text='User who received this message'
    )
    room = models.CharField(
        max_length=200,
        blank=True, null=True,
        help_text='Chat room identifier'
    )
    message = models.TextField(
        max_length=2000,
        help_text='Message content (max 2000 characters)'
    )
    is_read = models.BooleanField(
        default=False,
        help_text='Has the receiver read this message?'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name        = 'Message'
        verbose_name_plural = 'Messages'
        ordering            = ['-created_at']

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.sender == self.receiver:
            raise ValidationError('Sender and receiver cannot be the same person.')

    def __str__(self):
        return f"{self.sender.name} → {self.receiver.name}: {self.message[:50]}"
