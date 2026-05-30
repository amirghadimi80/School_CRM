"""
WebSocket authentication middleware.
"""
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections


@database_sync_to_async
def get_user_from_token(token):
    from apps.users.models import User
    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    """
    Middleware to authenticate WebSocket connections using JWT token.
    Token should be provided in the query string: ?token=<jwt_token>
    """
    
    def __init__(self, inner):
        super().__init__(inner)
    
    async def __call__(self, scope, receive, send):
        close_old_connections()
        
        query_string = scope.get('query_string', b'').decode()
        token = None
        
        # Parse query string for token
        if 'token=' in query_string:
            params = query_string.split('&')
            for param in params:
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
        
        # Also check headers for token
        headers = dict(scope.get('headers', []))
        if not token and b'authorization' in headers:
            auth_header = headers[b'authorization'].decode()
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        scope['user'] = await get_user_from_token(token) if token else AnonymousUser()
        
        return await super().__call__(scope, receive, send)
