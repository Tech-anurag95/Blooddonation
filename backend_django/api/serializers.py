from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VerificationDoc, BloodRequest

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','email','blood_type','phone','city','age','weight','verified','profile_picture')

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    name = serializers.CharField(required=False, allow_blank=True, write_only=True)
    blood_type = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False, allow_null=True)
    weight = serializers.FloatField(required=False, allow_null=True)
    
    def create(self, validated_data):
        name = validated_data.pop('name', '')
        password = validated_data.pop('password')
        email = validated_data.pop('email')
        username = validated_data.pop('username', '') or email.split('@')[0]
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name.split()[0] if name else '',
            last_name=' '.join(name.split()[1:]) if len(name.split()) > 1 else '',
            blood_type=validated_data.get('blood_type', ''),
            phone=validated_data.get('phone', ''),
            city=validated_data.get('city', ''),
            age=validated_data.get('age'),
            weight=validated_data.get('weight')
        )
        return user
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value

class VerificationDocSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationDoc
        fields = ('id','file','uploaded_at')

class BloodRequestSerializer(serializers.ModelSerializer):
    requester = UserSerializer(read_only=True)
    class Meta:
        model = BloodRequest
        fields = '__all__'
        read_only_fields = ('requester','created_at','completed_at')


from .models import LoginActivity


class LoginActivitySerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = LoginActivity
        fields = ('id','user_id','user_email','action','ip','user_agent','timestamp','extra')


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','email','first_name','last_name','is_active','is_staff','is_superuser')


class PasswordChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=6)


from .models import DonorMatch, Message


class DonorMatchSerializer(serializers.ModelSerializer):
    """Serializer for DonorMatch model."""
    donor = UserSerializer(read_only=True)
    request = BloodRequestSerializer(read_only=True)
    
    class Meta:
        model = DonorMatch
        fields = '__all__'
        read_only_fields = ('matched_at', 'completed_at')


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model."""
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('sent_at', 'read_at', 'is_read')


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages."""
    class Meta:
        model = Message
        fields = ('content',)
    
    def validate_content(self, value):
        """Ensure message content is not empty."""
        if not value or not value.strip():
            raise serializers.ValidationError("Message content cannot be empty")
        return value.strip()


from .models import DonationCertificate, UserRewards


class DonationCertificateSerializer(serializers.ModelSerializer):
    """Serializer for DonationCertificate model."""
    donor = UserSerializer(read_only=True)
    verified_by_name = serializers.CharField(source='verified_by.username', read_only=True)
    
    class Meta:
        model = DonationCertificate
        fields = '__all__'
        read_only_fields = ('certificate_id', 'donor', 'verified_by', 'verified_at', 'uploaded_at', 'expires_at')


class DonationCertificateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating donation certificates."""
    class Meta:
        model = DonationCertificate
        fields = ('donation_date', 'hospital_name', 'blood_type', 'quantity', 'certificate_image', 'match')
    
    def validate_certificate_image(self, value):
        """Validate image file size and type."""
        if value.size > 5 * 1024 * 1024:  # 5MB limit
            raise serializers.ValidationError("Image file size cannot exceed 5MB")
        
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only JPEG, PNG, and GIF images are allowed")
        
        return value
    
    def validate_donation_date(self, value):
        """Ensure donation date is not in the future."""
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Donation date cannot be in the future")
        return value


class UserRewardsSerializer(serializers.ModelSerializer):
    """Serializer for UserRewards model."""
    user = UserSerializer(read_only=True)
    progress_to_next_credit = serializers.SerializerMethodField()
    
    class Meta:
        model = UserRewards
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at')
    
    def get_progress_to_next_credit(self, obj):
        """Returns progress toward next free credit (e.g., 2 out of 3)."""
        return {
            'current': obj.progress_to_next_credit(),
            'required': 3,
            'percentage': (obj.progress_to_next_credit() / 3) * 100
        }


class CertificateApprovalSerializer(serializers.Serializer):
    """Serializer for approving/rejecting certificates."""
    action = serializers.ChoiceField(choices=['approve', 'reject'], required=True)
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        """Ensure rejection reason is provided when rejecting."""
        if data['action'] == 'reject' and not data.get('rejection_reason'):
            raise serializers.ValidationError({
                'rejection_reason': 'Rejection reason is required when rejecting a certificate'
            })
        return data
