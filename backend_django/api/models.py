from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.core.validators import MinValueValidator

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
