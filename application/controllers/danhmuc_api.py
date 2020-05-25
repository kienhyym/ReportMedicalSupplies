
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

from application.models.model_danhmuc import QuocGia, TinhThanh, QuanHuyen, XaPhuong, ThonXom,\
     TuyenDonVi,DanToc
from application.controllers.helpers.helper_common import validate_user, convert_text_khongdau
from application.database import db

async def check_exist_danhmuc(request=None, data=None, Model=None, **kw):
    if data is not None and "ma" in data and data["ma"] is not None and isxaphuong == True:
        record = db.session.query(Model).filter(Model.ma == data['ma']).first()
        if record is not None:
            data['id'] = record.id
            return json(to_dict(record))

async def update_name_khongdau(request=None, data=None, Model=None, **kw):
    if "ten" in data:
        data["tenkhongdau"]  = convert_text_khongdau(data["ten"])
    elif "name" in data:
        data["tenkhongdau"]  = convert_text_khongdau(data["name"])
    


apimanager.create_api(QuocGia,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc,update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='quocgia')


apimanager.create_api(TinhThanh,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc, update_name_khongdau], PUT_SINGLE=[validate_user, update_name_khongdau]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='tinhthanh')


apimanager.create_api(QuanHuyen,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user,check_exist_danhmuc,update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='quanhuyen')



apimanager.create_api(XaPhuong,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc,update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='xaphuong')



apimanager.create_api(ThonXom,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc,update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau]),
    collection_name='thonxom')



# apimanager.create_api(TuyenDonVi,
#     methods=['GET', 'POST', 'DELETE', 'PUT'],
#     url_prefix='/api/v1',
#     preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc,update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau]),
#     postprocess=dict(POST=[],PUT_SINGLE=[]),
#     collection_name='tuyendonvi')


apimanager.create_api(DanToc,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_user, check_exist_danhmuc,update_name_khongdau], PUT_SINGLE=[validate_user,update_name_khongdau]),
    postprocess=dict(POST=[],PUT_SINGLE=[]),
    collection_name='dantoc')


    