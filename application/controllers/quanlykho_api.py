
from application.extensions import apimanager
from gatco_restapi.helpers import to_dict
from application.server import app
from sqlalchemy import or_
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



apimanager.create_api(MedicalSupplies,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='medical_supplies')

apimanager.create_api(ReportOrganization,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='report_organization')

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