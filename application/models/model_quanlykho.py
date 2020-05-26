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

    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')
    details = db.relationship("ReportOrganizationDetail", order_by="ReportOrganizationDetail.created_at", cascade="all, delete-orphan")

class ReportOrganizationDetail(CommonModel):
    __tablename__ = 'report_organization_detail'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())

    report_organization_id = db.Column(String(), ForeignKey('report_organization.id'), nullable=True)
    report_organization = relationship('ReportOrganization')
    
    organization_id = db.Column(String(), ForeignKey('organization.id'), nullable=True)
    organization = relationship('Organization')

    medical_supplies_id = db.Column(String(), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    quantity_import = db.Column(DECIMAL(25,3), default=0)
    quantity_export = db.Column(DECIMAL(25,3), default=0)
    quantity_original = db.Column(DECIMAL(25,3), default=0)
