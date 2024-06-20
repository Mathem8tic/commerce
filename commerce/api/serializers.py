from rest_framework import serializers
import logging
from .models import Message, Address, Conversation, CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers


logger = logging.getLogger(__name__)

User = get_user_model()


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.StringRelatedField(source='user.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'username', 'content', 'created_at']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id','street', 'city', 'state', 'postal_code', 'country', 'type', 'is_primary_shipping', 'is_primary_billing']

class ConversationSerializer(serializers.ModelSerializer):
    # messages = MessageSerializer(many=True, read_only=True)
    participants = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'email_address', 'phone', 'participants', 'created_at', 'updated_at']

class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user if user.is_authenticated else None
        return super().create(validated_data)

class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'addresses', 'messages']

class RegisterSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, required=False)

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'email', 'addresses']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        addresses_data = validated_data.pop('addresses', None)
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        if addresses_data:
            for address_data in addresses_data:
                Address.objects.create(user=user, **address_data)
        return user

User = get_user_model()
logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    login = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        logger.info("CustomTokenObtainPairSerializer validate method called.")
        login = attrs.get('login')
        password = attrs.get('password')

        if login and password:
            user = None
            if '@' in login:
                try:
                    user_obj = User.objects.get(email=login)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            else:
                user = authenticate(username=login, password=password)

            if not user:
                raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')
        else:
            raise serializers.ValidationError('Must include "login" and "password".', code='authorization')

        data = super().validate(attrs)
        refresh = self.get_token(user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)

        user_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
        }

        data['user'] = user_data
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        token['is_user'] = user.is_active
        return token
