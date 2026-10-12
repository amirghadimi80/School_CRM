"""
Custom exception handlers for DRF.
"""
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is None:
        return None

    data = response.data
    # Keep field errors ({"email": ["..."]}) so clients can show them.
    # Only wrap responses that are already a single detail message.
    if isinstance(data, dict) and 'detail' not in data:
        response.data = {**data, 'status_code': response.status_code}
        return response

    if isinstance(data, dict):
        detail = data.get('detail', data)
    else:
        detail = data

    response.data = {
        'detail': detail,
        'status_code': response.status_code,
    }
    return response
