""" Module for managing tasks through a simple cli interface. """
# Libraries

import sys
from os.path import abspath, dirname
sys.path.insert(0, dirname(abspath(__file__)))
import random
import string
from manager import Manager
import requests
from gatco_restapi.helpers import to_dict
from sqlalchemy import create_engine
from sqlalchemy.inspection import inspect
import sqlalchemy
from application.database import db, redisdb
from application import run_app 
from application.server import app
from application.extensions import auth
from application.models.models import User, QuocGia, TinhThanh, QuanHuyen,\
    XaPhuong, DanToc, TrinhDoHocVan, TuyenDonVi, Role, DonViDangKi, DonVi,roles_users
from application.controllers.api import generator_salt
from application.controllers.admin import default_uuid
from application.client import HTTPClient
from gatco.response import json as json_resp
from application.controllers.preprocess import generate_uid,convert_text_khongdau
# from application.controllers.preprocess import generate_uid
import json
import os
import asyncio
import ujson
# Constants.
manager = Manager()


@manager.command
def generate_id(size=100):
    generate_uid(size)


@manager.command
def generate_schema(path = "static/schema", exclude = None, prettyprint = True):
    """ Generate javascript schema"""
    exclude_list = None
    if path is None:
        print("Path is required")
        return
    
    if exclude is not None:
        exclude_list = exclude.split(",")
        
    for cls in [cls for cls in db.Model._decl_class_registry.values() if isinstance(cls, type) and issubclass(cls, db.Model)]:
        classname = cls.__name__
        if (exclude_list is not None) and (classname in exclude_list):
            continue
        schema = {}
        for col in cls.__table__.c:
            col_type = str(col.type)
            schema_type = ''
            if 'DECIMAL' in col_type:
                schema_type = 'number'
            if col_type in ['INTEGER','SMALLINT', 'FLOAT' ]:
                schema_type = 'number'
            if col_type == 'DATETIME':
                schema_type = 'datetime'
            if col_type == 'DATE':
                schema_type = 'datetime'
            if 'VARCHAR' in col_type:
                schema_type = 'string'
            if col_type in ['VARCHAR', 'UUID', 'TEXT']:
                schema_type = 'string'
            if col_type in ['JSON', 'JSONB']:
                schema_type = 'json'
            if 'BOOLEAN' in col_type:
                schema_type = 'boolean'
            
            schema[col.name] = {"type": schema_type}
            
            if col.primary_key:
                schema[col.name]["primary"] = True
            #nullabel
            if (not col.nullable) and (not col.primary_key):
                schema[col.name]["required"] = True
                
            if hasattr(col.type, "length") and (col.type.length is not None):
                schema[col.name]["length"] = col.type.length
            
            #default
            if (col.default is not None) and (col.default.arg is not None) \
                and (not callable(col.default.arg)) and not isinstance(col.default.arg, sqlalchemy.sql.functions.GenericFunction):
                #print(col.default, col.default.arg, callable(col.default.arg))
                schema[col.name]["default"] = col.default.arg
                
            #User confirm_password
            if (classname == "User") and ("password" in col.name):
                schema["confirm_password"] = {"type": schema_type}
                schema["confirm_password"]["length"] = col.type.length
                
                
        
        relations = inspect(cls).relationships
        for rel in relations:
            if rel.direction.name in ['MANYTOMANY', 'ONETOMANY']:
                schema[rel.key] = {"type": "list"}
            if rel.direction.name in ['MANYTOONE']:
                schema[rel.key] = {"type": "dict"}
        
        if prettyprint:
            with open(path + '/' + classname + 'Schema.json', 'w') as outfile:
                json.dump(schema,  outfile, indent=4,)
        else:
            with open(path + '/' + classname + 'Schema.json', 'w') as outfile:
                json.dump(schema,  outfile,)


