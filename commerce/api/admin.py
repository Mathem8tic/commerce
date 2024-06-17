from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Address, Message

class AddressInline(admin.TabularInline):
    model = Address
    extra = 1

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0  # Number of extra forms to show
    fields = ('title','content')

class UserAdmin(BaseUserAdmin):
    inlines = (AddressInline, MessageInline)

# Unregister the default User admin
admin.site.unregister(User)

# Register the customized User admin
admin.site.register(User, UserAdmin)

class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street', 'city', 'state', 'postal_code', 'country')
    search_fields = ('user__username', 'street', 'city', 'state', 'postal_code', 'country')

admin.site.register(Address, AddressAdmin)

class MessageAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'content')
    search_fields = ('user__username', 'title', 'content')
    
admin.site.register(Message, MessageAdmin)