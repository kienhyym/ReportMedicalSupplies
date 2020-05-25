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
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=default_uuid)
    code = db.Column(String())
    name = db.Column(String())
    image = db.Column(String())
    unit = db.Column(String())
    name_not_tone_mark = db.Column(String())

class ReportOrganization(CommonModel):
    __tablename__ = 'report_organization'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=default_uuid)
    code = db.Column(String())
    period = db.Column(String())
    medical_supplies_id = db.Column(UUID(as_uuid=True), ForeignKey('medical_supplies.id'), nullable=True)
    medical_supplies = relationship('MedicalSupplies')

    organization_id = db.Column(String, ForeignKey('organization.id', onupdate='CASCADE', ondelete='SET NULL'), nullable=True)
    organization = relationship('Organization')
    
    quantity_import = db.Column(DECIMAL(25,3), default=1)
    quantity_export = db.Column(DECIMAL(25,3), default=1)
    quantity_original = db.Column(DECIMAL(25,3), default=1)
