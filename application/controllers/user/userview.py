from application.database import redisdb,db
from application.server import app
from gatco.response import json,text, html
from application.extensions import jinja
from application.extensions import apimanager
import asyncio
import hashlib
import binascii
from application.client import HTTPClient 
import ujson
import uuid
from sqlalchemy import func
import time
from application.controllers.helpers.helper_common import *            
from application.extensions import auth
from sqlalchemy import or_, and_
from gatco_restapi.helpers import to_dict
from application.models.models import User, Role

from application.controllers.helpers.EmailClient import send_active_account



#from application.controllers.admin import resp


def deny_func(request=None, **kw):
    return json({'error_code':"ERROR_PERMISSION_DENY", 'error_message':'Permission denied'}, status=520)

@app.route('/')
async def index(request):
    return jinja.render('index.html', request)

@app.route('/landingpage')
async def index(request):
    return jinja.render('landingpage.html', request)


@app.route('/privacy')
async def contact(request):
#     return jinja.render('admin/index.html', request)
    return jinja.render('dieukhoan.html', request)

 

@app.route('/api/v1/current_user')
async def check_current_user(request):
    uid = current_uid(request)
    print("check_current_user.uid===",uid)
    data = await get_current_user(request,uid)
    if data is None:
        return json({"error_code": "SESSION_EXPIRED", "error_msg": "Hết phiên làm việc, vui lòng đăng nhập lại!"},status=520)
    else:
        return json(data,status=200)
    
@app.route('/api/v1/login', methods=["POST"])
async def do_login(request):
    if not check_content_json(request):
        return json({"error_message":"content type is not application-json", "error_code":"PARAM_ERROR"}, status=520)
    
    param = request.json
    if "data" not in param or param['data'] is None or "password" not in param \
        or (param['password'] is None) or (len(param['data']) == 0) or (len(param['password']) == 0):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    data = param['data']
    password = param['password']
    user = db.session.query(User).filter(and_(or_(User.phone == data, User.email == data, User.accountName == data),User.active==1)).first()
    if user is None or user.deleted == True:
        return json({"error_code":"LOGIN_FAILED", "error_message":u"Tài khoản không tồn tại"}, status=520)
    else:
        if auth.verify_password(password, user.password, user.salt):
            check_donvi = db.session.query(Organization).filter(Organization.id == user.organization_id).first()
            if check_donvi is not None and check_donvi.active != 1:
                return json({"error_code":"LOGIN_FAILED", "error_message":u"Đơn vị trực thuộc hiện đang bị khóa. Vui lòng thử lại sau."}, status=520)
            result = response_current_user(user)
            return json(result, status=200)
        else:
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Mật khẩu không đúng"}, status=520)


@app.route('/api/v1/register', methods=["POST"])
async def register(request):
    if request.method == 'POST':
        data = request.json
        password = data.get('password', None)
        name = data.get('name', None)
        email = data.get('email', None)
        phone = data.get('phone', None)
        type_confirm = data.get('type_confirm', None)

        if name is None or  name.strip() == '':
            return json({"error_code": "REGISTER_FAILED", "error_message": "Họ và tên không được để trống!"},status=520)
        if password is None or  password.strip() == '':
            return json({"error_code": "REGISTER_FAILED", "error_message": "Mật khẩu không hợp lệ!"},status=520)
        
        if email is not None and email.strip() != '':
            check_email = db.session.query(User).filter(and_(User.email == email, User.deleted == False)).first()
            if check_email is not None:
                return json({"error_code": "REGISTER_FAILED", "error_message": "Email đã tồn tại trong hệ thống"},status=520)
        else:
            email = None

        if phone is not None and phone.strip() == '':
            phone = None
        
        if phone is not None:
            check_phone = db.session.query(User).filter(and_(User.phone == phone, User.deleted == False)).first()
            if check_phone is not None:
                return json({"error_code": "REGISTER_FAILED", "error_message": "Số điện thoại đã tồn tại trong hệ thống"},status=520)
        if phone is None and email is None:
            return json({"error_code": "REGISTER_FAILED", "error_message": "Email hoặc số điện thoại không được để trống"},status=520)

        
        salt = str(generator_salt())
        role3 = db.session.query(Role).filter(Role.name == 'nguoidan').first()
        user = User(email=email, name=name, password=auth.encrypt_password(password,salt), active=0, salt = salt)
        user.phone = phone
        user.roles.append(role3)
        user.unsigned_name = convert_text_khongdau(name)
        user.type_confirm = type_confirm
        db.session.add(user)
        db.session.commit()
        result = response_current_user(user)
        await send_active_account(request,to_dict(user))
        return json(result, status=200)
        
    return json({"error_code": "REGISTER_FAILED", "error_message": "Method not found"},status=520)

