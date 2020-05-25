import  base64, re
import binascii
import uuid
import string
import random

from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app

import ujson
from application.database import db, redisdb
from sqlalchemy import or_,and_

from gatco.response import json
from datetime import datetime

from application.client import HTTPClient

from application.models.models import User, Role, DanToc, QuocGia, TinhThanh,\
    QuanHuyen, XaPhuong, DonVi, DonViDangKi, TuyenDonVi, roles_users
from application.controllers.preprocess import validate_header, validate_email, generate_uid,convert_text_khongdau

from application.extensions import auth


def deny_func(request=None, **kw):
    return json({'error_code':"ERROR_PERMISSION_DENY", 'error_message':'Permission denied'}, status=520)

def current_uid(request):
    user_token = request.headers.get("X-USER-TOKEN", None)
    if user_token is None:
        return None
    uid = redisdb.get("sessions-canbo:" + user_token)
    if uid is not None:
        return uid.decode('utf8')
    
    return None
    
def current_user(request):
    uid = current_uid(request)
    if uid is not None:
        user = db.session.query(User).filter(and_(User.id == uid, User.active == True)).first()
        return user
    return None

def validate_user(request, **kw):
    uid = current_uid(request)
    if uid is None:
        return {'error_code':'SESSION_EXPIRED', 'error_message':'Session Expired!'}


def generate_user_token(uid_contact,uid_canbo):
    token =  binascii.hexlify(uuid.uuid4().bytes).decode()
    p1 = redisdb.pipeline()
    p1.set("sessions:" + token, uid_contact)
    p1.expire("sessions:" + token, app.config.get('SESSION_EXPIRE_TIME', 86400))
    p1.execute()
    print(p1)
    p2 = redisdb.pipeline()
    p2.set("sessions-canbo:" + token, uid_canbo)
    p2.expire("sessions-canbo:" + token, app.config.get('SESSION_EXPIRE_TIME', 86400))
    p2.execute()
    
    return token


def check_user_confirm_passwd(instance_id=None, data=None,**kw):
    if (data is not None) and ('password' in data) and ('confirm_password' in data):
        if (data['password'] is not None and data['password'] !=""):
            if(data['password'] == data['confirm_password']):
                del data['confirm_password']
            else:
                return json({"error_code":"PASSWORD_MISSMATCH","error_message":"Mật khẩu không khớp!"}, status=520)
        else:
            return json({"error_code":"PARAMETER_ERROR","error_message":"Tham số không hợp lệ!"}, status=520)
    else:
        return json({"error_code":"PARAMETER_ERROR","error_message":"Tham số không hợp lệ!"}, status=520)

def generator_salt():
    data = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(24))
    return data

async def register_user_preprocess(data, Model = None, **kw):
    if "id_card" in data and data["id_card"] == "":
        data["id_card"] = None
    check_role_canbo = False
    if "roles" in data:
        for role in data["roles"]:
            if role["name"] == "canbo":
                check_role_canbo = True
    if check_role_canbo == False:
        role_canbo = db.session.query(Role).filter(Role.name=="canbo").first()
        data["roles"].append(to_dict(role_canbo))
    salt = generator_salt()
    uid =  redisdb.spop("user_key_canboyte")
    print("user_key_canboyte", uid)
    if uid is None:
        generate_uid(1000000)
        return json({"error_code":"ERROR_GENERATE_ID","error_message":"Không tạo được mã người dùng"}, status=520)
    else:
