from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.dispatch import receiver
from django.utils import timezone
from .models import LoginActivity

def _get_ip(request):
    # Respect common headers; in production behind proxies you may need to read X-Forwarded-For
    return request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR')

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    try:
        LoginActivity.objects.create(
            user=user,
            action='login',
            ip=_get_ip(request),
            ua=request.META.get('HTTP_USER_AGENT', ''),
            timestamp=timezone.now()
        )
    except Exception:
        pass

@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    try:
        LoginActivity.objects.create(
            user=user,
            action='logout',
            ip=_get_ip(request),
            ua=request.META.get('HTTP_USER_AGENT', ''),
            timestamp=timezone.now()
        )
    except Exception:
        pass