@app.route('/api/v1/register/resend-email', methods=["POST"])
async def register_resend_email(request):
    data = request.json
    uid = data.get('uid', None)
    
    user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
    if user is None:
        return json({"error_code": "ACTIVE_FAILED", "error_message": "Tham số không hợp lệ"},status=520)
    await send_active_account(request,to_dict(user))
    return json({"error_message":"send email success"}, status=200)



@app.route('/api/v1/register/active', methods=["POST"])
async def register_active(request):
    data = request.json
    uid = data.get('uid', None)
    active = data.get('active', None)
    check_token = redisdb.get("session-active-account:"+str(uid))
    if check_token is not None:
        str_active = check_token.decode('utf8')

        if active != str_active:
            return json({"error_code": "ACTIVE_FAILED", "error_message": "Mã số không hợp lệ"},status=520)
        else:
            user = db.session.query(User).filter(and_(User.id == uid, User.deleted == False)).first()
            if user is None:
                return json({"error_code": "ACTIVE_FAILED", "error_message": "Tham số không hợp lệ"},status=520)
            user.active = 1
            db.session.commit()
            result = response_current_user(user)
            return json(result, status=200)
    else:
        return json({"error_code": "ACTIVE_FAILED", "error_message": "Mã số hết hạn sử dụng, vui lòng thử lại"},status=520)


        
    


##### end register ####

        
@app.route('/logout', methods=['GET'])    
async def logout2(request):
    return logout(request)

@app.route('/api/v1/logout', methods=['GET'])
async def logout1(request):
    return logout(request)

def logout(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is not None:
        redisdb.delete("sessions:" + token)
    
    return json({"error_message": "successful!"})
    #else:
    #    return json({"error_code":"LOGOUT_FAILED","error_message": "Token is not found in header"})
    
@app.route('/api/v1/user/changepw', methods=['POST'])
async def changepassword(request):
    error_msg = None
    params = request.json
    # password = params['password']
    password = params['password']
    cfpassword = params['confirm_password']
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
    
    if((error_msg is None)):
        if(password != cfpassword ) :
            error_msg = u"Xin mời nhập lại mật khẩu!"
    
    salt = generator_salt()
    user = db.session.query(User).filter(User.id == uid_current).first()
    if user is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
    
    newpassword = auth.encrypt_password(str(password), str(salt))
    user.password = newpassword
    user.salt = salt
    db.session.commit()

    return json({"error_code": "OK", "error_message": "successfilly"},status=200) 

#api change profile for app     
@app.route('/api/v1/user/changeprofile', methods=["POST"])
async def change_profile(request):
    error_msg = None
    if request.method == 'POST':
        
        address = request.json.get('address', None)
        email = request.json.get('email', None)
        phone = request.json.get('phone', None)
        name = request.json.get('name', '')
        birthday = request.json.get('birthday', None)
        gender = request.json.get('gender', None)
        ma_bhyt = request.json.get('ma_bhyt', None)
        organization_id = request.json.get('organization_id', '')
        if(phone is None):
            if  not valid_phone_number(phone):
                error_msg = u"Số điện thoại không đúng định dạng, xin mời nhập lại!"

        uid_current = current_uid(request)
        if uid_current is None:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)

        user = db.session.query(User).filter(or_(User.phone == phone, User.email == email)).first()
        if user is not None and user.id != uid_current:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Số điện thoại hoặc email đã tồn tại trong hệ thống."}, status=520)

        current_user = db.session.query(User).filter(User.id == uid_current).first()
        if current_user is None:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
        
        current_user.name = name
        current_user.phone = phone
        current_user.email = email
        current_user.unsigned_name = convert_text_khongdau(name)
        db.session.commit()

        patient = db.session.query(Patient).filter(or_(Patient.user_id == uid_current, Patient.mabaohiem == ma_bhyt)).all()

        if isinstance(patient, list) and len(patient) > 1:
            return json({"error_message":"Mã thẻ bảo hiểm đã tồn tại trong hệ thống", "error_code":"PARAM_ERROR"}, status=520)
        
        if len(patient) == 1:
            object_patient = patient[0]
            check_patient = db.session.query(Patient).filter(Patient.id == object_patient.id).first()
            
            if check_patient is None:
                return json({"error_message":"Lỗi truy cập dữ liệu.Vui lòng thử lại sau", "error_code":"PARAM_ERROR"}, status=520)

            check_patient.name = name
            check_patient.phone = phone
            check_patient.email = email
            check_patient.mabaohiem = ma_bhyt
            check_patient.gender = gender
            check_patient.organization_id = organization_id
            check_patient.address = address
            check_patient.birthday = birthday
            check_patient.user_id = uid_current
            check_patient.unsigned_name = convert_text_khongdau(check_patient.name)
            db.session.commit()
        elif len(patient) == 0:
            newpatient = Patient()
            newpatient.name = name
            newpatient.phone = phone
            newpatient.email = email
            newpatient.mabaohiem = ma_bhyt
            newpatient.gender = gender
            newpatient.organization_id = organization_id
            newpatient.address = address
            newpatient.birthday = birthday
            newpatient.user_id = uid_current
            newpatient.unsigned_name = convert_text_khongdau(newpatient.name)
            db.session.add(newpatient)
            db.session.commit()
    return json({"error_code": "Ok", "error_message": "successfully", "data": response_current_user(current_user)},status=200)


