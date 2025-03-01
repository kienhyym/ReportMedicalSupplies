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
from application.models.model_danhmuc import TuyenDonVi, TinhThanh, QuanHuyen, XaPhuong
from application.controllers.helpers.helper_notify import send_notify_single
from sqlalchemy import or_, and_, func
from application.models.model_quanlykho import *
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
        cfpassword = request.json.get('confirm_password', None)
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
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[validate_user], PUT_SINGLE=[validate_user, donvi_prepput_children], DELETE_SINGLE=[validate_user]),
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
    accountName = data.get("accountName",None)
    password = data.get("password",None)
    salt = generator_salt()
    if phone is not None or email is not None:
        check_user = db.session.query(User).filter(or_(User.phone == phone, User.email == email)).first()
        if check_user is not None:
            return json({"error_code": "ERROR_PARAM", "error_message": "Email hoặc số điện thoại đã tồn tại."}, status=520)
    if accountName is None:
        return json({"error_code": "ERROR_PARAM", "error_message": "Tài khoản đăng nhập không được để trống."}, status=520)
    check_accountName = db.session.query(User).filter(User.accountName == accountName).first()
    if check_accountName is not None:
        return json({"error_code": "ERROR_PARAM", "error_message": "Tài khoản đăng nhập đã tồn tại."}, status=520)

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
    user.accountName = accountName
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
            # donvi.level = int(float(level_donvi))
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
            db.session.commit()

            
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
            role_admin_donvi = db.session.query(Role).filter(Role.name == 'admin_donvi').first()
            admin.roles.append(role_admin_donvi)

            salt = generator_salt()
            if matkhau is not None:
                newpassword = auth.encrypt_password(str(matkhau), str(salt))
                admin.password = newpassword
                admin.salt = salt

            db.session.add(admin)
            print("admin====================", to_dict(admin))
            db.session.commit()
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

