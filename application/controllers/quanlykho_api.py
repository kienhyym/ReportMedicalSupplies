
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
from application.controllers.helpers.helper_common import validate_user, convert_text_khongdau
from application.database import db
import pandas


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


apimanager.create_api(MedicalSupplies,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
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
                print ('________________________',_)
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
    text = request.json
    if text is not None and text != "":
        keySearch = text
        search = "%{}%".format(keySearch)
        tex_capitalize = keySearch.capitalize()
        search_capitalize = "%{}%".format(tex_capitalize)
        list = db.session.query(MedicalSupplies).filter(or_(MedicalSupplies.name.like(search),MedicalSupplies.name.like(search_capitalize)))
        arr = []
        for i in list:
            obj = to_dict(i)
            arr.append(obj)
        return json(arr)
    else:
        result = []
        return json(result)




@app.route("/api/v1/create_report_organization_detail", methods=["POST"])
async def create_itembalances(request):
    data = request.json
    for _ in data:
        new_item = ReportOrganizationDetail()

        new_item.report_organization_id = _['report_organization_id']
        new_item.organization_id = _['organization_id']
        new_item.medical_supplies_id = _['medical_supplies_id']
        new_item.quantity_export = _['quantity_export']
        new_item.quantity_import = _['quantity_import']
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