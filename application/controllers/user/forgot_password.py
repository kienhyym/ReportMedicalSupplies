'''
Created on Oct 14, 2018

@author: namdv
'''
import time
import asyncio
import aiosmtplib
from application.database import redisdb,db
from gatco_restapi.helpers import to_dict
from application.server import app
from application.extensions import  jinja

from gatco.response import json, text
import ujson
import binascii
import uuid
from sqlalchemy import func
from application.controllers.helpers.EmailClient import send_reset_password
from application.models.models import User, Role
from sqlalchemy import or_, and_
from application.extensions import auth
from application.controllers.helpers.helper_common import response_current_user           







async def generate_token(user_id, time_expire):
    token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p = redisdb.pipeline()
    p.set("sessions:" + token, user_id)
    p.expire("sessions:" + token, time_expire)
    p.execute()
    return token
    
    
@app.route('/api/resetpw', methods=["POST"])
async def resetpw_email(request):
    type_confirm = request.json.get("type_confirm", None)
    phone = request.json.get("phone", None)
    email = request.json.get("email", None)
    check_email = None
    if (type_confirm == '0' or type_confirm ==0):
        if ((email is None) or (email == '')):
            return json({"error_code": "PARRAM_ERROR", "error_message": "tham số không hợp lệ"},status=520) 
        check_email = db.session.query(User).filter(and_(User.email == email, User.deleted == False)).first()
        if check_email is None:
            return json({"error_code": "FORGOT_FAILED", "error_message": "Email không tồn tại trong hệ thống"},status=520)
        check_email.type_confirm = 0
        db.session.commit()
        await send_reset_password(request,to_dict(check_email))
        return json({"id":str(check_email.id),"error_message": u"Yêu cầu thành công, mời bạn kiểm tra email để thiết lập lại mật khẩu!"}, status=200)

    else:
        if ((phone is None) or (phone == '')):
            return json({"error_code": "PARRAM_ERROR", "error_message": "tham số không hợp lệ"},status=520) 
        check_email = db.session.query(User).filter(and_(User.phone == phone, User.deleted == False)).first()
        if check_email is None:
            return json({"error_code": "FORGOT_FAILED", "error_message": "Số điện thoại không tồn tại trong hệ thống"},status=520)
        check_email.type_confirm = 1
        db.session.commit()
        await send_reset_password(request,to_dict(check_email))
        return json({"id":str(check_email.id),"error_message": u"Yêu cầu thành công, mời bạn kiểm tra điện thoại để thiết lập lại mật khẩu!"}, status=200)

    
    
   

@app.route('/api/v1/forgotpass/resend-email', methods=["POST"])
async def register_resend_email(request):
    data = request.json
    uid = data.get('uid', None)
    
    user = db.session.query(User).filter(or_(User.email == uid, User.phone == uid)).first()
    if user is None:
        return json({"error_code": "FORGOT_FAILED", "error_message": "Email không hợp lệ"},status=520)
    await send_reset_password(request,to_dict(user))
    return json({"error_message":"send email success"}, status=200)



@app.route('/api/v1/forgotpass/active', methods=["POST"])
async def register_active(request):
    data = request.json
    uid = data.get('uid', None)
    active = data.get('active', None)
    check_token = redisdb.get("session-reset-password:"+str(uid))
    print("session-reset-password:"+str(uid))
    
    print("active===="+active)
    if check_token is not None:
        str_active = check_token.decode('utf8')
        print("str_active=="+str_active)
        if active != str_active:
            return json({"error_code": "ACTIVE_FAILED", "error_message": "Mã số không hợp lệ"},status=520)
        else:
            user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
            if user is None:
                return json({"error_code": "ACTIVE_FAILED", "error_message": "Tham số không hợp lệ"},status=520)
            # user.active = 1
            # db.session.commit()
            result = response_current_user(user)
            return json(result, status=200)
    else:
        return json({"error_code": "ACTIVE_FAILED", "error_message": "Mã số hết hạn sử dụng, vui lòng thử lại"},status=520)

@app.route('/api/v1/forgot/changepass', methods=["POST"])
async def register_active(request):
    data = request.json
    uid = data.get('uid', None)
    password = data.get('password', None)
    active = data.get('active', None)
    check_token = redisdb.get("session-reset-password:"+str(uid))
    if check_token is not None:
        str_active = check_token.decode('utf8')

        if active != str_active:
            return json({"error_code": "ACTIVE_FAILED", "error_message": "Mã số không hợp lệ"},status=520)
        else:
            user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
            if user is None:
                return json({"error_code": "ACTIVE_FAILED", "error_message": "Tham số không hợp lệ"},status=520)
            user.password = auth.encrypt_password(password,user.salt)
            db.session.commit()
            result = response_current_user(user)
            return json(result, status=200)
    else:
        return json({"error_code": "ACTIVE_FAILED", "error_message": "Mã số hết hạn sử dụng, vui lòng thử lại"},status=520)


        