@app.route('/api/v1/organizational_list_donvicungung',methods=['POST'])
async def organizational_list_donvicungung(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    currentUser = db.session.query(User).filter(User.id == uid_current).first()
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    data = request.json
    type_donvi = data['type_donvi']
    medical_supplies_id = data['medical_supplies_id']
    start_time = data['start_time']
    end_time = data['end_time']
    print('________________________',start_time)

    donvi = db.session.query(Organization).filter(Organization.id == currentUser.organization_id).first()
    if donvi is None:
        return json(status=520)
    thongke_tong = {"organization_name": "Tổng", "quantity_import": 0, "quantity_export": 0, "net_amount": 0, "estimates_net_amount": 0}
    thongkesolieu = await get_thongke_tinhthanh_donvicungung(donvi.quanhuyen_id, "16", medical_supplies_id, start_time, end_time)
    for thongke in thongkesolieu:
        thongke_tong['quantity_import'] =  thongke_tong['quantity_import'] + thongke["quantity_import"]
        thongke_tong['quantity_export'] = thongke_tong['quantity_export'] + thongke["quantity_export"]
        thongke_tong['net_amount'] = thongke_tong['net_amount'] + thongke["net_amount"]
        thongke_tong['estimates_net_amount'] = thongke_tong['estimates_net_amount'] + thongke["estimates_net_amount"]
    thongkesolieu.append(thongke_tong)
    print("abc========================", thongkesolieu)
    return json(thongkesolieu)


@app.route('/api/v1/statistical_data_of_health_facilities',methods=['POST'])
async def statistical_data_of_health_facilities(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    currentUser = db.session.query(User).filter(User.id == uid_current).first()
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    data = request.json

    type_donvi = data['type_donvi']
    medical_supplies_id = data['medical_supplies_id']
    type_filter = data['type']
    start_time = None
    if data.get('from_date') is not None:
        start_date= data['from_date']
        date_string_start_date = str(datetime.fromtimestamp(start_date))[0:10].replace("-", "/")
        conver_date_start_date = datetime.strptime(date_string_start_date, "%Y/%m/%d")
        start_time = datetime.timestamp(conver_date_start_date)
    
    end_time = None
    if data.get('to_date') is not None:
        end_date = data['to_date']
        date_string_end_date = str(datetime.fromtimestamp(end_date))[0:10].replace("-", "/")
        conver_date_end_date = datetime.strptime(date_string_end_date, "%Y/%m/%d")
        end_time = datetime.timestamp(conver_date_end_date)+ 86400
   
    is_admin = await hasRole(request, "admin")
    if is_admin == True:
        donvi = db.session.query(Organization).filter(Organization.tuyendonvi_id == "1").first()
        currentUser.Organization = donvi
    
    check_ttdcn = await hasTuyenDonvi(request, "13")
    check_cdc = await hasTuyenDonvi(request, "9")
    check_soyte = await hasTuyenDonvi(request, "6")
    check_boyte = await hasTuyenDonvi(request, "1")

    if check_ttdcn is True:
        donvi = db.session.query(Organization).filter(Organization.id == currentUser.organization_id).first()
        if donvi is None:
            return json(status=520)
        thongke_tong = {"organization_name": "Tổng", "quantity_import": 0, "quantity_export": 0, "net_amount": 0, "estimates_net_amount": 0}
        thongkesolieu = await trungtam_dachucnang_thongke(donvi.quanhuyen_id, medical_supplies_id, start_time, end_time,type_filter)
        for thongke in thongkesolieu:
            thongke_tong['quantity_import'] =  thongke_tong['quantity_import'] + thongke["quantity_import"]
            thongke_tong['quantity_export'] = thongke_tong['quantity_export'] + thongke["quantity_export"]
            thongke_tong['net_amount'] = thongke_tong['net_amount'] + thongke["net_amount"]
            thongke_tong['estimates_net_amount'] = thongke_tong['estimates_net_amount'] + thongke["estimates_net_amount"]
        thongkesolieu.append(thongke_tong)
        return json(thongkesolieu)

    elif check_cdc is True:
        donvi = db.session.query(Organization).filter(Organization.id == currentUser.organization_id).first()
        if donvi is None:
            return json(status=520)
        thongke_tong = {"organization_name": "Tổng", "quantity_import": 0, "quantity_export": 0, "net_amount": 0, "estimates_net_amount": 0}
        thongkesolieu = await cdc_thongke(donvi.tinhthanh_id, medical_supplies_id, start_time, end_time,type_filter)
        for thongke in thongkesolieu:
            thongke_tong['quantity_import'] =  int(thongke_tong['quantity_import']) + thongke["quantity_import"]
            thongke_tong['quantity_export'] = int(thongke_tong['quantity_export']) + thongke["quantity_export"]
            thongke_tong['net_amount'] = int(thongke_tong['net_amount']) + thongke["net_amount"]
            thongke_tong['estimates_net_amount'] = int(thongke_tong['estimates_net_amount']) + thongke["estimates_net_amount"]
        thongkesolieu.append(thongke_tong)
        return json(thongkesolieu)

    elif check_soyte is True:
        donvi = db.session.query(Organization).filter(Organization.id == currentUser.organization_id).first()
        if donvi is None:
            return json(status=520)
        thongke_tong = {"organization_name": "Tổng", "quantity_import": 0, "quantity_export": 0, "net_amount": 0, "estimates_net_amount": 0}
        thongkesolieu = await soyte_thongke(donvi.tinhthanh_id, medical_supplies_id, start_time, end_time,type_filter)
        for thongke in thongkesolieu:
            thongke_tong['quantity_import'] =  int(thongke_tong['quantity_import']) + thongke["quantity_import"]
            thongke_tong['quantity_export'] = int(thongke_tong['quantity_export']) + thongke["quantity_export"]
            thongke_tong['net_amount'] = int(thongke_tong['net_amount']) + thongke["net_amount"]
            thongke_tong['estimates_net_amount'] = int(thongke_tong['estimates_net_amount']) + thongke["estimates_net_amount"]
        thongkesolieu.append(thongke_tong)
        return json(thongkesolieu)

    elif check_boyte is True:
        thongke_tong = {"organization_name": "Tổng", "quantity_import": 0, "quantity_export": 0, "net_amount": 0, "estimates_net_amount": 0}
        thongkesolieu = await boyte_thongke(medical_supplies_id, start_time, end_time,type_filter)
        for thongke in thongkesolieu:
            thongke_tong['quantity_import'] =  int(thongke_tong['quantity_import']) + thongke["quantity_import"] 
            thongke_tong['quantity_export'] = int(thongke_tong['quantity_export']) + thongke["quantity_export"]
            thongke_tong['net_amount'] = int(thongke_tong['net_amount']) + thongke["net_amount"]
            thongke_tong['estimates_net_amount'] = int(thongke_tong['estimates_net_amount']) + thongke["estimates_net_amount"]
        thongkesolieu.append(thongke_tong)
        return json(thongkesolieu)

async def trungtam_dachucnang_thongke(quanhuyen_id, medical_supplies_id, start_time, end_time,type_filter):
    list_item  = []
    list_organization = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc", Organization.quanhuyen_id == quanhuyen_id, Organization.tuyendonvi_id == "16")).all()
    if len(list_organization) == 0:
        obj = {'organization_name':'','quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}
        list_item.append(obj)
        return list_item
    else:
        for organization in list_organization:
            obj = {'organization_name':to_dict(organization)['name'],'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}

            if type_filter == "all":
                reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
                begin_net_amount = 0
                report_organization_detail_begin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).order_by(ReportOrganizationDetail.date.asc()).first()
                if report_organization_detail_begin_net_amount is not None:
                    begin_net_amount = to_dict(report_organization_detail_begin_net_amount)['begin_net_amount']

            elif type_filter == "fromBeforeToDay":
                reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).all()
                begin_net_amount = 0
                report_organization_detail_begin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).order_by(ReportOrganizationDetail.date.asc()).first()
                if report_organization_detail_begin_net_amount is not None:
                    begin_net_amount = to_dict(report_organization_detail_begin_net_amount)['begin_net_amount']

            elif type_filter == "fromDayToDay":
            # TRONG KHOẢNG THỜI GIAN
                reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
            # TRƯỚC KHOẢNG THỜI GIAN
                begin_net_amount = 0
                report_organization_detail_before_sum_quantity = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= start_time)).all()
                if len(report_organization_detail_before_sum_quantity) > 0:
                    begin_net_amount = report_organization_detail_before_sum_quantity[0][0]
                report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
                if len(report_organization_begin_net_amoun_before_from_daytoday)> 0:
                    begin_net_amount = report_organization_begin_net_amoun_before_from_daytoday[0][0] + begin_net_amount

            if len(reportOrganizationDetail) > 0:
                obj['quantity_import'] = reportOrganizationDetail[0][0]
                obj['quantity_export'] = reportOrganizationDetail[0][1]
                obj['net_amount'] = reportOrganizationDetail[0][2] + begin_net_amount
                obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
                list_item.append(obj)
            else:
                obj['quantity_import'] = 0
                obj['quantity_export'] = 0
                obj['net_amount'] = 0
                obj['estimates_net_amount'] = 0
                list_item.append(obj)
        return list_item


