"""
Custom exception handlers for DRF.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        if isinstance(response.data, dict):
            error_message = response.data.get('detail', str(response.data))
        else:
            error_message = str(response.data)
        
        response.data = {
            'detail': error_message,
            'status_code': response.status_code
        }
    
    return response
