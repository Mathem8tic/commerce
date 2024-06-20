import django_filters
from .models import Message

class MessageFilter(django_filters.FilterSet):
    conversation = django_filters.UUIDFilter(field_name='conversation__id')

    class Meta:
        model = Message
        fields = ['conversation']