#api change profile for web
@app.route('/api/v1/user/changeprofile_web', methods=["POST"])
async def change_profile_web(request):
    error_msg = None
    if request.method == 'POST':
        
        address = request.json.get('address', None)
        email = request.json.get('email', None)
        phone = request.json.get('phone', None)
        name = request.json.get('name', '')
        birthday = request.json.get('birthday', None)
        gender = request.json.get('gender', None)
        ma_bhyt = request.json.get('ma_bhyt', None)
        organization_id = request.json.get('organization_id', '')
        organization = request.json.get('organization', '')
        xaphuong_id = request.json.get('xaphuong_id', '')
        quanhuyen_id = request.json.get('quanhuyen_id', '')
        tinhthanh_id = request.json.get('tinhthanh_id', '')
        xaphuong = request.json.get('xaphuong', '')
        quanhuyen = request.json.get('quanhuyen', '')
        tinhthanh = request.json.get('tinhthanh', '')
        ma_kcbbd = request.json.get('ma_kcbbd', None)
        accountName = request.json.get('accountName', None)
        password = request.json.get('password', None)

        # if(phone is None):
        #     if  not valid_phone_number(phone):
        #         error_msg = u"Số điện thoại không đúng định dạng, xin mời nhập lại!"
        uid_current = current_uid(request)
        if uid_current is None:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)

        if accountName is None:
            return json({"error_code": "PARAM_ERROR", "error_message": "Tên đăng nhập không được để trống."}, status=520)

        user = db.session.query(User).filter(or_(User.phone == phone, User.email == email, User.accountName == accountName)).first()
        if user is not None and user.id != uid_current:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Tên đăng nhập hoặc số điện thoại hoặc email đã tồn tại trong hệ thống."}, status=520)

        current_user = db.session.query(User).filter(User.id == uid_current).first()
        if current_user is None:
            return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết hạn phiên làm việc"}, status=520)
        
        salt = generator_salt()
        if password is not None:
            newpassword = auth.encrypt_password(str(password), str(salt))
            current_user.password = newpassword
            current_user.salt = salt

        current_user.name = name
        current_user.phone = phone
        current_user.email = email
        current_user.unsigned_name = convert_text_khongdau(name)
        current_user.accountName = accountName
        db.session.commit()

        patient = db.session.query(Patient).filter(or_(Patient.user_id == uid_current, Patient.mabaohiem == ma_bhyt)).all()

        if isinstance(patient, list) and len(patient) > 1:
            return json({"error_message":"Mã thẻ bảo hiểm đã tồn tại trong hệ thống", "error_code":"PARAM_ERROR"}, status=520)
        
        if len(patient) == 1:
            object_patient = patient[0]
            check_patient = db.session.query(Patient).filter(Patient.id == object_patient.id).first()
            
            if check_patient is None:
                return json({"error_message":"Lỗi truy cập dữ liệu.Vui lòng thử lại sau", "error_code":"PARAM_ERROR"}, status=520)
            check_patient.name = name
            check_patient.phone = phone
            check_patient.email = email
            check_patient.mabaohiem = ma_bhyt
            check_patient.gender = gender
            # patient.organization_id = organization_id
            check_patient.address = address
            check_patient.birthday = birthday
            check_patient.xaphuong_id = xaphuong_id
            check_patient.quanhuyen_id = quanhuyen_id
            check_patient.tinhthanh_id = tinhthanh_id
            check_patient.user_id = uid_current
            check_patient.xaphuong = xaphuong
            check_patient.quanhuyen = quanhuyen
            check_patient.tinhthanh = tinhthanh
            if organization is not None:
                check_patient.noi_kcbbd = organization.get("name","")
                check_patient.organization_id = organization.get("id")
                check_patient.ma_kcbbd = organization.get("code","")
            check_patient.unsigned_name = convert_text_khongdau(check_patient.name)
            db.session.commit()
        elif len(patient) == 0:
            newpatient = Patient()
            newpatient.name = name
            newpatient.phone = phone
            newpatient.email = email
            newpatient.mabaohiem = ma_bhyt
            newpatient.gender = gender
            # newpatient.organization_id = organization_id
            newpatient.address = address
            newpatient.birthday = birthday
            newpatient.user_id = uid_current
            newpatient.xaphuong_id = xaphuong_id
            newpatient.quanhuyen_id = quanhuyen_id
            newpatient.tinhthanh_id = tinhthanh_id
            newpatient.xaphuong = xaphuong
            newpatient.quanhuyen = quanhuyen
            newpatient.tinhthanh = tinhthanh
            if organization is not None:
                newpatient.noi_kcbbd = organization.get("name","")
                newpatient.organization_id = organization.get("id")
                newpatient.ma_kcbbd = organization.get("code","")
            newpatient.unsigned_name = convert_text_khongdau(newpatient.name)
            db.session.add(newpatient)
            db.session.commit()

    return json({"error_code": "Ok", "error_message": "successfully", "data": response_current_user(current_user)},status=200)


