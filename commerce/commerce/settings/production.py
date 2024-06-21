from .base import *


DEBUG = False
ALLOWED_HOSTS = ['143.198.32.144', 'friendsdiscount.ca']
CORS_ALLOWED_ORIGINS = [
    "https://friendsdiscount.ca",
    "https://143.198.32.144",
]

# Static files (CSS, JavaScript, Images)
STATIC_ROOT = BASE_DIR / 'static/'

# Security settings
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Ensure the correct secret key is used in production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')