@manager.command
def migrate_data_2020():

    myengine = create_engine('postgresql://sochamsocusr:123sdfswczs456@127.0.0.1:5432/sochamsoc')
    # myengine = create_engine('postgresql://quanlycanbousr:1s23sdfswczsass456@127.0.0.1:5432/dataquanlydonvi')
    print("=======start migrate_danhmuc=======")
    with myengine.connect() as con:
        count = 0
        results = con.execute('select * from quocgia')
        for row in results:
            
            check_exist = db.session.query(QuocGia).filter(QuocGia.ma == row[8]).first()
            if check_exist is None:
                print("rowDAta===",row)
                item = QuocGia()
                item.id = row[7]
                item.ma = row[8]
                item.ten = row[9]
                item.tenkhongdau = convert_text_khongdau(row[9])
                db.session.add(item)
                count = count +1
        db.session.commit()
        print("==========end migrate quocgia==============",count)
          
          
        count =0        
        results_tinhthanh = con.execute('select * from tinhthanh')
        for row in results_tinhthanh:
            check_exist = db.session.query(TinhThanh).filter(TinhThanh.ma == row[8]).first()
            if check_exist is  None:
                item = TinhThanh()
                item.id = row[7]
                item.ma = row[8]
                item.ten = row[9]
                item.quocgia_id = row[11]
                item.tenkhongdau = convert_text_khongdau(row[9])
                db.session.add(item)
                count = count +1
        db.session.commit()
        print("==========end migrate tinhthanh==============",count)
          
        count =0
        results_quanhuyen = con.execute('select * from quanhuyen')
        for row in results_quanhuyen:
            check_exist = db.session.query(QuanHuyen).filter(QuanHuyen.ma == row[8]).first()
            if check_exist is None:
                item = QuanHuyen()
                item.id = row[7]
                item.ma = row[8]
                item.ten = row[9]
                item.tinhthanh_id = row[11]
                item.tenkhongdau = convert_text_khongdau(row[9])
                db.session.add(item)
                count = count +1
        db.session.commit()
        print("==========end migrate quanhuyen==============",count)
                  
        count =0
        results_xaphuong = con.execute('select * from xaphuong')
        for row in results_xaphuong:
            check_exist = db.session.query(XaPhuong).filter(XaPhuong.ma == row[8]).first()
            if check_exist is None:
                item = XaPhuong()
                item.id = row[7]
                item.ma = row[8]
                item.ten = row[9]
                item.quanhuyen_id = row[11]
                item.tenkhongdau = convert_text_khongdau(row[9])
                db.session.add(item)
                count = count +1
        db.session.commit()
        print("==========end migrate xaphuong==============",count)
              
          
        count = 0
        results_dantoc = con.execute('select * from dantoc')
        for row in results_dantoc:
            check_exist = db.session.query(DanToc).filter(DanToc.ma == row[8]).first()
            if check_exist is None:
                item = DanToc()
                item.id = row[7]
                item.ma = row[8]
                item.ten = row[9]
                db.session.add(item)
                count = count +1
        db.session.commit()
        print("==========end migrate dantoc==============",count)
        
        
        count = 0
        results_dantoc = con.execute('select * from trinhdohocvan')
        for row in results_dantoc:
            check_exist = db.session.query(TrinhDoHocVan).filter(TrinhDoHocVan.ma == row[8]).first()
            if check_exist is None:
                item = TrinhDoHocVan()
                item.id = row[7]
                item.ma = row[8]
                item.ten = row[9]
                item.mota = row[10]
                db.session.add(item)
                count = count +1
        db.session.commit()
        print("==========end migrate trinhdohocvan==============",count)
        if con is not None:
            con.close()
    print(" migrate_data 2019 ok====count===")
            

