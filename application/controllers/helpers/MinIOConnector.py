""" Module for managing tasks through a simple cli interface. """
# Libraries

import sys
from os.path import abspath, dirname
sys.path.insert(0, dirname(abspath(__file__)))

from manager import Manager

import json
import ujson

from datetime import datetime

import asyncio
import os
import io
from application.database import redisdb,db
from sqlalchemy import or_, and_, desc, asc
from datetime import timedelta

from minio import Minio
from minio.error import (ResponseError, BucketAlreadyOwnedByYou, BucketAlreadyExists)
from application.models.models import User
import uuid
# Instance
manager = Manager()

minioClient = Minio('103.74.122.206:9000',
                  access_key='BFKOM03UO2AA4X3AM54F',
                  secret_key='ZKAN3REiTv8ZDwXkakuRdwGGCdILz6W+YO77v9bh',
                  secure=False)
SITE_ROOT = os.path.realpath(os.path.dirname(__file__))

def read_file_json(path):
    
    json_url = os.path.join(SITE_ROOT, "../exampleData", path)
    data_json = json.load(open(json_url))
    return data_json
    

def default_uuid():
    return str(uuid.uuid4())

def get_sharelink_oneday(mybucket=None,myobject=None):
    
    # presigned get object URL for object name, expires in 2 days.
    try:
        link = minioClient.presigned_get_object(mybucket, myobject, expires=timedelta(days=1))
        return link
    # Response error is still possible since internally presigned does get bucket location.
    except ResponseError as err:
        print(err)
    return None

def uploadFromPath(bucketName, path=None, params=None):
    print("upload path=="+path)
    paths = path.split('/')
    try:
        if(minioClient.bucket_exists(bucketName)==False):
            minioClient.make_bucket(bucketName, location="utf-8")
        try:
            minioClient.fput_object(bucketName, paths[len(paths)-1], path)
            print("upload success")
        except ResponseError as err:
            print(err)
       
    except BucketAlreadyOwnedByYou as err:
        print("BucketAlreadyOwnedByYou===",err)
        pass
    except BucketAlreadyExists as err:
        print("BucketAlreadyExists===",err)
        pass
    except ResponseError as err:
        print("ResponseError===",err)
        raise
    else:
        # Put an object 'pumaserver_debug.log' with contents from 'pumaserver_debug.log'.
        try:
            minioClient.fput_object(bucketName, paths[len(paths)-1], path)
            print("upload success")
        except ResponseError as err:
            print(err)


async def uploadFromData(bucketName,objectName=None, fileData=None, length=None):
    print("upload objectName=="+objectName)
    # paths = path.split('/')
    try:
        if(minioClient.bucket_exists(bucketName)==False):
            minioClient.make_bucket(bucketName, location="utf-8")
        try:
            raw_data = io.BytesIO(fileData)
            raw_data_size = raw_data.getbuffer().nbytes
            checkupload = minioClient.put_object(bucketName, objectName, raw_data, raw_data_size)
            print("upload success",checkupload)
            return checkupload
        except ResponseError as err:
            print(err)
       
    except BucketAlreadyOwnedByYou as err:
        print("BucketAlreadyOwnedByYou===",err)
        pass
    except BucketAlreadyExists as err:
        print("BucketAlreadyExists===",err)
        pass
    except ResponseError as err:
        print("ResponseError===",err)
        raise
    else:
        # Put an object 'pumaserver_debug.log' with contents from 'pumaserver_debug.log'.
        try:
            raw_data = io.BytesIO(fileData)
            raw_data_size = raw_data.getbuffer().nbytes
            checkupload = minioClient.put_object(bucketName, objectName, raw_data, raw_data_size)
            print("upload success",checkupload)
            return checkupload
        except ResponseError as err:
            print(err)
    return None


