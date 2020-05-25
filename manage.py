""" Module for managing tasks through a simple cli interface. """
# Libraries

import sys
from os.path import abspath, dirname
sys.path.insert(0, dirname(abspath(__file__)))
import os
from sqlalchemy import create_engine, or_
from sqlalchemy.sql import table, column, select, update, insert

from manager import Manager
from sqlalchemy.inspection import inspect

from application.database import db
from application import run_app
from application.server import app
from application.database import init_database

from application.extensions import auth

from gatco_restapi.helpers import to_dict
from gatco.response import json,text
from gatco_restapi import  ProcessingException

from application.controllers.helpers.helper_common import generator_salt, convert_text_khongdau, default_uuid
from application.models.model_danhmuc import QuocGia, TinhThanh, QuanHuyen, XaPhuong, DanToc
import json
from application.models.models import Role, User, Organization,roles_users
import xlrd

manager = Manager()


@manager.command
def generate_schema(path = None, exclude = None, prettyprint = True):
    """ Generate javascript schema"""
    exclude_list = None
    if path is None:
        print("Path is required")
        return
    
    if exclude is not None:
        exclude_list = exclude.split(",")
        
    for cls in [cls for cls in db.Model._decl_class_registry.values() if isinstance(cls, type) and issubclass(cls, db.Model)]:
        classname = cls.__name__
        print("classname===",classname)
        if (exclude_list is not None) and (classname in exclude_list):
            continue
        schema = {}
        for col in cls.__table__.c:
            col_type = str(col.type)
            schema_type = ''
            if 'DECIMAL' in col_type:
                schema_type = 'number'
            if col_type in ['INTEGER','SMALLINT', 'FLOAT','BIGINT' ]:
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
            if (col.default is not None) and (col.default.arg is not None) and (not callable(col.default.arg)):
                schema[col.name]["default"] = col.default.arg
                
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
def create_test_models():
    from application.config.development import Config
    app.config.from_object(Config)
    init_database(app)

    salt = str(generator_salt())
    role1 = Role(name='admin')
    db.session.add(role1)
    user1 = User(email='admin', name='Admin', password=auth.encrypt_password('123456',salt), active=1, salt = salt)
    user1.roles.append(role1)

    db.session.add(user1)
    db.session.flush()
    db.session.commit()

notdict = ['_created_at','_updated_at','_deleted','_deleted_at','_etag','id']

@manager.command
def init_danhmuc(): 

    print("add quoc gia==========")
    add_quoc_gia()

    print("add danh muc tinh thanh=============")
    add_danhmuc_tinhthanh()
    
    print("add danh muc quan huyen=============")
    add_danhmuc_quanhuyen()
    
    print("add danh muc xa phuong=============")
    add_danhmuc_xaphuong()
     
    print("add danh muc dan toc=============")
    add_danhmuc_dantoc()

    # print("add role==========")
    # add_role()

    # print("migrate ten khong dau======")
    # migrate_tenkhongdau()

@manager.command
def add_quoc_gia():
    check_quocgia = db.session.query(QuocGia).filter(QuocGia.ma == 'VN').first()
    if check_quocgia is None:
        quocgias = QuocGia( ma = "VN", ten = "Việt Nam")
        db.session.add(quocgias)
        db.session.flush() 
        db.session.commit()

@manager.command
def add_danhmuc_tinhthanh():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dstinhthanh = os.path.join(SITE_ROOT, "application/data", "ThongTinTinhThanh.json")
        data_dstinhthanh = json.load(open(json_url_dstinhthanh))
        for item_dstinhthanh in data_dstinhthanh:
            tinhthanh_filter = db.session.query(TinhThanh).filter(TinhThanh.ma == item_dstinhthanh["matinhthanh"]).first()
            if tinhthanh_filter is None:
                quocgia_filter = db.session.query(QuocGia).filter(QuocGia.ma == 'VN').first()
                tinhthanh_filter = TinhThanh(ten = item_dstinhthanh["tentinhthanh"], ma = item_dstinhthanh["matinhthanh"], quocgia_id = quocgia_filter.id)
                tinhthanh_filter.tenkhongdau = convert_text_khongdau(tinhthanh_filter.ten)
                db.session.add(tinhthanh_filter)
                db.session.commit()
    except Exception as e:
        print("TINH THANH ERROR",e)

