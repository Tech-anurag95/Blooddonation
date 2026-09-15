from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from .models import DonorUser, BloodRequest, Donation, Match, Message, UploadedCertificate
from .forms  import DonorUserForm, BloodRequestForm, DonationForm, MatchForm, MessageForm

# ── Site branding ─────────────────────────────────────────────────────────────
admin.site.site_header = '🩸 Bloodde Administration'
admin.site.site_title  = 'Bloodde Admin'
admin.site.index_title = 'Welcome to Bloodde Admin Panel'


# ── DonorUser ─────────────────────────────────────────────────────────────────
@admin.register(DonorUser)
class DonorUserAdmin(admin.ModelAdmin):
    form         = DonorUserForm
    list_display = (
        'name', 'email', 'phone', 'role_badge',
        'blood_type_badge', 'city', 'age', 'weight_kg',
        'verified_badge', 'available_to_donate', 'created_at'
    )
    list_filter     = ('role', 'blood_type', 'verified', 'available_to_donate', 'city')
    search_fields   = ('name', 'email', 'phone', 'city')
    ordering        = ('-created_at',)
    readonly_fields = ('created_at',)
    list_per_page   = 25

    fieldsets = (
        ('👤 Personal Information', {
            'fields': ('name', 'email', 'phone'),
            'description': 'Basic contact details. Phone must be exactly 10 digits.'
        }),
        ('🩸 Blood & Health', {
            'fields': ('blood_type', 'age', 'weight', 'last_donation', 'available_to_donate'),
            'description': 'Age: 18–65 | Weight: 50–200 kg | Last donation cannot be in the future.'
        }),
        ('📍 Location', {
            'fields': ('city', 'state', 'latitude', 'longitude'),
            'description': 'Latitude: -90 to 90 | Longitude: -180 to 180'
        }),
        ('🔐 Account', {
            'fields': ('role', 'verified', 'profile_picture', 'created_at'),
        }),
    )

    # ── Display helpers ───────────────────────────────────────────────────────
    def role_badge(self, obj):
        colors = {'admin': '#c0392b', 'donor': '#27ae60', 'recipient': '#2980b9'}
        color  = colors.get(obj.role, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, obj.role.upper()
        )
    role_badge.short_description = 'Role'

    def blood_type_badge(self, obj):
        if not obj.blood_type:
            return '—'
        return format_html(
            '<span style="background:#c0392b;color:#fff;padding:2px 10px;'
            'border-radius:4px;font-weight:bold">{}</span>',
            obj.blood_type
        )
    blood_type_badge.short_description = 'Blood Type'

    def verified_badge(self, obj):
        if obj.verified:
            return format_html('<span style="color:#27ae60;font-weight:bold">✔ Verified</span>')
        return format_html('<span style="color:#e74c3c">✘ Unverified</span>')
    verified_badge.short_description = 'Verified'

    def weight_kg(self, obj):
        return f'{obj.weight} kg' if obj.weight else '—'
    weight_kg.short_description = 'Weight'

    # ── Bulk actions ──────────────────────────────────────────────────────────
    actions = ['verify_users', 'unverify_users', 'mark_available', 'mark_unavailable']

    def verify_users(self, request, queryset):
        updated = queryset.update(verified=True)
        self.message_user(request, f'{updated} user(s) marked as verified.')
    verify_users.short_description = '✔ Mark selected users as Verified'

    def unverify_users(self, request, queryset):
        updated = queryset.update(verified=False)
        self.message_user(request, f'{updated} user(s) marked as unverified.')
    unverify_users.short_description = '✘ Mark selected users as Unverified'

    def mark_available(self, request, queryset):
        updated = queryset.update(available_to_donate=True)
        self.message_user(request, f'{updated} donor(s) marked as available.')
    mark_available.short_description = '🟢 Mark selected as Available to Donate'

    def mark_unavailable(self, request, queryset):
        updated = queryset.update(available_to_donate=False)
        self.message_user(request, f'{updated} donor(s) marked as unavailable.')
    mark_unavailable.short_description = '🔴 Mark selected as Unavailable'


