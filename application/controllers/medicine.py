# import asyncio
import aiohttp
import hashlib
import ujson
import aiofiles
import hashlib
import os
import random
import string
import xlrd
from application.server import app
import time
from math import floor
from application.extensions import apimanager
from application.server import app
from application.database import db
from gatco.response import json, text, html
from application.database import redisdb,db 
from application.controllers.helpers.helper_common import *
from sqlalchemy import or_, and_, desc, asc
import uuid
from application.database.model import default_uuid
from application.models.models import Medicine, Prescription, Ticket
from application.models.model_file import FileInfo
from application.controllers.helpers.helper_notify import send_notify_single
from sqlalchemy.orm.attributes import flag_modified
# async def postprocess_medicine(request=None, Model=None, result=None, **kw):
#     print("result========", result)
#     ticket = db.session.query(Ticket).filter(Ticket.id == result["ticket_id"]).first()
#     if ticket is not None:
#         ticket.donthuoc_id = result["id"]
#         ticket.status = 
#         db.session.commit()
#         print("ticket===================", to_dict(ticket))

async def preprocess_prescription(request=None, data=None, Model=None, **kw):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
   
    current_user = db.session.query(User).filter(User.id == uid_current).first()
    if current_user is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520)

    ticket = db.session.query(Ticket).filter(Ticket.id == data["ticket_id"]).first()
    if ticket is not None:
        prescription =  Prescription()
        prescription.id = default_uuid()
        prescription.ticket_id = ticket.id
        prescription.ma_bhyt = data["ma_bhyt"]
        prescription.thuoc = data["thuoc"]
        prescription.thoigiankedon = floor(time.time())

        nguoikedon = {}
        nguoikedon["user_id"] = str(uid_current)
        nguoikedon["user_name"] = current_user.name
        nguoikedon["updated_at"] = floor(time.time())
        prescription.nguoikedon = []
        prescription.nguoikedon.append(nguoikedon)

        db.session.add(prescription)
        # flag_modified(record, "approved")
        ticket.donthuoc_id = prescription.id
        
        ticket.confirm_prescriber_userid = uid_current
        ticket.confirm_prescriber_username = current_user.name
        ticket.confirm_prescriber_at = floor(time.time())
        ticket.status = 3
        db.session.commit()
        url_notify = app.config.get("DOMAIN_URL") + "#ticket/detail?id="+ticket.id
        content_tramyte = current_user.Organization.name + " đã chấp nhận kê đơn thuốc cho  "+ticket.patient_name+" vào lúc "+ convert_timestamp_to_string(ticket.confirm_prescriber_at,"%d/%m/%Y, %H:%M")+". Vui lòng chờ quá trình chuyển phát thuốc"
        if ticket.approved_note_level1 is not None and ticket.approved_note_level1 != "":
            content_tramyte = current_user.Organization.name + " đã chấp nhận kê đơn thuốc cho  "+ticket.patient_name+" vào lúc "+ convert_timestamp_to_string(ticket.confirm_prescriber_at,"%d/%m/%Y, %H:%M")+". Vui lòng chờ quá trình chuyển phát thuốc \n Ghi chú: " + ticket.approved_note_level1 
        await send_notify_single(ticket.creator_id, "Xác nhận đã được kê đơn",content_tramyte, "text" ,url_notify, {"action":"ticket_prescriber", "url":url_notify})

        db.session.commit()
        return json(to_dict(prescription), status=200)
    else:
        return json({"error_code": "PARAM_ERROR", "error_message": "Không thể tìm thấy phiếu yêu cầu."}, status=520)

async def preprocess_prescription_update(request=None, data=None, Model=None, **kw):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
   
    current_user = db.session.query(User).filter(User.id == uid_current).first()
    if current_user is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"},status=520)

    prescription = db.session.query(Prescription).filter(Prescription.id == data["id"]).first()
    if prescription is not None:
        list_nguoikedon = prescription.nguoikedon
        if list_nguoikedon is None:
            list_nguoikedon = [] 
        nguoikedon = {}
        nguoikedon["user_id"] = str(uid_current)
        nguoikedon["user_name"] = current_user.name
        nguoikedon["updated_at"] = floor(time.time())
        
        list_nguoikedon.append(nguoikedon)
        prescription.nguoikedon = list_nguoikedon
        prescription.thuoc = data["thuoc"]
        flag_modified(prescription, "nguoikedon")
        db.session.commit()
        return json(to_dict(prescription), status=200)

apimanager.create_api(Medicine,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_admin], GET_MANY=[validate_admin], POST=[validate_admin], PUT_SINGLE=[validate_admin]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    collection_name='medicine')

apimanager.create_api(Prescription,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, preprocess_prescription], PUT_SINGLE=[validate_user, preprocess_prescription_update]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
    collection_name='prescription')


@app.route('/api/v1/medicine/import', methods=['POST'])
async def import_excel_medicine(request):
    # data = request.json
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    fileId = request.headers.get("fileId",None)
    file_data = request.files.get('file', None)
    attrs = request.form.get('attrs',None)
    if file_data :
        response = await write_file_excel_thuoc(file_data,fileId, attrs,uid_current)
        print("respone",response)
        return response

    return json({"error_code": "UPLOAD_ERROR", "error_message": "Không thể tải file lên hệ thống"}, status=520)

async def write_file_excel_thuoc(file, fileId, attrs, uid_current):
    # url = app.config['FS_ROOT_THUOC']
    fsroot = app.config['FS_ROOT_THUOC']
    print("fsroot", fsroot)
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
    fileInfo.kind = "filethuoc"
    db.session.add(fileInfo)
    db.session.commit()

    #load and save to model Medicine

    url_file_thuoc = fsroot + str_sha256 + extname

    wb = xlrd.open_workbook(url_file_thuoc) 
    sheet = wb.sheet_by_index(0) 
    sheet.cell_value(0, 0) 
    count =0
    for i in range(sheet.nrows):
        if i == 0:
            continue
        ten = str(sheet.cell_value(i,1)).strip()
        mathuoc = str(sheet.cell_value(i,2)).strip()
        check_medicine = db.session.query(Medicine).filter(Medicine.mathuoc == mathuoc).first()
        if check_medicine is not None:
            continue

        giatien = convert_columexcel_to_string(sheet.cell_value(i,3)).strip()
        lieuluong = str(sheet.cell_value(i,4)).strip()
        hamluong = str(sheet.cell_value(i,5)).strip()
        donvitinh = str(sheet.cell_value(i,7)).strip()
        hdsd = str(sheet.cell_value(i,6)).strip()
        medicine = Medicine()
        medicine.id = default_uuid()
        medicine.ten = ten
        medicine.mathuoc = mathuoc
        medicine.giatien = giatien
        medicine.lieudung = lieuluong
        medicine.hamluong = hamluong
        medicine.donvitinh = donvitinh
        medicine.huongdansudung = hdsd
        db.session.add(medicine)
        db.session.commit()
        print("ten=====" +  ten + ";mathuoc==" + mathuoc + ";giatien===" + giatien + ";lieuluong" + lieuluong + ";hamluong==" + hamluong + ";donvitinh===" + donvitinh + ";hssd===" + hdsd) 
        # print("/mathuoc====", mathuoc)
    print("fileInfo_thuoc", to_dict(fileInfo))
    return json(to_dict(fileInfo), status=200)

def convert_columexcel_to_string(value):
    # print("value", value)
    if isinstance(value,str):
        return value.strip()
    if isinstance(value, float):
        return str(int(value)).strip()
    if isinstance(value,int):
        return str(value).strip()