async def change_profile_user(data, Model, **kw):
    param = data
    if ("id" not in param or param['id'] is None):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)

    user = db.session.query(User).filter(and_(User.id == param["id"],User.deleted == False)).first()
    if user is None:
        return json({
                "error_code": "USER_NOT_FOUND",
                "error_message":"Không tìm thấy tài khoản cán bộ"
            }, status=520)
    phone = param["phone"]
    if phone is not None and (phone[0] == 0  or phone[0] == '0'):
        check_phone = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.phone == param["phone"]).first()
        if check_phone is not None:
            return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    user.phone = param["phone"]

    if ("email" in param) and (param["email"] is not None) and (len(param["email"])>0):
        check_email = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.email == param["email"]).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)

    if ("accountName" in param) and (param["accountName"] is not None) and (len(param["accountName"])>0):
        check_accountName = db.session.query(User).filter(and_(User.id != user.id,User.deleted == False)).filter(User.accountName == param["accountName"]).first()
        if check_accountName is not None:
            return json({"error_message":"Tên đăng nhập đã tồn tại trong hệ thống, vui lòng nhập lại tên đăng nhập.", "error_code":"PARAM_ERROR"}, status=520)
    
    user.email = param["email"]
    user.active = param["active"]
    user.name = param["name"]
    user.unsigned_name = convert_text_khongdau(user.name)
    user.accountName = param["accountName"]
    roles_dict = []

    role_admin_donvi = db.session.query(Role).filter(Role.name == "admin_donvi").first()
    role_canbo = db.session.query(Role).filter(Role.name=="canbo").first()
    role_admin = db.session.query(Role).filter(Role.name == "admin").first()

    if role_admin_donvi is None or role_canbo is None or role_admin is None:
        print("quanlycanbo.change_profile.role_user>>> role không tồn tại")
        return json({"error_code":"ERROR_PARAM","error_message":"Tham số không hợp lệ"},status=520)
    user.roles = []
    for role_user in param["roles"]:
        if isinstance(role_user, str):
            if (role_user == role_admin_donvi.name):
                roles_dict.append(role_admin_donvi)
            if (role_user == role_canbo.name):
                roles_dict.append(role_canbo)
            if (role_user == role_admin.name):
                roles_dict.append(role_admin)
        else:
            if (role_user["name"] == role_admin_donvi.name):
                roles_dict.append(role_admin_donvi)
            if (role_user["name"] == role_canbo.name):
                roles_dict.append(role_canbo)
            if (role_user["name"] == role_admin.name):
                roles_dict.append(role_admin)
    user.roles = roles_dict
    if("password" in param and param["password"] is not None and param["password"] !=""):
        newpassword = auth.encrypt_password(str(param['password']), str(user.salt))
        user.password = newpassword

    user.deleted = param['deleted']
    user.deleted_by = param['deleted_by']
    db.session.commit()
    return json({"error_message": "successfully"}, status=200)

