from django.shortcuts import render

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import User
import logging

from .models import Message
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    CreateMessageSerializer,
    MessageSerializer,
)

logger = logging.getLogger(__name__)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    permission_classes = [AllowAny]  # Allow any user to create messages

    def get_permissions(self):
        if self.action in ['destroy']:
            self.permission_classes = [IsAdminUser]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateMessageSerializer
        return MessageSerializer

    def create(self, request, *args, **kwargs):
        logger.info("Create method called")
        if request.user.is_authenticated:
            logger.info(f"Authenticated user: {request.user}")
        else:
            logger.info("User is not authenticated")

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        logger.info(f"User in perform_create: {user}")
        serializer.save(user=user)

    def update(self, request, *args, **kwargs):
        logger.info(f"User {request.user} is updating a message with ID {kwargs['pk']}")
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        logger.info(f"User {request.user} is deleting a message with ID {kwargs['pk']}")
        return super().destroy(request, *args, **kwargs)

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer