from .base import *

DEBUG = False
ALLOWED_HOSTS = ['143.198.32.144', 'friendsdiscount.ca', 'api.friendsdiscount.ca', 'django']

# Security settings
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# CORS settings
CORS_ALLOWED_ORIGINS = [
    "https://friendsdiscount.ca",
    "https://api.friendsdiscount.ca",
    "https://143.198.32.144",
    "django"
]

# CSRF settings
CSRF_TRUSTED_ORIGINS = [
    "https://friendsdiscount.ca",
    "https://api.friendsdiscount.ca",
    "https://143.198.32.144",
    "django"
]

# Static and media files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Ensure the correct secret key is used in production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
