
from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from sqlalchemy import or_, and_, func

from datetime import datetime
import ujson
import asyncio
import aiohttp
import time
import random
import string
import os, sys
import aiofiles
from gatco.response import json, text, html

from operator import itemgetter

from application.models.model_quanlykho import *
from application.models.models import Organization, User
from application.models.model_danhmuc import TinhThanh,TuyenDonVi
from application.extensions import auth
from application.controllers.helpers.helper_common import *            

# from application.controllers.helpers.helper_common import validate_user, convert_text_khongdau, current_uid, get_current_user
from application.database import db
import pandas



@app.route('/api/v1/changepassword', methods=['POST'])
async def changepassword(request):
    data = request.json
    password_old = data['password_old']
    password_new = data['password_new']
    user_id = data['user_id']
    user = db.session.query(User).filter(User.id == user_id).first()
    if user is not None:
        print('___________________________',user.password,auth.encrypt_password(str(password_old), str(salt)))
        if user.password == auth.encrypt_password(str(password_old)):

            newpass= auth.encrypt_password(str(password_new), str(salt))
            user.password = newpass
            user.salt = salt
            # db.session.commit()
            return json({})


async def postprocess_add_stt2(request=None, Model=None, result=None, **kw):
    if result is not None and "objects" in result:
        lit =  sorted(to_dict(result["objects"]), key=itemgetter('created_at'), reverse=True)
        data = []
        i =1
        page = request.args.get("page",None)
        results_per_page = request.args.get("results_per_page",None)
        if page is not None and results_per_page is not None and int(page) > 1:
            i = i + int(results_per_page)*(int(page)-1)
        for obj in lit:
            if obj is not None:
                obj["stt"] = i
                i = i + 1
        result = lit

async def postprocess_add_stt(request=None, Model=None, result=None, **kw):
    if result is not None and "objects" in result:
        lit =  sorted(to_dict(result["objects"]), key=itemgetter('date'), reverse=True)
        data = []
        i = 1
        page = request.args.get("page",None)
        results_per_page = request.args.get("results_per_page",None)
        if page is not None and results_per_page is not None and int(page) > 1:
            i = i + int(results_per_page)*(int(page)-1)
        for obj in lit:
            if obj is not None:
                obj["stt"] = i
                i = i + 1
        result = lit


async def get_name_medical_supplies2(request=None, Model=None, result=None ,**kw):
        for _ in result['details']:
            organization = db.session.query(Organization.name).filter(Organization.id == _['health_facilities_id']).first()
            if organization is not None:
                _['health_facilities_name']= organization[0]
            else:
                _['health_facilities_name'] = ""
            medicalSupplies = db.session.query(MedicalSupplies).filter(MedicalSupplies.id == _['medical_supplies_id']).first()
            _['medical_supplies_name']= to_dict(medicalSupplies)['name']
            _['medical_supplies_unit']= to_dict(medicalSupplies)['unit']
                


async def check_medical_supplies_name1(request=None, data=None, Model=None, **kw):
        for _ in data['details']:
            del _['medical_supplies_name']
            del _['medical_supplies_unit']
            del _['begin_net_amount']

async def check_medical_supplies_name2(request=None, data=None, Model=None, **kw):
        for _ in data['details']:
            del _['medical_supplies_name']
            del _['medical_supplies_unit']
            del _['health_facilities_name']


@app.route('/api/v1/load_medical_supplies_dropdown2',methods=['POST'])
async def load_medical_supplies_dropdown2(request):
    data = request.json
    text =data['text']
    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(MedicalSupplies).filter(and_(or_(MedicalSupplies.name.like(search),MedicalSupplies.name.like(searchTitle),MedicalSupplies.name_not_tone_mark.like(search)))).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)
    else:
        list = db.session.query(MedicalSupplies).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)

# // TÌM KIẾM DANH SÁCH VÂT TƯ Y TẾ 
@app.route('/api/v1/load_medical_supplies_dropdown',methods=['POST'])
async def load_medical_supplies_dropdown(request):
    text = request.json
    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(MedicalSupplies).filter(and_(or_(MedicalSupplies.name.like(search),MedicalSupplies.name.like(searchTitle),MedicalSupplies.name_not_tone_mark.like(search)))).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)
    else:
        list = db.session.query(MedicalSupplies).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)

