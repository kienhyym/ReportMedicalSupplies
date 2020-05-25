import asyncio
import aiohttp
import hashlib
import ujson
from application.extensions import apimanager
from application.server import app
from application.database import db
from sqlalchemy.orm import aliased, joinedload_all
# from sqlalchemy import has
from gatco.response import json, text, html
import time
from math import floor
from application.controllers.helpers.helper_common import *
from application.models.model_danhmuc import TuyenDonVi
from application.controllers.helpers.helper_notify import send_notify_single


from application.models.models import User, Organization, Role
from application.extensions import auth
import xlrd
from application.controllers.upload import *


@app.route('/api/v1/donvitree')
async def DonVitree(request):
    data = None
    is_admin = await hasRole(request, "admin")
    if(is_admin == True):
        data = db.session.query(DonVi).\
            options(joinedload_all("children", "children", "children", "children")).\
            join(TuyenDonVi, DonVi.tuyendonvi).filter(TuyenDonVi.ma == 'TW').first()
    else:
        data = db.session.query(DonVi).\
            options(joinedload_all("children", "children", "children", "children")).\
            join(TuyenDonVi, DonVi.tuyendonvi).filter(TuyenDonVi.ma == 'TW').first()
            
    if data is not None:
        obj = data.dump()
        return  json(to_dict(obj))
    else:
        return json({})
#     if datas is not None:
#         for dv in datas:
#             donvi = to_dict(dv)
#             donvi["xaphuong"] = to_dict(dv.xaphuong)
#             donvi["quanhuyen"] = to_dict(dv.quanhuyen)
#             donvi["tinhthanh"] = to_dict(dv.tinhthanh)
#             donvi["quocgia"] = to_dict(dv.quocgia)
#             donvi["tuyendonvi"] = to_dict(dv.tuyendonvi)
#             donvi["users"] = to_dict(dv.users)
#             results.append(to_dict(donvi))
#     return json(to_dict(results), status=200)
#     else:
#         return json({"error_code":"PERMISSION_DENY","error_message":"Not Permission"},status=520)


@app.route('/api/donvi/adduser/new', methods=["POST"])
async def addUserDonvi(request):
    error_msg = None
    if request.method == 'POST':
        donvi_id = request.json.get('donvi_id',None)
        password = request.json.get('password', None)
        cfpassword = request.json.get('password_confirm', None)
        macongdan = request.json.get('macongdan', None)
        email = request.json.get('email', None)
        phone_number = request.json.get('phone', None)
        hoten = request.json.get('hoten', '')
#         if ((email is None) or (email == '')):
#             error_msg = u"Xin mời nhập email"
#         if ((macongdan is None) or (macongdan == '')):
#             error_msg = u"Xin mời nhập Mã công dân (CMND/Hộ chiếu)"
        if(error_msg is None):
            if  not valid_phone_number(phone_number):
                error_msg = u"Số điện thoại không đúng định dạng, xin mời nhập lại"
            else:
                checkphone = await check_user(phone_number)
                if(checkphone is not None):
                    error_msg = u"Số điện thoại đã có người sử dụng, xin mời nhập lại"
        if(error_msg is None):
            check_macongdan = await check_user(macongdan)
            if(check_macongdan is not None):
                error_msg = u"Mã công dân đã có người sử dụng, xin mời nhập lại"
                    
        if((error_msg is None)):
            if((password is None) or (password == '') or (password != cfpassword )) :
                error_msg = u"Xin mời nhập lại mật khẩu"
            
        if((error_msg is None)):
            if(password != cfpassword ) :
                error_msg = u"Mật khẩu không khớp"
                
        if((error_msg is None)):
            if(check_donvi(donvi_id) is None):
                error_msg = u"Tham số đơn vị không đúng"
                
        if (error_msg is None):
            url = app.config.get("USER_STORE_URL") + "user"
            data = {
                'fullname':hoten,
                'phone_number': '+84'+phone_number[1:],
                'email':email,
                'phone_country_prefix':'+84',
                'phone_national_number':phone_number,
                'password':password,
                'confirm_password':cfpassword,
                'id_card':macongdan
            }
            headers = {"X-Auth-Token":"security-token"}
            
            resp = await HTTPClient.post(url, data, headers)
            if resp is not None and 'error_code' not in resp:
                uid = resp['id']