async def cdc_thongke(tinhthanh_id, medical_supplies_id, start_time, end_time,type_filter):
    list_item = []
    danhsach_quanhuyen = db.session.query(QuanHuyen).filter(QuanHuyen.tinhthanh_id == tinhthanh_id).all()
    for quanhuyen in danhsach_quanhuyen:
        obj = {'organization_name':to_dict(quanhuyen)['ten'],'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}
        list_organizations_id = db.session.query(Organization.id).filter(and_(Organization.type_donvi == "donvinhanuoc", Organization.quanhuyen_id == to_dict(quanhuyen)['id'], Organization.tuyendonvi_id.in_(["12","13","16"]))).all()
        if type_filter == "all":
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            begin_net_amount = 0
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount 

        elif type_filter == "fromBeforeToDay":
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).all()
            begin_net_amount = 0
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount 

        elif type_filter == "fromDayToDay":
            # TRONG KHOẢN THỜI GIAN
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
            # TỒN TRƯỚC TRƯỚC KHOẢNG THỜI GIAN
            begin_net_amount = 0
            report_organization_detail_before_sum_quantity = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date < start_time)).all()
            if len(report_organization_detail_before_sum_quantity) > 0:
                begin_net_amount = report_organization_detail_before_sum_quantity[0][0] + begin_net_amount
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount 

        if len(reportOrganizationDetail) > 0:
            obj['quantity_import'] = reportOrganizationDetail[0][0]
            obj['quantity_export'] = reportOrganizationDetail[0][1]
            obj['net_amount'] = reportOrganizationDetail[0][2] + begin_net_amount
            obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
            list_item.append(obj)
        else:
            obj['quantity_import'] = 0
            obj['quantity_export'] = 0
            obj['net_amount'] = 0 + begin_net_amount
            obj['estimates_net_amount'] = 0
            list_item.append(obj)
    return list_item


