from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.core.mail import send_mail
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied
from .filters import MessageFilter

import logging

from .models import Message, Address, Conversation
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    ConversationSerializer,
    AddressSerializer,
    CreateMessageSerializer,
    MessageSerializer,
)

logger = logging.getLogger(__name__)

class AddressViewSet(viewsets.ModelViewSet): 
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        if serializer.validated_data.get('is_primary_shipping'):
            Address.objects.filter(user=user, is_primary_shipping=True).update(is_primary_shipping=False)
        if serializer.validated_data.get('is_primary_billing'):
            Address.objects.filter(user=user, is_primary_billing=True).update(is_primary_billing=False)
        serializer.save(user=user)

    def perform_update(self, serializer):
        user = self.request.user
        if serializer.validated_data.get('is_primary_shipping'):
            Address.objects.filter(user=user, is_primary_shipping=True).update(is_primary_shipping=False)
        if serializer.validated_data.get('is_primary_billing'):
            Address.objects.filter(user=user, is_primary_billing=True).update(is_primary_billing=False)
        serializer.save(user=user)

class ConversationViewSet(viewsets.ModelViewSet):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        conversation = serializer.save()
        conversation.participants.add(user)  # Add the creator to the participants

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def user_conversations(self, request):
        user = request.user
        logger.info(f"Fetching conversations for user: {user.id} - {user.username}")
        
        if user.is_superuser:
            conversations = Conversation.objects.all()
        else:
            conversations = Conversation.objects.filter(participants=user)
            
        logger.info(f"Conversations found for user {user.username}: {conversations.count()}")
        serializer = self.get_serializer(conversations, many=True)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_class = MessageFilter

    def get_permissions(self):
        if self.action == 'destroy':
            self.permission_classes = [IsAdminUser]
        elif self.action == 'create':
            self.permission_classes = [AllowAny]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateMessageSerializer
        return MessageSerializer

    def get_queryset(self):
        user = self.request.user
        conversation_id = self.request.query_params.get('conversation', None)

        if conversation_id:
            conversation = get_object_or_404(Conversation, id=conversation_id)
            if user.is_superuser or user in conversation.participants.all():
                return Message.objects.filter(conversation=conversation)
            else:
                raise PermissionDenied("You do not have permission to view messages in this conversation.")
        else:
            if user.is_superuser:
                return Message.objects.all()
            return Message.objects.none()

    def create(self, request, *args, **kwargs):
        logger.info("Create method called")
        if request.user.is_authenticated:
            logger.info(f"Authenticated user: {request.user}")
        else:
            logger.info("User is not authenticated")

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['conversation_id'] = serializer.instance.conversation.id

        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        logger.info(f"User in perform_create: {user}")

        conversation_id = self.request.data.get('conversation_id')

        if conversation_id:
            conversation = get_object_or_404(Conversation, id=conversation_id)
        else:
            # Create a new conversation if none exists
            conversation = Conversation.objects.create(
                title=self.request.data.get('title', 'Untitled'),
                email_address=self.request.data.get('email_address', ''),
                phone=self.request.data.get('phone', '')
            )
            if user:
                conversation.participants.add(user)

        serializer.save(user=user, conversation=conversation)

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