# // TÌM KIẾM DANH SÁCH SỎ Y TẾ 
@app.route('/api/v1/load_organization_dropdown_soyte',methods=['POST'])
async def load_organization_dropdown_soyte(request):
    data = request.json
    text = data['text']
    notid = data['danhSachDaSearch']
    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(Organization).filter(and_(or_(Organization.name.like(search),Organization.name.like(searchTitle),Organization.unsigned_name.like(search)),Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id == "6",Organization.id.notin_(notid),Organization.active == 1)).all()
        arr = []
        for i in list:
            obj =  to_dict(i)
            tinhthanh_name = db.session.query(TinhThanh.ten).filter(TinhThanh.id == obj['tinhthanh_id']).first()
            obj['name'] = tinhthanh_name[0]
            arr.append(obj)
        return json(arr)
    else:
        list = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id == "6",Organization.id.notin_(notid),Organization.active == 1)).all()
        arr = []
        for i in list:
            obj =  to_dict(i)
            tinhthanh_name = db.session.query(TinhThanh.ten).filter(TinhThanh.id == obj['tinhthanh_id']).first()
            obj['name'] = tinhthanh_name[0]
            arr.append(obj)
        return json(arr)

# // TÌM KIẾM DANH SÁCH VIỆN BỆNH VIỆN
@app.route('/api/v1/load_organization_dropdown_hospital',methods=['POST'])
async def load_organization_dropdown_hospital(request):
    data = request.json
    text = data['text']
    notid = data['danhSachDaSearch']
    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(Organization).filter(and_(or_(Organization.name.like(search),Organization.name.like(searchTitle),Organization.unsigned_name.like(search)),Organization.type_donvi == "donvinhanuoc",or_(Organization.tuyendonvi_id == "7",Organization.tuyendonvi_id == "8"),Organization.id.notin_(notid),Organization.active == 1)).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)
    else:
        list = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc",or_(Organization.tuyendonvi_id == "7",Organization.tuyendonvi_id == "8"),Organization.id.notin_(notid),Organization.active == 1)).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)

# // TÌM KIẾM DANH SÁCH KHÁC
@app.route('/api/v1/load_organization_dropdown_other',methods=['POST'])
async def load_organization_dropdown_other(request):
    data = request.json
    text = data['text']
    notid = data['danhSachDaSearch']
    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(Organization).filter(and_(or_(Organization.name.like(search),Organization.name.like(searchTitle),Organization.unsigned_name.like(search)),Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id.notin_(["6","7","8"]),Organization.id.notin_(notid),Organization.active == 1)).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)
    else:
        list = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id.notin_(["6","7","8"]),Organization.id.notin_(notid),Organization.active == 1)).all()
        arr = []
        for i in list:
            arr.append(to_dict(i))
        return json(arr)

# // TÌM KIẾM DANH SÁCH CẤP DƯỚI BỘ
@app.route('/api/v1/load_organization_dropdown_all',methods=['POST'])
async def load_organization_dropdown_all(request):
    text = request.json
    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(Organization).filter(and_(or_(Organization.name.like(search),Organization.name.like(searchTitle),Organization.unsigned_name.like(search)),Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id.in_(["6","7","8"]),Organization.active == 1)).all()
        arr = []
        for i in list:
            obj =  to_dict(i)
            arr.append(obj)
        return json(arr)
    else:
        list = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id.in_(["6","7","8"]),Organization.active == 1)).all()
        arr = []
        for i in list:
            obj =  to_dict(i)
            arr.append(obj)
        return json(arr)


apimanager.create_api(MedicalSupplies,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[],GET_MANY=[postprocess_add_stt2]),
    collection_name='medical_supplies')


async def check_date_create_form_ReportSupplyOrganization(request=None, data=None, Model=None, **kw):
    date_request_string = str(datetime.fromtimestamp(request.json['date']))[0:10].replace("-", "/")
    timestamps = db.session.query(ReportSupplyOrganization.date).filter(ReportSupplyOrganization.organization_id == request.json['organization']['id']).all()
    for _ in timestamps:
        date_string = str(datetime.fromtimestamp(_[0]))[0:10].replace("-", "/")
        if date_request_string == date_string:
            return json({
                "error_code": "create Error",
                "error_message": "Bạn đã tạo báo cáo ngày này rồi"
            }, status=520)

#############################################################      BÁO CÁO CƠ SỞ Y TẾ       ##########################################
# ====================> Thêm tên ,đơn vị tính, ngày khởi tạo cho detail 
async def get_info_medical_supplies(request=None, Model=None, result=None ,**kw):
    date_init = db.session.query(func.min(ReportOrganization.date)).filter(ReportOrganization.organization_id == result['organization_id']).all()
    if date_init is not None:
        result['date_init'] = date_init[0][0]
    else:
        result['date_init'] = None
    for _ in result['details']:
        medicalSupplies = db.session.query(MedicalSupplies).filter(MedicalSupplies.id == _['medical_supplies_id']).first()
        _['medical_supplies_name']= to_dict(medicalSupplies)['name']
        _['medical_supplies_unit']= to_dict(medicalSupplies)['unit']
        if date_init is not None:
            medical_supplies_init = db.session.query(ReportOrganizationDetail.begin_net_amount).filter(and_(ReportOrganizationDetail.organization_id == result['organization_id'],ReportOrganizationDetail.medical_supplies_id == _['medical_supplies_id'],ReportOrganizationDetail.date == date_init[0][0])).order_by(ReportOrganizationDetail.date.asc()).first()
            medical_supplies_import_export = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == result['organization_id'],ReportOrganizationDetail.medical_supplies_id == _['medical_supplies_id'],ReportOrganizationDetail.date >= date_init[0][0],ReportOrganizationDetail.date < result['date'])).all()
            if len(medical_supplies_import_export) == 0:
                if medical_supplies_init is not None:
                    _['begin_net_amount'] = medical_supplies_init[0]
                else:
                    _['begin_net_amount'] = 0
            else:
                if medical_supplies_init is not None:
                    _['begin_net_amount'] = medical_supplies_init[0] + medical_supplies_import_export[0][0]
                else:
                    _['begin_net_amount'] = medical_supplies_import_export[0][0]