#                 encrypted_id = hashlib.sha256((uid + app.config.get('SECRET_KEY', None)).encode('utf8')).hexdigest()
#                 resp_create_participant = await requests("invoke", "participant_create", [encrypted_id])
                resp_create_participant = await create_participant(uid, uid)
                if resp_create_participant is None:
                    print("donvi.py --> resp_create_participant is None")
                
                user_donvi = UserDonvi(uid=uid, ten= hoten, macongdan = macongdan, donvi_id = donvi_id)
                db.session.add(user_donvi)
                db.session.commit()
                return json({"uid":uid, "donvi_id":donvi_id});
            else:
                try:
                    if "error_message" in resp:
                        error_msg = resp["error_message"]
                        if "error_message" in error_msg:
                            data_message = ujson.loads(error_msg)
                            error_msg = data_message["error_message"]
                    else:
                        error_msg = u" đăng ký không thành công"
                except:
                    error_msg = u" đăng ký không thành công"
    return json({"error_code": "ADD_USER_FAILED", "error_message": error_msg},status=520)

@app.route('/api/donvi/adduser/exist', methods=["POST"])
async def addUserExistToDonvi(request):
    error_msg = None
    if request.method == 'POST':
        donvi_id = request.json.get('donvi_id',None)
        account = request.json.get('account', None)
        userinfo = None
        if(error_msg is None):
            if  account is None:
                error_msg = u"Tham số không hợp lệ, xin mời nhập lại"
            else:
                userinfo = await get_current_user(request, account)
                if(userinfo is None):
                    error_msg = u"Tài khoản không tồn tại, Vui lòng kiểm tra lại hoặc tạo mới tài khoản"

        if (error_msg is None):
            user_donvi = db.session.query(UserDonvi).filter(UserDonvi.uid == userinfo['id']).filter(UserDonvi.donvi_id == donvi_id).first()
            if (user_donvi is not None):
                error_msg = u"Tài khoản đã tồn tại trong đơn vị ( Mã tài khoản: "+ userinfo['id']+ " )"
            else:
                user_donvi = UserDonvi(uid=userinfo["id"], ten= userinfo["fullname"], macongdan = userinfo["id_card"], donvi_id = donvi_id)
                db.session.add(user_donvi)
                db.session.commit()
                return json({"uid":userinfo["id"], "donvi_id":donvi_id});

    return json({"error_code": "ADD_USER_FAILED", "error_message": error_msg},status=520)


def apply_DonVi_filter(search_params, request=None, **kw ):
    uid = current_uid(request)
    if uid is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520)
    user = db.session.query(User).filter(User.id == uid).first()
    if user is not None:
        #admin_tyt,admin_benhvien,canbo_benhvien,canbo_tyt
        #organization_id
        query = None
        if user.has_role('admin_tyt') or user.has_role('canbo_tyt'):
            query = { "$and": [{ "approved_by_organization_id_level1": { "$eq": user.organization_id } }, { "status": { "$eq": 2 } }] }

        DonVichildids = []
        if(currDonVi is not None):
            currDonVi.get_children_ids(DonVichildids)
            if currDonVi.tuyenDonVi != 1:
                search_params["filters"] = ("filters" in search_params) and {"$and":[search_params["filters"], {"DonVi_id":{"$in": DonVichildids}}]} \
                                        or {"DonVi_id":{"$in": DonVichildids}}
    
#@jwt_required()
def entity_pregetmany(search_params=None,request=None, **kw):
    apply_DonVi_filter(search_params, request)
    
#def donvi_pregetmany(search_params=None, **kw):
    request = kw.get("request", None)
    currentUser = current_user(request)
    if currentUser is not None:
        currdonvi = currentUser.donvi
        donvichildids = []
        if(currdonvi is not None):
            currdonvi.get_children_ids(donvichildids)
            
        search_params["filters"] = ("filters" in search_params) and {"$and":[search_params["filters"], {"id":{"$in": donvichildids}}]} \
                                or {"id":{"$in": donvichildids}}
                                        
def donvi_predelete(instance_id=None):
    """Accepts a single argument, `instance_id`, which is the primary key
    of the instance which will be deleted.

    """
    donvi = db.session.query(DonVi).filter(DonVi.id == instance_id).first()
    if donvi is not None:
        donvichildids = []
        donvi.get_children_ids(donvichildids)
        if len(donvichildids) > 1:
            return json({"error_message":u'Không thể xoá đơn vị có đơn vị con'},
                                      status=520)

def donvi_prepput_children(request=None, instance_id=None, data=None, **kw):
    if 'children' in data :
        del data['children']
    if 'captren' in data:
        del data['captren']
    # if 

