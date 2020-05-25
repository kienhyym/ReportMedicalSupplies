import string, time
import random
import uuid
import base64, re
import binascii
import aiohttp
import ujson
import hashlib

from math import floor


from gatco.response import json, text, html
from application.extensions import apimanager
from application.models.models import  NotifyUser, Notify, User
from application.database import db, redisdb
from application.server import app
from sqlalchemy import or_, and_, desc, asc
from gatco_restapi.helpers import to_dict

from application.controllers.helpers.helper_notify import send_notify_single,\
    send_firebase_notify

# from application.controllers.helpers.helper_common import current_uid

from application.models.models import User, Organization, Ticket
from application.controllers.helpers.helper_common import *


async def apply_user_filter(request=None, search_params=None, **kw):
    uid_current = current_uid(request)
    if uid_current is not None:
        list_user_notify = db.session.query(NotifyUser).filter(NotifyUser.user_id == uid_current).order_by(desc(NotifyUser.updated_at)).limit(100)
        if list_user_notify is None or list_user_notify:
            return json({"objects":[]})
        arr_uid = []
        for uid in list_user_notify:
            arr_uid.append(uid)
        
        search_params["filters"] = {"id": {"$in": arr_uid}}
    else:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)

@app.route('/api/v1/notify/read', methods=['POST', 'GET'])
async def read_notify(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        arrNotify = []
        notify_user = db.session.query(NotifyUser).\
        filter(NotifyUser.user_id == uid_current).order_by(desc(NotifyUser.updated_at)).limit(300)
        if notify_user is not None:
            for nf in notify_user:
                notify = to_dict(nf.notify)
                notify["read_at"] = nf.read_at
                arrNotify.append(notify)
                if nf.read_at is None:
                    nf.read_at = floor(time.time())
        db.session.commit()
        return json({"objects": arrNotify})

@app.route('/api/v1/notify/check', methods=['GET'])
async def check_notify(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        count = 0
        notify_user = db.session.query(NotifyUser).\
        filter(and_(NotifyUser.user_id == uid_current, NotifyUser.read_at == None)).count()
        if notify_user is not None:
            count = notify_user
        check_all =db.session.query(NotifyUser, Notify).filter(and_(NotifyUser.user_id == uid_current, NotifyUser.notify_id == Notify.id)).\
            filter(NotifyUser.read_at.is_(None)).order_by(desc(NotifyUser.updated_at)).all()
        check_video = None
        check_new = None
        noti_user = None

        for item, notify in check_all:
            if notify.type == "call_video":
                check_video = notify
                noti_user = item
                break
            else:
                if (check_new is None):
                    check_new = to_dict(notify)
                    noti_user = item
        if check_video is not None:
            check_new = to_dict(check_video)

        if noti_user is not None and noti_user.read_at is None:
            notify_info = db.session.query(NotifyUser).filter(NotifyUser.id ==noti_user.id).first()
            if notify_info is not None:
                notify_info.read_at = floor(time.time())
                db.session.commit()
    return json({"error_message": "successful", "data": count, "notify": to_dict(check_new)})



apimanager.create_api(Notify, max_results_per_page=1000000,
                         methods=['GET', 'POST', 'DELETE', 'PUT'],
                         url_prefix='/api/v1',
                         preprocess=dict(GET_SINGLE=[], GET_MANY=[], POST=[], PUT_SINGLE=[]),
                         postprocess=dict(POST=[]),
                         collection_name='notify')

apimanager.create_api(NotifyUser, max_results_per_page=1000000,
                         methods=['GET', 'POST', 'DELETE', 'PUT'],
                         url_prefix='/api/v1',
                         preprocess=dict(GET_SINGLE=[], GET_MANY=[apply_user_filter], POST=[], PUT_SINGLE=[]),
                         postprocess=dict(POST=[]),
                         collection_name='notify_user')




@app.route('/api/v1/video/sendnotify', methods=['POST'])
async def send_notify_callvideo(request):
    data = request.json
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        current_user = db.session.query(User).filter(User.id == uid_current).first()
        roomName = data.get("room", None)
        organization_id = data.get("organization_id",None)
        check_organization = db.session.query(Organization).filter(Organization.id == organization_id).first()

        if check_organization is None:
            return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin đơn vị"}, status=520)
        else:
            
            
            sender_name = str(current_user.name)
            room_title = sender_name
            address = current_user.Organization.address
            if(address is not None):
                address = '\n Địa chỉ: ' + str(address)
            else:
                address  = ''
            if current_user.has_role("admin_tyt") or current_user.has_role("canbo_tyt") or current_user.has_role("admin_benhvien") or current_user.has_role("canbo_benhvien"):
                orga = current_user.Organization
                if(orga is None):
                    sender_name = sender_name  + address
                    room_title = sender_name
                else:
                    room_title = str(orga.name) + " - " + check_organization.name
                    sender_name = str(orga.name) + '( '+ sender_name + ' )' + address
                    # room_title = str(orga.name) + ' ( '+ sender_name + ' ) ' 
            try:
                url_notify = app.config.get("DOMAIN_URL") + "#video/model?room="+roomName+'&room_title='+room_title
                print("url", url_notify)
                for user in check_organization.users:
                    content = "Bạn nhận được một yêu cầu kết nối cuộc gọi video từ "+sender_name
                    await send_notify_single(str(user.id), "Kết nối cuộc gọi video",content, "call_video" ,url_notify, {"action":"call_video", "url":url_notify})
            except Exception as error:
                print(error)
                pass
    return json({})


@app.route('/api/v1/send_notify', methods=['POST'])
async def send_notify(request):
    data = request.json
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    else:
        current_user = db.session.query(User).filter(User.id == uid_current).first()
        content = data.get("content", "")
        id_ticket = data.get("id_ticket", None)
        url_notify = app.config.get("DOMAIN_URL") + "#ticket/detail?id="+id_ticket

        if id_ticket is None:
            return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin phiếu yêu cầu"}, status=520)
        
        check_ticket = db.session.query(Ticket).filter(Ticket.id == id_ticket).first()
        if check_ticket is None:
            return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin phiếu yêu cầu"}, status=520)
        current_time = floor(time.time())
        if current_user.has_role("admin_tyt") or current_user.has_role("canbo_tyt"):
            content_tramyte = current_user.Organization.name + " đã gửi tin nhắn cho bạn \n Nội dung: " + content 

            await send_notify_single(check_ticket.creator_id, "Tin nhắn",content_tramyte, "text" ,url_notify, {"action":"send_message", "url":url_notify})
            return json({"error_messsage": "successfullh"},status=200)

        elif current_user.has_role("nguoidan"):
            content_nguoidan = current_user.name + " đã gửi tin nhắn cho bạn. \n Nội dung:" + content 
            
            id_donvi = check_ticket.approved_by_organization_id_level1
            if id_donvi is None:
                return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin trạm y tế"}, status=520)
            list_user = db.session.query(User).filter(User.organization_id == id_donvi).all()
            
            if list_user is None or len(list_user) == 0:
                return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin trạm y tế"}, status=520)
            else:
                for user in list_user:
                    await send_notify_single(user.id, "Tin nhắn",content_nguoidan, "text" ,url_notify, {"action":"send_message", "url":url_notify})
                return json({"error_messsage": "successfull"},status=200)
        elif current_user.has_role("admin_benhvien") or current_user.has_role("canbo_benhvien"):
            content_benhvien = current_user.name + "-" + current_user.Organization.name + " đã gửi tin nhắn cho bạn. \n Nội dung:" + content 

            id_donvi = check_ticket.approved_by_organization_id_level1
            if id_donvi is None:
                return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin trạm y tế"}, status=520)
            list_user = db.session.query(User).filter(User.organization_id == id_donvi).all()
            
            if list_user is None or len(list_user) == 0:
                return json({"error_code":"PARAMS_ERROR","error_message":"Không tìm thấy thông tin trạm y tế"}, status=520)
            else:
                for user in list_user:
                    await send_notify_single(user.id, "Tin nhắn",content_benhvien, "text" ,url_notify, {"action":"send_message", "url":url_notify})
                return json({"error_messsage": "successfull"},status=200)


        return json({"error_code":"PARAMS_ERROR","error_messsage": "Lỗi hệ thống.Vui lòng gửi lại sau."},status=520)
        # sender_name = str(current_user.name)
        # room_title = sender_name
        # if current_user.has_role("admin_tyt") or current_user.has_role("canbo_tyt") or current_user.has_role("admin_benhvien") or current_user.has_role("canbo_benhvien"):
        #     sender_name = '<span>' + str(current_user.Organization.name) + '</span>( '+ sender_name + ' )' + '<br> Địa chỉ: ' + str(current_user.Organization.address)
        #     room_title = str(current_user.Organization.name) + ' ( '+ sender_name + ' )'

        # url_notify = app.config.get("DOMAIN_URL") + "#video/model?room="+roomName+'&room_title='+room_title
        # for user in check_organization.users:

        #     content = "Bạn nhận được một yêu cầu kết nối cuộc gọi video từ "+sender_name
        #     await send_notify_single(str(user.id), "Kết nối cuộc gọi video",content, "text" ,url_notify, {"action":"call_video", "url":url_notify})




@app.route('/api/v1/set_notify_token', methods=['POST'])
async def set_notify_token(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({
            "error_code": "USER_NOT_LOGIN",
            "error_message": None
        }, status=520)

    data = request.json
    token = data.get("data", None)
    type_notify = data.get("type_notify", None)
    print("type_notify====",type_notify)
    if(type_notify is not None and type_notify == "web"):
        redisdb.set("notify_token_web:" + str(uid_current), token)
    else:
        redisdb.set("notify_token:" + str(uid_current), token)
    return json({})


@app.route('/api/v1/test_notify', methods=['POST'])
async def test_notify(request):
    # uid_current = current_uid(request)
    # if uid_current is None:
    #     return json({
    #         "error_code": "USER_NOT_LOGIN",
    #         "error_message": None
    #     }, status=520)
 
    data = request.json
    uid_current = data.get("uid",None)
    firebase_token = redisdb.get("notify_token:" + str(uid_current))
    if firebase_token is not None:
        firebase_token = firebase_token.decode('utf8')


        await send_firebase_notify([firebase_token], data.get("content", ""), data)

        return json({})
    else:
        return json({"error_code": "KEY_NOT_SET", "error_message": ""}, status=520)

