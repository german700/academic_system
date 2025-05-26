# C:\Users\germa\Desktop\academic_system\backend\authentication\serializers.py
from rest_framework import serializers
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'middle_name', 'last_name',
                  'second_last_name', 'date_of_birth', 'user_type', 'profile_picture', 'is_superuser')
        read_only_fields = ('id', 'is_superuser')


class UserProfileSerializer(serializers.ModelSerializer):
    is_superuser = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'middle_name', 'last_name',
                  'second_last_name', 'date_of_birth', 'user_type', 'profile_picture', 'is_superuser')
        read_only_fields = ('id', 'user_type', 'is_superuser')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD  # <- Esto usa email como campo de autenticación

    def validate(self, attrs):
        # Copia el valor del campo email a username para que el backend funcione correctamente
        attrs['username'] = attrs.get('email')
        data = super().validate(attrs)
        data["user_type"] = self.user.user_type
        data["is_superuser"] = self.user.is_superuser
        return data

