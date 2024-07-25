from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MessageViewSet, RegisterView, UserProfileView, CustomTokenObtainPairView, AddressViewSet, ConversationViewSet, CategoryViewSet, ProductViewSet, PriceGroupViewSet, UserPricingViewSet, ProductListView

from .consumers import ChatConsumer

router = DefaultRouter()
router.register(r'messages', MessageViewSet)
router.register(r'addresses', AddressViewSet)
router.register(r'conversations', ConversationViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'price_groups', PriceGroupViewSet)
router.register(r'user_pricing', UserPricingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('products/', ProductListView.as_view(), name='product-list'),
]

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<room_name>[^/]+)/$', ChatConsumer.as_asgi()),
]