# ── BloodRequest ──────────────────────────────────────────────────────────────
@admin.register(BloodRequest)
class BloodRequestAdmin(admin.ModelAdmin):
    form         = BloodRequestForm
    list_display = (
        'blood_type_badge', 'urgency_badge', 'hospital',
        'city', 'phone', 'quantity_ml', 'requester',
        'status_badge', 'accepted_by', 'created_at'
    )
    list_filter     = ('status', 'urgency', 'blood_type', 'city')
    search_fields   = ('hospital', 'city', 'requester__name', 'reason', 'phone')
    ordering        = ('-created_at',)
    readonly_fields = ('created_at', 'completed_at')
    list_per_page   = 25

    fieldsets = (
        ('🩸 Blood Details', {
            'fields': ('blood_type', 'quantity', 'urgency', 'reason'),
            'description': 'Quantity: 100–1000 ml | Reason: max 500 characters'
        }),
        ('🏥 Hospital & Location', {
            'fields': ('hospital', 'city', 'phone', 'latitude', 'longitude'),
            'description': 'Phone must be exactly 10 digits. City: letters only.'
        }),
        ('📋 Status & Assignment', {
            'fields': ('status', 'requester', 'accepted_by', 'created_at', 'completed_at'),
            'description': 'If status is "Accepted", a donor must be selected in "Accepted by".'
        }),
    )

    def blood_type_badge(self, obj):
        return format_html(
            '<span style="background:#c0392b;color:#fff;padding:2px 10px;'
            'border-radius:4px;font-weight:bold">{}</span>',
            obj.blood_type
        )
    blood_type_badge.short_description = 'Blood Type'

    def urgency_badge(self, obj):
        colors = {'critical': '#c0392b', 'urgent': '#e67e22', 'normal': '#27ae60'}
        color  = colors.get(obj.urgency, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, obj.urgency.upper()
        )
    urgency_badge.short_description = 'Urgency'

    def status_badge(self, obj):
        colors = {
            'pending':   '#f39c12',
            'accepted':  '#2980b9',
            'completed': '#27ae60',
            'cancelled': '#888'
        }
        color = colors.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'

    def quantity_ml(self, obj):
        return f'{obj.quantity} ml'
    quantity_ml.short_description = 'Quantity'

    actions = ['mark_completed', 'mark_cancelled']

    def mark_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f'{updated} request(s) marked as completed.')
    mark_completed.short_description = '✔ Mark selected as Completed'

    def mark_cancelled(self, request, queryset):
        updated = queryset.update(status='cancelled')
        self.message_user(request, f'{updated} request(s) marked as cancelled.')
    mark_cancelled.short_description = '✘ Mark selected as Cancelled'


