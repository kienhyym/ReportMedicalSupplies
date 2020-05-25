from application.server import app
from gatco.exceptions import ServerError
from gatco_restapi import  ProcessingException
import ujson
from gatco.response import json
from gatco_restapi.helpers import to_dict
from application.database import db,redisdb
from Crypto.Cipher import AES
import requests
from Crypto import Random
from Crypto.Hash import SHA256
import  base64, re
import binascii
import uuid
from application.models.models import User

def convert_text_khongdau(text):
    if text is None:
        return None
    kituA=["á","à","ạ","ã","ả","â","ấ","ầ","ậ","ẫ","ă","ằ","ắ","ẳ"]
    kituE=["é","è","ẹ","ẻ","ẽ","ê","ế","ề","ệ","ễ","ể"]
    kituI=["í","ì","ị","ỉ","ĩ"]
    kituO=["ò","ó","ọ","ỏ","õ","ô","ồ","ố","ộ","ổ","ỗ","ơ","ờ","ớ","ợ","ở","ỡ"]
    kituU=["ù","ú","ụ","ủ","ũ","ư","ừ","ứ","ự","ử","ữ"]
    kituY=["ỳ","ý","ỵ","ỷ","ỹ"]

    ten = text.lower()
    for i in ten:
        if i in kituA:
            ten = ten.replace(i,"a")
        elif i in kituE:
            ten = ten.replace(i,"e")
        elif i in kituI:
            ten = ten.replace(i,"i")
        elif i in kituO:
            ten = ten.replace(i,"o")
        elif i in kituU:
            ten = ten.replace(i,"u")
        elif i in kituY:
            ten = ten.replace(i,"y")
        elif i=="đ":
            ten = ten.replace(i,"d")
    return ten

def validate_email(email):
    return re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)


def validate_header(request):
    ret = False
    try:
        content_type = request.headers.get('Content-Type', "")
        ret = content_type.startswith('application/json')
    except:
        pass
    return ret

def hash_value(value):
    return SHA256.new(value.encode('utf-8')).hexdigest()

def encrypt(salt, value):
    iv = Random.new().read(AES.block_size)
    cipher = AES.new(salt, AES.MODE_CFB, iv)
    return base64.b64encode( iv + cipher.encrypt( value ) ).decode('utf-8')
    
    
def decrypt(secret_key, hash_value):
    enc = base64.b64decode(hash_value)
    iv = enc[:AES.block_size]
    cipher = AES.new(secret_key, AES.MODE_CFB, iv )
    return re.sub(b'\x00*$', b'', cipher.decrypt( enc[AES.block_size:])).decode('utf-8')

def generate_user_token(uid):
    token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p = redisdb.pipeline()
    p.set("sessions:" + token, uid)
    p.expire("sessions:" + token, app.config.get('SESSION_EXPIRE_TIME', 86400))
    p.execute()
    return token

def generate_uid(size):
    arr_prekey = ['AAA'] #,'BBB','CCC'
    for key in arr_prekey:
        data_key = 'generator_canboyte_'+str(key)
        data_value = redisdb.get(data_key)
        print(data_value)
        if(key is not None and key =='AA'):
            print('AA use for Admin!, please send other key')
            continue
            
        if(data_value is not None):
            print(redisdb.smembers("generator_canboyte_*"))
            print('generate key is exited!, please send other key')
            print(redisdb.keys("generator_canboyte_*"))
            continue
        else:
            key_check = str(key)+'00000001'
            check_user = db.session.query(User).filter(User.id == key_check).count()
            if(check_user is not None and check_user >0):
                continue
            redisdb.setnx(data_key, key)
        for x in range(0,size):
            value = key
            length = len(str(x))
            if length < 8:
                for i in range(0, (8-length)):
                    value += str('0')
            elif length>8:
                return
            value += str(x)
            redisdb.sadd('user_key_canboyte', value)
        
#         print(redisdb.smembers("user_key"))
        total = redisdb.scard("user_key_canboyte")
        print('total_'+str(total))
#         print(redisdb.spop( "user_key"))
        return

def reset_user_passwd(instance_id=None, data=None,**kw):
    if (data is not None) and ('password' in data) and ('confirm_password' in data):
        if (data['password'] is not None):
            if(data['password'] == data['confirm_password']):
                    #del data['newpassword']
                del data['confirm_password']
                print("reset_user_passwd===="+data["password"])
            else:
                return json({"error_code":"PASSWORD_MISSMATCH","error_message":"Confirm password is not match"}, status=520)
        else:
            del data['confirm_password']
            del data['password']
    else:
        return json({"error_code":"PARAMETER_ERROR","error_message":"Parameters are not correct"}, status=520)
    


def get_user_with_permission(user):
    user_info = to_dict(user)
    del(user_info["password"])
    return user_info

  
def get_app_postprocess(request, result=None, Model=None, headers={}, **kw):
    if (result is not None) and ('id' in result) and ("app_secret" in result):
        del result['app_secret']        
