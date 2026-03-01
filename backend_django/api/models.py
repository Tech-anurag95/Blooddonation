from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    # extend default user
    BLOOD_CHOICES = [
        ('O+','O+'),('O-','O-'),('A+','A+'),('A-','A-'),('B+','B+'),('B-','B-'),('AB+','AB+'),('AB-','AB-')
    ]
    blood_type = models.CharField(max_length=3, choices=BLOOD_CHOICES, null=True, blank=True)
    phone = models.CharField(max_length=32, null=True, blank=True)
    city = models.CharField(max_length=128, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True, validators=[MinValueValidator(0)])
    weight = models.FloatField(null=True, blank=True)
    verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    # verification docs stored as separate model
    push_subscriptions = models.JSONField(default=list, blank=True)

class VerificationDoc(models.Model):
    user = models.ForeignKey(User, related_name='verification_docs', on_delete=models.CASCADE)
    file = models.FileField(upload_to='verification_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class BloodRequest(models.Model):
    STATUS_CHOICES = [('pending','pending'),('matched','matched'),('completed','completed')]
    requester = models.ForeignKey(User, related_name='requests', on_delete=models.CASCADE)
    blood_type = models.CharField(max_length=3)
    quantity = models.IntegerField(default=1)
    urgency = models.CharField(max_length=64)
    reason = models.TextField(blank=True)
    hospital = models.CharField(max_length=256)
    city = models.CharField(max_length=128)
    phone = models.CharField(max_length=32, blank=True, null=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.blood_type} @ {self.hospital} ({self.city})"


class LoginActivity(models.Model):
    ACTION_CHOICES = [
        ('login','login'),
        ('logout','logout'),
        ('password_change','password_change'),
        ('password_change_by_admin','password_change_by_admin'),
        ('admin_update','admin_update'),
    ]
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=64, choices=ACTION_CHOICES)
    ip = models.CharField(max_length=45, null=True, blank=True)
    ua = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    extra = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user} {self.action} at {self.timestamp}"

        # New fields for auditing login/logout events
        user_agent = models.TextField(blank=True, null=True)
        ip = models.CharField(max_length=64, blank=True, null=True)

        # Update the __str__ method to include user email
        def __str__(self):
            return f"{self.user.email} - {self.action} at {self.timestamp}"


class DonorMatch(models.Model):
    """
    Represents a match between a donor and a blood request.
    When a donor accepts a request, a match is created.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    
    request = models.ForeignKey(
        BloodRequest,
        related_name='matches',
        on_delete=models.CASCADE
    )
    donor = models.ForeignKey(
        User,
        related_name='donations',
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=32,
        choices=STATUS_CHOICES,
        default='active'
    )
    matched_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Feedback
    rating = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    feedback = models.TextField(blank=True)
    
    class Meta:
        unique_together = ['request', 'donor']
        ordering = ['-matched_at']
    
    def __str__(self):
        return f"Match: {self.donor.username} -> {self.request.blood_type} request"
    
    def complete_donation(self):
        """Mark donation as completed and update donor's last donation date."""
        from django.utils import timezone
        self.status = 'completed'
        self.completed_at = timezone.now()
        self.save()
        
        # Update request status
        self.request.status = 'completed'
        self.request.completed_at = timezone.now()
        self.request.save()
    
    def cancel_match(self, reason=''):
        """Cancel the match and make request available again."""
        self.status = 'cancelled'
        self.save()
        
        # Make request available again
        self.request.status = 'pending'
        self.request.save()