async def soyte_thongke(tinhthanh_id, medical_supplies_id, start_time, end_time,type_filter):
    list_item  = []
    tuyenduoi = ["9","11"]
    for td in tuyenduoi:
        organizations = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc", Organization.tinhthanh_id == tinhthanh_id, Organization.tuyendonvi_id == td)).all()
        if len(organizations) > 0 :
            for organization in organizations:
                organization_id = to_dict(organization)['id']
                organization_name = to_dict(organization)['name']
                obj = {'organization_name':organization_name,'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}

                if type_filter == "all":
                    reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
                    begin_net_amount = 0
                    report_organization_detail_begin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).order_by(ReportOrganizationDetail.date.asc()).first()
                    if report_organization_detail_begin_net_amount is not None:
                        begin_net_amount = to_dict(report_organization_detail_begin_net_amount)['begin_net_amount']

                elif type_filter == "fromBeforeToDay":
                    reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).all()
                    begin_net_amount = 0
                    report_organization_detail_begin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).order_by(ReportOrganizationDetail.date.asc()).first()
                    if report_organization_detail_begin_net_amount is not None:
                        begin_net_amount = to_dict(report_organization_detail_begin_net_amount)['begin_net_amount']

                elif type_filter == "fromDayToDay":
                # TRONG KHOẢNG THỜI GIAN
                    reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
                # TRƯỚC KHOẢNG THỜI GIAN
                    begin_net_amount = 0
                    report_organization_detail_before_sum_quantity = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date < start_time)).all()
                    if len(report_organization_detail_before_sum_quantity) > 0:
                        begin_net_amount = report_organization_detail_before_sum_quantity[0][0]
                    report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
                    if len(report_organization_begin_net_amoun_before_from_daytoday)> 0:
                        begin_net_amount = report_organization_begin_net_amoun_before_from_daytoday[0][0] + begin_net_amount

                if len(reportOrganizationDetail) > 0:
                    obj['quantity_import'] = reportOrganizationDetail[0][0]
                    obj['quantity_export'] = reportOrganizationDetail[0][1]
                    obj['net_amount'] = reportOrganizationDetail[0][2] + begin_net_amount
                    obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
                    list_item.append(obj)
                else:
                    obj['quantity_import'] = 0
                    obj['quantity_export'] = 0
                    obj['net_amount'] = 0 + begin_net_amount
                    obj['estimates_net_amount'] = 0
                    list_item.append(obj)  


    danhsach_quanhuyen = db.session.query(QuanHuyen).filter(QuanHuyen.tinhthanh_id == tinhthanh_id).all()
    for quanhuyen in danhsach_quanhuyen:
        obj = {'organization_name':to_dict(quanhuyen)['ten'],'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}
        list_organizations_id = db.session.query(Organization.id).filter(and_(Organization.type_donvi == "donvinhanuoc", Organization.quanhuyen_id == to_dict(quanhuyen)['id'], Organization.tuyendonvi_id.in_(["12","13","14","15","16","17"]))).all()
        if type_filter == "all":
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            begin_net_amount = 0
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount 

        elif type_filter == "fromBeforeToDay":
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).all()
            begin_net_amount = 0
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount 

        elif type_filter == "fromDayToDay":
            # TRONG KHOẢN THỜI GIAN
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
            # TỒN TRƯỚC TRƯỚC KHOẢNG THỜI GIAN
            begin_net_amount = 0
            report_organization_detail_before_sum_quantity = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date < start_time)).all()
            if len(report_organization_detail_before_sum_quantity) > 0:
                begin_net_amount = report_organization_detail_before_sum_quantity[0][0] + begin_net_amount
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount  

        if len(reportOrganizationDetail) > 0:
            obj['quantity_import'] = reportOrganizationDetail[0][0]
            obj['quantity_export'] = reportOrganizationDetail[0][1]
            obj['net_amount'] = reportOrganizationDetail[0][2] + begin_net_amount
            obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
            list_item.append(obj)
        else:
            obj['quantity_import'] = 0
            obj['quantity_export'] = 0
            obj['net_amount'] = 0 + begin_net_amount
            obj['estimates_net_amount'] = 0
            list_item.append(obj)
    return list_item



