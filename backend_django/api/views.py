from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.parsers import MultiPartParser, FormParser
from .models import VerificationDoc, BloodRequest
from .serializers import (
    UserSerializer, RegisterSerializer, VerificationDocSerializer, BloodRequestSerializer,
    LoginActivitySerializer, AdminUserSerializer, PasswordChangeSerializer
)
from .models import LoginActivity
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers as drf_serializers
from django.contrib.auth import authenticate

User = get_user_model()


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Accept 'email' and 'password' (or legacy 'username') to authenticate and return tokens."""
    def validate(self, attrs):
        # Accept either 'username' or explicit 'email' in the request payload
        email = attrs.get('username') or attrs.get('email') or self.initial_data.get('email')
        password = attrs.get('password')

        if email is None or password is None:
            raise drf_serializers.ValidationError('Must include email and password')

        # Try to find user by email (case-insensitive)
        try:
            user = User.objects.get(email__iexact=email)
            # verify password
            if not user.check_password(password):
                raise User.DoesNotExist()
        except User.DoesNotExist:
            # fallback to default authenticate (may accept username)
            user = authenticate(username=email, password=password)

        if user is None:
            raise drf_serializers.ValidationError('No active account found with the given credentials')

        # delegate to parent but provide username as user's username
        data = super().validate({'username': user.get_username(), 'password': password})
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT token for the new user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.all()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class VerificationUploadView(generics.CreateAPIView):
    serializer_class = VerificationDocSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.all().order_by('-created_at')
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)


class LoginActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """Admin-only view to list login/logout activities for auditing."""
    queryset = LoginActivity.objects.all().order_by('-timestamp')
    serializer_class = LoginActivitySerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        user_email = self.request.query_params.get('user_email')
        since = self.request.query_params.get('since')
        until = self.request.query_params.get('until')
        if action:
            qs = qs.filter(action=action)
        if user_email:
            qs = qs.filter(user__email__icontains=user_email)
        if since:
            qs = qs.filter(timestamp__gte=since)
        if until:
            qs = qs.filter(timestamp__lte=until)
        return qs


class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin-only user management endpoints including password change."""
    queryset = User.objects.all().order_by('-id')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def change_password(self, request, pk=None):
        user = self.get_object()
        serializer = PasswordChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        # record audit entry
        try:
            LoginActivity.objects.create(user=user, action='password_change_by_admin', ip=request.META.get('REMOTE_ADDR'), user_agent=request.META.get('HTTP_USER_AGENT',''))
        except Exception:
            pass
        return Response({'status':'password_changed'})

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def pending_verifications(request):
    users = User.objects.filter(verified=False, verification_docs__isnull=False).distinct()
    data = UserSerializer(users, many=True).data
    return Response({'data': data})