# ====================> lấy tất cả vật tư và ngày khởi tạo tồn kho 
@app.route('/api/v1/get_all_medical_supplies_and_date_init',methods=['POST'])
async def get_all_medical_supplies_and_date_init(request):  
    data = request.json
    organization_id = data["organization_id"]
    date = data["date"]
    date_string = str(datetime.fromtimestamp(date))[0:10].replace("-", "/")
    conver_date = datetime.strptime(date_string, "%Y/%m/%d")
    date_timestamp = datetime.timestamp(conver_date)
    arr = []
    query_date_init = db.session.query(func.min(ReportOrganization.date)).filter(ReportOrganization.organization_id == organization_id).all()
    if query_date_init is not None:
        date_init = query_date_init[0][0]
    else:
        date_init = None
    medicalSupplies = db.session.query(MedicalSupplies).all()
    for medicalSupplie in medicalSupplies:
        obj = to_dict(medicalSupplie)
        if date_init is not None: 
            medical_supplies_init = db.session.query(ReportOrganizationDetail.begin_net_amount).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(medicalSupplie)['id'],ReportOrganizationDetail.date == date_init)).order_by(ReportOrganizationDetail.date.asc()).first()
            medical_supplies_import_export = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(medicalSupplie)['id'],ReportOrganizationDetail.date >= date_init,ReportOrganizationDetail.date < date_timestamp)).all()
            if len(medical_supplies_import_export) == 0:
                if medical_supplies_init is not None:
                    obj['begin_net_amount'] = medical_supplies_init[0]
                else:
                    obj['begin_net_amount'] = 0
                arr.append(obj)
            else:
                if medical_supplies_init is not None:
                    obj['begin_net_amount'] = medical_supplies_init[0] + medical_supplies_import_export[0][0]
                else:
                    obj['begin_net_amount'] = medical_supplies_import_export[0][0]
                arr.append(obj)
        else:
            obj['begin_net_amount'] = 0
            arr.append(obj)
    return json({"medicalSupplies":arr,"date_init":date_init})

async def del_date_init(request=None, data=None, Model=None, **kw):
        del data['date_init']

# ====================> kiểm tra xem đã tạo báo cáo trong ngày chưa nếu rồi ko cho tạo
async def check_date_create_form_ReportOrganization(request=None, data=None, Model=None, **kw):
    date_init = db.session.query(ReportOrganization.date).filter(ReportOrganization.organization_id == data.get('organization')['id']).order_by(ReportOrganization.date.asc()).first()
    if date_init is not None:
        if data.get('date') < date_init[0]:
            return json({
                    "error_code": "create Error",
                    "error_message": "Bạn không được tạo báo cáo trước ngày khởi tạo tồn kho"
                }, status=520)
    date_request_string = str(datetime.fromtimestamp(request.json['date']))[0:10].replace("-", "/")
    timestamps = db.session.query(ReportOrganization.date).filter(ReportOrganization.organization_id == data.get('organization')['id']).all()
    for _ in timestamps:
        date_string = str(datetime.fromtimestamp(_[0]))[0:10].replace("-", "/")
        if date_request_string == date_string:
            return json({
                "error_code": "create Error",
                "error_message": "Bạn đã tạo báo cáo ngày này rồi"
            }, status=520)


apimanager.create_api(ReportOrganization,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[check_date_create_form_ReportOrganization], PUT_SINGLE=[del_date_init]),
    postprocess=dict(GET_SINGLE=[get_info_medical_supplies],POST=[],PUT_SINGLE=[],GET_MANY=[postprocess_add_stt]),
    collection_name='report_organization')




#############################################################        CHI TIẾT BÁO CÁO CƠ SỞ Y TẾ       ##########################################
#======================>  Chuyển thành số trước khi lưu và xóa trường đã thêm chi tiết báo cáo đơn vị 
async def conver_decimal(request=None, data=None, Model=None, **kw):
        data['begin_net_amount'] = int(data['begin_net_amount'])
        data['quantity_import'] = int(data['quantity_import'])
        data['quantity_export'] = int(data['quantity_export'])
        data['end_net_amount'] = int(data['end_net_amount'])
        data['quantity_original'] = int(data['quantity_original'])
        data['estimates_net_amount'] = int(data['estimates_net_amount'])
        if data.get('medical_supplies_unit') is not None:
            del data['medical_supplies_unit']
            del data['medical_supplies_name']