class Message(models.Model):
    """
    Represents a message between matched users (donor and recipient).
    """
    match = models.ForeignKey(
        DonorMatch,
        related_name='messages',
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        User,
        related_name='sent_messages',
        on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User,
        related_name='received_messages',
        on_delete=models.CASCADE
    )
    content = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['sent_at']
        indexes = [
            models.Index(fields=['match', 'sent_at']),
            models.Index(fields=['receiver', 'is_read'])
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.receiver.username}"
    
    def mark_as_read(self):
        """Mark message as read and set timestamp."""
        from django.utils import timezone
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class DonationCertificate(models.Model):
    """
    Represents a donation certificate that donors upload after donating blood.
    Hospital admins verify these certificates.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected')
    ]
    
    certificate_id = models.CharField(max_length=64, unique=True, editable=False)
    donor = models.ForeignKey(
        User,
        related_name='certificates',
        on_delete=models.CASCADE
    )
    match = models.ForeignKey(
        DonorMatch,
        related_name='certificates',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    # Certificate details
    donation_date = models.DateField()
    hospital_name = models.CharField(max_length=256)
    blood_type = models.CharField(max_length=3)
    quantity = models.IntegerField(help_text="Quantity in ml")
    certificate_image = models.ImageField(upload_to='certificates/')
    
    # Verification
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default='pending')
    verified_by = models.ForeignKey(
        User,
        related_name='verified_certificates',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()  # 30 days from upload
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['donor', 'status']),
            models.Index(fields=['status', 'expires_at'])
        ]
    
    def __str__(self):
        return f"Certificate {self.certificate_id} - {self.donor.username}"
    
    def save(self, *args, **kwargs):
        # Generate certificate ID if not exists
        if not self.certificate_id:
            from django.utils import timezone
            import random
            year = timezone.now().year
            random_num = random.randint(100000, 999999)
            self.certificate_id = f"CERT-{year}-{random_num}"
        
        # Set expiry date (30 days from upload)
        if not self.expires_at:
            from django.utils import timezone
            from datetime import timedelta
            self.expires_at = timezone.now() + timedelta(days=30)
        
        super().save(*args, **kwargs)
        
        # Update user rewards when certificate is approved
        if self.status == 'approved':
            self.update_user_rewards()
    
    def approve(self, admin_user):
        """Approve the certificate and update rewards."""
        from django.utils import timezone
        self.status = 'approved'
        self.verified_by = admin_user
        self.verified_at = timezone.now()
        self.save()
    
    def reject(self, admin_user, reason):
        """Reject the certificate with a reason."""
        from django.utils import timezone
        self.status = 'rejected'
        self.verified_by = admin_user
        self.verified_at = timezone.now()
        self.rejection_reason = reason
        self.save()
    
    def update_user_rewards(self):
        """Update user's reward credits when certificate is approved."""
        rewards, created = UserRewards.objects.get_or_create(user=self.donor)
        rewards.certified_donations += 1
        
        # Every 3 certified donations = 1 free credit
        if rewards.certified_donations % 3 == 0:
            rewards.free_credits_available += 1
        
        rewards.last_donation_date = self.donation_date
        rewards.save()


class UserRewards(models.Model):
    """
    Tracks user's donation rewards and free blood credits.
    """
    user = models.OneToOneField(
        User,
        related_name='rewards',
        on_delete=models.CASCADE
    )
    
    # Donation tracking
    total_donations = models.IntegerField(default=0)
    certified_donations = models.IntegerField(default=0)
    
    # Free blood credits
    free_credits_available = models.IntegerField(default=0)
    free_credits_used = models.IntegerField(default=0)
    
    # Dates
    last_donation_date = models.DateField(null=True, blank=True)
    next_eligible_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "User Rewards"
    
    def __str__(self):
        return f"{self.user.username} - {self.certified_donations} donations, {self.free_credits_available} credits"
    
    def progress_to_next_credit(self):
        """Returns progress toward next free credit (e.g., 2 out of 3)."""
        return self.certified_donations % 3
    
    def use_credit(self):
        """Use one free credit."""
        if self.free_credits_available > 0:
            self.free_credits_available -= 1
            self.free_credits_used += 1
            self.save()
            return True
        return False
    
    def calculate_next_eligible_date(self):
        """Calculate next eligible donation date (56 days after last donation)."""
        if self.last_donation_date:
            from datetime import timedelta
            self.next_eligible_date = self.last_donation_date + timedelta(days=56)
            self.save()