#         try:
        if ("email" in data and data['email'] is not None and data['email'] != ""):
            checkEmail = db.session.query(User).filter(and_(User.email == data["email"])).first()
            if checkEmail is not None:
                return json({"error_code":"ERROR_EMAIL_EXISTED","error_message":"Email đã tồn tại trong hệ thống, vui lòng kiểm tra lại"}, status=520)
        if ("id_card" in data and data['id_card'] is not None and data['id_card'] != ""):
            check_chungminhthu = db.session.query(User).filter(and_(User.id_card == data["id_card"])).first()
            if check_chungminhthu is not None:
                return json({"error_code":"ERROR_CMND_EXISTED","error_message":"Chứng minh nhân dân đã tồn tại trong hệ thống, vui lòng kiểm tra lại"}, status=520)
        
        phone_number = data["phone_national_number"]
        phone_national_number = data["phone_national_number"]
        phone_country_prefix = "+84"
        
        if phone_national_number is not None and (phone_national_number[0] == 0  or phone_national_number[0] == '0'):
            phone_number = '+84'+phone_national_number[1:] if phone_national_number is not None else None,
        if (phone_national_number is not None and phone_national_number!=""):
            checkPhone = db.session.query(User).filter(and_(User.phone_national_number == phone_national_number)).first()
            if checkPhone is not None:
                return json({"error_code":"ERROR_PHONE_EXISTED","error_message":"Số điện thoại đã tồn tại trong hệ thống, vui lòng kiểm tra lại"}, status=520)
            data['phone_number'] = phone_number
            data['phone_national_number'] = phone_national_number
            data['phone_country_prefix'] = phone_country_prefix
        uid = uid.decode('utf-8')
        #start for migrate data
        password = data.get('password', None)
        if password is not None:
        #end migrate data
            if (str(data['password']) == "password_default_mevabe_migrate"):
                password = None
            else:
                password = auth.encrypt_password(str(data['password']), str(salt))
        
        if "quocgia" in data:
            del data["quocgia"] 
        if "tinhthanh" in data:
            del data["tinhthanh"]
        if "quanhuyen" in data:
            del data["quanhuyen"]
        if "xaphuong" in data:
            del data["xaphuong"] 
        if "thonxom" in data:
            del data["thonxom"]
        print("data==================",data)
        data['id'] = uid
        data['password'] = password
        data['salt'] = str(salt)
        # return to_dict(data)
        
def respone_user(user,prepare_role=None):
    result = to_dict(user)
    roles = []
    if isinstance(user,dict):
        roles = user["roles"]
    else:
        roles = user.roles
    if user is not None:
        donvi_id = result['donvi_id']
        donvi = db.session.query(DonVi).filter(DonVi.id == donvi_id).first()
        
        if donvi is not None:
            result["tuyendonvi_id"] = donvi.tuyendonvi_id
        else:
            result["tuyendonvi_id"] = ""
        uid_canbo = result['id']
        madonvi_bmte = result['madonvi_bmte']
        token = generate_user_token(madonvi_bmte, uid_canbo)
        result["token"] = token
        result['id'] = id
        result["hoten"] = result["fullname"]
        result["donvi_ten"] = donvi.ten
        result["roles"] = []
        for role in roles:
            if isinstance(role, str):
                if "canbo" not in result['roles']:
                    result['roles'].append('canbo')
                if "admin" == role:
                    result['roles'].append("admin")
            elif isinstance(role, dict):
                if "canbo" not in result['roles']:
                    result['roles'].append('canbo')
                if "admin" == role["name"]:
                    result['roles'].append("admin")
            else:
                if "canbo" not in result['roles']:
                    result['roles'].append('canbo')
                if "admin" == role.name:
                    result['roles'].append("admin")
        version = {}
        result['version'] = version
        if "password" in result:
            del result["password"] 
        if "salt" in result:
            del result["salt"]
        if "created_at" in result:
            del result["created_at"]
        if "created_by" in result:
            del result["created_by"]
        if "updated_at" in result:
            del result["updated_at"]
        if "deleted_by" in result:
            del result["deleted_by"]
        if "deleted_at" in result:
            del result["deleted_at"]
        if "deleted" in result:
            del result["deleted"]
    return result
                
     
def register_user_postprocess(request=None, Model=None, result=None, **kw):
    if (result is not None) and ('id' in result):
        result = respone_user(result, True)
        
            
    

