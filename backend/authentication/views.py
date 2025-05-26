#C:\Users\germa\Desktop\academic_system\backend\authentication\views.py
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from .models import User
from .serializers import UserProfileSerializer, CustomTokenObtainPairSerializer
from .utils import enviar_contrasena_provisional
import random
import string

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

@api_view(['GET'])
@permission_classes([AllowAny])
def confirm_email(request, uidb64, token):
    """
    NOTA: Este endpoint ya no se usa desde los enlaces de correo.
    Los enlaces ahora apuntan al frontend. 
    Se mantiene para uso interno de APIs si es necesario.
    """
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError):
        return Response({'error': 'Usuario no válido.'}, status=status.HTTP_400_BAD_REQUEST)

    if user.email_confirmed:
        return Response({'message': 'El correo ya estaba confirmado.'}, status=status.HTTP_200_OK)

    if default_token_generator.check_token(user, token):
        user.email_confirmed = True
        user.save()
        return Response({'message': 'Correo confirmado. Ahora define tu contraseña definitiva.'}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Token inválido o expirado.'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([AllowAny])
def set_new_password(request):
    """
    Endpoint principal para cambiar contraseña desde el frontend.
    El frontend envía uid, token y nueva contraseña.
    """
    uid = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("password")

    if not uid or not token or not new_password:
        return Response({'error': 'Faltan parámetros requeridos (uid, token, password).'}, status=400)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except Exception:
        return Response({'error': 'Enlace inválido o usuario no encontrado.'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Token inválido o expirado.'}, status=400)

    # Validación básica de contraseña
    if len(new_password) < 6:
        return Response({'error': 'La contraseña debe tener al menos 6 caracteres.'}, status=400)

    user.set_password(new_password)
    user.email_confirmed = True
    user.save()

    return Response({'message': 'Contraseña actualizada correctamente.'}, status=200)