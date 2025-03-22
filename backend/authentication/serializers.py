# \academic_system\backend\authentication\serializers.py
from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'middle_name', 'last_name',
                  'second_last_name', 'date_of_birth', 'user_type', 'profile_picture', 'is_superuser')
        read_only_fields = ('id', 'is_superuser')

class UserProfileSerializer(serializers.ModelSerializer):
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'middle_name', 'last_name',
                  'second_last_name', 'date_of_birth', 'user_type', 'profile_picture', 'is_superuser')
        read_only_fields = ('id', 'user_type', 'is_superuser')

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data["user_type"] = self.user.user_type
        data["is_superuser"] = self.user.is_superuser  # ✅ Incluir en la respuesta
        return data
