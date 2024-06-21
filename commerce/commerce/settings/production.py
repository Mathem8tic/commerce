from .base import *


DEBUG = False
ALLOWED_HOSTS = ['143.198.32.144', 'friendsdiscount.ca']
# Ensure SSL redirect is enabled for HTTPS
SECURE_SSL_REDIRECT = True
# Trust the reverse proxy's scheme headers
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CORS_ALLOWED_ORIGINS = [
    "https://friendsdiscount.ca",
    "https://143.198.32.144",
]

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Security settings
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Ensure the correct secret key is used in production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')