# ── Donation ──────────────────────────────────────────────────────────────────
@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    form         = DonationForm
    list_display = (
        'donor', 'recipient_name', 'blood_type_badge',
        'quantity_ml', 'location', 'status_badge',
        'cert_status_badge', 'completed_date', 'created_at'
    )
    list_filter     = ('status', 'blood_type', 'certificate_status')
    search_fields   = ('donor__name', 'recipient_name', 'location')
    ordering        = ('-created_at',)
    readonly_fields = ('created_at', 'mongo_id')
    list_per_page   = 25

    fieldsets = (
        ('🩸 Donation Details', {
            'fields': ('donor', 'request', 'blood_type', 'quantity', 'recipient_name'),
        }),
        ('📍 Location & Notes', {
            'fields': ('location', 'notes'),
        }),
        ('📋 Status & Dates', {
            'fields': ('status', 'scheduled_date', 'completed_date', 'created_at'),
        }),
        ('🏅 Certificate Verification', {
            'fields': ('certificate_status', 'rejection_reason', 'mongo_id'),
            'description': 'Approve or reject the certificate. '
                           'Donor will be notified in real-time. '
                           'Only approved donations allow certificate download.'
        }),
    )

    def blood_type_badge(self, obj):
        if not obj.blood_type:
            return '—'
        return format_html(
            '<span style="background:#c0392b;color:#fff;padding:2px 10px;'
            'border-radius:4px;font-weight:bold">{}</span>',
            obj.blood_type
        )
    blood_type_badge.short_description = 'Blood Type'

    def quantity_ml(self, obj):
        return f'{obj.quantity} ml'
    quantity_ml.short_description = 'Quantity'

    def status_badge(self, obj):
        colors = {
            'accepted':  '#2980b9',
            'scheduled': '#f39c12',
            'completed': '#27ae60',
            'cancelled': '#888'
        }
        color = colors.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'

    def cert_status_badge(self, obj):
        colors = {
            'not_requested':  ('#888',    'NOT REQUESTED'),
            'pending_review': ('#f39c12', 'PENDING REVIEW'),
            'approved':       ('#27ae60', 'APPROVED'),
            'rejected':       ('#c0392b', 'REJECTED'),
        }
        color, label = colors.get(obj.certificate_status, ('#888', obj.certificate_status.upper()))
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, label
        )
    cert_status_badge.short_description = 'Certificate'

    actions = ['approve_certificates', 'reject_certificates']

    def approve_certificates(self, request, queryset):
        # Approve any selected donation regardless of status
        updated = queryset.update(
            certificate_status='approved', rejection_reason=''
        )
        self.message_user(request, f'{updated} certificate(s) approved. Donors can now download.')
    approve_certificates.short_description = 'APPROVE certificate for selected donations'

    def reject_certificates(self, request, queryset):
        updated = queryset.update(
            certificate_status='rejected',
            rejection_reason='Certificate rejected by admin. Please contact support.'
        )
        self.message_user(request, f'{updated} certificate(s) rejected.')
    reject_certificates.short_description = 'REJECT certificate for selected donations'


# ── Match ─────────────────────────────────────────────────────────────────────
@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    form         = MatchForm
    list_display = ('donor', 'recipient', 'blood_type_badge', 'status_badge', 'created_at')
    list_filter  = ('status', 'blood_type')
    search_fields = ('donor__name', 'recipient__name')
    ordering      = ('-created_at',)
    readonly_fields = ('created_at',)
    list_per_page = 25

    fieldsets = (
        ('🔗 Match Details', {
            'fields': ('donor', 'recipient', 'request', 'blood_type'),
            'description': 'Donor must have role "donor". Recipient must have role "recipient". '
                           'They cannot be the same person.'
        }),
        ('📋 Status', {
            'fields': ('status', 'created_at'),
        }),
    )

    def blood_type_badge(self, obj):
        if not obj.blood_type:
            return '—'
        return format_html(
            '<span style="background:#c0392b;color:#fff;padding:2px 10px;'
            'border-radius:4px;font-weight:bold">{}</span>',
            obj.blood_type
        )
    blood_type_badge.short_description = 'Blood Type'

    def status_badge(self, obj):
        colors = {
            'pending':   '#f39c12',
            'accepted':  '#27ae60',
            'rejected':  '#c0392b',
            'completed': '#2980b9'
        }
        color = colors.get(obj.status, '#888')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, obj.status.upper()
        )
    status_badge.short_description = 'Status'


# ── Message ───────────────────────────────────────────────────────────────────
@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    form         = MessageForm
    list_display = ('sender', 'receiver', 'short_message', 'room', 'is_read', 'created_at')
    list_filter  = ('is_read',)
    search_fields = ('sender__name', 'receiver__name', 'message', 'room')
    ordering      = ('-created_at',)
    readonly_fields = ('created_at',)
    list_per_page = 25

    fieldsets = (
        ('💬 Message', {
            'fields': ('sender', 'receiver', 'room', 'message'),
            'description': 'Sender and receiver must be different people. '
                           'Message: max 2000 characters.'
        }),
        ('📋 Status', {
            'fields': ('is_read', 'created_at'),
        }),
    )

    def short_message(self, obj):
        return obj.message[:60] + '…' if len(obj.message) > 60 else obj.message
    short_message.short_description = 'Message Preview'


