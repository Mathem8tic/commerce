import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class BaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True

class CustomUser(AbstractUser, BaseModel):
    pass

class Message(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    title = models.CharField(max_length=100)
    content = models.TextField()
    email_address = models.EmailField(max_length=254, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.user.username if self.user else 'Anonymous'} at {self.created_at}"

class Address(BaseModel):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)

    def __str__(self):
        return f'{self.street}, {self.city}, {self.state}, {self.postal_code}, {self.country}'