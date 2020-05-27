#from gatco.exceptions import ServerError
from application.server import app
from gatco.response import json
from application.database import redisdb, db
from application.client import HTTPClient 
from application.models.models import Organization
import random
import os
from sqlalchemy import or_,and_
import re
import binascii
import asyncio
import aiohttp
import hashlib
import ujson
import uuid
import string
from datetime import datetime,timezone
import time
from gatco_restapi.helpers import to_dict
from application.models.models import User

def hash_value(value):
    return hashlib.md5(value.encode('utf-8')).hexdigest()


def convert_timestamp_to_utctimestamp(value):
#     dtobj_utc = datetime.utcfromtimestamp(value)
    dtobj_utc = None
    try:
        
        dtobj_utc = datetime.utcfromtimestamp(int(value))
    except:
        try:
            dtobj_utc = datetime.strptime(value, '%Y-%m-%d')
        except:
            return None
    date_utc = datetime(dtobj_utc.year, dtobj_utc.month, dtobj_utc.day)
    return int(date_utc.replace(tzinfo=timezone.utc).timestamp())

def convert_timestamp_to_string(value, format):
    dtobj_utc = None
    try:
        dtobj_utc = datetime.fromtimestamp(int(value))
    except:
        try:
            dtobj_utc = datetime.strptime(value)
        except:
            return None
    return dtobj_utc.strftime(format)

def convert_datetime_to_timestamp(value, formatdate):
    result = None
    if value is None:
        result = None
    else:
        try:
            validate_ngaysinh = int(value)
            result = validate_ngaysinh
        except:
            for format in ['%d-%m-%Y','%Y-%m-%d','%Y-%m-%dT%H:%M:%S','%d/%m/%Y']:
                try:
                    value = datetime.strptime(value, format)
                    date_utc = datetime(value.year, value.month, value.day)
                    result = int(date_utc.replace(tzinfo=timezone.utc).timestamp())
                    break
                except:
                    continue
    return result

def check_content_json(request):
    ret = False
    try:
        content_type = request.headers.get('Content-Type', "")
        ret = content_type.startswith('application/json')
    except:
        pass
    return ret

def valid_phone_number(phone_number):
    if phone_number is None:
        return False
    if phone_number.isdigit() and len(phone_number)>=8 and len(phone_number)<=12 and phone_number.startswith("0"):
        return True
    return False

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

def check_donvi(donvi_id):
    return db.session.query(Organization).filter(Organization.id == donvi_id).first()

def password_generator(size = 8, chars=string.ascii_letters + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def generator_salt():
    return ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(24))

def current_uid(request):
    user_token = request.headers.get("X-USER-TOKEN", None)
    print("user_token=======================", user_token)
    if user_token is None:
        return None
    uid = redisdb.get("sessions:" + user_token)
    if uid is not None:
        p = redisdb.pipeline()
        p.set("sessions:" + user_token, uid)
        p.expire("sessions:" + user_token, app.config.get('SESSION_EXPIRED', 86400))
        p.execute()
        return uid.decode('utf8')
    
    return None

def generate_user_token(uid):
    token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p = redisdb.pipeline()
    p.set("sessions:" + token, uid)
    print("token22222222222=====", token)
    p.expire("sessions:" + token, app.config.get('SESSION_EXPIRE_TIME', 86400))
    p.execute()
    return token


# def current_uid_canbo(request):
#     user_token = request.headers.get("X-USER-TOKEN", None)
#     if user_token is None:
#         return None
#     uid = redisdb.get("sessions-canbo:" + user_token)
#     if uid is not None:
#         p = redisdb.pipeline()
#         p.set("sessions-canbo:" + user_token, uid)
#         p.expire("sessions-canbo:" + user_token, app.config.get('SESSION_EXPIRED', 86400))
#         p.execute()
#         return uid.decode('utf8')
    
#     return None

async def get_current_user(request, userId):
    if userId is not None:
        user = db.session.query(User).filter(or_(User.id ==userId,User.phone == userId, User.email == userId)).first()
        if user is None:
            return None
        return response_current_user(user)
    return None

def response_current_user(user):
    response = {}
    token = generate_user_token(user.id)
    print("token1=================", token)
    response["id"] = user.id
    response["name"] = user.name
    response["phone"] = user.phone
    response["email"] = user.email
    response["token"] = token
    response["active"] = user.active
    response["organization_id"] = user.organization_id
    response["accountName"] = user.accountName
    response["Organization"] = to_dict(user.Organization)
    response["token"] = token
    # response["type_donvi"] = user.type_donvi
    
    roles = []
    if user.roles is not None:
        for role in user.roles:
            roles.append(role.name)
    response["roles"] = roles
    return response