@app.route('/api/v1/verify_password', methods=['POST'])
async def verify_password(request=None, **kw):
    if not validate_header(request):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    param = request.json
    if "data" not in param or param['data'] is None or "password" not in param \
        or (param['password'] is None) or (len(param['data']) == 0) or (len(param['password']) == 0):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    data = param['data']
    password = param['password']
    user = None
    first_character = data[0]
    
    if first_character is '+':
        user = db.session.query(User).filter(User.phone_number == data).\
            filter(User.active == True).first()    
    elif first_character.isdigit() == False and data[1].isdigit() == False:
        user = db.session.query(User).filter(User.id == data).filter(User.active == True).first()
    else:
        user = db.session.query(User).filter(or_(User.phone_national_number == data, User.id_card == data)).\
            filter(User.active == True).first()
    
    if user is not None:
        if auth.verify_password(password, user.password, user.salt):
            return json({"result":True})
            
    return json({"result":False})
    
    

@app.route('/api/v1/login', methods=['POST', 'OPTIONS'])
async def login(request=None, **kw):
    if not validate_header(request):
        return json({"error_message":"Yêu cầu không hợp lệ (application-json)", "error_code":"PARAM_ERROR"}, status=520)
    
    param = request.json
    if "data" not in param or param['data'] is None or "password" not in param \
        or (param['password'] is None) or (len(param['data']) == 0) or (len(param['password']) == 0):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    data = param['data']
    password = param['password']
    user = None
    first_character = data[0] 
    if first_character is '+':
        user = db.session.query(User).filter(User.phone_number == data).\
            first()   
    elif validate_email(data) is not None:
        user = db.session.query(User).filter(User.email == data).\
            first()
    elif first_character.isdigit() == False and data[1].isdigit() == False  and len(data) >= 10 and data[2:].isdigit() == True:
        user = db.session.query(User).filter(User.id == data).first()
    else:
        user = db.session.query(User).filter(or_(User.phone_national_number == data, User.id_card == data)).\
       first()
    

    # roles = user.roles
    # roles_dict = []

    # if roles is not None and isinstance(roles, list):
    #     for _ in roles:
    #         roles_dict.append(_.name)
    # user.roles = to_dict(roles_dict)
    # print(to_dict(user))
    if(user is not None):
        donvi = db.session.query(DonVi).filter(DonVi.id ==  user.donvi_id).first()
        print(to_dict(donvi))
        if(donvi.active == False):
            print("donvi_active=====",user.donvi_id)
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Đơn vị này hiện đang bị khóa.Vui lòng thử lại sau!"}, status=520)
        if(user.active == False):
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Tài khoản hiện đang bị khóa.Vui lòng thử lại sau!"}, status=520)
        
        if auth.verify_password(password, user.password, user.salt):
            result = respone_user(user)
            return json(to_dict(result), status=200)
        else:
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Mật khẩu không đúng"}, status=520)
    else:
        return json({"error_code":"LOGIN_FAILED", "error_message":u"Tài khoản không tồn tại"}, status=520)
           

@app.route('/api/v1/checkuser', methods=['POST'])
async def check_user(request):
    validate_user(request)
    params = request.json
    if params is not None and 'data' in params and len(params['data'])>0:
        data = params['data']
        user = None
        first_character = data[0]
        if first_character is '+':
            user = db.session.query(User).filter(User.phone_number == data).\
                filter(User.active == True).first()    
        elif validate_email(data) is not None:
            user = db.session.query(User).filter(User.email == data).\
                filter(User.active == True).first()
        elif first_character.isdigit() == False and data[1].isdigit() == False:
            user = db.session.query(User).filter(User.id == data).filter(User.active == True).first()
        else:
            user = db.session.query(User).filter(or_(User.phone_national_number == data, User.id_card == data)).\
                filter(User.active == True).first()
        if user is not None:
            result = respone_user(user)
            print("result=====================",json(result))
            return json(result, status=200)
        else:
            return json({"error_message":"user not existed!", "error_code":"USER_NOT_EXISTED"}, status=520)
    
    return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)

@app.route('/api/v1/logout', methods=['GET'])
async def logout(request):
    token = request.headers.get("X-USER-TOKEN", None)
    if token is not None:
        redisdb.delete("sessions:" + token)
        return json({"error_message": "successful!"})
    return json({"error_code":"LOGOUT_FAILED","error_message": "Token is not found in header"})


 