async def boyte_thongke(medical_supplies_id, start_time, end_time,type_filter):
    list_item  = []
    tuyenduoi = ["7","8"]
    for td in tuyenduoi:
        organizations = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc", Organization.tuyendonvi_id == td)).all()
        if len(organizations) > 0 :
            for organization in organizations:
                organization_id = to_dict(organization)['id']
                organization_name = to_dict(organization)['name']
                obj = {'organization_name':organization_name,'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}

                if type_filter == "all":
                    reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
                    begin_net_amount = 0
                    report_organization_detail_begin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).order_by(ReportOrganizationDetail.date.asc()).first()
                    if report_organization_detail_begin_net_amount is not None:
                        begin_net_amount = to_dict(report_organization_detail_begin_net_amount)['begin_net_amount']

                elif type_filter == "fromBeforeToDay":
                    reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).all()
                    begin_net_amount = 0
                    report_organization_detail_begin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).order_by(ReportOrganizationDetail.date.asc()).first()
                    if report_organization_detail_begin_net_amount is not None:
                        begin_net_amount = to_dict(report_organization_detail_begin_net_amount)['begin_net_amount']

                elif type_filter == "fromDayToDay":
                # TRONG KHOẢNG THỜI GIAN
                    reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
                # TRƯỚC KHOẢNG THỜI GIAN
                    begin_net_amount = 0
                    report_organization_detail_before_sum_quantity = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id  == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date < start_time)).all()
                    if len(report_organization_detail_before_sum_quantity) > 0:
                        begin_net_amount = report_organization_detail_before_sum_quantity[0][0]
                    report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
                    if len(report_organization_begin_net_amoun_before_from_daytoday)> 0:
                        begin_net_amount = report_organization_begin_net_amoun_before_from_daytoday[0][0] + begin_net_amount

                if len(reportOrganizationDetail) > 0:
                    obj['quantity_import'] = reportOrganizationDetail[0][0]
                    obj['quantity_export'] = reportOrganizationDetail[0][1]
                    obj['net_amount'] = reportOrganizationDetail[0][2] + begin_net_amount
                    obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
                    list_item.append(obj)
                else:
                    obj['quantity_import'] = 0
                    obj['quantity_export'] = 0
                    obj['net_amount'] = 0 + begin_net_amount
                    obj['estimates_net_amount'] = 0
                    list_item.append(obj) 


    danhsach_tinhthanh = db.session.query(TinhThanh).order_by(TinhThanh.ma.asc()).all()
    for tinhthanh in danhsach_tinhthanh:
        obj = {'organization_name':to_dict(tinhthanh)['ten'],'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}
        list_organizations_id = db.session.query(Organization.id).filter(and_(Organization.type_donvi == "donvinhanuoc", Organization.tinhthanh_id == to_dict(tinhthanh)['id'], Organization.tuyendonvi_id.in_(["6","9","11","12","13","14","15","16","17"]))).all()
        if type_filter == "all":
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            begin_net_amount = 0
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount

        elif type_filter == "fromBeforeToDay":
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= end_time)).all()
            begin_net_amount = 0
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount

        elif type_filter == "fromDayToDay":
            # TRONG KHOẢN THỜI GIAN
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
            # TỒN TRƯỚC TRƯỚC KHOẢNG THỜI GIAN
            begin_net_amount = 0
            report_organization_detail_before_sum_quantity = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date < start_time)).all()
            if len(report_organization_detail_before_sum_quantity) > 0:
                begin_net_amount = report_organization_detail_before_sum_quantity[0][0] + begin_net_amount
            report_organization_begin_net_amoun_before_from_daytoday = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.organization_id.in_(list_organizations_id),ReportOrganizationDetail.medical_supplies_id == medical_supplies_id)).all()
            if report_organization_begin_net_amoun_before_from_daytoday[0][0] is not None:
                begin_net_amount = to_dict(report_organization_begin_net_amoun_before_from_daytoday)[0][0] + begin_net_amount 

        if len(reportOrganizationDetail) > 0:
            obj['quantity_import'] = reportOrganizationDetail[0][0]
            obj['quantity_export'] = reportOrganizationDetail[0][1]
            obj['net_amount'] = reportOrganizationDetail[0][2] + begin_net_amount
            obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
            list_item.append(obj)
        else:
            obj['quantity_import'] = 0
            obj['quantity_export'] = 0
            obj['net_amount'] = 0 + begin_net_amount
            obj['estimates_net_amount'] = 0
            list_item.append(obj)
    return list_item


async def get_thongke_tinhthanh_donvicungung(tinhthanh_id, tuyendonvi_id, medical_supplies_id, start_time, end_time):
    list_item = []
    organization_donvicungung = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvicungung")).all()
    for organization in organization_donvicungung:
        obj = {'quantity_import':0,'quantity_export':0,'net_amount':0,'estimates_net_amount':0}

        reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
        if len(reportOrganizationDetail) > 0:
            obj['quantity_import'] = reportOrganizationDetail[0][0]
            obj['quantity_export'] = reportOrganizationDetail[0][1]
            obj['net_amount'] = reportOrganizationDetail[0][2]
            obj['estimates_net_amount'] = reportOrganizationDetail[0][3]
            obj['organization_name'] = organization.name
            list_item.append(obj)
        else:
            obj['quantity_import'] = 0
            obj['quantity_export'] = 0
            obj['net_amount'] = 0
            obj['estimates_net_amount'] = 0
            obj['organization_name'] = organization.name
            list_item.append(obj)
    return list_item


    