# def generate_user_token(uid_user):
#     token =  binascii.hexlify(uuid.uuid4().bytes).decode()
#     print("token2==================", token)
#     p1 = redisdb.pipeline()
#     p1.set("sessions:" + token, uid_user)
#     p1.expire("sessions:" + token, app.config.get('SESSION_EXPIRE_TIME', 86400))
#     p1.execute()
#     return token


async def hasRole(request, role):
    uid = current_uid(request)
    if uid is None:
        return False;
    else:
        currentUser = await get_current_user(request, uid)
        if currentUser is not None and role in currentUser["roles"]:
            return True
        else:
            return False

async def  hasTuyenDonvi(request, tuyendonvi_id):
    uid = current_uid(request)
    if uid is None:
        return False
    else:
        currentUser = await get_current_user(request, uid)
        Organization = currentUser["Organization"]
        if Organization is not None and "tuyendonvi_id" in  Organization:
            if tuyendonvi_id == Organization["tuyendonvi_id"]:
                return True
            else:
                return False
        return False


async def validate_admin(request, **kw):
    
    uid = current_uid(request)
    if uid is None:
        return {'error_code':'SESSION_EXPIRED', 'error_message':'Session Expired!'}
    else:
        user = db.session.query(User).filter(and_(User.id == uid,User.deleted == False)).first()
        roles = user.roles
        list_role = []
        for role in roles:
            list_role.append(role.name)
        if 'admin' not in list_role:
            return {'error_code':'ERROR_PERMISSION', 'error_message':'Permission deny!'}

def validate_user(request, **kw):
    uid = current_uid(request)
    if uid is None:
        return {'error_code':'SESSION_EXPIRED', 'error_message':'Session Expired!'}


    

async def check_user(uid):    
    url = app.config.get("USER_STORE_URL", "http://127.0.0.1:9018/api/v1/") + str('checkuser')
    data_key = {'data':uid}
    headers = {'content-type': 'application/json'}
    response = await HTTPClient.post(url, data=data_key, headers=headers)
    if(response is not None and "error_code" not in response):
        return response
    return None



async def generate_id_record(sochamsoc_id, record_type,  params):
    record_id = str(uuid.uuid4())
    thoigian_param = None
    check_key = False
    prefix = ""
    if record_type == "mevabe_sochamoc_cannangchieucao":
        thoigian_param = params['thoigian']
        check_key = True
    elif record_type == app.config.get("RECORD_THEODOI_TIEMCHUNG") or record_type == app.config.get("RECORD_TIEMPHONG_UONVAN_ME"):
        thoigian_param = params['ngaytiem']
        check_key = True
        if "mavacxin" in params and params["mavacxin"] is not None:
            prefix = params["mavacxin"]
            if "somuitiem" in params and params["somuitiem"] is not None:
                prefix = str(params["mavacxin"])+"_"+str(params["somuitiem"])
        else:
            prefix = record_id
            
    elif record_type in [app.config.get("RECORD_KHAMSUCKHOE_TRE"),app.config.get("RECORD_KHAMTHAI"), app.config.get("RECORD_KHAMSUCKHOE_ME")]:
        thoigian_param = params['ngaykham']
        check_key = True
    
    valid_thoigian = convert_timestamp_to_utctimestamp(thoigian_param)

    if check_key == True and thoigian_param is not None and thoigian_param !="" and valid_thoigian is not None:
#         try:
#             valid_thoigian = datetime.utcfromtimestamp(thoigian_param)
#         except:
#             valid_thoigian = datetime.strptime(thoigian_param, '%Y-%m-%d')
#         record_id = hash_value(sochamsoc_id + valid_thoigian.strftime("%Y-%m-%d"))
        if prefix is not None and prefix !="":
            record_id = hash_value(sochamsoc_id +"_"+ str(valid_thoigian)+"_"+record_type+"_"+str(prefix))
        else:
            record_id = hash_value(sochamsoc_id +"_"+ str(valid_thoigian)+"_"+record_type)

    return record_id


async def check_permission_public(uid):
    result = {}
    result["read"] = False
    result["write"] = False
    current_time = int(time.time())
    so_public = db.session.query(PermissionSoPublic).filter(PermissionSoPublic.id == uid).first()
    if so_public is None or so_public.type == -1:
        return result
    else:
        if so_public.type == 0 or current_time < so_public.expired_time:
            if so_public.roles == "write":
                result["write"] = True
                result["read"] = True
            elif  so_public.roles == "read":
                result["read"] = True
            
    return result

def validate_email(email):
    return re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', email)

def default_uuid():
    return str(uuid.uuid4())