apimanager.create_api(ReportOrganizationDetail,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[conver_decimal], PUT_SINGLE=[conver_decimal]),
    postprocess=dict(GET_SINGLE=[],POST=[],PUT_SINGLE=[]),
    collection_name='report_organization_detail')

apimanager.create_api(ReportSupplyOrganization,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[check_date_create_form_ReportSupplyOrganization], PUT_SINGLE=[check_medical_supplies_name2]),
    postprocess=dict(GET_SINGLE=[get_name_medical_supplies2],POST=[],PUT_SINGLE=[],GET_MANY=[postprocess_add_stt]),
    collection_name='report_supply_organization')

apimanager.create_api(ReportSupplyOrganizationDetail,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(GET_SINGLE=[],POST=[],PUT_SINGLE=[]),
    collection_name='report_supply_organization_detail')


async def check_date_create_form(request=None, data=None, Model=None, **kw):
    date_request_string = str(datetime.fromtimestamp(request.json['date']))[0:10].replace("-", "/")
    timestamps = db.session.query(SyntheticRelease.date).all()
    for _ in timestamps:
        date_string = str(datetime.fromtimestamp(_[0]))[0:10].replace("-", "/")
        if date_request_string == date_string:
            return json({
                "error_code": "create Error",
                "error_message": "Bạn đã tạo báo cáo ngày này rồi"
            }, status=520)


apimanager.create_api(SyntheticRelease,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[check_date_create_form], PUT_SINGLE=[]),
    postprocess=dict(GET_SINGLE=[],POST=[],PUT_SINGLE=[],GET_MANY=[postprocess_add_stt]),
    collection_name='synthetic_release')

apimanager.create_api(SyntheticReleaseDetail,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(GET_SINGLE=[],POST=[],PUT_SINGLE=[],),
    collection_name='synthetic_release_detail')


    

@app.route('/api/v1/export_excel', methods=["POST"])
async def export_excel(request):
    data = request.json
    list_id = data['data']
    dataFrame = []
    for i in range(len(list_id)):
        arr = []
        arr.append(i)
        arr.append(list_id[i]['organization_name'])
        arr.append(list_id[i]['quantity_import'])
        arr.append(list_id[i]['quantity_export'])
        arr.append(list_id[i]['net_amount'])
        arr.append(list_id[i]['estimates_net_amount'])
        dataFrame.append(arr)
    print ("_____________________",dataFrame)
    df1 = pandas.DataFrame(dataFrame,columns=['STT','Tên đơn vị','Tổng Nhập', 'Tổng sử dụng','Tổng tồn','Tổng dự kiến nhu cầu nhập'])

    df1.to_excel("static/uploads/"+data['filter']+".xlsx",index=False)  
    return json({"message": "/static/uploads/"+data['filter']+".xlsx"})


@app.route('/api/v1/export_excel_cungung', methods=["POST"])
async def export_excel_cungung(request):
    data = request.json
    dataFrame = []
    list_id = data['data']['data']
    arrHead = []
    arrHead.append('')
    arrHead.append(data['data']['medical_supplies_name'])
    arrHead.append(data['data']['avg_price'])
    arrHead.append(data['data']['quantity'])
    arrHead.append(data['data']['sum_price'])
    dataFrame.append(arrHead)

    for i in range(len(list_id)):
        arr = []
        arr.append(i+1)
        arr.append(list_id[i]['organization_name'])
        arr.append(list_id[i]['price'])
        arr.append(list_id[i]['quantity'])
        arr.append(list_id[i]['quantity'] * list_id[i]['price'] )
        dataFrame.append(arr)
    df1 = pandas.DataFrame(dataFrame,columns=['STT','Tên đơn vị','Báo giá(bao gồm VAT)-đồng', 'Số lượng đã và đang ký hợp đồng','Tổng tiền(vnđ)'])

    df1.to_excel("static/uploads/"+data['filter']+".xlsx",index=False)  
    return json({"message": "/static/uploads/"+data['filter']+".xlsx"})