#Thống kê đơn vị cung ứng
@app.route('/api/v1/enterprise_supply_statistics', methods=["POST"])
async def enterprise_supply_statistics(request):
    data = request.json

    type= data['type']
    type_donvi= data['type_donvi']
    medical_supplies_id= data['medical_supplies_id']
    medical_supplies_name= data['medical_supplies_name']
    if data.get('from_date') is not None:
        start_date= data['from_date']
        date_string_start_date = str(datetime.fromtimestamp(start_date))[0:10].replace("-", "/")
        conver_date_start_date = datetime.strptime(date_string_start_date, "%Y/%m/%d")
        from_date = datetime.timestamp(conver_date_start_date)
    if data.get('to_date') is not None:
        end_date = data['to_date']
        date_string_end_date = str(datetime.fromtimestamp(end_date))[0:10].replace("-", "/")
        conver_date_end_date = datetime.strptime(date_string_end_date, "%Y/%m/%d")
        to_date = datetime.timestamp(conver_date_end_date)+ 86400
        
    if type == "all":
        reportSupplyOrganizationDetails = db.session.query(ReportSupplyOrganizationDetail).filter(and_(ReportSupplyOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportSupplyOrganizationDetail.type_sell_sponsor == "sell")).all()
    if type == "fromDayToDay":
        reportSupplyOrganizationDetails = db.session.query(ReportSupplyOrganizationDetail).filter(and_(ReportSupplyOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportSupplyOrganizationDetail.type_sell_sponsor == "sell",ReportSupplyOrganizationDetail.date >= from_date,ReportSupplyOrganizationDetail.date <= to_date)).all()
    if type == "fromBeforeToDay":
        reportSupplyOrganizationDetails = db.session.query(ReportSupplyOrganizationDetail).filter(and_(ReportSupplyOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportSupplyOrganizationDetail.type_sell_sponsor == "sell",ReportSupplyOrganizationDetail.date <= to_date)).all()


    arr = []
    obj = {"medical_supplies_name":medical_supplies_name,"data":arr}
    price = 0
    quantity = 0
    sum_price = 0
    if len(reportSupplyOrganizationDetails) >0:
        if len(reportSupplyOrganizationDetails) > 0:
            for _ in reportSupplyOrganizationDetails:
                reportSupplyOrganizationDetail = to_dict(_)
                organization_name = db.session.query(Organization.name).filter(Organization.id == to_dict(_)['organization_id']).first()
                reportSupplyOrganizationDetail['organization_name'] = organization_name[0]
                arr.append(reportSupplyOrganizationDetail)
            
                price = to_dict(_)['price'] + price
                quantity = to_dict(_)['quantity'] + quantity  
                sum_price = to_dict(_)['quantity'] * to_dict(_)['price'] +sum_price  

            obj["avg_price"]= price/len(reportSupplyOrganizationDetails)
            obj["quantity"]= quantity
            obj["sum_price"]= sum_price
        else:
            obj = {
                "medical_supplies_name":medical_supplies_name,
                "data":[],
                "avg_price":0,
                "quantity":0,
                "sum_price":0,
            }
        return json(obj)
    else:
        obj = {
                "medical_supplies_name":medical_supplies_name,
                "data":[],
                "avg_price":0,
                "quantity":0,
                "sum_price":0,
            }
        return json(obj)





@app.route('/api/v1/dangky_donvi_cungung', methods=['POST'])
async def dangky_donvi_cungung(request):

    data = request.json
    numberphone = data.get("phone",None)
    checktontai = db.session.query(User).filter(User.phone == numberphone).first()
    # print ('___________________________',numberphone,checktontai)
    if checktontai is None:
        organization = Organization()
        organization.id = default_uuid()
        organization.name = data.get("donvi_name",None).upper()
        organization.unsigned_name = convert_text_khongdau(organization.name)
        organization.phone = data.get("donvi_phone",None)
        organization.email = data.get("donvi_email",None)
        organization.tinhthanh_id = data.get("tinhthanh_id",None)
        organization.quanhuyen_id = data.get("quanhuyen_id",None)
        organization.xaphuong_id = data.get("xaphuong_id",None)
        organization.ghichu = data.get("ghichu",None)
        organization.donvi_diachi = data.get("donvi_diachi",None)
        organization.active = 1
        organization.type_donvi = "donvicungung"
        db.session.add(organization)
        db.session.flush()
        # # print("organization=============", to_dict(organization))
        salt = generator_salt()
        user = User()
        user.id = default_uuid()
        user.name = data.get("name",None).upper()
        user.phone = data.get("phone",None)
        user.email = data.get("email",None)
        user.unsigned_name = convert_text_khongdau(user.name)
        user.salt = salt
        user.password = auth.encrypt_password(data.get("password",None), str(salt))
        user.organization_id = organization.id
        user.active = 1
        role_admin_donvi = db.session.query(Role).filter(Role.name == 'admin_donvi').first()
        user.roles.append(role_admin_donvi)
        db.session.add(user)
        # print("user===========================", to_dict(user))
        db.session.commit()
    else:
        return json({"error_code":"OK","error_message":"Tài khoản đã tồn tại"},status=520)


    return json({"error_code":"OK","error_message":"successful"},status=200)