def donvi_prepput(instance_id=None, data=None):
    if 'children' in data :
        del data['children']
    if 'parent_id' in data:
        donvi = db.session.query(DonVi).filter(DonVi.id == instance_id).first()
        donvichildids = []
        if(donvi is not None):
            donvi.get_children_ids(donvichildids)
            #try:
            #    donvichildids.remove(instance_id)
            #except:
            #    pass
            if (data['parent_id'] is not None) and (int(data['parent_id']) in donvichildids):
                return json({"error_message":u'Cấp trên không đúng'},
                                      status=520)
            
# apimanager.create_api(DonVi,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_admin], POST=[validate_admin], PUT_SINGLE=[validate_admin, donvi_prepput_children], DELETE_SINGLE=[validate_admin]),
#     collection_name='donvi',
#     exclude_columns= ["children"])
async def postprocess_ticket(request=None, Model=None, result=None, **kw):
    if "num_results" in result and (result["num_results"] > 0):
        i = 0
        list_ticket = []
        for result_post in result["objects"]:
            if result_post["ngay_henkham"] is not None:
                list_ticket.append(result_post)
        result["objects"] = list_ticket


apimanager.create_api(Organization,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user], PUT_SINGLE=[validate_user, donvi_prepput_children], DELETE_SINGLE=[validate_user]),
    collection_name='donvi')

apimanager.create_api(Hospital,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user], PUT_SINGLE=[validate_user, donvi_prepput_children], DELETE_SINGLE=[validate_user]),
    collection_name='benhvien')

apimanager.create_api(Patient,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user], PUT_SINGLE=[validate_user, donvi_prepput_children], DELETE_SINGLE=[validate_user]),
    collection_name='benhnhan')

apimanager.create_api(Ticket,max_results_per_page=1000000,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user], PUT_SINGLE=[validate_user, donvi_prepput_children], DELETE_SINGLE=[validate_admin]),
    postprocess=dict(GET_MANY=[postprocess_ticket]),
    collection_name='ticket')