@app.route('/api/v1/link_file_upload', methods=['POST'])
async def link_file_upload(request):
    kituA=["á","à","ạ","ã","ả","â","ấ","ầ","ậ","ẫ","ă","ằ","ắ","ẳ"]
    kituE=["é","è","ẹ","ẻ","ẽ","ê","ế","ề","ệ","ễ","ể"]
    kituI=["í","ì","ị","ỉ","ĩ"]
    kituO=["ò","ó","ọ","ỏ","õ","ô","ồ","ố","ộ","ổ","ỗ","ơ","ờ","ớ","ợ","ở","ỡ"]
    kituU=["ù","ú","ụ","ủ","ũ","ư","ừ","ứ","ự","ử","ữ"]
    kituY=["ỳ","ý","ỵ","ỷ","ỹ"]
    url = app.config['FILE_SERVICE_URL']
    fsroot = app.config['FS_ROOT']
    if request.method == 'POST':
        file = request.files.get('file', None)
        if file :
            rand = ''.join(random.choice(string.digits) for _ in range(15))
            file_name = os.path.splitext(file.name)[0]
            extname = os.path.splitext(file.name)[1]
            newfilename = file_name + "-" + rand + extname
            new_filename = newfilename.replace(" ", "_")
            async with aiofiles.open(fsroot + new_filename, 'wb+') as f:
                await f.write(file.body)
            df = pandas.read_excel(fsroot+new_filename)
            count = df.STT.count()
            i = 0
            arr = []
            while i < count:
                obj = {}
                obj['stt'] = df.STT[i]
                obj['name'] = df.NAME[i]
                obj['unit_name'] = df.UNIT[i]
                ten = df.NAME[i].lower()
                for o in ten:
                    if o in kituA:
                        ten = ten.replace(o,"a")
                    elif o in kituE:
                        ten = ten.replace(o,"e")
                    elif o in kituI:
                        ten = ten.replace(o,"i")
                    elif o in kituO:
                        ten = ten.replace(o,"o")
                    elif o in kituU:
                        ten = ten.replace(o,"u")
                    elif o in kituY:
                        ten = ten.replace(o,"y")
                    elif o=="đ":
                        ten = ten.replace(o,"d")
                obj['name_not_tone_mark'] = str(ten)

                arr.append(obj)
                i += 1
            for _ in arr:
                medicalSupplies = db.session.query(MedicalSupplies).filter(MedicalSupplies.code == str(_['stt'])).first()
                if medicalSupplies is None:
                    medicalSuppliesNew = MedicalSupplies()
                    medicalSuppliesNew.name = _['name']
                    medicalSuppliesNew.code = str(_['stt'])
                    medicalSuppliesNew.unit = _['unit_name']
                    medicalSuppliesNew.name_not_tone_mark = _['name_not_tone_mark']
                    db.session.add(medicalSuppliesNew)
                    db.session.commit()
            return json({'data':"success"})
    return json({
        "error_code": "Upload Error",
        "error_message": "Could not upload file to store"
    }, status=520)

@app.route('/api/v1/load_item_dropdown',methods=['POST'])
async def load_item_dropdown(request):
    data = request.json
    text = data['text']
    organization_id = data['organization_id']
    date = data['date']
    selectedList = data['selectedList']

    if text is not None and text != "":
        search = "%{}%".format(text)
        searchTitle = "%{}%".format(text.title())
        list = db.session.query(MedicalSupplies).filter(and_(or_(MedicalSupplies.name.like(search),MedicalSupplies.name.like(searchTitle),MedicalSupplies.name_not_tone_mark.like(search))),MedicalSupplies.id.notin_(selectedList)).all()
        arr = []
        for i in list:
            obj = to_dict(i)
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(i)['id'],ReportOrganizationDetail.date < date)).all()
            begin_net_amount = 0
            reportOrganizatiobegin_net_amount = db.session.query(ReportOrganizationDetail.begin_net_amount).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(i)['id'])).order_by(ReportOrganizationDetail.date.asc()).first()
            if reportOrganizatiobegin_net_amount is not None:
                begin_net_amount = reportOrganizatiobegin_net_amount[0]
            if len(reportOrganizationDetail)>0:
                obj['begin_net_amount']= reportOrganizationDetail[0][0]+ begin_net_amount
            else:
                obj['begin_net_amount']= 0 + begin_net_amount
            arr.append(obj)
        print ('___text________',len(arr))
        return json(arr)
    else:
        list = db.session.query(MedicalSupplies).filter(MedicalSupplies.id.notin_(selectedList)).all()
        arr = []
        for i in list:
            obj = to_dict(i)
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(i)['id'],ReportOrganizationDetail.date < date)).all()
            begin_net_amount = 0
            reportOrganizatiobegin_net_amount = db.session.query(ReportOrganizationDetail.begin_net_amount).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(i)['id'])).order_by(ReportOrganizationDetail.date.asc()).first()
            if reportOrganizatiobegin_net_amount is not None:
                begin_net_amount = reportOrganizatiobegin_net_amount[0]
            if len(reportOrganizationDetail)>0:
                    obj['begin_net_amount']= reportOrganizationDetail[0][0] + begin_net_amount
            else:
                obj['begin_net_amount']= 0 + begin_net_amount
            arr.append(obj)
        print ('___no text________',len(arr))
        return json(arr)