@app.route('/api/v1/user/changepw', methods=['POST'])
async def change_password(request=None, **kw):
    param = request.json
    if ("uid" not in param or param['uid'] is None) or\
    ("newpassword" not in param or param['newpassword'] is None) or\
     "password" not in param or (param['password'] is None) or\
      (len(param['newpassword']) == 0) or (len(param['password']) == 0):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    if not validate_header(request):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    user = db.session.query(User).filter(User.id == param["uid"]).first()
    if user is None:
        return json({
                "error_code": "USER_NOT_LOGIN",
                "error_message":"Không tìm thấy tài khoản"
            }, status=520)
        
    if auth.verify_password(param['password'], user.password, user.salt):
        newpassword = auth.encrypt_password(str(param['newpassword']), str(user.salt))
        user.password = newpassword
        db.session.commit()
        return json({"error_message":"Thay đổi mật khẩu thành công"}, status=200)
    else:
        return json({"error_message":"PASSWORD_WRONG", "error_code":"Mật khẩu không đúng!"}, status=520)

@app.route('/api/v1/user/resetpw', methods=['POST'])
async def reset_password(request=None, **kw):
    param = request.json
    token = param['token']
    password = param['password']
    user_id = redisdb.get("sessions:" + token)
    
    if user_id is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết thời gian thay đổi mật khẩu, vui lòng thực hiện lại"}, status=520)
    user_id = user_id.decode('utf8')
    if not validate_header(request):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    user = db.session.query(User).filter(User.id == user_id).first()
    if user is None:
        return json({
                "error_code": "NOT_FOUND",
                "error_message":"Không tìm thấy tài khoản trong hệ thống"
            }, status=520)
        
    newpassword = auth.encrypt_password(str(password), str(user.salt))
    user.password = newpassword
    db.session.commit()
    redisdb.delete("sessions:" + token)
    return json({"error_message":"Thay đổi mật khẩu thành công"}, status=200)