@app.route('/api/v1/donvi/create', methods=['POST'])
async def create_account_donvi(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    await validate_admin(request)

    data = request.json

    name = data.get("name",None)
    phone = data.get("phone",None)
    email = data.get("email",None)
    password = data.get("password",None)
    salt = generator_salt()

    check_user = db.session.query(User).filter(or_(User.phone == phone, User.email == email)).first()
    if check_user is not None:
        return json({"error_code": "ERROR_PARAM", "error_message": "Tài khoản người dùng đã tồn tại"}, status=520)

    level = data.get("level",None)

    organization = Organization()
    organization.id = default_uuid()
    organization.code = data.get("donvi_code",None)
    organization.name = data.get("donvi_name",None)
    organization.unsigned_name = convert_text_khongdau(organization.name)
    organization.phone = data.get("donvi_phone",None)
    organization.address = data.get("patient_address",None)
    organization.email = data.get("donvi_email",None)
    organization.description = data.get("description",None)
    organization.tinhthanh_id = data.get("tinhthanh_id",None)
    organization.quanhuyen_id = data.get("quanhuyen_id",None)
    organization.xaphuong_id = data.get("xaphuong_id",None)
    organization.level = level
    organization.parent_id = data.get("parent_id",None)
    organization.parent_name = data.get("parent_name",None)
    organization.active = 1

    db.session.add(organization)
    db.session.flush()
    
    user = User()
    user.id = default_uuid()
    user.name = name
    user.phone = phone
    user.email = email
    user.unsigned_name = convert_text_khongdau(user.name)
    user.salt = salt
    user.password = auth.encrypt_password(password, str(salt))
    user.organization_id = organization.id
    user.active = 1
    if level is not None:
        role_admin_tyt = db.session.query(Role).filter(Role.name == 'admin_tyt').first()
        role_admin_benhvien = db.session.query(Role).filter(Role.name == 'admin_benhvien').first()
        if level == 1:
            user.roles.append(role_admin_benhvien)
        elif level == 2:
            user.roles.append(role_admin_tyt)
    db.session.add(user)
    db.session.commit()

    return json({"error_code":"OK","error_message":"successful", "data":to_dict(organization)},status=200)


@app.route('/api/v1/create/ticket', methods=['POST'])
async def create_ticket(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    param = request.json
    patient_bhyt = param.get("patient_bhyt",None)
    if patient_bhyt is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Vui lòng nhập mã bảo hiểm y tế"}, status=520)
    
    ma_kcbbd = param.get("ma_kcbbd",None)
    noi_kcbbd = param.get("noi_kcbbd",None)
    patient_organization = param.get("patient_organization",None)
    patient_organization_id = param.get("patient_organization_id",None)
    xaphuong_id = param.get("xaphuong_id",None)
    quanhuyen_id = param.get("quanhuyen_id",None)
    tinhthanh_id = param.get("tinhthanh_id",None)
    xaphuong = param.get("xaphuong",None)
    quanhuyen = param.get("quanhuyen",None)
    tinhthanh = param.get("tinhthanh",None)
    check_patient = db.session.query(Patient).filter(Patient.mabaohiem == patient_bhyt).first()
    patient_ticket = {}
    if check_patient is None:
        patient = Patient()
        # patient_name
        patient.id = default_uuid()
        patient.name = param.get("patient_name",None)
        patient.unsigned_name = convert_text_khongdau(patient.name)
        patient.birthday = param.get("patient_ngaysinh",None)
        
        patient.gender = param.get("patient_gioitinh",2)
        patient.address = param.get("patient_address",None)
        patient.phone = param.get("patient_phone",None)
        patient.email = param.get("patient_email",None)
        patient.mabaohiem = param.get("patient_bhyt",None)

        patient.ma_kcbbd = param.get("ma_kcbbd",None)
        patient.noi_kcbbd = param.get("noi_kcbbd",None)
        patient.organization_id = param.get("patient_organization_id",None)
        patient.xaphuong_id = param.get("xaphuong_id",None)
        patient.quanhuyen_id = param.get("quanhuyen_id",None)
        patient.tinhthanh_id = param.get("tinhthanh_id",None)
        patient.xaphuong = param.get("xaphuong",None)
        patient.quanhuyen = param.get("quanhuyen",None)
        patient.tinhthanh = param.get("tinhthanh",None)

        db.session.add(patient)
        db.session.commit()
        patient_ticket = patient
    else:
        check_patient.name = param.get("patient_name",None)
        check_patient.unsigned_name = convert_text_khongdau(check_patient.name)
        check_patient.birthday = param.get("patient_ngaysinh",None)
        
        check_patient.gender = param.get("patient_gioitinh",2)
        check_patient.address = param.get("patient_address",None)

        check_patient.phone = param.get("patient_phone",None)
        check_patient.email = param.get("patient_email",None)
        check_patient.mabaohiem = param.get("patient_bhyt",None)
        if patient_organization is not None:
            check_patient.organization_id = param.get("patient_organization_id",None)
        check_patient.ma_kcbbd = param.get("ma_kcbbd",None)
        check_patient.noi_kcbbd = param.get("noi_kcbbd",None)
        if quanhuyen is not None:
            check_patient.quanhuyen = quanhuyen
            check_patient.quanhuyen_id = quanhuyen_id
        if xaphuong is not None:
            check_patient.xaphuong = xaphuong
            check_patient.xaphuong_id = xaphuong_id
        if tinhthanh is not None:
            check_patient.tinhthanh = tinhthanh
            check_patient.tinhthanh_id = tinhthanh_id
        db.session.commit()
        patient_ticket = check_patient
    

    ticket = Ticket()
    ticket.id = default_uuid()
    ticket.patient_id = patient_ticket.id
    ticket.patient_name = patient_ticket.name
    ticket.unsigned_patientname = convert_text_khongdau(ticket.patient_name)
    ticket.patient_bhyt = param.get("patient_bhyt",None)
    ticket.patient_email = param.get("patient_email",None)
    ticket.patient_phone = param.get("patient_phone",None)
    ticket.patient_gender = param.get("patient_gioitinh",None)
    ticket.patient_birthday = param.get("patient_ngaysinh",None)
    ticket.patient_address = param.get("patient_address",None)
    

    ticket.noikcb_id = param.get("noikcb_id",None)
    ticket.noikcb_name = param.get("noikcb_name",None)
    ticket.address_accept_id = param.get("address_accept_id",None)
    ticket.address_accept_name = param.get("address_accept_name",None)
    ticket.address_accept_other = param.get("address_accept_other",None)
    ticket.approved_by_organization_id_level1 = param.get("approved_by_organization_id_level1",None)
    ticket.approved_by_organization_name_level1 = param.get("approved_by_organization_name_level1",None)
    ticket.approved_by_organization_id_level2 = param.get("approved_by_organization_id_level2",None)
    ticket.approved_by_organization_name_level2 = param.get("approved_by_organization_name_level2",None)
    ticket.tenbenh = param.get("tenbenh",None)
    ticket.mabenhnhan = param.get("mabenhnhan",None)
    ticket.status = param.get("status",0)

    ticket.approved_by_userid_level1 = param.get("approved_by_userid_level1",None)
    ticket.approved_by_username_level1 = param.get("approved_by_username_level1",None)
    ticket.approved_at_level1 = param.get("approved_at_level1",None)
    
    ticket.healthinfo = param.get("healthinfo",None)
    ticket.attachment = param.get("attachment",None)
    # ticket.status = None
    ticket.khaiho = param.get("khaiho",0)
    ticket.ngay_henkham = param.get("ngay_henkham",None)
    ticket.phut_henkham = param.get("phut_henkham",None)
    ticket.gio_henkham = param.get("gio_henkham",None)
    ticket.tuvan_benhvien = param.get("tuvan_benhvien",None)
    ticket.link_phonghop = param.get("link_phonghop","")
    ticket.creator_id = uid_current

    db.session.add(ticket)
    db.session.commit()

    return json(to_dict(ticket), status=200)
    # print(param)

@app.route('/api/v1/update/ticket', methods=['POST'])
async def update_ticket(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    current_user = await get_current_user(request,uid_current)
    if current_user is None:
        return json({"error_code": "SESSION_EXPIRED", "error_msg": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520)
    

    param = request.json
    id_ticket = param.get("id", None)
    if id_ticket is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Phiếu này không tồn tại"}, status=520)
    
    patient_organization_id = param.get("patient_organization_id",None)
    xaphuong_id = param.get("xaphuong_id",None)
    quanhuyen_id = param.get("quanhuyen_id",None)
    tinhthanh_id = param.get("tinhthanh_id",None)
    xaphuong = param.get("xaphuong",None)
    quanhuyen = param.get("quanhuyen",None)
    tinhthanh = param.get("tinhthanh",None)
    khaiho = param.get("khaiho",0)

    # patient_id = param.get("patient_id",None)
    # if patient_id is None:
    #     return json({"error_code": "PARAM_ERROR", "error_message": "Bệnh nhân này không tồn tại. Vui lòng thử lại sau"}, status=520)
    # if khaiho is not None and khaiho !=0:

    #     patient = db.session.query(Patient).filter(Patient.mabaohiem == param.get("patient_bhyt",None)).first()
    #     if patient is None:
    #         return json({"error_code": "PARAM_ERROR", "error_message": "Bệnh nhân này không tồn tại. Vui lòng thử lại sau"}, status=520)
    #     # patient.id = default_uuid()
    #     patient.name = param.get("patient_name",None)
    #     patient.unsigned_name = convert_text_khongdau(patient.name)
    #     patient.birthday = param.get("patient_ngaysinh",None)
        
    #     patient.gender = param.get("patient_gioitinh",2)
    #     patient.address = param.get("patient_address",None)
    #     patient.phone = param.get("patient_phone",None)
    #     patient.email = param.get("patient_email",None)
    #     patient.mabaohiem = param.get("patient_bhyt",None)

    #     if patient_organization_id is not None:
    #         patient.ma_kcbbd = param.get("ma_kcbbd",None)
    #         patient.noi_kcbbd = param.get("noi_kcbbd",None)
    #         patient.organization_id = param.get("patient_organization_id",None)
    #     if quanhuyen_id is not None:
    #         patient.quanhuyen = quanhuyen
    #         patient.quanhuyen_id = quanhuyen_id
    #     if xaphuong_id is not None:
    #         patient.xaphuong = xaphuong
    #         patient.xaphuong_id = xaphuong_id
    #     if tinhthanh_id is not None:
    #         patient.tinhthanh = tinhthanh
    #         patient.tinhthanh_id = tinhthanh_id

    #     db.session.commit()
    ticket = db.session.query(Ticket).filter(Ticket.id == id_ticket).first()
    if ticket is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Phiếu này không tồn tại"}, status=520)
    
    ticket.patient_name = param.get("patient_name",None)
    ticket.unsigned_patientname = convert_text_khongdau(ticket.patient_name)
    ticket.patient_bhyt = param.get("patient_bhyt",None)
    ticket.patient_email = param.get("patient_email",None)
    ticket.patient_phone = param.get("patient_phone",None)
    ticket.patient_gender = param.get("patient_gioitinh",None)
    ticket.patient_birthday = param.get("patient_ngaysinh",None)
    ticket.patient_address = param.get("patient_address",None)

    ticket.noikcb_id = param.get("noikcb_id",None)
    ticket.noikcb_name = param.get("noikcb_name",None)
    ticket.address_accept_id = param.get("address_accept_id",None)
    ticket.address_accept_name = param.get("address_accept_name",None)
    ticket.address_accept_other = param.get("address_accept_other",None)
    ticket.approved_by_organization_id_level1 = param.get("approved_by_organization_id_level1",None)
    ticket.approved_by_organization_name_level1 = param.get("approved_by_organization_name_level1",None)
    ticket.approved_by_organization_id_level2 = param.get("approved_by_organization_id_level2",None)
    ticket.approved_by_organization_name_level2 = param.get("approved_by_organization_name_level2",None)
    ticket.tenbenh = param.get("tenbenh",None)
    ticket.mabenhnhan = param.get("mabenhnhan",None)
    ticket.healthinfo = param.get("healthinfo",None)
    ticket.attachment = param.get("attachment",None)
    
    ticket.ngay_henkham = param.get("ngay_henkham",None)
    ticket.phut_henkham = param.get("phut_henkham",None)
    ticket.gio_henkham = param.get("gio_henkham",None)
    ticket.tuvan_benhvien = param.get("tuvan_benhvien",None)
    ticket.link_phonghop = param.get("link_phonghop","")
    
    ticket.updated_by = uid_current
    # status = param.get("status",0)

    # if (status == 6):
    #     ticket.receive_drug_userid = uid_current
    #     ticket.receive_drug_username = current_user.name
    #     ticket.receive_drug_at = floor(time.time())
    #     ticket.status = status

    # if (status == 5):
    #     ticket.confirm_prescriber_userid = uid_current
    #     ticket.confirm_prescriber_username = current_user.name
    #     ticket.confirm_prescriber_at = floor(time.time())
    #     ticket.status = status
    ticket.khaiho = khaiho

    db.session.commit()

    return json(to_dict(ticket), status=200)


@app.route('/api/v1/ticket/changestatus', methods=['POST'])
async def change_status_ticket(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    param = request.json
    id_ticket = param.get("id", None)
    status = param.get("status",None)

    if id_ticket is None  or status is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Yêu cầu không hợp lệ, vui lòng thử lại sau"}, status=520)

    
    current_user = db.session.query(User).filter(User.id == uid_current).first()
    if current_user is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520)
    
    isNguoidan =  current_user.has_role("nguoidan")
    organization_id = current_user.organization_id

    ticket = db.session.query(Ticket).filter(Ticket.id == id_ticket).first()
    if ticket is None:
        return json({"error_code": "PARAM_ERROR", "error_message": "Phiếu này không tồn tại"}, status=520)
    ticket.comments = param.get("comments", None)

    if isNguoidan and ticket.creator_id != uid_current and status != 0 and status != 6:
        return json({"error_code": "PARAM_ERROR", "error_message": "Bạn không có quyền thực hiện hành động này."}, status=520)

    if organization_id is not None and organization_id != ticket.approved_by_organization_id_level1 and  organization_id != ticket.approved_by_organization_id_level2:
        return json({"error_code": "PARAM_ERROR", "error_message": "Bạn không có quyền thực hiện hành động này."}, status=520)


# 0 - tạo mới
# 1 - Trạm y tế đã duyệt
# 2- Trạm y tế từ chối
# 3- Đã kê đơn và chuyển phát 
# 4 - Đã nhận thuốc
    
    url_notify = app.config.get("DOMAIN_URL") + "#ticket/detail?id="+ticket.id
    if (status == 0 or status == 5):
        ticket.status = status
        db.session.commit()
        
    elif (status == 4):
        ticket.receive_drug_userid = uid_current
        ticket.receive_drug_username = current_user.name
        ticket.receive_drug_at = floor(time.time())
        ticket.approved_note_level1 = param.get("approved_note_level1", "")
        ticket.approved_note_level2 = param.get("approved_note_level2", "")
        ticket.status = status
        db.session.commit()
        
        # content = "<span>"+current_user.Organization.name + "<span> đã cấp thuốc cho Bạn thành công vào lúc <span>"+ convert_timestamp_to_string(ticket.receive_drug_at,"%d/%m/%Y, %H:%M")+"</span>. Yêu cầu đã được hoàn tất"
        content = ticket.approved_by_organization_name_level1 + " đã cấp thuốc cho Bạn thành công vào lúc "+ convert_timestamp_to_string(ticket.receive_drug_at,"%d/%m/%Y, %H:%M")+". Yêu cầu đã được hoàn tất"
        await send_notify_single(ticket.creator_id, "Xác nhận đã nhận được thuốc",content, "text" ,url_notify, {"action":"ticket_complete", "url":url_notify})


    elif (status == 3):
        ticket.confirm_prescriber_userid = uid_current
        ticket.confirm_prescriber_username = current_user.name
        ticket.confirm_prescriber_at = floor(time.time())
        ticket.approved_note_level1 = param.get("approved_note_level1", "")
        ticket.approved_note_level2 = param.get("approved_note_level2", "")
        ticket.status = status
        db.session.commit()
        # content = "<span>"+current_user.Organization.name + "</span> đã chấp nhận kê đơn thuốc cho Bạn vào lúc </span>"+ convert_timestamp_to_string(ticket.confirm_prescriber_at,"%d/%m/%Y, %H:%M")+"</span>. Vui lòng chờ quá trình chuyển phát thuốc"
        # await send_notify_single(ticket.creator_id, "Xác nhận đã được kê đơn",content, "text" ,url_notify, {"action":"ticket_prescriber", "url":url_notify})
            
        content_tramyte = current_user.Organization.name + " đã chấp nhận kê đơn thuốc cho  "+ticket.patient_name+" vào lúc "+ convert_timestamp_to_string(ticket.confirm_prescriber_at,"%d/%m/%Y, %H:%M")+". Vui lòng chờ quá trình chuyển phát thuốc"
        if ticket.approved_note_level1 is not None and ticket.approved_note_level1 != "":
            content_tramyte = current_user.Organization.name + " đã chấp nhận kê đơn thuốc cho  "+ticket.patient_name+" vào lúc "+ convert_timestamp_to_string(ticket.confirm_prescriber_at,"%d/%m/%Y, %H:%M")+". Vui lòng chờ quá trình chuyển phát thuốc \n Ghi chú: " + ticket.approved_note_level1 
        await send_notify_single(ticket.creator_id, "Xác nhận đã được kê đơn",content_tramyte, "text" ,url_notify, {"action":"ticket_prescriber", "url":url_notify})

    
    elif status == 1 or status == 2:
        ticket.approved_by_organization_id_level1 = current_user.organization_id
        ticket.approved_by_organization_name_level1 = current_user.Organization.name
        ticket.approved_by_userid_level1 = uid_current
        ticket.approved_by_username_level1 = current_user.name
        ticket.approved_at_level1 = floor(time.time())
        ticket.approved_note_level1 = param.get("approved_note_level1", "")
        ticket.approved_note_level2 = param.get("approved_note_level2", "")

        ticket.status = status
        db.session.commit()
        if status == 1:
            content = current_user.Organization.name + " đã chấp nhận yêu cầu của Bạn vào lúc "+ convert_timestamp_to_string(ticket.approved_at_level1,"%d/%m/%Y, %H:%M")
            if ticket.approved_note_level1 is not None and ticket.approved_note_level1 != "":
                content = current_user.Organization.name + " đã chấp nhận yêu cầu của Bạn vào lúc "+ convert_timestamp_to_string(ticket.approved_at_level1,"%d/%m/%Y, %H:%M")+" \n Ghi chú: " + ticket.approved_note_level1 
        
            await send_notify_single(ticket.creator_id, "Xét duyệt tại trạm y tế",content, "text" ,url_notify, {"action":"ticket_approved_level1", "url":url_notify})
        else:
            content = current_user.Organization.name + " đã từ chối yêu cầu của Bạn vào lúc "+ convert_timestamp_to_string(ticket.approved_at_level1,"%d/%m/%Y, %H:%M")+". Vui lòng kiểm tra lại yêu cầu"
            if ticket.approved_note_level1 is not None and ticket.approved_note_level1 != "":
                content = current_user.Organization.name + " đã từ chối yêu cầu của Bạn vào lúc "+ convert_timestamp_to_string(ticket.approved_at_level1,"%d/%m/%Y, %H:%M")+". Vui lòng kiểm tra lại yêu cầu \n Ghi chú: " + ticket.approved_note_level1
            await send_notify_single(ticket.creator_id, "Từ chối duyệt yêu cầu",content, "text" ,url_notify, {"action":"ticket_cancel_level1", "url":url_notify})
    # elif status == 3 or status == 4: 
    #     ticket.approved_by_organization_id_level2 = current_user.organization_id
    #     ticket.approved_by_organization_name_level2 = current_user.Organization.name
    #     ticket.approved_by_userid_level2 = uid_current
    #     ticket.approved_by_username_level2 = current_user.name
    #     ticket.approved_at_level2 = floor(time.time())
    #     ticket.status = status
    #     db.session.commit()
    #     # approved_note_level2 = db.Column(String)
    #     if status == 3:
    #         content = "<span>"+current_user.Organization.name + "</span> đã chấp nhận yêu cầu của Bạn vào lúc <span>"+ convert_timestamp_to_string(ticket.approved_at_level2,"%d/%m/%Y, %H:%M")+"</span>. Vui lòng chờ bác sĩ kê đơn và chuyển thuốc"
    #         await send_notify_single(ticket.creator_id, "Xét duyệt tại bệnh viện",content, "text" ,url_notify, {"action":"ticket_approved_level2", "url":url_notify})

    #         content_tramyte = "<span>"+current_user.Organization.name + "</span> đã chấp nhận yêu cầu của <span> "+ticket.patient_name+"</span> vào lúc <span>"+ convert_timestamp_to_string(ticket.approved_at_level2,"%d/%m/%Y, %H:%M")+"</span>. Vui lòng chờ bác sĩ kê đơn và chuyển thuốc"
    #         await send_notify_single(ticket.approved_by_userid_level1, "Xét duyệt tại bệnh viện",content_tramyte, "text" ,url_notify, {"action":"ticket_approved_level2", "url":url_notify})
    #     else:
    #         content = "<span>"+current_user.Organization.name + "</span> đã từ chối yêu cầu của Bạn vào lúc <span>"+ convert_timestamp_to_string(ticket.approved_at_level2,"%d/%m/%Y, %H:%M")+"</span>. Vui lòng kiểm tra lại yêu cầu"
    #         await send_notify_single(ticket.creator_id, "Từ chối duyệt yêu cầu",content, "text" ,url_notify, {"action":"ticket_cancel_level2", "url":url_notify})

    #         content_tramyte = "<span>"+current_user.Organization.name + "</span> đã từ chối yêu cầu của <span> "+ticket.patient_name+"</span> vào lúc <span>"+ convert_timestamp_to_string(ticket.approved_at_level2,"%d/%m/%Y, %H:%M")+"</span>. Vui lòng kiểm tra lại yêu cầu"
    #         await send_notify_single(ticket.approved_by_userid_level1, "Từ chối duyệt yêu cầu",content_tramyte, "text" ,url_notify, {"action":"ticket_cancel_level2", "url":url_notify})

    else:
        return json({"error_code": "PARAM_ERROR", "error_message": "Trạng thái không hợp lệ."}, status=520)
    return json({"message": "successfully"}, status=200)


@app.route('/api/v1/suggetion', methods=['POST'])
async def send_suggetion_with_bvhuyen(request):
    data = request.json
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        current_user = db.session.query(User).filter(User.id == uid_current).first()
        content = data.get("approved_note_level2", "")
        id_ticket = data.get("id", None)

        if id_ticket is None:
            return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin phiếu yêu cầu"}, status=520)
        
        check_ticket = db.session.query(Ticket).filter(Ticket.id == id_ticket).first()
        if check_ticket is None:
            return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin phiếu yêu cầu"}, status=520)
        
        # check_ticket.approved_by_organization_id_level2 = current_user.organization_id
        # check_ticket.approved_by_organization_name_level2 = current_user.Organization.name
        check_ticket.approved_note_level2 = content
        check_ticket.approved_by_userid_level2 = uid_current
        check_ticket.approved_by_username_level2 = current_user.name
        check_ticket.approved_at_level2 = floor(time.time())
        check_ticket.comments = data.get("comments",None)
        print("ticket", to_dict(check_ticket))
        db.session.commit()
        return json({"error_message": "successfully"}, status=200)


@app.route('/api/v1/import/donvi', methods=['POST'])
async def import_excel_donvi(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    if request.method == 'POST':
        # try:
        # fileId = request.headers.get("fileId",None)
        file_data = request.files.get('file', None)
        print("",file_data)
        attrs = request.form.get('attrs',None)
        print(attrs)
        if file_data :
            response = await write_file(file_data,fileId, attrs,uid_current)
            return response