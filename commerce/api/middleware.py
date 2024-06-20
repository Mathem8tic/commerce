import logging
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth.models import AnonymousUser
from django.middleware.common import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from urllib.parse import parse_qs
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        logger.info("JWTAuthMiddleware called")
        query_string = parse_qs(scope['query_string'].decode())
        token = query_string.get('token', [None])[0]
        
        logger.info(f"Token from query string: {token}")
        
        if token:
            try:
                decoded_token = UntypedToken(token)
                user_id = decoded_token['user_id']
                logger.info(f"Decoded user ID: {user_id}")
                scope['user'] = await get_user(user_id)
            except (InvalidToken, TokenError) as e:
                logger.error(f"Invalid token error: {str(e)}")
                scope['user'] = AnonymousUser()
        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)

def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)

class JWTAuthMiddlewareForHTTP(MiddlewareMixin):
    def process_request(self, request):
        logger.info("JWTAuthMiddlewareForHTTP called")
        
        if request.path.startswith('/admin/'):
            return  # Skip middleware for admin URLs
        
        auth = JWTAuthentication()
        
        try:
            user_token_tuple = auth.authenticate(request)
            if user_token_tuple is not None:
                user, token = user_token_tuple
                request.user = user
            else:
                request.user = AnonymousUser()
        except (InvalidToken, TokenError):
            request.user = AnonymousUser()
