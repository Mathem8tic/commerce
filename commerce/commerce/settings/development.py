from .base import *

DEBUG = True
ALLOWED_HOSTS = ['*']

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'

# The directory where `collectstatic` will collect static files for deployment.
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Database settings
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'mydatabase'),
        'USER': os.environ.get('POSTGRES_USER', 'myuser'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'mypassword'),
        'HOST': 'db',
        'PORT': 5432,
    }
}