async def preprocess_create_user(data, Model, **kw):
    param = data
    user = User()

    phone = param["phone"]
    if phone is not None and (phone[0] == 0  or phone[0] == '0'):
        check_phone = db.session.query(User).filter(and_(User.phone == param["phone"], User.deleted == False)).first()
        if check_phone is not None:
            return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    user.phone = param["phone"]

    if ("email" in param) and (param["email"] is not None) and (len(param["email"])>0):
        check_email = db.session.query(User).filter(and_(User.email == param["email"], User.deleted == False)).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)
    
    user.email = param["email"]
    user.active = 1
    user.name = param["name"]
    user.unsigned_name = convert_text_khongdau(user.name)
    user.organization_id = param["organization_id"]
    user.accountName = param["accountName"]
    roles_dict = []
    role_admin_donvi = db.session.query(Role).filter(Role.name == "admin_donvi").first()
    role_canbo = db.session.query(Role).filter(Role.name=="canbo").first()
    role_admin = db.session.query(Role).filter(Role.name == "admin").first()

    if role_admin_donvi is None or role_canbo is None or role_admin is None:
        print("quanlycanbo.change_profile.role_user>>> role không tồn tại")
        return json({"error_code":"ERROR_PARAM","error_message":"Tham số không hợp lệ"},status=520)
    user.roles = []
    for role_user in param["roles"]:
        if isinstance(role_user, str):
            if (role_user == role_admin_donvi.name):
                roles_dict.append(role_admin_donvi)
            if (role_user == role_canbo.name):
                roles_dict.append(role_canbo)
            if (role_user == role_admin.name):
                roles_dict.append(role_admin)
        else:
            if (role_user["name"] == role_admin_donvi.name):
                roles_dict.append(role_admin_donvi)
            if (role_user["name"] == role_canbo.name):
                roles_dict.append(role_canbo)
            if (role_user["name"] == role_admin.name):
                roles_dict.append(role_admin)


    user.roles = roles_dict
    salt = generator_salt()
    if("password" in param and param["password"] is not None and param["password"] !=""):
        newpassword = auth.encrypt_password(str(param['password']), str(salt))
        user.password = newpassword
        user.salt = salt
    db.session.add(user)
    db.session.commit()
    return json({"error_message": "successfully"}, status=200)

# async def preprocess_get_many_user(request=None, search_params=None, **kw):
#     uid_current = current_uid(request)
#     if uid_current is not None:
#         param = request.json
#         print("param", param)
#         # list_user_notify = db.session.query(NotifyUser).filter(NotifyUser.user_id == uid_current).order_by(desc(NotifyUser.updated_at)).limit(100)
#         # if list_user_notify is None or list_user_notify:
#         #     return json({"objects":[]})
#         # arr_uid = []
#         # for uid in list_user_notify:
#         #     arr_uid.append(uid)
        
#         # search_params["filters"] = {"deleted": {"$eq": False}}
#     else:
#         return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)


apimanager.create_api(User,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[validate_user], POST=[validate_admin,preprocess_create_user], PUT_SINGLE=[validate_user,change_profile_user], DELETE_SINGLE=[validate_admin_donvi]), #validate_user,change_profile_user
    exclude_columns= ["password","salt"],
    collection_name='user')

apimanager.create_api(Role,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin], PUT_SINGLE=[validate_admin], DELETE_SINGLE=[validate_admin]),
    collection_name='role')
