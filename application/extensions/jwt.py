from collections import OrderedDict
from datetime import timedelta
from functools import wraps

from itsdangerous import (
    TimedJSONWebSignatureSerializer,
    SignatureExpired,
    BadSignature
)

from gatco.response import json, text
from gatco.request import json_loads

from gatco.exceptions import ServerError

'''def _get_serializer():
    config_value = app.config.get
    expires_in = config_value('JWT_EXPIRATION_DELTA')
    if isinstance(expires_in, timedelta):
        expires_in = int(expires_in.total_seconds())
    expires_in_total = expires_in + config_value('JWT_LEEWAY')
    return TimedJSONWebSignatureSerializer(
        secret_key=config_value('JWT_SECRET_KEY'),
        expires_in=expires_in_total,
        algorithm_name=config_value('JWT_ALGORITHM')
    )


def _default_payload_handler(user):
    return {
        'user_id': user.id,
    }


def _default_encode_handler(payload):
    """Return the encoded payload."""
    return _get_serializer().dumps(payload).decode('utf-8')


def _default_decode_handler(token):
    """Return the decoded token."""
    try:
        result = _get_serializer().loads(token)
    except SignatureExpired:
        if config_value('JWT_VERIFY_EXPIRATION'):
            raise
    return result


def _default_response_handler(payload):
    """Return a Flask response, given an encoded payload."""
    return jsonify({'token': payload})
'''

class JWTError(ServerError):
    pass
        
class JWT(object):
    app = None
    secret = None
    algorithm = 'HS256'
    
    def __init__(self, app=None):
        if app is not None:
            self.app = app
            self.init_app(app)
        else:
            self.app = None


    def init_app(self, app):
        if self.app is not None:
            raise RuntimeError('already initialized with an application')
        get = app.config.get
        self.secret = get('APP_API_SECRET', None)
        self.algorithm = get('APP_API_ALGORITHM', "HS256")
        self.expiration_delta = get('APP_API_EXPIRATION_DELTA', timedelta(seconds=300))
        self.leeway = get('APP_API_LEEWAY', 0)
        self.app = app
        
        #app.errorhandler(JWTError)(self._on_jwt_error)
    def get_serializer(self):
        if self.app is None:
            raise RuntimeError('The app must not be None')
        
        expires_in = self.expiration_delta
        if isinstance(expires_in, timedelta):
            expires_in = int(expires_in.total_seconds())
        expires_in_total = expires_in + self.leeway
        
        return TimedJSONWebSignatureSerializer(
            secret_key=self.secret,
            expires_in=expires_in_total,
            algorithm_name=self.algorithm
        )
    
    def encode(self, payload):
        return self.get_serializer().dumps(payload).decode('utf-8')
    
    def decode(self, token):
        try:
            result = self.get_serializer().loads(token)
        except SignatureExpired:
            #if self.app.config.get('JWT_VERIFY_EXPIRATION'):
            raise ServerError("Token expired") 
        return result
    
    def _on_jwt_error(self, e):
        return getattr(self, 'error_callback', self._error_callback)(e)
    
    def _error_callback(self, e):
        return json(OrderedDict([
            ('status_code', e.status_code),
            ('error', e.error),
            ('description', e.description),
        ]), status=e.status_code)   #, e.status_code, e.headers
        
    
    def error_handler(self, callback):
        """Specifies the error handler function. This function receives a JWTError instance as
        its only positional argument. It can optionally return a response. Example::

            @jwt.error_handler
            def error_handler(e):
                return "Something bad happened", 400

        :param callback: the error handler function
        """
        self.error_callback = callback
        return callback

    def payload_handler(self, callback):
        """Specifies the payload handler function. This function receives a
        user object and returns a dictionary payload.

        Example::

            @jwt.payload_handler
            def make_payload(user):
                return {
                    'user_id': user.id,
                    'exp': datetime.utcnow() + current_app.config['JWT_EXPIRATION_DELTA']
                }

        :param callable callback: the payload handler function
        """
        self.payload_callback = callback
        return callback