@app.route("/api/v1/create_report_organization_detail", methods=["POST"])
async def create_itembalances(request):
    data = request.json
    for _ in data:
        new_item = ReportOrganizationDetail()
        new_item.report_organization_id = _['report_organization_id']
        new_item.organization_id = _['organization_id']
        new_item.medical_supplies_id = _['medical_supplies_id']
        new_item.begin_net_amount = _['begin_net_amount']
        new_item.quantity_export = _['quantity_export']
        new_item.quantity_import = _['quantity_import']
        # new_item.end_net_amount = _['end_net_amount']
        new_item.estimates_net_amount = _['estimates_net_amount']
        new_item.date = _['date']
        db.session.add(new_item)
        db.session.commit()
    return json({"message":"create success"})

@app.route('/api/v1/update_report_organization_detail', methods=["POST"])
async def update_itembalances(request):
    data = request.json
    for _ in data:
        old_item = db.session.query(ReportOrganizationDetail).filter(ReportOrganizationDetail.id == _['id']).first()
        old_item.organization_id = _['organization_id']
        old_item.begin_net_amount = _['begin_net_amount']
        old_item.quantity_export = _['quantity_export']
        old_item.quantity_import = _['quantity_import']
        old_item.estimates_net_amount = _['estimates_net_amount']
        old_item.date = _['date']
        db.session.commit()
    return json({"message": "Update Success"})

@app.route('/api/v1/delete_report_organization_detail', methods=["POST"])
async def delete_itembalances(request):
    list_id = request.json
    for _ in list_id:
        item_delete = db.session.query(ReportOrganizationDetail).filter(ReportOrganizationDetail.id == _).first()
        db.session.delete(item_delete)
        db.session.commit()
    return json({"message": "Delete Success"})

@app.route('/api/v1/check_date_begin_new_amount', methods=["POST"])
async def check_date_begin_new_amount(request):
    list_id = request.json
    if list_id is not None: 
        for _ in list_id:
            reportOrganizatiobegin_net_amount = db.session.query(ReportOrganizationDetail).filter(and_(ReportOrganizationDetail.organization_id == _["organization_id"],ReportOrganizationDetail.medical_supplies_id == _['medical_supplies_id'])).order_by(ReportOrganizationDetail.date.asc()).first()
            if reportOrganizatiobegin_net_amount is not None: 
                if int(to_dict(reportOrganizatiobegin_net_amount)['date']) > int(_['date']):
                    return json({"message":"false"})
        return json({"message": "true"})
    return json({"message": "true"})



@app.route("/api/v1/create_report_donvicungung", methods=["POST"])
async def create_report_donvicungung(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    currentUser = db.session.query(User).filter(User.id == uid_current).first()
    if currentUser is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

    data = request.json
    thoigian_bandau = data.get("thoigian_bandau",None)
    thoigian_ketthuc = data.get("thoigian_kethuc", None)
    vattu_id = data.get("vattu_id", None)

    list_donvicungung = db.session.query(Organization).filter(Organization.type_donvi == "donvicungung").all()
    arr = []
    for donvicungung in list_donvicungung:
        vattu = db.session.query(MedicalSupplies).filter(MedicalSupplies.id == vattu_id).first()
        obj = to_dict(vattu)

        reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.organization_id).filter(and_(ReportOrganizationDetail.organization_id == donvicungung.id,ReportOrganizationDetail.medical_supplies_id == to_dict(vattu)['id'],ReportOrganizationDetail.date < date)).all()

        if len(reportOrganizationDetail)>0:
            obj['begin_net_amount']= reportOrganizationDetail[0][0]
        else:
            obj['begin_net_amount']= 0
        arr.append(obj)
    print ('___no text________',len(arr))
    return json(arr)





# # TỔNG HỢP XUẤT KHO VÂT TƯ PHÒNG CHỐNG DỊCH COVID-19 
# # Danh sách đơn vị nhận hàng
# @app.route("/api/v1/list_organization_synthetic_receive", methods=["GET"])
# async def list_organization_synthetic_release(request):
#     arr = [{'XXXX':"cccccccccccccc"}]
#     return json(arr)

# Danh sách đơn vị nhận hàng
@app.route("/api/v1/get_synthetic_receive", methods=["GET"])
async def get_synthetic_receive(request):
    listOrganization = db.session.query(Organization).filter(and_(Organization.type_donvi == "donvinhanuoc",Organization.tuyendonvi_id.in_(["6","7","8"]))).all()
    tuyen6 = {"tuyen":"Sở y tế","stt":"I"}
    tuyen78 = {"tuyen":"Bệnh viện/Viện trực thuộc Bộ y tế","stt":"II"}
    tuyenkhac = {"tuyen":"Các Bộ và cơ quan khác","stt":"III"}
    result = [tuyen6,tuyen78,tuyenkhac]
    arr6 = []
    arr78 = []
    if listOrganization is not None:
        for i in range(len(listOrganization)):
            obj = to_dict(listOrganization[i])
            province = db.session.query(TinhThanh.ten).filter(TinhThanh.id == obj['tinhthanh_id']).first()
            if obj['tuyendonvi_id'] == '6':
                obj["tendonvi"]= province[0]
                arr6.append(obj)
            else:
                obj["tendonvi"]= obj['name']
                arr78.append(obj)
        tuyen6['list'] = arr6
        tuyen78['list'] = arr78
        return json(result)