# @app.route('/api/v1/user/changeprofile', methods=['POST'])
async def change_profile(data, Model, **kw):
    param = data
    if ("id" not in param or param['id'] is None):
        return json({"error_message":"Tham số không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    if ("fullname" not in param or param['fullname'] is None or param["fullname"] ==""):
        return json({"error_message":"Vui lòng nhập đầy đủ họ và tên", "error_code":"PARAM_ERROR"}, status=520)
    if ("phone_national_number" not in param or param['phone_national_number'] is None or param["phone_national_number"] ==""):
        return json({"error_message":"Vui lòng nhập số điện thoại", "error_code":"PARAM_ERROR"}, status=520)

    if ("id_card" not in param or param['id_card'] is None or param["id_card"] ==""):
        return json({"error_message":"Vui lòng nhập mã công dân", "error_code":"PARAM_ERROR"}, status=520)

    user = db.session.query(User).filter(User.id == param["id"]).first()
    if user is None:
        return json({
                "error_code": "USER_NOT_FOUND",
                "error_message":"Không tìm thấy tài khoản cán bộ"
            }, status=520)
  
    phone_number = param["phone_national_number"]
    phone_national_number = param["phone_national_number"]
    phone_country_prefix = "+84"
    
    if phone_national_number is not None and (phone_national_number[0] == 0  or phone_national_number[0] == '0'):
        phone_number = '+84'+phone_national_number[1:] if phone_national_number is not None else None,
    check_phone = db.session.query(User).filter(User.id != user.id).filter(User.phone_national_number == param["phone_number"]).first()
    if check_phone is not None:
        return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)

    check_id_card = db.session.query(User).filter(User.id != user.id).filter(User.id_card == param["id_card"]).first()
    if check_id_card is not None:
        return json({"error_message":"Mã công dân đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    if ("email" in param) and (param["email"] is not None) and (len(param["email"])>0):
        check_email = db.session.query(User).filter(User.id != user.id).filter(User.email == param["email"]).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)
    
        user.email = param["email"]
        
    user.fullname = param["fullname"]
    user.id_card = param["id_card"]
    user.phone_number = phone_number
    user.phone_country_prefix = phone_country_prefix
    user.phone_national_number = phone_national_number
    user.macanboyte = param["macanboyte"]
    user.ngaysinh = param["ngaysinh"]
    user.gioitinh = param["gioitinh"]
    user.dantoc_id = param["dantoc_id"]
    user.matrinhdochuyenmon = param["matrinhdochuyenmon"]
    user.tentrinhdochuyenmon = param["tentrinhdochuyenmon"]
    user.machucvu = param["machucvu"]
    user.tenchucvu = param["tenchucvu"]
    user.xaphuong_id = param["xaphuong_id"]
    user.quanhuyen_id = param["quanhuyen_id"]
    user.tinhthanh_id = param["tinhthanh_id"]
    user.quocgia_id = param["quocgia_id"]
    user.noicongtac = param["noicongtac"]
    user.sochungchi = param["sochungchi"]
    user.thoihanchungchi = param["thoihanchungchi"]
    user.ghichu = param["ghichu"]
    user.madonvi_bmte = param["madonvi_bmte"]
    user.donvi_id = param["donvi_id"]
    user.active = param["active"]
    roles_dict = []
   
    role_canbo  = db.session.query(Role).filter(Role.name == "canbo").first()
    role_admin = db.session.query(Role).filter(Role.name=="admin_donvi").first()
    role_editor = db.session.query(Role).filter(Role.name == "editor").first()
    role_manager = db.session.query(Role).filter(Role.name == "manager").first()
    if role_canbo is None or role_admin is None or role_editor is None or role_manager is None:
        print("quanlycanbo.change_profile.role_user>>> role không tồn tại")
        return json({"error_code":"ERROR_PARAM","error_message":"Tham số không hợp lệ"},status=520)
    user.roles = []
    for role_user in param["roles"]:
        if isinstance(role_user, str):
            if (role_user == role_canbo.name):
                roles_dict.append(role_canbo)
            if (role_user == role_admin.name):
                roles_dict.append(role_admin)
            if (role_user == role_editor.name):
                roles_dict.append(role_editor)
            if (role_user == role_manager.name):
                roles_dict.append(role_manager)
        else:
            if (role_user["name"] == role_canbo.name):
                roles_dict.append(role_canbo)
            if (role_user["name"] == role_admin.name):
                roles_dict.append(role_admin)
            if (role_user["name"] == role_editor.name):
                roles_dict.append(role_editor)
            if (role_user["name"] == role_manager.name):
                roles_dict.append(role_manager)
    user.roles = roles_dict
    if("password" in param and param["password"] is not None and param["password"] !=""):
        if(param['password'] == param['confirm_password']):
            del param['confirm_password']
        else:
            return json({"error_code":"PASSWORD_MISSMATCH","error_message":"Mật khẩu không khớp!"}, status=520)
        newpassword = auth.encrypt_password(str(param['password']), str(user.salt))
        user.password = newpassword

#     try:
    db.session.commit()
    # print("user=======",to_dict(user))
    return json(respone_user(user), status=200)
    # except:
    #     return json({"error_message":"Có lỗi xảy ra, vui lòng thử lại sau", "error_code":"ERROR_UPDATE"}, status=520)
           
async def create_donvi_and_contact(request):
    uid_current = current_uid(request)
    print("uid_current==========",uid_current)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json
    data_donvi = {}
    data_donvi["donvi_ten"] = data.get("donvi_ten",None)
    data_donvi["donvi_sodienthoai"] = data.get("donvi_sodienthoai",None)
    data_donvi["donvi_email"] = data.get("donvi_email",None)
    data_donvi["donvi_diachi"] = data.get("donvi_diachi",None)
    data_donvi["donvi_tuyendonvi_id"] = data.get("donvi_tuyendonvi_id",None)
    data_donvi["captren_id"] = data.get("captren_id",None)
    data_donvi["fullname"] = data.get("fullname",None)
    data_donvi["phone"] =data.get("phone",None)
    data_donvi["email"] = data.get("email",None)
    data_donvi["macongdan"] = data.get("macongdan",None)
    data_donvi["password"] = data.get("password",None)
    data_donvi["cfpassword"] = data.get("cfpassword",None)
    data_donvi["xaphuong_id"] =data.get("xaphuong_id",None)
    data_donvi["quanhuyen_id"] = data.get("quanhuyen_id",None)
    data_donvi["tinhthanh_id"] = data.get("tinhthanh_id",None)
    data_donvi["quocgia_id"] = data.get("quocgia_id",None)
    data_donvi["trangthai"] = data.get("trangthai",None)
    data_donvi["active"] = data.get("active",None)
    data_donvi["ghichu"] = data.get("ghichu",None)
    data_donvi["ma"] = data.get("ma",None)
    
    url_taodonvi =app.config.get("SOMEVABE_URL", "") + str('/api/v1/createdonvi')
    # print(url_taodonvi)
    print("respone_contact111==============",respone_contact)
    respone_contact = await HTTPClient.post(url_taodonvi,data = to_dict(data_donvi))
    print("respone_contact==============",respone_contact)
    if respone_contact[error_code] != "OK":
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    # else:
    #     return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
async def pre_post1(data=None, **kw):
    if data is not None:
        if 'captren' in data:
            del data['captren']
        if 'children' in data:
            del data['children']
async def pre_post(data=None, **kw):
    if data is not None:
        if 'captren' in data:
            del data['captren']
   
    # print (">>>>>>", data)
apimanager.create_api(User,max_results_per_page=15,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[check_user_confirm_passwd, register_user_preprocess ], PUT_SINGLE=[validate_user,change_profile], PUT_MANY=[deny_func]),
    postprocess=dict(GET_SINGLE=[register_user_postprocess],PUT_SINGLE=[register_user_postprocess],POST=[register_user_postprocess]),
    exclude_columns= ["password","salt","created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='user')

apimanager.create_api(DonVi,max_results_per_page=15,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[pre_post1], POST=[pre_post], PUT_SINGLE=[pre_post1], PUT_MANY=[]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[], PUT_SINGLE=[], POST=[]),
    exclude_columns= ["children", "updated_at", "updated_by",
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='donvi')

apimanager.create_api(DonViDangKi, max_results_per_page = 20,
    methods = ['GET','POST', 'PUT'],
    url_prefix = '/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[pre_post], PUT_SINGLE=[pre_post], PUT_MANY=[]),
    # postprocess=dict(GET_SINGLE=[],PUT_SINGLE=[],POST=[]),
    exclude_columns= ["created_at", "created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='donvidangki')
###
apimanager.create_api(Role,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[deny_func], PUT_SINGLE=[deny_func], PUT_MANY=[deny_func]),
    postprocess=dict(POST=[]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='role')

apimanager.create_api(DanToc,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[deny_func], PUT_SINGLE=[deny_func], PUT_MANY=[deny_func]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='dantoc')

apimanager.create_api(QuocGia,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[deny_func], PUT_SINGLE=[deny_func], PUT_MANY=[deny_func]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='quocgia')

apimanager.create_api(TinhThanh,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[deny_func], PUT_SINGLE=[deny_func], PUT_MANY=[deny_func]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='tinhthanh')

apimanager.create_api(QuanHuyen,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[deny_func], PUT_SINGLE=[deny_func], PUT_MANY=[deny_func]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='quanhuyen')

apimanager.create_api(XaPhuong,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[deny_func], PUT_SINGLE=[deny_func], PUT_MANY=[deny_func]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='xaphuong')
apimanager.create_api(TuyenDonVi,max_results_per_page=1000,
    methods=['GET', 'POST', 'PUT'],
    url_prefix='/api/v1',
    # preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[], PUT_MANY=[]),
    exclude_columns= ["created_by", "updated_at", "updated_by",\
                        "deleted_by", "deleted_at", "deleted"],
    collection_name='tuyendonvi')