@manager.command
def create_roles(): 
    role_admin = db.session.query(Role).filter(Role.name == 'admin').first()
    if role_admin is None:
        role = Role(name='admin',description='Admin')
        db.session.add(role)
        db.session.commit()

        # admin = User()
        salt = str(generator_salt())
        user1 = User(email='admin', name='Admin', password=auth.encrypt_password('123456',salt), active=1, salt = salt)
        user1.roles.append(role)
        db.session.add(user1)
        db.session.commit()
    # role_admin = db.session.query(Role).filter(Role.name == 'admin').first()
    # if role_admin is None:
    #     role = Role(name='admin',description='Admin hệ thống')
    #     db.session.add(role)
    #     db.session.commit()
    # role_admin = db.session.query(Role).filter(Role.name == 'admin_donvi').first()
    # if role_admin is None:
    #     role = Role(name='admin_donvi',description='Quản lý đơn vị')
    #     db.session.add(role)
    #     db.session.commit()

    # role_canbo = db.session.query(Role).filter(Role.name == 'canbo').first()
    # if role_canbo is None:
    #     role = Role(name='canbo',description='Cán bộ trực thuộc đơn vị')
    #     db.session.add(role)
    #     db.session.commit()

    # role_manager = db.session.query(Role).filter(Role.name == 'manager').first()
    # if role_manager is None:
    #     role = Role(name = 'manager',description='Người duyệt bài')
    #     db.session.add(role)
    #     db.session.commit()

    # role_editor = db.session.query(Role).filter(Role.name == 'editor').first()
    # if role_editor is None:
    #     role = Role(name = 'editor',description = "Người viết bài")
    #     db.session.add(role)
    #     db.session.commit()


@manager.command
def add_tuyendonvi():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_tuyendonvi = os.path.join(SITE_ROOT, "application/data", "TuyenDonViEnum.json")
        data_tuyendonvi = json.load(open(json_url_tuyendonvi))
        for item_tuyendonvi in data_tuyendonvi:
            print("tuyendonvi>>>",item_tuyendonvi)
            tuyendonvi_filter = db.session.query(TuyenDonVi).filter(TuyenDonVi.ma == item_tuyendonvi["value"]).first()
            if tuyendonvi_filter is None:
                tuyendonvi = TuyenDonVi()
                tuyendonvi.id = item_tuyendonvi["value"]
                tuyendonvi.ma = item_tuyendonvi["value"]
                tuyendonvi.ten = item_tuyendonvi.get('text', None)
                tuyendonvi.mota = item_tuyendonvi["ma"]
                db.session.add(tuyendonvi)
                db.session.commit()
    except Exception as e:
        print("TUYEN DON VI ERROR",e)


@manager.command
def generator_salt():
    data = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(24))
    return data

@manager.command
def migrate_tenkhongdau():

    list_item = db.session.query(TinhThanh).all()
    for item in list_item:
        if item is not None and item.ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.ten)
    db.session.commit()

    list_item = db.session.query(QuanHuyen).all()
    for item in list_item:
        if item is not None and item.ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.ten)
    db.session.commit()


    list_item = db.session.query(XaPhuong).all()
    for item in list_item:
        if item is not None and item.ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.ten)
    db.session.commit()

    list_item = db.session.query(User).all()
    for item in list_item:
        if item is not None and item.fullname is not None:
            item.tenkhongdau = convert_text_khongdau(item.fullname)
    db.session.commit()

    list_item = db.session.query(DonVi).all()
    for item in list_item:
        if item is not None and item.ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.ten)
    db.session.commit()

    list_item = db.session.query(DonViDangKi).all()
    for item in list_item:
        if item is not None and item.donvi_ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.donvi_ten)
    db.session.commit()

    list_item = db.session.query(DanToc).all()
    for item in list_item:
        if item is not None and item.ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.ten)
    db.session.commit()


def add_danhsach_quocgia_tinhthanh():  
    quocgias = QuocGia( ma = "VN", ten = "Việt Nam")
    db.session.add(quocgias)
    db.session.flush() 
    db.session.commit()
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dstinhthanh = os.path.join(SITE_ROOT, "application/data", "ThongTinTinhThanh.json")
        data_dstinhthanh = json.load(open(json_url_dstinhthanh))
        for item_dstinhthanh in data_dstinhthanh:
            tinhthanh_filter = db.session.query(TinhThanh).filter(TinhThanh.ma == item_dstinhthanh["matinhthanh"]).first()
            if tinhthanh_filter is None:
                quocgia_filter = db.session.query(QuocGia).filter(QuocGia.ma == 'VN').first()
                tinhthanh_filter = TinhThanh(ten = item_dstinhthanh["tentinhthanh"], ma = item_dstinhthanh["matinhthanh"], quocgia_id = quocgia_filter.id)
                db.session.add(tinhthanh_filter)
                db.session.commit()
    except Exception as e:
        print("TINH THANH ERROR",e)

        
