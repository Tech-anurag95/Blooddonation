from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, UserViewSet, VerificationUploadView, BloodRequestViewSet,
    pending_verifications, EmailTokenObtainPairView, LoginActivityViewSet, AdminUserViewSet
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'requests', BloodRequestViewSet, basename='request')
router.register(r'admin/login-activities', LoginActivityViewSet, basename='loginactivity')
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/upload-doc/', VerificationUploadView.as_view(), name='upload-doc'),
    path('admin/pending-verifications/', pending_verifications, name='pending-verifications'),
]
