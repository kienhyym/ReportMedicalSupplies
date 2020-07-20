from sqlalchemy import (
    Column, String, Integer,BigInteger,SmallInteger, DateTime, Date, Boolean, DECIMAL, Text, Index, ForeignKey, UniqueConstraint, JSON
)
from sqlalchemy.orm import *
from sqlalchemy import or_,and_
from sqlalchemy.dialects.postgresql import UUID
from application.database import db
from application.database.model import CommonModel
import uuid

def default_uuid():
    return str(uuid.uuid4())
#bo sung
# class National(CommonModel):
#     __tablename__ = 'national'
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ma = db.Column(String(255), index=True)
#     ten = db.Column(String(255))
#     tenkhongdau = db.Column(String)
#     active = db.Column(SmallInteger(), default=0) 

class Brands(CommonModel):
    __tablename__ = 'brands'
    id = db.Column(String, primary_key=True, default=default_uuid)
    name = db.Column(String(255), index=True)
    code = db.Column(String(255))
    # tenkhongdau = db.Column(String)
    national_id = db.Column(String, ForeignKey('quocgia.id', ondelete='SET NULL'), nullable=True)
    national = relationship('QuocGia')
    active = db.Column(SmallInteger(), default=0) 

class GroupSupplies(CommonModel):
    __tablename__ = 'group_supplies'
    id = db.Column(String, primary_key=True, default=default_uuid)
    code = db.Column(String(255), index=True)
    name = db.Column(String(255))
    # tenkhongdau = db.Column(String)
  
    
class CodeSupplies(CommonModel):
    __tablename__ = 'code_supplies'
    id = db.Column(String, primary_key=True, default=default_uuid)
    code = db.Column(String(255), index=True)
    name = db.Column(String(255))
    # tenkhongdau = db.Column(String)
   

class MedicalSupplies(CommonModel): #Vat tu y te
    __tablename__ = 'medical_supplies'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String()) #ma vat tu
    name = db.Column(String())
    image = db.Column(String()) 
    unit = db.Column(String()) #donvi tinh
    name_not_tone_mark = db.Column(String()) #ten khong dau
    national_id = db.Column(String, ForeignKey('quocgia.id', ondelete='SET NULL'), nullable=True)
    national = relationship('QuocGia')
    brands_id = db.Column(String, ForeignKey('brands.id', ondelete='SET NULL'), nullable=True)
    brands = relationship('Brands')
    group_supplies_id = db.Column(String, ForeignKey('group_supplies.id', ondelete='SET NULL'), nullable=True)
    group_supplies = relationship('GroupSupplies')
    code_supplies = db.Column(String()) 

class ReportOrganization(CommonModel): #Bao cao co so y te
    __tablename__ = 'report_organization'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String()) #ma
    period = db.Column(String()) #
    date = db.Column(BigInteger())#ngay thang baocao

    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')
    details = db.relationship("ReportOrganizationDetail", order_by="ReportOrganizationDetail.created_at", cascade="all, delete-orphan") #danh sach vat tu chitiet

class ReportOrganizationDetail(CommonModel): # baocao vat tu chi tiet
    __tablename__ = 'report_organization_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String()) #
    date = db.Column(BigInteger()) #ngay thang baocao

    report_organization_id = db.Column(String(), ForeignKey('report_organization.id'), nullable=True) #thuoc bao cao nao
    report_organization = relationship('ReportOrganization')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    begin_net_amount = db.Column(DECIMAL(25,3), default=0) # tồn đầu kì
    quantity_import = db.Column(DECIMAL(25,3), default=0) # số lượng nhập = sản xuất
    quantity_export = db.Column(DECIMAL(25,3), default=0) # số lượng xuất bằng sử dụng
    end_net_amount = db.Column(DECIMAL(25,3), default=0) # tồn cuối kì
    quantity_original = db.Column(DECIMAL(25,3), default=0) # ko dung
    estimates_net_amount = db.Column(DECIMAL(25,3), default=0) # du kiến nhập 


class ReportSupplyOrganization(CommonModel): #Bao cao don vi cung ung
    __tablename__ = 'report_supply_organization'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')
    details = db.relationship("ReportSupplyOrganizationDetail", order_by="ReportSupplyOrganizationDetail.created_at", cascade="all, delete-orphan")


class ReportSupplyOrganizationDetail(CommonModel): #baocao chi tiet don vi cung ung
    __tablename__ = 'report_supply_organization_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    report_supply_organization_id = db.Column(String(), ForeignKey('report_supply_organization.id'), nullable=True)
    report_supply_organization = relationship('ReportSupplyOrganization')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    health_facilities_id = db.Column(String()) #id don vi giao mua


    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    supply_ability = db.Column(DECIMAL(25,3), default=0) # Khả năng cung cấp
    type_sell_sponsor = db.Column(String()) # type cung cấp thực tế "sell" ,"sponsor"
    quantity = db.Column(DECIMAL(25,3), default=0) # số lượng xuất thực tế 

    price = db.Column(DECIMAL(25,3), default=0) # Đơn giá
    effective_time = db.Column(BigInteger()) # Thời hạn (ko dung)
    file = db.Column(String()) #file báo giá


class SyntheticRelease(CommonModel): #Tong hop xuat kho
    __tablename__ = 'synthetic_release'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    details = db.relationship("SyntheticReleaseDetail", order_by="SyntheticReleaseDetail.created_at", cascade="all, delete-orphan")

class SyntheticReleaseDetail(CommonModel): #chi tiet
    __tablename__ = 'synthetic_release_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    synthetic_release_id = db.Column(String(), ForeignKey('synthetic_release.id'), nullable=True)
    synthetic_release = relationship('SyntheticRelease')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    date_export = db.Column(BigInteger()) #ngay xuat kho
    quantity  = db.Column(DECIMAL(25,3), default=0) #soluong
    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')