@app.route('/api/v1/count_of_month_csyte',methods=['POST'])
async def count_of_month_csyte(request):
    data = request.json
    medical_supplies_id = data['medical_supplies_id']
    date = data['nam']
    date_after = int(date) + 1
    month = [1,2,3,4,5,6,7,8,9,10,11,12]
    data_12_month = []

    for th in month:
        th_after = int(th)+1
        if th == 12:
            date_conver_start_month= datetime.strptime(str(date)+"/"+str(th)+"/01", "%Y/%m/%d")
            timestamp_start_month = datetime.timestamp(date_conver_start_month)
            date_conver_end_month= datetime.strptime(str(date_after)+"/01/01", "%Y/%m/%d")
            timestamp_end_month = datetime.timestamp(date_conver_end_month)
            obj = {"timestamp_start_month":timestamp_start_month,"timestamp_end_month":timestamp_end_month}
            data_12_month.append(obj)

        if th < 12:
            date_conver_start_month= datetime.strptime(str(date)+"/"+str(th)+"/01", "%Y/%m/%d")
            timestamp_start_month = datetime.timestamp(date_conver_start_month)
            date_conver_end_month= datetime.strptime(str(date)+"/"+str(th_after)+"/01", "%Y/%m/%d")
            timestamp_end_month = datetime.timestamp(date_conver_end_month)
            obj = {"timestamp_start_month":timestamp_start_month,"timestamp_end_month":timestamp_end_month}
            data_12_month.append(obj)
            
    quantity_import  = []
    quantity_export = []
    net_amount = []
    estimates_net_amount = []
    object = {}
    
    if medical_supplies_id is None:
        medicalSupplies = db.session.query(MedicalSupplies.id,MedicalSupplies.name).first()
        medical_supplies_id = medicalSupplies[0]
        object["medical_supplies_name"] = medicalSupplies[1],

    for month in data_12_month:
        tong_dau = 0
        quantity = 0
        now = datetime.now()
        datenow_string = datetime.strptime("01/"+now.strftime("%m/%Y"), "%d/%m/%Y")
        timestamp_datenow= datetime.timestamp(datenow_string)
        
        # Tính tồn đầu kỳ của các cơ sở y tế
        count_quantity_original = db.session.query(func.sum(ReportOrganizationDetail.quantity_original)).filter(and_(ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= int(month['timestamp_end_month']))).all()
        if count_quantity_original[0][0] is not None:
            tong_dau = count_quantity_original[0][0]
            if int(timestamp_datenow) < int(month['timestamp_start_month']):
                tong_dau = 0
        
        # Tính sô lượng trong các tháng trước đó
        quantity_import_export_before = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date <= int(month['timestamp_start_month']))).all()
        if len(quantity_import_export_before) > 0:
            quantity = int(quantity_import_export_before[0][0])
            if int(timestamp_datenow) < int(month['timestamp_start_month']):
                quantity = 0

        # Tính sô lượng trong tháng
        quantity_import_export = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export),func.sum(ReportOrganizationDetail.estimates_net_amount)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= int(month['timestamp_start_month']),ReportOrganizationDetail.date <= int(month['timestamp_end_month']))).all()
        if len(quantity_import_export) > 0:
            if int(timestamp_datenow) < int(month['timestamp_start_month']):
                quantity_import.append(0)
                quantity_export.append(0)
                net_amount.append(0 + tong_dau+quantity)
                estimates_net_amount.append(0)
            else:
                quantity_import.append(quantity_import_export[0][0])
                quantity_export.append(quantity_import_export[0][1])
                net_amount.append(quantity_import_export[0][2]+ tong_dau +quantity)
                estimates_net_amount.append(quantity_import_export[0][3])
        else:
            quantity_import.append(0)
            quantity_export.append(0)
            net_amount.append(0 + tong_dau +quantity)
            estimates_net_amount.append(0)

    object["quantity_import"] = quantity_import,
    object["quantity_export"] = quantity_export,
    object["net_amount"] = net_amount,
    object["estimates_net_amount"]= estimates_net_amount
    return json(object)


