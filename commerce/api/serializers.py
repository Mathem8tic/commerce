from rest_framework import serializers
from .models import Message, Address, Conversation, CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MessageSerializer(serializers.ModelSerializer):
    username = serializers.StringRelatedField(source='user.username', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'conversation', 'username', 'content', 'created_at']

class AddressSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    
    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'postal_code', 'country', 'type', 'is_primary_shipping', 'is_primary_billing', 'user']
        read_only_fields = ['user', 'id']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    participants = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'email_address', 'phone', 'participants', 'messages', 'created_at', 'updated_at']

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
    addresses = AddressSerializer(many=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'email', 'addresses']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(validated_data['username'], validated_data['email'], validated_data['password'])
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['is_staff'] = user.is_staff
        token['is_user'] = user.is_active

        return token