from application.database import db
from application.models.models import User, Role
from application.extensions import auth, jwt
from datetime import datetime
from application.server import app
from gatco.exceptions import ServerError
from gatco_restapi import  ProcessingException
import random
import qrcode
import os
import string
from gatco_restapi.helpers import to_dict
from sqlalchemy import or_



def current_user(request):
    uid = auth.current_user(request)
    if uid is not None:
        user = db.session.query(User).filter(and_(User.id == uid,User.deleted == False)).first()
        return user
    return None;

def auth_func(request=None, **kw):
    
    uid = auth.current_user(request)
    print("auth_func")
    print(uid)
    if uid is None:
        raise ServerError("API.py auth_func can not found uid")
    
def deny_func(request=None, **kw):
    raise ServerError("Permission denied")

def check_content_json(request):
    content_type = request.headers.get('Content-Type', "")
    content_is_json = content_type.startswith('application/json')
    if not content_is_json:
        raise ProcessingException({'error_code':-1, 'error_message':'Request must have "Content-Type: application/json" header'})
    
        
def password_generator(size = 8, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))
       

