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
    if 'parent' in data:
        del data['parent']
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

    organization = Organization()
    organization.id = default_uuid()
    organization.code = data.get("donvi_code",None)
    organization.name = data.get("donvi_name",None)
    organization.unsigned_name = convert_text_khongdau(organization.name)
    organization.phone = data.get("donvi_phone",None)
    organization.email = data.get("donvi_email",None)
    organization.tinhthanh_id = data.get("tinhthanh_id",None)
    organization.quanhuyen_id = data.get("quanhuyen_id",None)
    organization.xaphuong_id = data.get("xaphuong_id",None)
    organization.tuyendonvi_id = data.get("tuyendonvi_id",None)
    organization.parent_id = data.get("parent_id",None)
    organization.parent_name = data.get("parent_name",None)
    organization.active = 1
    organization.created_by = uid_current
    organization.type_donvi = data.get("type_donvi","donvinhanuoc")
    db.session.add(organization)
    db.session.flush()
    # print("organization=============", to_dict(organization))
    
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
    user.created_by = uid_current
    role_admin_donvi = db.session.query(Role).filter(Role.name == 'admin_donvi').first()
    user.roles.append(role_admin_donvi)
    db.session.add(user)
    # print("user===========================", to_dict(user))
    db.session.commit()

    return json({"error_code":"OK","error_message":"successful", "data":to_dict(organization)},status=200)

@app.route('/api/v1/donvi/import', methods=['POST'])
async def import_excel_medicine(request):
    # data = request.json
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    fileId = request.headers.get("fileId",None)
    file_data = request.files.get('file', None)
    attrs = request.form.get('attrs',None)
    if file_data :
        response = await write_file_excel_donvinhanuoc(file_data,fileId, attrs,uid_current)
        print("respone",response)
        return response

    return json({"error_code": "UPLOAD_ERROR", "error_message": "Không thể tải file lên hệ thống"}, status=520)

