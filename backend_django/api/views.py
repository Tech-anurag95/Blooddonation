from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db import models
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
    username_field = 'email'  # Tell parent class to use 'email' field instead of 'username'
    
    def validate(self, attrs):
        # Get email from attrs (parent class will use username_field='email')
        email = attrs.get(self.username_field)
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

        # Store user for token generation
        self.user = user
        
        # Generate tokens using the parent class method
        refresh = self.get_token(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


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
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return User.objects.all()

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        if request.method == 'GET':
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = UserSerializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerificationUploadView(generics.CreateAPIView):
    serializer_class = VerificationDocSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.all().order_by('-created_at')
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.AllowAny]  # Allow anonymous blood requests

    def perform_create(self, serializer):
        # If user is authenticated, set them as requester
        # Otherwise, create an anonymous user or handle differently
        if self.request.user.is_authenticated:
            serializer.save(requester=self.request.user)
        else:
            # For anonymous requests, we need a default user or make requester optional
            # For now, let's require authentication and return a clear error
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be logged in to submit a blood request")


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



from .models import DonorMatch, Message
from .serializers import DonorMatchSerializer, MessageSerializer, MessageCreateSerializer


class DonorMatchViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing donor matches.
    Allows donors to accept blood requests and manage their donations.
    """
    queryset = DonorMatch.objects.all().order_by('-matched_at')
    serializer_class = DonorMatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return matches where user is either donor or requester."""
        user = self.request.user
        return DonorMatch.objects.filter(
            models.Q(donor=user) | models.Q(request__requester=user)
        ).order_by('-matched_at')
    
    def create(self, request, *args, **kwargs):
        """Create a new match when donor accepts a blood request."""
        blood_request_id = request.data.get('request_id')
        
        if not blood_request_id:
            return Response(
                {'error': 'request_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            blood_request = BloodRequest.objects.get(id=blood_request_id)
        except BloodRequest.DoesNotExist:
            return Response(
                {'error': 'Blood request not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if request is still pending
        if blood_request.status != 'pending':
            return Response(
                {'error': 'This request is no longer available'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Check if match already exists
        if DonorMatch.objects.filter(request=blood_request, donor=request.user).exists():
            return Response(
                {'error': 'You have already matched with this request'},
                status=status.HTTP_409_CONFLICT
            )
        
        # Create the match
        match = DonorMatch.objects.create(
            request=blood_request,
            donor=request.user,
            status='active'
        )
        
        # Update request status
        blood_request.status = 'matched'
        blood_request.save()
        
        serializer = DonorMatchSerializer(match)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a donation as completed."""
        match = self.get_object()
        
        # Only donor or requester can complete
        if request.user not in [match.donor, match.request.requester]:
            return Response(
                {'error': 'You do not have permission to complete this match'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        match.complete_donation()
        serializer = DonorMatchSerializer(match)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a match."""
        match = self.get_object()
        
        # Only donor or requester can cancel
        if request.user not in [match.donor, match.request.requester]:
            return Response(
                {'error': 'You do not have permission to cancel this match'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reason = request.data.get('reason', '')
        match.cancel_match(reason)
        serializer = DonorMatchSerializer(match)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rate(self, request, pk=None):
        """Rate and provide feedback for a completed donation."""
        match = self.get_object()
        
        if match.status != 'completed':
            return Response(
                {'error': 'Can only rate completed donations'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rating = request.data.get('rating')
        feedback = request.data.get('feedback', '')
        
        if not rating or not (1 <= int(rating) <= 5):
            return Response(
                {'error': 'Rating must be between 1 and 5'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        match.rating = rating
        match.feedback = feedback
        match.save()
        
        serializer = DonorMatchSerializer(match)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing messages between matched users.
    """
    queryset = Message.objects.all().order_by('sent_at')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        """Return messages where user is sender or receiver."""
        user = self.request.user
        match_id = self.request.query_params.get('match_id')
        
        queryset = Message.objects.filter(
            models.Q(sender=user) | models.Q(receiver=user)
        )
        
        if match_id:
            queryset = queryset.filter(match_id=match_id)
        
        return queryset.order_by('sent_at')
    
    def create(self, request, *args, **kwargs):
        """Send a message to a matched user."""
        match_id = request.data.get('match_id')
        content = request.data.get('content')
        
        if not match_id:
            return Response(
                {'error': 'match_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            match = DonorMatch.objects.get(id=match_id)
        except DonorMatch.DoesNotExist:
            return Response(
                {'error': 'Match not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verify user is part of the match
        if request.user not in [match.donor, match.request.requester]:
            return Response(
                {'error': 'You can only message users you are matched with'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Determine receiver
        receiver = match.request.requester if request.user == match.donor else match.donor
        
        # Validate content
        serializer = MessageCreateSerializer(data={'content': content})
        serializer.is_valid(raise_exception=True)
        
        # Create message
        message = Message.objects.create(
            match=match,
            sender=request.user,
            receiver=receiver,
            content=serializer.validated_data['content']
        )
        
        response_serializer = MessageSerializer(message)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read."""
        message = self.get_object()
        
        # Only receiver can mark as read
        if request.user != message.receiver:
            return Response(
                {'error': 'Only the receiver can mark messages as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.mark_as_read()
        serializer = MessageSerializer(message)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread messages for current user."""
        count = Message.objects.filter(
            receiver=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})



from .models import DonationCertificate, UserRewards
from .serializers import (
    DonationCertificateSerializer, DonationCertificateCreateSerializer,
    UserRewardsSerializer, CertificateApprovalSerializer
)


class DonationCertificateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing donation certificates.
    Donors can upload certificates, admins can approve/reject them.
    """
    queryset = DonationCertificate.objects.all().order_by('-uploaded_at')
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DonationCertificateCreateSerializer
        return DonationCertificateSerializer
    
    def get_queryset(self):
        """Return certificates based on user role."""
        user = self.request.user
        
        # Admins can see all certificates
        if user.is_staff or user.is_superuser:
            status_filter = self.request.query_params.get('status')
            queryset = DonationCertificate.objects.all()
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset.order_by('-uploaded_at')
        
        # Regular users can only see their own certificates
        return DonationCertificate.objects.filter(donor=user).order_by('-uploaded_at')
    
    def create(self, request, *args, **kwargs):
        """Upload a new donation certificate."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Save certificate with current user as donor
        certificate = serializer.save(donor=request.user)
        
        # Update total donations count
        rewards, created = UserRewards.objects.get_or_create(user=request.user)
        rewards.total_donations += 1
        rewards.save()
        
        response_serializer = DonationCertificateSerializer(certificate)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        """Approve a certificate (admin only)."""
        certificate = self.get_object()
        
        if certificate.status != 'pending':
            return Response(
                {'error': f'Certificate is already {certificate.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        certificate.approve(request.user)
        serializer = DonationCertificateSerializer(certificate)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a certificate (admin only)."""
        certificate = self.get_object()
        
        if certificate.status != 'pending':
            return Response(
                {'error': f'Certificate is already {certificate.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CertificateApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reason = serializer.validated_data.get('rejection_reason', 'No reason provided')
        certificate.reject(request.user, reason)
        
        response_serializer = DonationCertificateSerializer(certificate)
        return Response(response_serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        """Get all pending certificates (admin only)."""
        certificates = DonationCertificate.objects.filter(status='pending').order_by('-uploaded_at')
        serializer = DonationCertificateSerializer(certificates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_certificates(self, request):
        """Get current user's certificates."""
        certificates = DonationCertificate.objects.filter(donor=request.user).order_by('-uploaded_at')
        serializer = DonationCertificateSerializer(certificates, many=True)
        return Response(serializer.data)


class UserRewardsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing user rewards.
    Users can view their own rewards, admins can view all.
    """
    queryset = UserRewards.objects.all()
    serializer_class = UserRewardsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return rewards based on user role."""
        user = self.request.user
        
        # Admins can see all rewards
        if user.is_staff or user.is_superuser:
            return UserRewards.objects.all()
        
        # Regular users can only see their own rewards
        return UserRewards.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def my_rewards(self, request):
        """Get current user's rewards."""
        rewards, created = UserRewards.objects.get_or_create(user=request.user)
        serializer = UserRewardsSerializer(rewards)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def use_credit(self, request):
        """Use a free blood credit."""
        rewards, created = UserRewards.objects.get_or_create(user=request.user)
        
        if rewards.free_credits_available <= 0:
            return Response(
                {'error': 'No free credits available'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success = rewards.use_credit()
        if success:
            serializer = UserRewardsSerializer(rewards)
            return Response({
                'success': True,
                'message': 'Free credit used successfully',
                'rewards': serializer.data
            })
        else:
            return Response(
                {'error': 'Failed to use credit'},
                status=status.HTTP_400_BAD_REQUEST
            )
