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
from application.controllers.api import respone_user
from application.extensions import auth
from application.controllers.api import register_user_preprocess,current_uid

'''
    function validate header
'''
def validate_header(request):
    ret = False
    key_connect_bmte = "SECURITY-CREATE-DONVI"
    try:
        headers = request.headers.get('X-AUTH', "")
        if (headers == key_connect_bmte):
            ret = True
    except:
        pass
    return ret

async def get_current_user(request, userId):
    if userId is not None:
        user_contact = db.session.query(User).filter(or_(User.id ==userId, User.email == userId, User.id_card == userId)).first()
        roles = user_contact.roles
        roles_dict = []

        if roles is not None and isinstance(roles, list):
            for _ in roles:
                roles_dict.append(_.name)

        user_contact = to_dict(user_contact)
        user_contact["roles"] = roles_dict
        
        if user_contact is None:
            print("Helper_common.get_current_user.user_contact is NONE===",userId)
            return None
        else:
            return respone_user(user_contact)
    else:
        print("User does not exist")
        return None

@app.route('/current_user')
async def check_current_user(request):
    uid = current_uid(request)
    data = await get_current_user(request,uid)
    if data is None:
        return json({"error_code": "SESSION_EXPIRED", "error_msg": "Hết phiên làm việc, vui lòng đăng nhập lại!"},status=520)
    else:
        donvi = db.session.query(DonVi).filter(DonVi.id ==  data["donvi_id"]).first()
        if(donvi.active == False):
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Đơn vị này hiện đang bị khóa.Vui lòng thử lại sau!"}, status=520)
        if(data["active"] == False):
            return json({"error_code":"LOGIN_FAILED", "error_message":u"Tài khoản này hiện đang bị khóa.Vui lòng thử lại sau!"}, status=520)
        return json(data,status=200)
    
def default_uuid():
    return str(uuid.uuid4())

def generator_salt():
    data = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(24))
    return data


"""
    API for So BMTE call create donvi
"""

