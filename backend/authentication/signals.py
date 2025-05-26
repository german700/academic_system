# authentication/signals.py

#from django.db.models.signals import post_save
#from django.dispatch import receiver
#from django.utils.http import urlsafe_base64_encode
#from django.utils.encoding import force_bytes
#from django.contrib.auth.tokens import default_token_generator
#from django.core.mail import send_mail
#from django.conf import settings
#from .models import User

#@receiver(post_save, sender=User)
#def enviar_correo_activacion(sender, instance, created, **kwargs):
#    if created and not instance.is_superuser:
#        uid = urlsafe_base64_encode(force_bytes(instance.pk))
#        token = default_token_generator.make_token(instance)
#
 #       # ¡Enlace al frontend, no al API!
  #      link = f"http://localhost:5173/cambiar-contraseña/{uid}/{token}/"
   #     mensaje = (
    #        f"Hola {instance.first_name},\n\n"
     #       f"Pulsa aquí para activar tu cuenta y establecer tu contraseña:\n\n"
      #      f"{link}\n\n"
       #     "Este enlace expira en 24 horas."
        #)
        #send_mail(
#            subject="Activa tu cuenta",
 #           message=mensaje,
  #          from_email=settings.DEFAULT_FROM_EMAIL,
   #         recipient_list=[instance.email],
    #        fail_silently=False,
     #   )
