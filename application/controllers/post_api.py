# import asyncio
import aiohttp
import hashlib
import ujson


from application.server import app

from application.extensions import apimanager
from application.server import app
from application.database import db
from gatco.response import json, text, html
from application.database import redisdb,db 
from application.controllers.helpers.helper_common import *
from sqlalchemy import or_, and_, desc, asc
import uuid
import time
from application.database.model import default_uuid
from application.models.models import Category,Post


# validate role admin,manager,editor
# async def validate_admin_manager_editor(request, **kw):

    # role_admin = await hasRole(request,"admin")
    # role_manager = await hasRole(request,"manager")
    # role_editor = await hasRole(request,"editor")
    # if not(role_admin is True or role_manager is True or role_editor is True): 
    #     return {'error_code':'SESSION_EXPIRED', 'error_message':'Session Expired!'}


@app.route('/api/v1/post/changestatus', methods=['POST'])
async def change_status_post(request):
    uid_current = current_uid(request)
    if uid_current is None:
        return json({"error_code": "SESSION_EXPIRED", "error_message": "Hết phiên làm việc, vui lòng đăng nhập lại"}, status=520)
    
    print("uid_current>>>>>>>>>>",uid_current)

    # role_manager = await hasRole(request,"manager")
    role_admin = await hasRole(request,"admin")
    if role_admin is True :
        params = request.json
        id_post = params.get("post_id",None)
        status = params.get("status",None)
        post = db.session.query(Post).filter(Post.id == id_post).first()
        if post is None:
            return json({"error_code":"PARAM_ERROR","error_message":"Tham số không hợp lệ"},status=520)
        
        hasChange = params.get("change",False)
        data = params["data"]
        if hasChange is False:
            post.status = status
            post.updated_by = params.get("id_canbo",None)
            post.approvedby = params.get("id_canbo",None)
            post.approvedtime = int(time.time())

            db.session.commit()
            return json({"error_code":"OK","error_message":"successful", "data":to_dict(post)},status=200)
        elif hasChange is True:
            post.status = status
            post.category_id = data.get("category_id",None)
            post.title = data.get("title",None)
            post.description = data.get("description",None)
            post.content = data.get("content",None)
            post.image = data.get("image",None)
            post.type_show = data.get("type_show",None)
            post.tags_age = data.get("tags_age",None)
            post.show = data.get("show",1)
            post.approvedby = params.get("id_canbo",None)
            post.approvedtime = int(time.time())
            post.updated_at = int(time.time())
            post.updated_by = params.get("id_canbo",None)
            post.priority = data.get("priority")
            db.session.commit()

            return json({"error_code":"OK","error_message":"successful", "data":to_dict(post)},status=200)

    return json({"error_code": "PERMISSION_DENIED", "error_message": "Bạn không có quyền thực hiện hành động này"}, status=520)

async def postprocess_category(request=None, Model=None, result=None, **kw):
    if "num_results" in result and (result["num_results"] > 0):
        i = 0
        for result_category in result["objects"]:
            if result_category["priority"] is None:
                # result_post["priority"] = 20
                result["objects"][i]["priority"] = 10
            i = i + 1
        
        sort_category = sorted(result["objects"], key=lambda k: (k['priority'],-k['created_at']), reverse=False)
        result["objects"] = sort_category



async def postprocess_post(request=None, Model=None, result=None, **kw):
    if "num_results" in result and (result["num_results"] > 0):
        i = 0
        for result_post in result["objects"]:
            if result_post["priority"] is None:
                # result_post["priority"] = 20
                result["objects"][i]["priority"] = 10
            
            if "content" in  result["objects"][i]:
                result["objects"][i]["content"] = ""
            i = i + 1

        sort_post = sorted(result["objects"], key=lambda k: (k['priority'],-k['created_at']), reverse=False)
        result["objects"] = sort_post

apimanager.create_api(Category,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin], PUT_SINGLE=[validate_admin]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_category], POST=[], PUT_SINGLE=[]),
    collection_name='category')

apimanager.create_api(Post,
    methods=['GET', 'POST', 'DELETE', 'PUT'],
    url_prefix='/api/v1',
    preprocess=dict(GET_SINGLE=[validate_user], GET_MANY=[validate_user], POST=[validate_admin], PUT_SINGLE=[validate_admin]),
    postprocess=dict(GET_SINGLE=[], GET_MANY=[postprocess_post], POST=[validate_admin], PUT_SINGLE=[validate_admin]),
    collection_name='post')
