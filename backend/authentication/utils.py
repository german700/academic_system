# C:\Users\germa\Desktop\academic_system\backend\authentication\utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.core.signing import TimestampSigner, SignatureExpired, BadSignature
from django.contrib.auth.tokens import PasswordResetTokenGenerator
import six

signer = TimestampSigner()

def generar_token_confirmacion(email):
    # Crea un token firmado basado en el email
    return signer.sign(email)

def verificar_token_confirmacion(token, max_age=86400):
    # max_age en segundos (86400 = 1 día)
    try:
        email = signer.unsign(token, max_age=max_age)
        return email
    except SignatureExpired:
        return None
    except BadSignature:
        return None

def enviar_correo_confirmacion(destinatario, token):
    asunto = "Confirma tu correo en Academic System"
    enlace = f"http://tu-dominio.com/api/auth/confirmar/{token}/"  # Actualiza con tu URL de confirmación
    mensaje = (
        f"Hola,\n\n"
        f"Para confirmar tu correo, por favor haz clic en el siguiente enlace:\n{enlace}\n\n"
        f"Este enlace expirará en 24 horas.\n\n"
        f"Saludos,\nAcademic System"
    )
    remitente = settings.DEFAULT_FROM_EMAIL
    send_mail(asunto, mensaje, remitente, [destinatario])

def enviar_contrasena_provisional(destinatario, contrasena):
    asunto = "Contraseña provisional para Academic System"
    mensaje = (
        f"Hola,\n\n"
        f"Tu cuenta ha sido confirmada. Aquí tienes tu contraseña provisional: {contrasena}\n"
        f"Por favor, cambia esta contraseña en tu primer inicio de sesión.\n\n"
        f"Saludos,\nAcademic System"
    )
    remitente = settings.DEFAULT_FROM_EMAIL
    send_mail(asunto, mensaje, remitente, [destinatario])

class EmailConfirmationTokenGenerator(PasswordResetTokenGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            six.text_type(user.pk) + six.text_type(timestamp) +
            six.text_type(user.email_confirmed)
        )

email_confirmation_token = EmailConfirmationTokenGenerator()