from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VerificationDoc, BloodRequest

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','email','blood_type','phone','city','age','weight','verified')

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
