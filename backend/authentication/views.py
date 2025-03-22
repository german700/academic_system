# \academic_system\backend\authentication\views.py
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserProfileSerializer, CustomTokenObtainPairSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@api_view(['POST'])
@permission_classes([AllowAny])
def debug_auth(request):
    username = request.data.get('username')
    password = request.data.get('password')

    try:
        user = User.objects.get(username=username)
        user_exists = True
    except User.DoesNotExist:
        return Response({
            'user_exists': False,
            'credentials_valid': False,
            'user_type': None,
            'is_superuser': False
        })

    auth_user = authenticate(username=username, password=password)

    return Response({
        'user_exists': user_exists,
        'credentials_valid': auth_user is not None,
        'user_type': user.user_type if user_exists else None,
        'is_superuser': user.is_superuser if user_exists else False
    })

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