@manager.command
def add_danhmuc_quanhuyen():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dsquanhuyen = os.path.join(SITE_ROOT, "application/data", "ThongTinTinhThanh.json")
        data_dsquanhuyen = json.load(open(json_url_dsquanhuyen))
        for item_dsquanhuyen in data_dsquanhuyen:
            quanhuyen_filter = db.session.query(QuanHuyen).filter(QuanHuyen.ma == item_dsquanhuyen["maquanhuyen"]).first()
            if quanhuyen_filter is None:
                tinhthanh_filter = db.session.query(TinhThanh).filter(TinhThanh.ma == item_dsquanhuyen["matinhthanh"]).first()
                quanhuyen_filter = QuanHuyen(ten = item_dsquanhuyen["tenquanhuyen"], ma = item_dsquanhuyen["maquanhuyen"], tinhthanh_id = tinhthanh_filter.id)
                quanhuyen_filter.tenkhongdau = convert_text_khongdau(quanhuyen_filter.ten)
                db.session.add(quanhuyen_filter)
        db.session.commit()
    except Exception as e:
        print("QUAN HUYEN ERROR", e)

@manager.command
def add_danhmuc_xaphuong():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
        json_url_dsxaphuong = os.path.join(SITE_ROOT, "application/data", "ThongTinTinhThanh.json")
        data_dsxaphuong = json.load(open(json_url_dsxaphuong))
        for item_dsxaphuong in data_dsxaphuong:
            xaphuong_filter = db.session.query(XaPhuong).filter(XaPhuong.ma == item_dsxaphuong["maxaphuong"]).first()
            if xaphuong_filter is None:
                quanhuyen_filter = db.session.query(QuanHuyen).filter(QuanHuyen.ma == item_dsxaphuong["maquanhuyen"]).first()
                xaphuong_filter = XaPhuong(ten = item_dsxaphuong["tenxaphuong"], ma = item_dsxaphuong["maxaphuong"], quanhuyen_id = quanhuyen_filter.id)
                xaphuong_filter.tenkhongdau = convert_text_khongdau(xaphuong_filter.ten)
                db.session.add(xaphuong_filter)
        db.session.commit()
    except Exception as e:
        print("XA PHUONG ERROR", e)

@manager.command
def add_danhmuc_dantoc():
    try:
        SITE_ROOT = os.path.realpath(os.path.dirname(__file__))    
        json_url_dantoc = os.path.join(SITE_ROOT, "application/data", "DanTocEnum.json")
        data_dantoc = json.load(open(json_url_dantoc))
        for item_dantoc in data_dantoc:
            check_dantoc = db.session.query(DanToc).filter(DanToc.ma == str(item_dantoc["value"])).first()
            if check_dantoc is None:
                dantoc = DanToc(ma = str(item_dantoc["value"]), ten = item_dantoc["text"])
                dantoc.tenkhongdau = convert_text_khongdau(dantoc.ten)
                db.session.add(dantoc)
        db.session.commit()
    except Exception as e:
        print("DAN TOC ERROR", e)

@manager.command
def add_role():
    role_admin = db.session.query(Role).filter(Role.name == 'admin').first()
    if role_admin is None:
        role = Role(name='admin',description='Admin')
        db.session.add(role)
        db.session.commit()

    # role_citizen = db.session.query(Role).filter(Role.name == 'nguoidan').first()
    # if role_citizen is None:
    #     role = Role(name='nguoidan',description='Người dân')
    #     db.session.add(role)
    #     db.session.commit()

    role_canbotyt = db.session.query(Role).filter(Role.name == 'canbo_tyt').first()
    if role_canbotyt is None:
        role = Role(name = 'canbo_tyt',description='Cán bộ tại trạm y tế')
        db.session.add(role)
        db.session.commit()

    role_canbo_benhvien = db.session.query(Role).filter(Role.name == 'canbo_benhvien').first()
    if role_canbo_benhvien is None:
        role = Role(name = 'canbo_benhvien',description = "Cán bộ tại bệnh viện")
        db.session.add(role)
        db.session.commit()

    role_admin_tyt = db.session.query(Role).filter(Role.name == 'admin_tyt').first()
    if role_admin_tyt is None:
        role = Role(name = 'admin_tyt',description='Cán bộ tại trạm y tế')
        db.session.add(role)
        db.session.commit()

    role_admin_benhvien = db.session.query(Role).filter(Role.name == 'admin_benhvien').first()
    if role_admin_benhvien is None:
        role = Role(name = 'admin_benhvien',description = "Cán bộ tại bệnh viện")
        db.session.add(role)
        db.session.commit()

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
        if item is not None and item.name is not None:
            item.tenkhongdau = convert_text_khongdau(item.name)
    db.session.commit()

    list_item = db.session.query(Organization).all()
    for item in list_item:
        if item is not None and item.name is not None:
            item.unsigned_name = convert_text_khongdau(item.name)
    db.session.commit()

    list_item = db.session.query(DanToc).all()
    for item in list_item:
        if item is not None and item.ten is not None:
            item.tenkhongdau = convert_text_khongdau(item.ten)
    db.session.commit()


