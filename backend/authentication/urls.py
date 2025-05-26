# C:\Users\germa\Desktop\academic_system\backend\authentication\urls.py
from django.urls import path
from .views import CustomTokenObtainPairView, UserProfileView, confirm_email, set_new_password
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), 
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('confirm-email/<uidb64>/<token>/', confirm_email, name='confirm_email'),
    path('set-new-password/', set_new_password, name='set_new_password'),
]