# ── UploadedCertificate ───────────────────────────────────────────────────────
@admin.register(UploadedCertificate)
class UploadedCertificateAdmin(admin.ModelAdmin):
    list_display  = (
        'donor_name', 'donor_email', 'hospital_name',
        'blood_type_badge', 'donation_date', 'quantity_ml',
        'status_badge', 'file_preview', 'created_at'
    )
    list_filter   = ('status', 'blood_type', 'donation_date')
    search_fields = ('donor_name', 'donor_email', 'hospital_name')
    ordering      = ('-created_at',)
    readonly_fields = ('created_at', 'reviewed_at', 'mongo_id', 'file_preview_large')
    list_per_page = 25

    fieldsets = (
        ('👤 Donor Info', {
            'fields': ('donor', 'donor_name', 'donor_email', 'mongo_id'),
        }),
        ('🏥 Donation Details', {
            'fields': ('hospital_name', 'donation_date', 'blood_type', 'quantity'),
        }),
        ('📄 Certificate File', {
            'fields': ('file_url', 'file_type', 'file_preview_large'),
        }),
        ('✅ Review', {
            'fields': ('status', 'rejection_reason', 'reviewed_at', 'created_at'),
            'description': 'Set status to Approved or Rejected. '
                           'Add a rejection reason if rejecting. '
                           'The donor will see the updated status immediately.'
        }),
    )

    def blood_type_badge(self, obj):
        if not obj.blood_type:
            return '—'
        return format_html(
            '<span style="background:#c0392b;color:#fff;padding:2px 8px;'
            'border-radius:4px;font-weight:bold">{}</span>', obj.blood_type
        )
    blood_type_badge.short_description = 'Blood Type'

    def quantity_ml(self, obj):
        return f'{obj.quantity} ml'
    quantity_ml.short_description = 'Quantity'

    def status_badge(self, obj):
        colors = {
            'pending':  ('#f39c12', 'PENDING'),
            'approved': ('#27ae60', 'APPROVED'),
            'rejected': ('#c0392b', 'REJECTED'),
        }
        color, label = colors.get(obj.status, ('#888', obj.status.upper()))
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;'
            'border-radius:4px;font-size:11px;font-weight:bold">{}</span>',
            color, label
        )
    status_badge.short_description = 'Status'

    def file_preview(self, obj):
        if not obj.file_url:
            return '—'
        if obj.file_type == 'pdf':
            return format_html(
                '<a href="{}" target="_blank" style="color:#c0392b;font-weight:bold">View PDF</a>',
                obj.file_url
            )
        return format_html(
            '<a href="{}" target="_blank">'
            '<img src="{}" style="height:40px;border-radius:4px;border:1px solid #ddd"/>'
            '</a>', obj.file_url, obj.file_url
        )
    file_preview.short_description = 'File'

    def file_preview_large(self, obj):
        if not obj.file_url:
            return '—'
        if obj.file_type == 'pdf':
            return format_html(
                '<a href="{}" target="_blank" style="background:#c0392b;color:#fff;'
                'padding:8px 16px;border-radius:6px;font-weight:bold;text-decoration:none">'
                'Open PDF in new tab</a>', obj.file_url
            )
        return format_html(
            '<img src="{}" style="max-width:400px;max-height:300px;'
            'border-radius:8px;border:2px solid #ddd"/>', obj.file_url
        )
    file_preview_large.short_description = 'Certificate Preview'

    actions = ['approve_certificates', 'reject_certificates']

    def approve_certificates(self, request, queryset):
        updated = queryset.update(status='approved', rejection_reason='', reviewed_at=timezone.now())
        self.message_user(request, f'{updated} certificate(s) APPROVED. Donors will see updated status.')
    approve_certificates.short_description = 'APPROVE selected certificates'

    def reject_certificates(self, request, queryset):
        updated = queryset.update(
            status='rejected',
            rejection_reason='Certificate rejected by admin. Please re-upload a clearer copy.',
            reviewed_at=timezone.now()
        )
        self.message_user(request, f'{updated} certificate(s) REJECTED. Donors will see the reason.')
    reject_certificates.short_description = 'REJECT selected certificates'

    def save_model(self, request, obj, form, change):
        """Auto-set reviewed_at when status changes to approved/rejected."""
        if change and obj.status in ('approved', 'rejected') and not obj.reviewed_at:
            obj.reviewed_at = timezone.now()
        super().save_model(request, obj, form, change)
