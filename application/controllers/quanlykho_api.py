
from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from sqlalchemy import or_, and_, func

from gatco.response import json
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


from application.models.model_quanlykho import *
from application.models.models import Organization, User

from application.controllers.helpers.helper_common import validate_user, convert_text_khongdau
from application.database import db
import pandas


async def postprocess_add_stt(request=None, Model=None, result=None, **kw):
    if result is not None and "objects" in result:
        objects = to_dict(result["objects"])
        data = []
        i =1
        page = request.args.get("page",None)
        results_per_page = request.args.get("results_per_page",None)
        if page is not None and results_per_page is not None and int(page) != 1:
            i = i + int(results_per_page)*int(page)
        for obj in objects:
            if obj is not None:
                obj_tmp = to_dict(obj)
                obj_tmp["stt"] = i
                i = i +1
                data.append(obj_tmp)
        result = data

async def check_dict_like(request=None, data=None, Model=None, **kw):
        del data['organization']

async def get_name_medical_supplies(request=None, Model=None, result=None ,**kw):
        for _ in result['details']:
            medicalSupplies = db.session.query(MedicalSupplies).filter(MedicalSupplies.id == _['medical_supplies_id']).first()
            _['medical_supplies_name']= to_dict(medicalSupplies)['name']
            _['medical_supplies_unit']= to_dict(medicalSupplies)['unit']
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == result["organization_id"],ReportOrganizationDetail.medical_supplies_id == _['medical_supplies_id'],ReportOrganizationDetail.date < _['date'])).all()
            if len(reportOrganizationDetail)>0:
                _['begin_net_amount']= reportOrganizationDetail[0][0]
            else:
                _['begin_net_amount']= 0


async def check_medical_supplies_name(request=None, data=None, Model=None, **kw):
        for _ in data['details']:
            del _['medical_supplies_name']
            del _['medical_supplies_unit']
            del _['begin_net_amount']


@app.route('/api/v1/load_item_dropdown_statistical',methods=['POST'])
async def load_item_dropdown_statistical(request):
    data = request.json
    arr = []
    if data is not None and data != "":
        search = "%{}%".format(data)
        searchTitle = "%{}%".format(data.title())
        list = db.session.query(MedicalSupplies).filter(or_(MedicalSupplies.name.like(search),MedicalSupplies.name.like(searchTitle),MedicalSupplies.name_not_tone_mark.like(search))).all()
        for i in list:
            arr.append(to_dict(i))
        return json(arr)
    else:
        list = db.session.query(MedicalSupplies).all()
        for _ in list:
            arr.append(to_dict(_))
        return json(arr)

apimanager.create_api(MedicalSupplies,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[],GET_MANY=[postprocess_add_stt]),
    collection_name='medical_supplies')


apimanager.create_api(ReportOrganization,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[check_dict_like], PUT_SINGLE=[check_medical_supplies_name]),
    postprocess=dict(GET_SINGLE=[get_name_medical_supplies],POST=[],PUT_SINGLE=[],),
    collection_name='report_organization')

apimanager.create_api(ReportOrganizationDetail,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[check_dict_like], PUT_SINGLE=[]),
    postprocess=dict(GET_SINGLE=[get_name_medical_supplies],POST=[],PUT_SINGLE=[],),
    collection_name='report_organization_detail')

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
            df = pandas.read_excel("static/uploads/"+new_filename)
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
            if len(reportOrganizationDetail)>0:
                obj['begin_net_amount']= reportOrganizationDetail[0][0]
            else:
                obj['begin_net_amount']= 0
            arr.append(obj)
        print ('___text________',len(arr))
        return json(arr)
    else:
        list = db.session.query(MedicalSupplies).filter(MedicalSupplies.id.notin_(selectedList)).all()
        arr = []
        for i in list:
            obj = to_dict(i)
            reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import)-func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == organization_id,ReportOrganizationDetail.medical_supplies_id == to_dict(i)['id'],ReportOrganizationDetail.date < date)).all()
            if len(reportOrganizationDetail)>0:
                obj['begin_net_amount']= reportOrganizationDetail[0][0]
            else:
                obj['begin_net_amount']= 0
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
        # new_item.begin_net_amount = _['begin_net_amount']
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
    # organization_id = currentUser.organization_id


@app.route('/api/v1/organizational_list_statistics',methods=['POST'])
async def organizational_list_statistics(request):
    data = request.json

    type_donvi = data['type_donvi']
    medical_supplies_id = data['medical_supplies_id']
    start_time = data['start_time']
    end_time = data['end_time']
    organizations = db.session.query(Organization).filter(Organization.type_donvi == "donvinhanuoc").all()
    for organization in organizations:
        print("organization", to_dict(organization))
        obj = {}
        # obj['organization_name'] = arr_organization_id.append(to_dict(organization)['name'])
        reportOrganizationDetail = db.session.query(func.sum(ReportOrganizationDetail.quantity_import),func.sum(ReportOrganizationDetail.quantity_export)).group_by(ReportOrganizationDetail.medical_supplies_id).filter(and_(ReportOrganizationDetail.organization_id == to_dict(organization)['id'],ReportOrganizationDetail.medical_supplies_id == medical_supplies_id,ReportOrganizationDetail.date >= start_time,ReportOrganizationDetail.date <= end_time)).all()
        print ('___reportOrganizationDetail_______',reportOrganizationDetail)
        return json([])