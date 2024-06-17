from django.urls import path

from rest_framework.routers import DefaultRouter
from .views import MessageViewSet, RegisterView, UserProfileView

router = DefaultRouter()
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]