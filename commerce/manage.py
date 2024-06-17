#!/usr/bin/env python
import os
import sys
# import debugpy

if __name__ == '__main__':
    # Only enable debugpy in development mode
    # if os.environ.get('DJANGO_SETTINGS_MODULE') == 'commerce.settings.development':
    #     debugpy.listen(("0.0.0.0", 5678))
    #     print("Waiting for debugger attach...")
    #     debugpy.wait_for_client()
        
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)