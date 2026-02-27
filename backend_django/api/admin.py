from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VerificationDoc, BloodRequest
from .models import LoginActivity

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