@app.route('/api/v1/canbo/donvi/create', methods=['POST'])
async def create_account_donvi(request):
    header = request.headers.get("X-AUTH",None)
    # if header is not None:
    #     print("header==========",header)
    if not validate_header(request):
        return json({"error_code": "HTTP_ERROR", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)

    data = request.json
    print("data", data)
    tendonvi = data.get("donvi_ten",None)
    phone = data.get("donvi_sodienthoai",None)
    email = data.get("donvi_email",None)
    address = data.get("donvi_diachi",None)
    tinhthanh_id = data.get("tinhthanh_id",None)
    quanhuyen_id = data.get("quanhuyen_id",None)
    xaphuong_id = data.get("xaphuong_id",None)
    tuyendonvi_id = data.get("donvi_tuyendonvi_id",None)
    madonvi_bmte = data.get("madonvi_bmte",None)
    created_by = data.get("created_by",None)
    
    donvi = DonVi()
    donvi.id = default_uuid()
    donvi.ten = tendonvi
    donvi.tuyendonvi_id = tuyendonvi_id
    donvi.sodienthoai = phone
    donvi.email = email
    donvi.xaphuong_id = xaphuong_id
    donvi.quanhuyen_id = quanhuyen_id
    donvi.tinhthanh_id = tinhthanh_id
    donvi.created_by = created_by
    donvi.quocgia_id = data.get("quocgia_id",None)
    donvi.active = True
    donvi.captren_id = data.get("captren_id",None)
    donvi.diachi = address
    donvi.tenkhongdau = convert_text_khongdau(tendonvi)
    donvi.madonvi_bmte = madonvi_bmte

    fullname = data.get("fullname",None)
    phone_national_number =data.get("phone",None)
    email_user = data.get("email",None)
    id_card = data.get("macongdan",None)
    donvi_id = donvi.id
    password = data.get("password",None)
    confirm_password = data.get("cfpassword",None)


    if phone_national_number is not None:
        check_phone = db.session.query(User).filter(User.phone_national_number == phone_national_number).first()
        if check_phone is not None:
            return json({"error_message":"Số điện thoại đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    if id_card is not None:
        check_id_card = db.session.query(User).filter(User.id_card == id_card).first()
        if check_id_card is not None:
            return json({"error_message":"Mã công dân đã tồn tại, vui lòng nhập lại", "error_code":"PARAM_ERROR"}, status=520)
    
    if email_user is not None:
        check_email = db.session.query(User).filter(User.email == email_user).first()
        if check_email is not None:
            return json({"error_message":"Email đã tồn tại trong hệ thống, vui lòng chọn email khác", "error_code":"PARAM_ERROR"}, status=520)
    

    db.session.add(donvi)
    db.session.commit()

    user  = User()
    salt = generator_salt()
    uid =  redisdb.spop("user_key_canboyte")
    if uid is None:
        generate_uid(1000)
        uid =  redisdb.spop("user_key_canboyte")

    uid = uid.decode('utf-8')
    if password is not None:
        if (str(data['password']) == "password_default_mevabe_migrate"):
            password = None
        else:
            password = auth.encrypt_password(str(data['password']), str(salt))
    user.id = uid
    user.password = password
    user.salt = str(salt)
    user.fullname = fullname
    user.id_card = id_card
    user.phone_national_number = phone_national_number
    user.email = email_user
    user.donvi_id = donvi_id
    user.confirm_password = confirm_password
    user.active = True
    role_admin = db.session.query(Role).filter(Role.name=="admin_donvi").first()
    user.roles.append(role_admin)
    user.madonvi_bmte = madonvi_bmte
    user.tenkhongdau = convert_text_khongdau(fullname)
    db.session.add(user)
    db.session.commit()
    return json({"error_message":"successful", "data":to_dict(user)},status=200)

# async def check_admin(uid):
#     donvi = db.session.query(DonVi).filter(DonVi.id == uid).first()
#     if donvi is None:
#         return json({"error_code": "PERMISSION_DENIED", "error_message": "Không có quyền thực hiện hành động này"}, status=520)


'''
    API create donvi for service quanlydonvi
'''
@app.route('/api/v1/createDonvi', methods=['POST'])
async def create_donvi_and_contact(request):
    uid_current = current_uid(request)
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
    
    url_create_contact =app.config.get("SOMEVABE_URL", "") + str('/api/v1/createdonvi')
    headers = {"X-AUTH":"SECURITY-AUTH-DONVI"}
    respone_contact = await HTTPClient.post(url_create_contact,data = to_dict(data_donvi),headers= headers)
    if respone_contact is not None and "error_code" not in  respone_contact and "id_contact" in respone_contact["data"] :

        #create donvi
        madonvi_bmte = respone_contact["data"]["id_contact"]
        donvi = DonVi()
        donvi.id = default_uuid()
        donvi.ten = data_donvi["donvi_ten"]
        donvi.tuyendonvi_id = data_donvi["donvi_tuyendonvi_id"]
        donvi.sodienthoai = data_donvi["donvi_sodienthoai"]
        donvi.email = data_donvi["donvi_email"]
        donvi.xaphuong_id = data_donvi["xaphuong_id"]
        donvi.quanhuyen_id = data_donvi["quanhuyen_id"]
        donvi.tinhthanh_id = data_donvi["tinhthanh_id"]
        donvi.quocgia_id = data_donvi["quocgia_id"]
        donvi.active = True
        donvi.captren_id =data_donvi["captren_id"]
        donvi.diachi = data_donvi["donvi_diachi"]
        donvi.tenkhongdau = convert_text_khongdau(donvi.ten)
        donvi.madonvi_bmte = madonvi_bmte
        db.session.add(donvi)
        db.session.commit()

    #create user
        user  = User()
        salt = generator_salt()
        
        uid =  redisdb.spop("user_key_canboyte")
        if uid is None:
            generate_uid(1000)
            uid =  redisdb.spop("user_key_canboyte")
        uid = uid.decode('utf-8')
        
        password = data_donvi["password"]
        if password is not None:
            if (str(data_donvi['password']) == "password_default_mevabe_migrate"):
                password = None
            else:
                password = auth.encrypt_password(str(data['password']), str(salt))
        user.id = uid
        user.password = password
        user.salt = str(salt)
        user.fullname = data_donvi["fullname"]
        user.phone_national_number = data_donvi["phone"]
        user.email = data_donvi["email"]
        user.id_card = data_donvi["macongdan"]
        user.donvi_id = donvi.id
        user.confirm_password = data_donvi["cfpassword"]
        user.active = True
        role_admin = db.session.query(Role).filter(Role.name=="admin_donvi").first()
        user.roles.append(role_admin)
        user.madonvi_bmte = madonvi_bmte
        user.tenkhongdau = convert_text_khongdau(user.fullname)
        db.session.add(user)
        db.session.commit()
        return json({"error_code":"OK","error_message":"successful", "data":to_dict(user)},status=200)
    return json({"error_code":"PARAMS_ERROR","error_message":"Tham số không hợp lệ"},status=520)


'''
    API update don vi for service soBMTE
'''

@app.route('/api/v1/sobmte/donvi/update', methods=['POST'])
async def update_donvi_for_sobmte(request=None, **kw):
    param = request.json

    if not validate_header(request):
        return json({"error_code": "HTTP_ERROR", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)

    if ("id" not in param or param['id'] is None):
        return json({"error_message":"Tham số không không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    donvi = db.session.query(DonVi).filter(DonVi.id == param["id"]).first()
    if donvi is None:
        return json({
                "error_code": "DONVI_NOT_FOUND",
                "error_message":"Không tìm thấy đơn vị"
            }, status=520)
    donvi.ten = param["ten"]
    donvi.tuyendonvi_id = param["tuyendonvi_id"]
    donvi.sodienthoai = param["sodienthoai"]
    donvi.email = param["email"]
    donvi.xaphuong_id = param["xaphuong_id"]
    donvi.quanhuyen_id = param["quanhuyen_id"]
    donvi.tinhthanh_id = param["tinhthanh_id"]
    donvi.quocgia_id = param["quocgia_id"]
    donvi.active = param["active"]
    donvi.captren_id =param["captren_id"]
    donvi.diachi = param["diachi"]
    donvi.tenkhongdau = convert_text_khongdau(donvi.ten)
    donvi.madonvi_bmte = param["madonvi_bmte"]
    donvi.ghichu = param["ghichu"]
    db.session.commit()

    return json({"error_message":"successful", "data":to_dict(donvi)},status=200)


'''
    API update don vi for service quanlycanbo
'''

@app.route('/api/v1/canbo/donvi/update', methods=['POST'])
async def update_donvi_for_quanlycanbo(request=None, **kw):
    data = request.json
    if ("id" not in data or data['id'] is None):
        return json({"error_message":"Tham số không không hợp lệ", "error_code":"PARAM_ERROR"}, status=520)
    
    donvi = db.session.query(DonVi).filter(DonVi.id == data["id"]).first()
    if donvi is None:
        return json({
                "error_code": "DONVI_NOT_FOUND",
                "error_message":"Không tìm thấy đơn vị"
            }, status=520)

    url_create_contact =app.config.get("SOMEVABE_URL", "") + str('/api/v1/quanlyCB/donvi/update')
    headers = {"X-AUTH":"SECURITY-AUTH-DONVI"}
    respone_contact = await HTTPClient.post(url_create_contact,data = to_dict(request.json),headers = headers)
    
    if respone_contact is not None and "error_code" not in respone_contact:
        donvi.ten = data.get("ten",None)
        donvi.tuyendonvi_id = data.get("tuyendonvi_id",None)
        donvi.sodienthoai =  data.get("sodienthoai",None)
        donvi.email = data.get("email",None)
        donvi.xaphuong_id = data.get("xaphuong_id",None)
        donvi.quanhuyen_id =  data.get("quanhuyen_id",None)
        donvi.tinhthanh_id = data.get("tinhthanh_id",None)
        donvi.quocgia_id = data.get("quocgia_id",None)
        donvi.active = data.get("active",False)
        donvi.captren_id = data.get("captren_id",None)
        donvi.diachi = data.get("diachi",None)
        donvi.tenkhongdau = convert_text_khongdau(donvi.ten)
        donvi.madonvi_bmte = data.get("madonvi_bmte",None)
        donvi.ghichu = data.get("ghichu",None)
        db.session.commit()
        return json({"error_code":"OK","error_message":"successful", "data":to_dict(donvi)},status=200)
    return json({"error_code":"PARAMS_ERROR","error_message":"Tham số không hợp lệ"},status=520)


# /api/v1/quanlyCB/donvi/update