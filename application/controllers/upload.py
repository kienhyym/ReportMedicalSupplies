import os
import random
import string

from gatco.response import json
# from gatco import Blueprint
from application.server import app
from application.database import db, redisdb
from gatco.response import json, text, html
from gatco_restapi.helpers import to_dict


import aiofiles
import hashlib
from application.models.model_file import FileInfo
from application.controllers.helpers.helper_common import current_uid
# from application.controllers.helpers.MinIOConnector import uploadFromData

import uuid


# imageupload = Blueprint('image', url_prefix='/image')
# 
# @imageupload.route('/')
# async def bp_root(request):
#     return json({'image': 'blueprint'})


@app.route('/image/upload', methods=['POST'])
async def imgupload(request):
    ret = None
    url = app.config['IMAGE_SERVICE_URL']
    fsroot = app.config['FS_ROOT']
#     uid_current = current_uid(request)
#     if uid_current is None:
#         return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    if request.method == 'POST':
        file_data = request.files.get('image', None)
        if file_data :
            response = await write_file(file_data,None, None,"system")
            return response
    return json(ret)


@app.route('/api/v1/upload', methods=['POST'])
async def upload_file(request):
    ret = None
    
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    if request.method == 'POST':
        # try:
        fileId = request.headers.get("fileId",None)
        file_data = request.files.get('file', None)
        attrs = request.form.get('attrs',None)
        print(attrs)
        if file_data :
            response = await write_file(file_data,fileId, attrs,uid_current)
            return response
        # except Exception as e:
        #     raise e
    return json({
        "error_code": "Upload Error",
        "error_message": "Could not upload file to store"
    }, status=520)


async def write_file(file, fileId, attrs, uid_current):
    url = app.config['FILE_SERVICE_URL']
    fsroot = app.config['FS_ROOT_FILE']
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

    # f = file.body.open('rb')
    # if f.multiple_chunks():
    #     for chunk in f.chunks():
    #         sha256.update(chunk)
    # else:    
    #         sha256.update(f.read())
    # f.close()
    sha256.update(file_data)
    # file_buffer = file_data.read(BLOCKSIZE)
    # while len(file_buffer) > 0:
    #     sha256.update(file_buffer)
    #     file_buffer = file_data.read(BLOCKSIZE)
            
    str_sha256 = sha256.hexdigest()   
    check_exist = db.session.query(FileInfo).filter(FileInfo.sha256 == str_sha256).first()
    if check_exist is not None:
        return json(to_dict(check_exist))
    
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
    fileInfo.link = str(url)  + "/" + str(str_sha256) + str(extname)
    fileInfo.attrs = attrs
    fileInfo.size = data_length
    fileInfo.kind = "normal"
    db.session.add(fileInfo)
    db.session.commit()
    return json(to_dict(fileInfo), status=200)



@app.route('/api/v1/upload/file', methods=['POST'])
async def upload_file(request):
    url = app.config['FILE_SERVICE_URL']
    fsroot = app.config['FS_ROOT']
    print ('____________fsroot________________',fsroot)
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
            return json({
                    "error_code": "OK",
                    "error_message": "successful",
                    "id":rand,
                    "link":url  + "/" + new_filename,
                    "filename":newfilename,
                    "filename_organization":file_name,
                    "extname":extname
                }, status=200)
    
    return json({
        "error_code": "Upload Error",
        "error_message": "Could not upload file to store"
    }, status=520)