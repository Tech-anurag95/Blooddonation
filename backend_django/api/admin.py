from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VerificationDoc, BloodRequest, DonorMatch, Message
from .models import LoginActivity, DonationCertificate, UserRewards

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username','email','blood_type','city','verified')

@admin.register(VerificationDoc)
class VerificationDocAdmin(admin.ModelAdmin):
    list_display = ('user','file','uploaded_at')

@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    list_display = ('blood_type','hospital','city','status','created_at')


@admin.register(LoginActivity)
class LoginActivityAdmin(admin.ModelAdmin):
    list_display = ('user','action','ip','timestamp')
    list_filter = ('action','timestamp')
    search_fields = ('user__username','user__email','ip')


@admin.register(DonorMatch)
class DonorMatchAdmin(admin.ModelAdmin):
    list_display = ('donor', 'request', 'status', 'matched_at', 'completed_at')
    list_filter = ('status', 'matched_at')
    search_fields = ('donor__username', 'request__blood_type')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'match', 'sent_at', 'is_read')
    list_filter = ('is_read', 'sent_at')
    search_fields = ('sender__username', 'receiver__username', 'content')


@admin.register(DonationCertificate)
class DonationCertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_id', 'donor', 'donation_date', 'status', 'verified_by', 'uploaded_at')
    list_filter = ('status', 'donation_date', 'uploaded_at')
    search_fields = ('certificate_id', 'donor__username', 'hospital_name')
    readonly_fields = ('certificate_id', 'uploaded_at', 'expires_at')
    
    actions = ['approve_certificates', 'reject_certificates']
    
    def approve_certificates(self, request, queryset):
        for cert in queryset.filter(status='pending'):
            cert.approve(request.user)
        self.message_user(request, f"{queryset.count()} certificates approved.")
    approve_certificates.short_description = "Approve selected certificates"
    
    def reject_certificates(self, request, queryset):
        for cert in queryset.filter(status='pending'):
            cert.reject(request.user, "Rejected by admin")
        self.message_user(request, f"{queryset.count()} certificates rejected.")
    reject_certificates.short_description = "Reject selected certificates"


@admin.register(UserRewards)
class UserRewardsAdmin(admin.ModelAdmin):
    list_display = ('user', 'certified_donations', 'free_credits_available', 'free_credits_used', 'last_donation_date')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
