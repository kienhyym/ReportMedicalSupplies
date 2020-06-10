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
    
class MedicalSupplies(CommonModel):
    __tablename__ = 'medical_supplies'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    name = db.Column(String())
    image = db.Column(String())
    unit = db.Column(String())
    name_not_tone_mark = db.Column(String())


class ReportOrganization(CommonModel):
    __tablename__ = 'report_organization'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')
    details = db.relationship("ReportOrganizationDetail", order_by="ReportOrganizationDetail.created_at", cascade="all, delete-orphan")

class ReportOrganizationDetail(CommonModel):
    __tablename__ = 'report_organization_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    report_organization_id = db.Column(String(), ForeignKey('report_organization.id'), nullable=True)
    report_organization = relationship('ReportOrganization')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    begin_net_amount = db.Column(DECIMAL(25,3), default=0) # tồn đầu kì
    quantity_import = db.Column(DECIMAL(25,3), default=0) # số lượng nhập = sản xuất
    quantity_export = db.Column(DECIMAL(25,3), default=0) # số lượng xuất bằng sử dụng
    end_net_amount = db.Column(DECIMAL(25,3), default=0) # tồn cuối kì
    quantity_original = db.Column(DECIMAL(25,3), default=0) # khởi tạo ban đầu, không cần nhập lại
    estimates_net_amount = db.Column(DECIMAL(25,3), default=0) # du kiến nhập 


class ReportSupplyOrganization(CommonModel):
    __tablename__ = 'report_supply_organization'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')
    details = db.relationship("ReportSupplyOrganizationDetail", order_by="ReportSupplyOrganizationDetail.created_at", cascade="all, delete-orphan")


class ReportSupplyOrganizationDetail(CommonModel):
    __tablename__ = 'report_supply_organization_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    report_supply_organization_id = db.Column(String(), ForeignKey('report_supply_organization.id'), nullable=True)
    report_supply_organization = relationship('ReportSupplyOrganization')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    health_facilities_id = db.Column(String())


    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    supply_ability = db.Column(DECIMAL(25,3), default=0) # Khả năng cung cấp
    type_sell_sponsor = db.Column(String()) # số lượng cung cấp thực tế "sell" ,"sponsor"
    quantity = db.Column(DECIMAL(25,3), default=0) # số lượng xuất thực tế 

    price = db.Column(DECIMAL(25,3), default=0) # Đơn giá
    effective_time = db.Column(BigInteger()) # Thời hạn 
    file = db.Column(String()) #file báo giá


class SyntheticRelease(CommonModel):
    __tablename__ = 'synthetic_release'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    details = db.relationship("SyntheticReleaseDetail", order_by="SyntheticReleaseDetail.created_at", cascade="all, delete-orphan")

class SyntheticReleaseDetail(CommonModel):
    __tablename__ = 'synthetic_release_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    date = db.Column(BigInteger())

    synthetic_release_id = db.Column(String(), ForeignKey('synthetic_release.id'), nullable=True)
    synthetic_release = relationship('SyntheticRelease')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    date_export = db.Column(BigInteger())
    quantity  = db.Column(DECIMAL(25,3), default=0)
    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')