@app.route("/api/v1/create_report_supply_organization_detail", methods=["POST"])
async def create_report_supply_organization_detail(request):
    data = request.json
    for _ in data:
        new_item = ReportSupplyOrganizationDetail()
        new_item.report_supply_organization_id = _['report_supply_organization_id']
        new_item.organization_id = _['organization_id']
        new_item.medical_supplies_id = _['medical_supplies_id']
        new_item.date = _['date']

        new_item.supply_ability = _['supply_ability']
        new_item.type_sell_sponsor = _['type_sell_sponsor']
        new_item.quantity = _['quantity']
        new_item.price = _['price']
        new_item.health_facilities_id = _['health_facilities_id']

        new_item.file = _.get('file',None)

        db.session.add(new_item)
        db.session.commit()
    return json({"message":"create success"})

@app.route('/api/v1/update_report_supply_organization_detail', methods=["POST"])
async def update_report_supply_organization_detail(request):
    data = request.json
    for _ in data:
        old_item = db.session.query(ReportSupplyOrganizationDetail).filter(ReportSupplyOrganizationDetail.id == _['id']).first()
        old_item.date = _['date']
        old_item.supply_ability = _['supply_ability']
        old_item.type_sell_sponsor = _['type_sell_sponsor']
        old_item.quantity = _['quantity']
        old_item.price = _['price']
        old_item.health_facilities_id = _['health_facilities_id']
        old_item.file =_.get('file',None)
        db.session.commit()
    return json({"message": "Update Success"})

@app.route('/api/v1/delete_report_supply_organization_detail', methods=["POST"])
async def delete_report_supply_organization_detail(request):
    list_id = request.json
    for _ in list_id:
        item_delete = db.session.query(ReportSupplyOrganizationDetail).filter(ReportSupplyOrganizationDetail.id == _).first()
        db.session.delete(item_delete)
        db.session.commit()
    return json({"message": "Delete Success"})


# Thêm vật tư y tế vào danh sách vật tư mà đơn vị ko sử dụng
@app.route('/api/v1/save_check_use_medical_supplies', methods=["POST"])
async def save_check_use_medical_supplies(request):
    data = request.json
    medical_supplies_id = data.get('medical_supplies_id', None)
    organization = db.session.query(Organization).filter(Organization.id == data['organization_id']).first()

    list_unused_medical_supplies = to_dict(organization).get('list_unused_medical_supplies', [])
    print('----list_unused_medical_supplies', list_unused_medical_supplies)
    list_unused_medical_supplies.append(medical_supplies_id)
    print('----list_unused_medical_supplies-2', list_unused_medical_supplies)
    organization.list_unused_medical_supplies = list_unused_medical_supplies
    print('--------organization--------', to_dict(organization))
    db.session.commit()
    return json({"message": "Success"})

@app.route("/api/v1/create_synthetic_release_detail",methods=["POST"])
async def create_synthetic_release_detail(request):
    data = request.json
    for obj in data:
        new_item = SyntheticReleaseDetail()

        new_item.date = obj['date']
        new_item.synthetic_release_id = obj['synthetic_release_id']
        new_item.medical_supplies_id = obj['medical_supplies_id']

        new_item.organization_id = obj['organization_id']
        new_item.date_export= obj['date_export']
        new_item.quantity = obj['quantity']

        db.session.add(new_item)
        db.session.commit()
    return json({"message":"create success"})

@app.route("/api/v1/update_synthetic_release_detail",methods=["POST"])
async def update_synthetic_release_detail(request):
    data = request.json
    for obj in data:
        old_item = db.session.query(SyntheticReleaseDetail).filter(SyntheticReleaseDetail.id == obj['id']).first()
        old_item.date = obj['date']
        old_item.date_export= obj['date_export']
        old_item.quantity = obj['quantity']
        db.session.commit()
    return json({"message":"update success"})

@app.route('/api/v1/delete_synthetic_release_detail', methods=["POST"])
async def delete_synthetic_release_detail(request):
    list_id = request.json
    for _ in list_id:
        item_delete = db.session.query(SyntheticReleaseDetail).filter(SyntheticReleaseDetail.id == _).first()
        db.session.delete(item_delete)
        db.session.commit()
    return json({"message": "Delete Success"})