@manager.command
def add_danhsach_quanhuyen():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dsquanhuyen = os.path.join(SITE_ROOT, "application/data", "ThongTinTinhThanh.json")
        data_dsquanhuyen = json.load(open(json_url_dsquanhuyen))
        for item_dsquanhuyen in data_dsquanhuyen:
            quanhuyen_filter = db.session.query(QuanHuyen).filter(QuanHuyen.ma == item_dsquanhuyen["maquanhuyen"]).first()
            if quanhuyen_filter is None:
                tinhthanh_filter = db.session.query(TinhThanh).filter(TinhThanh.ma == item_dsquanhuyen["matinhthanh"]).first()
                quanhuyen_filter = QuanHuyen(ten = item_dsquanhuyen["tenquanhuyen"], ma = item_dsquanhuyen["maquanhuyen"], tinhthanh_id = tinhthanh_filter.id)
                db.session.add(quanhuyen_filter)
        db.session.commit()
    except Exception as e:
        print("QUAN HUYEN ERROR", e)

@manager.command
def add_danhsach_xaphuong():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dsxaphuong = os.path.join(SITE_ROOT, "application/data", "ThongTinTinhThanh.json")
        data_dsxaphuong = json.load(open(json_url_dsxaphuong))
        for item_dsxaphuong in data_dsxaphuong:
            xaphuong_filter = db.session.query(XaPhuong).filter(XaPhuong.ma == item_dsxaphuong["maxaphuong"]).first()
            if xaphuong_filter is None:
                quanhuyen_filter = db.session.query(QuanHuyen).filter(QuanHuyen.ma == item_dsxaphuong["maquanhuyen"]).first()
                xaphuong_filter = XaPhuong(ten = item_dsxaphuong["tenxaphuong"], ma = item_dsxaphuong["maxaphuong"], quanhuyen_id = quanhuyen_filter.id)
                db.session.add(xaphuong_filter)
        db.session.commit()
    except Exception as e:
        print("XA PHUONG ERROR", e)
        
        

@manager.command
def init_danhmuc():
    print("add danh muc tinh thanh=============")
    add_danhsach_quocgia_tinhthanh()
    
    print("add danh muc quan huyen=============")
    add_danhsach_quanhuyen()
    
    print("add danh muc xa phuong=============")
    add_danhsach_xaphuong()

    # print("migrate danh muc from service soBMTE to service quanlycanbo")
    # migrate_data_2020()

    # print("create role admin - canbo - manager - editor")
    # create_roles()
   
    # print("add_tuyendonvi")
    # add_tuyendonvi()

    # print("migrate ten khong dau")
    # migrate_tenkhongdau()


'''
    Migrate dulieu quanlydonvi cu sang quanlydonvi moi
'''
# @manager.command
# def migrate_data_quanlydonvi():
#     myengine = create_engine('postgresql://quanlycanbousr:1s23sdfswczsass456@127.0.0.1:5432/dataquanlydonvi')
#     print("=======start user=======")
#     with myengine.connect() as con:
#         count = 0
#         results = con.execute('select * from public.user')
#         for row in results:
#             data_user = {}
#             # data_user["id"] = row[7]
#             data_user["id"] = "BA02081441"
#             url_get_contact = app.config.get("SOMEVABE_URL", "") + str('/api/v1/admin/getcontact')
#             # respone_contact = HTTPClient.post(url_get_contact,data = to_dict(data_user))
#             respone_contact = requests.post(url_get_contact, data = ujson.dumps(data_user))
#             respone = respone_contact.json()
#             if respone is not None and "OK" in respone["error_code"]:
#                 data = respone["data"]
#                 print("data=====",data.get("hoten",None))
#                 donvi = DonVi()
#                 donvi.id = default_uuid()
#                 donvi.ten = data.get("hoten",None)
#                 donvi.tuyendonvi_id = data.get("tuyendonvi_id",None)
#                 donvi.xaphuong_id = data.get("xaphuong_id",None)
#                 donvi.quanhuyen_id = data.get("quanhuyen_id",None)
#                 donvi.tinhthanh_id = data.get("tinhthanh_id",None)
#                 donvi.quocgia_id = data.get("quocgia_id",None)
#                 donvi.sodienthoai = data.get("sodienthoai",None)
#                 donvi.email = data.get("email",None)
#                 donvi.tenkhongdau = convert_text_khongdau(donvi.ten)
#                 donvi.madonvi_bmte = data.get("id",None)
#                 db.session.add(donvi)
#                 db.session.commit()

