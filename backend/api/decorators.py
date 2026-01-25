"""
Custom decorators for API views to reduce boilerplate.
"""
from functools import wraps
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


def analytics_view(methods=['GET']):
    """
    Decorator for analytics endpoints that combines @api_view and @permission_classes.
    
    Usage:
        @analytics_view()
        def my_endpoint(request):
            ...
    
    Or for POST endpoints:
        @analytics_view(['POST'])
        def my_endpoint(request):
            ...
    """
    def decorator(func):
        @api_view(methods)
        @permission_classes([IsAuthenticated])
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            return func(request, *args, **kwargs)
        return wrapper
    return decorator