@app.route('/api/v1/get_detail_SyntheticReleaseDetail', methods=["POST"])
async def get_detail_SyntheticReleaseDetail(request):
    id = request.json
    item = db.session.query(SyntheticReleaseDetail).filter(SyntheticReleaseDetail.synthetic_release_id == id).all()
    arr = []
    for _ in item:
        obj = to_dict(_)
        organization_name = db.session.query(Organization.name,Organization.tuyendonvi_id,Organization.tinhthanh_id).filter(Organization.id == to_dict(_)['organization_id']).first()
        obj['organization_name']= organization_name[0]
        obj['tuyendonvi_id']= organization_name[1]
        if  organization_name[1] == "6":
            tinhthanh = db.session.query(TinhThanh.ten).filter(TinhThanh.id == organization_name[2]).first()
            obj['organization_name']= tinhthanh[0]
        arr.append(obj)
    return json(arr)


@app.route('/api/v1/export_SyntheticRelease', methods=["POST"])
async def export_SyntheticRelease(request):
    data = request.json
    id = data['idx']
    vattu_id = data['vattu_id']
    medicalSupplies = db.session.query(MedicalSupplies.name).filter(MedicalSupplies.id == vattu_id).first()
    item = db.session.query(SyntheticReleaseDetail).filter(and_(SyntheticReleaseDetail.synthetic_release_id == id,SyntheticReleaseDetail.medical_supplies_id == vattu_id)).all()
    arr6 = []
    arr78 = []
    arrkhac = []
    for _ in item:
        obj = to_dict(_)
        organization_name = db.session.query(Organization.name,Organization.tuyendonvi_id,Organization.tinhthanh_id).filter(Organization.id == to_dict(_)['organization_id']).first()
        obj['organization_name']= organization_name[0]
        obj['tuyendonvi_id']= organization_name[1]
        if  organization_name[1] == "6":
            tinhthanh = db.session.query(TinhThanh.ten).filter(TinhThanh.id == organization_name[2]).first()
            obj['organization_name']= tinhthanh[0]
            arr6.append(obj)
        elif  organization_name[1] == "7" or organization_name[1] == "8" :
            arr78.append(obj)
        else:
            arrkhac.append(obj)
    sum6 = 0
    sum78 = 0
    sumkhac = 0
    sumtong = 0
    for a6 in arr6:
        sum6 = sum6 +a6['quantity']
    for a78 in arr78:
        sum78 = sum78 +a78['quantity']
    for akhac in arrkhac:
        sumkhac = sumkhac +akhac['quantity']
    sumtong = sum6 +sum78 + sumkhac
    dataFrame = []
    mang = []
    mang.append('')
    mang.append('Tổng cộng xuất')
    mang.append('')
    mang.append(int(sumtong))
    dataFrame.append(mang)


    mang = []
    mang.append('')
    mang.append('Sở y tế')
    mang.append('')
    mang.append(int(sum6))
    dataFrame.append(mang)

    if len(arr6) >0:
        for i in range(len(arr6)):
            mang = []
            mang.append(i+1)
            mang.append(arr6[i]['organization_name'])
            mang.append(str(datetime.fromtimestamp(arr6[i]['date_export']))[0:10].replace("-", "/"))
            mang.append(int(arr6[i]['quantity']))
            dataFrame.append(mang)

    mang = []
    mang.append('')
    mang.append('Bệnh viện/Viện trực thuộc Bộ Y tế')
    mang.append('')
    mang.append(int(sum78))
    dataFrame.append(mang)

    if len(arr78) >0:
        for i in range(len(arr78)):
            mang = []
            mang.append(i+1)
            mang.append(arr78[i]['organization_name'])
            mang.append(str(datetime.fromtimestamp(arr78[i]['date_export']))[0:10].replace("-", "/"))
            mang.append(int(arr78[i]['quantity']))
            dataFrame.append(mang)
   
    mang = []
    mang.append('')
    mang.append('Các Bộ và cơ quan khác')
    mang.append('')
    mang.append(int(sumkhac))
    dataFrame.append(mang)

    if len(arrkhac) >0:
        for i in range(len(arrkhac)):
            mang = []
            mang.append(i+1)
            mang.append(arrkhac[i]['organization_name'])
            mang.append(str(datetime.fromtimestamp(arrkhac[i]['date_export']))[0:10].replace("-", "/"))
            mang.append(int(arrkhac[i]['quantity']))
            dataFrame.append(mang)
    df1 = pandas.DataFrame(dataFrame,columns=['STT','Tên đơn vị','Thời gian xuất cấp', medicalSupplies[0]])
    strig = medicalSupplies[0].replace('%','phần trăm')
    df1.to_excel("static/uploads/xuất kho tổng hợp vật tư "+strig+".xlsx",index=False)  
    return json({"message": "/static/uploads/xuất kho tổng hợp vật tư "+strig+".xlsx"})