# # created_at 1 | created_by 2 | updated_at 3 | updated_by 4  | deleted 5 | deleted_by 6 | deleted_at 7  |     id 8 |fullname 9 | phone_number 10 | phone_country_prefix 11 | phone_national_number 12 |   id_card   13 |              email    14           |                           password 15 |           salt      16     | active 17 |     macanboyte  18   |  ngaysinh 19 | gioitinh 20 |              dantoc_id   21   | matrinhdochuyenmon  22 | tentrinhdochuyenmon 23 | machucvu 24 |      tenchucvu  25    | diachi  26 |             xaphuong_id   27      |             quanhuyen_id  28           |    29      tinhthanh_id              | quocgia_id  30 |                  noicongtac     31             |     sochungchi  32   | thoihanchungchi 33 | ghichu 34 | madonvi_bmte 35 | donvi_id 36
#                 check_exist = db.session.query(User).filter(User.id == row[7]).first()
#                 if check_exist is None:
#                     item = User()
#                     item.id = row[7]
#                     item.fullname = row[8]
#                     item.phone_number = row[9]
#                     item.phone_country_prefix = row[10]
#                     item.phone_national_number = row[11]
#                     item.id_card = row[12]
#                     item.email = row[13]
#                     item.password = row[14]
#                     item.salt = row[15]
#                     item.active = row[16]
#                     item.macanboyte = row[17]
#                     item.ngaysinh = row[18]
#                     item.gioitinh = row[19]
#                     item.dantoc_id = row[20]
#                     item.matrinhdochuyenmon = row[21]
#                     item.tentrinhdochuyenmon = row[22]
#                     item.machucvu = row[23]
#                     item.tenchucvu = row[24]
#                     item.diachi = row[25]
#                     item.xaphuong_id = row[26]
#                     item.quanhuyen_id = row[27]
#                     item.tinhthanh_id = row[28]
#                     item.quocgia_id = row[29]
#                     item.noicongtac = row[30]
#                     item.sochungchi = row[31]
#                     item.thoihanchungchi = row[32]
#                     item.ghichu = row[33]
#                     item.madonvi_bmte = row[34],
#                     item.donvi_id = donvi.id
#                     item.tenkhongdau = convert_text_khongdau(row[8])
#                     db.session.add(item)
#                     count = count +1
#             db.session.commit()
#             break
#             print("==========end migrate user==============",count)
                
#             count = 0
#             results = con.execute('select * from roles_users')
#             for row in results:
#                 print("row======",row)
#                 user = db.session.query(User).filter(User.id == row[0]).first()
#                 if user is not None:
#                     role = con.execute("select * from role where id ='"+str(row[1])+"'")
#                     for row_role in role:
#                         if (row_role[8] == "admin"):
#                             count = count + 1
#                             role_admin = db.session.query(Role).filter(Role.name=="admin_donvi").first()
#                             user.roles.append(role_admin)
#                         elif (row_role[8] == "canbo"):
#                             count = count + 1
#                             role_canbo = db.session.query(Role).filter(Role.name=="canbo").first()
#                             user.roles.append(role_canbo)
#                     db.session.commit()
#             print("count roles-users =====",count)
            

@manager.command
def run():
    """ Starts server QuanLyDonVi on port 12002. """
#     if db.session.query(User).count() == 0:
#         create_test_models()
#         print("Khoi tao user==================")
    run_app(host="0.0.0.0", port=12002)

if __name__ == '__main__':
    manager.main()