async def write_file_excel_donvinhanuoc(file, fileId, attrs, uid_current):
    fsroot = app.config['FS_ROOT_DONVI']
    if not os.path.exists(fsroot):
        os.makedirs(fsroot)
    file_name = os.path.splitext(file.name)[0]
    extname = os.path.splitext(file.name)[1]
        
    BLOCKSIZE = 65536
    sha256 = hashlib.sha256()
    file_data = file.body
    data_length = len(file_data)
    if(data_length<=0):
        return json({"error_code": "Error","error_message": "File không hợp lệ"}, status=520)
    elif (data_length<BLOCKSIZE):
        BLOCKSIZE = data_length
    sha256.update(file_data)

    str_sha256 = sha256.hexdigest()   
    check_exist = db.session.query(FileInfo).filter(FileInfo.sha256 == str_sha256).first()
    if check_exist is not None:
        print("ERROR2====", to_dict(check_exist))
        return json(to_dict(check_exist))
    print("root file thuoc", fsroot + str_sha256 + extname)
    async with aiofiles.open(fsroot + str_sha256 + extname, 'wb+') as f:
        await f.write(file.body)
    f.close()

    if fileId is None:
        fileId = str(uuid.uuid4())
    fileInfo = FileInfo()
    fileInfo.id = fileId
    fileInfo.sha256 = str_sha256
    fileInfo.user_id = uid_current
    fileInfo.name = file_name
    fileInfo.extname = extname
    fileInfo.link = "/" + str(str_sha256) + str(extname)
    fileInfo.attrs = attrs
    fileInfo.size = data_length
    fileInfo.kind = "filedonvi"
    db.session.add(fileInfo)
    db.session.commit()

    #load and save to model Medicine

    url_file_thuoc = fsroot + str_sha256 + extname

    wb = xlrd.open_workbook(url_file_thuoc) 
    sheet = wb.sheet_by_index(0) 
    sheet.cell_value(0, 0) 
    count =0
    for i in range(sheet.nrows):
        for i in range(sheet.nrows):
            if i == 0:
                continue
            ma_donvi = str(sheet.cell_value(i,1)).strip()
            ten_donvi = str(sheet.cell_value(i,2)).strip()
            tuyendonvi = convert_columexcel_to_string(sheet.cell_value(i,3)).strip()
            parent_ma = convert_columexcel_to_string(sheet.cell_value(i,4)).strip()
            type_donvi = convert_columexcel_to_string(sheet.cell_value(i,5)).strip()

            # hinhthuc_tochuc = str(sheet.cell_value(i,6)).strip()
            matinhthanh = convert_columexcel_to_string(sheet.cell_value(i,6))
            maquanhuyen = convert_columexcel_to_string(sheet.cell_value(i,7))
            maxaphuong = convert_columexcel_to_string(sheet.cell_value(i,8))
            diachi_donvi = str(sheet.cell_value(i,9)).strip()
            email_donvi = str(sheet.cell_value(i,10)).strip()
            dienthoai_donvi = str(sheet.cell_value(i,11)).strip()
            
            account = str(sheet.cell_value(i,12)).strip()
            email_admin = str(sheet.cell_value(i,13)).strip()
            dienthoai_admin = str(sheet.cell_value(i,14)).strip()
            matkhau = convert_columexcel_to_string(sheet.cell_value(i,15))
            ten_admin = str(sheet.cell_value(i,16)).strip()

            if account is None:
                continue
            elif level_donvi != "1" and level_donvi != "2":
                continue
            
            check_donvi = db.session.query(Organization).filter(Organization.code == ma_donvi).first()
            if check_donvi is not None:
                continue
            donvi = Organization()
            donvi.id = default_uuid()
            donvi.code = ma_donvi
            if tuyendonvi is not None:
                check_tuyendonvi = db.session.query(TuyenDonVi).filter(TuyenDonVi.ma == tuyendonvi).first()
                if check_tuyendonvi is not None:
                    donvi.tuyendonvi_id = check_tuyendonvi.id
            if parent_ma is not None:
                check_parent = db.session.query(Organization).filter(Organization.code == ma_donvi).first()
                if check_parent is not None:
                    donvi.parent_id = check_parent.id
                    donvi.parent_name = check_parent.name
            donvi.type_donvi = type_donvi
            donvi.name = ten_donvi
            donvi.email = email_donvi
            donvi.phone = dienthoai_donvi
            donvi.address = diachi_donvi
            donvi.level = int(float(level_donvi))
            donvi.unsigned_name = convert_text_khongdau(donvi.name)
            donvi.active = 1
            check_tinhthanh = db.session.query(TinhThanh).filter(TinhThanh.ma == matinhthanh).first()
            if check_tinhthanh is not None:
                donvi.tinhthanh_id = check_tinhthanh.id

            check_quanhuyen = db.session.query(QuanHuyen).filter(QuanHuyen.ma == maquanhuyen).first()
            if check_quanhuyen is not None:
                donvi.quanhuyen_id = check_quanhuyen.id

            check_xaphuong = db.session.query(XaPhuong).filter(XaPhuong.ma == maxaphuong).first()
            if check_xaphuong is not None:
                donvi.xaphuong_id = check_xaphuong.id

            db.session.add(donvi)
            print("donvi==================================", to_dict(donvi))
            # db.session.commit()

            
            check_admin = db.session.query(User).filter(User.accountName == account).first()
            
            if check_admin is not None:
                continue
            admin = User()
            admin.id = default_uuid()
            admin.accountName = account
            admin.name = ten_admin
            admin.unsigned_name = convert_text_khongdau(admin.name)
            admin.organization_id = donvi.id
            admin.active = 1
            if email_admin is not None and email_admin != '':
                admin.email = email_admin
            else:
                admin.email = None
            if dienthoai_admin is not None and dienthoai_admin != '':
                admin.phone = dienthoai_admin
            else: 
                admin.phone = None
            # role_admin_tyt = db.session.query(Role).filter(Role.name == 'admin_tyt').first()
            # role_admin_benhvien = db.session.query(Role).filter(Role.name == 'admin_benhvien').first()
            # if donvi.level == 1:
            #     admin.roles.append(role_admin_benhvien)
            # elif donvi.level == 2:
            #     admin.roles.append(role_admin_tyt)

            salt = generator_salt()
            if matkhau is not None:
                newpassword = auth.encrypt_password(str(matkhau), str(salt))
                admin.password = newpassword
                admin.salt = salt

            db.session.add(admin)
            # db.session.commit()
            count = count + 1

        
    # print("fileInfo_thuoc", to_dict(fileInfo))
    return json(to_dict(fileInfo), status=200)

def convert_columexcel_to_string(value):
    # print("value", value)
    if isinstance(value,str):
        return value.strip()
    if isinstance(value, float):
        return str(int(value)).strip()
    if isinstance(value,int):
        return str(value).strip()