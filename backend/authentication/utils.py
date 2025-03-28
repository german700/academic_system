from django.core.mail import send_mail
from django.conf import settings

def enviar_correo_bienvenida(destinatario, nombre_usuario):
    asunto = "Bienvenido a Academic System"
    mensaje = f"Hola {nombre_usuario},\n\n¡Bienvenido a Academic System! Tu cuenta ha sido creada con éxito."
    remitente = settings.DEFAULT_FROM_EMAIL

    send_mail(asunto, mensaje, remitente, [destinatario])
