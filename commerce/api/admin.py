from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import Address, Message, CustomUser, Conversation

class AddressInline(admin.TabularInline):
    model = Address
    extra = 1

class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ('content', 'conversation')

class CustomUserAdmin(BaseUserAdmin):
    model = CustomUser
    inlines = (AddressInline, MessageInline)
    list_display = ['id', 'username', 'email', 'is_staff', 'is_active']
    search_fields = ['username', 'email']
    readonly_fields = ['id']

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street', 'city', 'state', 'postal_code', 'country')
    search_fields = ('user__username', 'street', 'city', 'state', 'postal_code', 'country')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'content', 'created_at', 'conversation')
    search_fields = ('user__username', 'content', 'conversation__title')
    list_filter = ('created_at',)

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'created_at')
    search_fields = ('title',)
    list_filter = ('created_at',)