@manager.command
def import_data_donvi_and_admin():
    SITE_ROOT = os.path.realpath(os.path.dirname(__file__))
    # path = os.path.join(SITE_ROOT, "application/data", "donvi_yte_79_TPHCM.xlsx")
    path = os.path.join(SITE_ROOT, "application/data", "donvi_yte_01_HN.xlsx")
    loc = (path) 
    wb = xlrd.open_workbook(loc) 
    sheet = wb.sheet_by_index(0) 
    sheet.cell_value(0, 0) 
    # print(sheet.row_values(1)) 
    # print("cell1",sheet.cell_value(0, 0))
    # print("number_rows===",sheet.nrows)
    count =0
    for i in range(sheet.nrows):
        if i == 0:
            continue
        ma_donvi = str(sheet.cell_value(i,1)).strip()
        ten_donvi = str(sheet.cell_value(i,2)).strip()
        level_donvi = convert_columexcel_to_string(sheet.cell_value(i,3)).strip()
        hinhthuc_tochuc = str(sheet.cell_value(i,4)).strip()
        matinhthanh = convert_columexcel_to_string(sheet.cell_value(i,5))
        maquanhuyen = convert_columexcel_to_string(sheet.cell_value(i,6))
        maxaphuong = convert_columexcel_to_string(sheet.cell_value(i,7))
        diachi_donvi = str(sheet.cell_value(i,8)).strip()
        email_donvi = str(sheet.cell_value(i,9)).strip()
        dienthoai_donvi = str(sheet.cell_value(i,10)).strip()

        account = str(sheet.cell_value(i,11)).strip()
        email_admin = str(sheet.cell_value(i,12)).strip()
        dienthoai_admin = str(sheet.cell_value(i,13)).strip()
        matkhau = convert_columexcel_to_string(sheet.cell_value(i,14))
        ten_admin = str(sheet.cell_value(i,15)).strip()

        if account is None:
            continue
        elif level_donvi != "1" and level_donvi != "2":
            continue
        
        check_donvi = db.session.query(Organization).filter(Organization.code == ma_donvi).first()
        if check_donvi is not None:
            continue
        donvi = Organization()
        donvi.id = default_uuid()
        donvi.code = ma_donvi
        donvi.name = ten_donvi
        donvi.email = email_donvi
        donvi.phone = dienthoai_donvi
        donvi.address = diachi_donvi
        donvi.type_donvi = hinhthuc_tochuc
        donvi.level = int(float(level_donvi))
        donvi.unsigned_name = convert_text_khongdau(donvi.name)
        donvi.active = 1
        check_tinhthanh = db.session.query(TinhThanh).filter(TinhThanh.ma == matinhthanh).first()
        if check_tinhthanh is not None:
            donvi.tinhthanh_id = check_tinhthanh.id

        check_quanhuyen = db.session.query(QuanHuyen).filter(QuanHuyen.ma == maquanhuyen).first()
        if check_quanhuyen is not None:
            donvi.quanhuyen_id = check_quanhuyen.id

        check_xaphuong = db.session.query(XaPhuong).filter(XaPhuong.ma == maxaphuong).first()
        if check_xaphuong is not None:
            donvi.xaphuong_id = check_xaphuong.id

        db.session.add(donvi)
        db.session.commit()

        
        check_admin = db.session.query(User).filter(User.accountName == account).first()
        
        if check_admin is not None:
            continue
        admin = User()
        admin.id = default_uuid()
        admin.accountName = account
        admin.name = ten_admin
        admin.unsigned_name = convert_text_khongdau(admin.name)
        admin.organization_id = donvi.id
        admin.active = 1
        if email_admin is not None and email_admin != '':
            admin.email = email_admin
        else:
            admin.email = None
        if dienthoai_admin is not None and dienthoai_admin != '':
            admin.phone = dienthoai_admin
        else: 
            admin.phone = None
        role_admin_tyt = db.session.query(Role).filter(Role.name == 'admin_tyt').first()
        role_admin_benhvien = db.session.query(Role).filter(Role.name == 'admin_benhvien').first()
        if donvi.level == 1:
            admin.roles.append(role_admin_benhvien)
        elif donvi.level == 2:
            admin.roles.append(role_admin_tyt)

        salt = generator_salt()
        if matkhau is not None:
            newpassword = auth.encrypt_password(str(matkhau), str(salt))
            admin.password = newpassword
            admin.salt = salt

        db.session.add(admin)
        db.session.commit()
        count = count + 1

    print("total_sync====",count)

def convert_columexcel_to_string(value):
    # print("value", value)
    if isinstance(value,str):
        return value.strip()
    if isinstance(value, float):
        return str(int(value)).strip()
    if isinstance(value,int):
        return str(value).strip()

@manager.command
def run():
    """ Starts server on port 12002. """
    # run_app(host="0.0.0.0", mode="development")
    run_app(host="0.0.0.0", mode="production")

@manager.command
def rundev():
    """ Starts server on port 12002. """
    run_app(host="0.0.0.0", mode="development")
    # run_app(host="0.0.0.0", mode="production")

if __name__ == '__main__':
    manager.main()