@app.route('/api/v1/count_of_day',methods=['POST'])
async def count_of_day(request):
    date = request.json
    date_conver_start_day= datetime.strptime(str(date), "%Y/%m/%d")
    timestamp_start_day = datetime.timestamp(date_conver_start_day)
    sl_baocao_csyte = db.session.query(ReportOrganization).filter(and_(ReportOrganization.date >= int(timestamp_start_day),ReportOrganization.date <= int(timestamp_start_day)+84600)).all()
    sl_baocao_cungung = db.session.query(ReportSupplyOrganization).filter(and_(ReportSupplyOrganization.date >= int(timestamp_start_day),ReportSupplyOrganization.date <= int(timestamp_start_day)+84600)).all()
    return json({"sl_baocao_csyte":len(sl_baocao_csyte),"sl_baocao_cungung":len(sl_baocao_cungung)})


@app.route('/api/v1/count_of_month_cungung',methods=['POST'])
async def count_of_month_cungung(request):
    data = request.json
    date = data['nam']
    medical_supplies_id = data['medical_supplies_id']
    date_after = int(date) + 1
    month = [1,2,3,4,5,6,7,8,9,10,11,12]
    data_12_month = []
    for th in month:
        th_after = int(th)+1
        if th == 12:
            date_conver_start_month= datetime.strptime(str(date)+"/"+str(th)+"/01", "%Y/%m/%d")
            timestamp_start_month = datetime.timestamp(date_conver_start_month)

            date_conver_end_month= datetime.strptime(str(date_after)+"/01/01", "%Y/%m/%d")
            timestamp_end_month = datetime.timestamp(date_conver_end_month)
            obj = {"timestamp_start_month":timestamp_start_month,"timestamp_end_month":timestamp_end_month}
            data_12_month.append(obj)
        if th < 12:
            date_conver_start_month= datetime.strptime(str(date)+"/"+str(th)+"/01", "%Y/%m/%d")
            timestamp_start_month = datetime.timestamp(date_conver_start_month)

            date_conver_end_month= datetime.strptime(str(date)+"/"+str(th_after)+"/01", "%Y/%m/%d")
            timestamp_end_month = datetime.timestamp(date_conver_end_month)
            obj = {"timestamp_start_month":timestamp_start_month,"timestamp_end_month":timestamp_end_month}
            data_12_month.append(obj)
    object ={}
    quantity  = []
    price = []
    supply_ability = []
    price_quantity = []
    if medical_supplies_id is None:
        medicalSupplies = db.session.query(MedicalSupplies.id,MedicalSupplies.name).all()
        medical_supplies_id = medicalSupplies[1][0]
        object['medical_supplies_name'] = medicalSupplies[1][1]
    organization = db.session.query(Organization.id).filter(and_(Organization.type_donvi=="donvicungung")).all()
    for month in data_12_month:
        sl_cungung = db.session.query(func.sum(ReportSupplyOrganizationDetail.supply_ability),func.sum(ReportSupplyOrganizationDetail.quantity),func.avg(ReportSupplyOrganizationDetail.price),func.sum(ReportSupplyOrganizationDetail.quantity * ReportSupplyOrganizationDetail.price)).group_by(ReportSupplyOrganizationDetail.medical_supplies_id).filter(and_(ReportSupplyOrganizationDetail.organization_id.in_(organization),ReportSupplyOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportSupplyOrganizationDetail.date >= int(month['timestamp_start_month']),ReportSupplyOrganizationDetail.date <= int(month['timestamp_end_month']),ReportSupplyOrganizationDetail.type_sell_sponsor == "sell")).all()
        if len(sl_cungung) > 0:
            supply_ability.append(sl_cungung[0][0])
            quantity.append(sl_cungung[0][1])
            price.append(sl_cungung[0][2])
            price_quantity.append(sl_cungung[0][3]/1000)
        else:
            supply_ability.append(0)
            quantity.append(0)
            price.append(0)
            price_quantity.append(0)
    object["supply_ability"]=supply_ability
    object["quantity"]=quantity
    object["price"]=price
    object["price_quantity"]=price_quantity
    return json(object)