def setNotification(bucketName=None):
    notification = {
        'QueueConfigurations': [
            
        ]
#         'CloudFunctionconfigurations':[]
        
    }

    if(minioClient.bucket_exists(bucketName)==False):
        minioClient.make_bucket(bucketName, location="utf-8")
    minioClient.remove_all_bucket_notification(bucketName)
    minioClient.set_bucket_notification(bucketName, notification)
    print("set notify success, please listen for events")
    # try:
    #     print(notification)
    #     if(minioClient.bucket_exists(record_listen)==False):
    #         minioClient.make_bucket(record_listen, location="utf-8")
    #     minioClient.set_bucket_notification(record_listen, notification)
    #     print("set notify success, please listen for events")
    # except ResponseError as err:
    #     # handle error response from service.
    #     print("loi 1===========")
    #     print(err)
    # except (TypeError) as err:
    #     # should happen only during development. Fix the notification argument
    #     print("loi 2===========")
    #     print(err)

def check_finish_upload_record(bucket_name, arrFile, objBuckets):
    result_files = []
    print("check_finish_upload_record.arrFile====",arrFile)
    for file in arrFile:
        check_finish = False
        for obj_bucket in objBuckets:
            print("obj_bucket.object_nam==",obj_bucket.object_name,"====path===",file['path'])
            if str(obj_bucket.object_name).replace("%2F","/") == file['path']:
                print("check file true====",file['path'])
                check_finish = True
                break
        if check_finish == False:
            return False
        else:
            file['bucket_name'] = bucket_name
#             result_files.append(file)
        
#     arrFile = result_files
    return True

               
                
    

def listen_notification(bucket_name=None, prefix=None, suffix=None, events=None):
    if(minioClient.bucket_exists(bucket_name)==False):
        resp_create_bucket = minioClient.make_bucket(bucket_name)
        print("resp_create_bucket====",resp_create_bucket)
        
    notification_config = {
        'QueueConfigurations': [
            
        ]
    }
    
    events = minioClient.get_bucket_notification(bucket_name)
    print("check listen notification====")
    print(events)
    print(len(events))
    if(events is None or len(events)==0):
        minioClient.remove_all_bucket_notification(bucket_name)
        resp_set_notify = minioClient.set_bucket_notification(bucket_name, notification_config)
        print("set notify for bucket===",bucket_name,"=====",resp_set_notify)
        events = minioClient.listen_bucket_notification(bucket_name, '',
                                                    '',
                                                    ['s3:ObjectCreated:*',  's3:ObjectRemoved:*'])
    print("start listen notification")
    for event in events:
        print("Notify.event==========",event)
        json_data = json.loads(json.dumps(event['Records'][0]))
        if json_data is not None and 's3' in json_data and json_data['s3']['object'] is not None:
            objectData = json_data['s3']['object']
            path_file = objectData['key'].replace("%2F","/")
            filename = path_file.split("/")[-1]
            
            if path_file.find("/assets/")!=-1:
                prefix_path = path_file.split("/assets/"+filename)[0]
            else:
                prefix_path = path_file.split("/"+filename)[0]
#             try:
#                 record6%2Femr_metadata.json
            print("prefix_path==",prefix_path)
            print("filename===",filename)
            resp_readFile = minioClient.get_object(bucket_name, str("/assets/metadata.json"))
            body_data = resp_readFile.read()
            try:
                body_data = body_data.decode('utf-8-sig')
            except UnicodeDecodeError:
                body_data = body_data.decode('utf-8-sig')
            if (body_data is None or body_data==""):
                continue
            json_metadata = ujson.loads(ujson.dumps(body_data))
            check_finish = True
           
            if(type(json_metadata) is str):
                print("chay vao load json lan 2")
                json_metadata = ujson.loads(body_data)
            
            attachments = json_metadata["attachments"]
            erm_record_data = json_metadata
            print("============attachments=======",attachments)
            for key, objValue in json_metadata.items():
                item_value_record = {}
                if key == "patient":
                    json_data_item = read_file_json(json_metadata["patient"]["path"])
                    
                    check_patient = get_or_create_patient(json_data_item)
                    if check_patient is None: 
                        print("can not create or get patient=========")
                        return
                    else:
                        item_value_record = check_patient
                elif isinstance(objValue, list):
                    item_value_record = []
                    for item in objValue:
                        if "id" in item and "type" in item:
                            json_data_item = read_file_json(item["path"])
                            resp_add = add_data_fhir(json_data_item)
                            if "error_code" not in resp_add and resp_add is not None:
                                item_value_record.append(resp_add)
                            else:
                                item_value_record.append(resp_add)
                        else:
                            item_value_record = objValue
                    
                elif "id" in objValue and "type" in objValue:
                    json_data_item = None
                    json_data_item = read_file_json(objValue["path"])
                    resp_add = add_data_fhir(json_data_item)
                    if "error_code" not in resp_add and resp_add is not None:
                        item_value_record = resp_add
                    else:
                        item_value_record = objValue
                else:
                    item_value_record = objValue
                    
                erm_record_data[key] = item_value_record
                
            if attachments is not None and len(attachments)>0:
                
                print("json_metadata.attachments========",attachments)
                list_object = minioClient.list_objects(bucket_name, (str('/assets/')), True)
                check_finish = check_finish_upload_record(bucket_name, attachments,list_object)    
             
            print("check_finish===",check_finish) 
            if check_finish == True:
#                 check_patient = get_or_create_patient(json_metadata["patient"])
#                 if check_patient is None: 
#                     print("can not create or get patient=========")
#                     return
#                 practitioners = []
#                 if "performer" in json_metadata:
#                     for p in json_metadata["performer"]:
#                         check_performer = get_or_create_practitioner(p)
#                         if check_performer is not None:
#                             practitioners.append(check_performer)
#                     json_metadata["performer"] = practitioners
                record_emr = db.session.query(RecordEMR).filter(and_(RecordEMR.code == json_metadata["id"],RecordEMR.patient_id ==erm_record_data['patient']['id'])).first()
                if record_emr is None:
                    print("create new record EMR ============")
                    record_emr = RecordEMR()
                    record_emr.code = json_metadata["id"]
                    record_emr.patient_id = erm_record_data['patient']['id']
                    record_emr.status = "draft"
                    db.session.add(record_emr)
                    
                record_emr.resources = erm_record_data
                performers = []
                if "creator" in erm_record_data:
                   performers.append(erm_record_data["creator"])
                if "approver" in erm_record_data:
                   performers.extend(erm_record_data["approver"])
                if "updaters" in erm_record_data:
                   performers.extend(erm_record_data["updaters"])
                   
                record_emr.performer = performers
                db.session.commit()
                print("update data to record =====",record_emr)
                        
#                 for obj in json_metadata["metadata"]:
                    #registered=received,preliminary=draft,
                    #final=complete,entered-in-error=error,
                    #unknown,cancelled=abandoned,corrected,amended
#                     if check_finish == False:
#                         obj['status'] = 'preliminary'
#                     else:
#                         obj['status'] = 'complete'
#                         record_emr = RecordEMR()
#                         record_emr.resources = json_metadata
#                         record_emr.performer = obj["performer"]
#                             if "subject" in obj and obj["subject"] is not None:
#                                 if "reference" in obj["subject"]:
#                                     objFhir = obj["subject"]["reference"]
#                                     model_subject = objFhir.split("/")[0]
#                                     id_subject = objFhir.split("/")[1]
#                                     modelInfo = read_data_fhir(model_subject,id_subject)
                            
                    
                    
#                     resp_add = add_data_fhir(obj)
#                     print("resp_add=====",resp_add)
                    
#             except:
#                 print("chua co file metadata.json")
            
                #cấu trúc của key sẽ bắt buộc là folder/emr_metadata.json. Trong đó folder = ten benh nhan + "_" + mã bệnh nhân+"_"+mã đợt kcb



