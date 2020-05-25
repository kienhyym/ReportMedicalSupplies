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
    
    
class QuocGia(CommonModel):
    __tablename__ = 'quocgia'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    active = db.Column(SmallInteger(), default=0) 

class TinhThanh(CommonModel):
    __tablename__ = 'tinhthanh'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    quocgia_id = db.Column(String, ForeignKey('quocgia.id', ondelete='SET NULL'), nullable=True)
    quocgia = relationship('QuocGia')
    quanhuyen = db.relationship("QuanHuyen", order_by="QuanHuyen.id", cascade="all, delete-orphan")
    active = db.Column(SmallInteger(), default=0) 

class QuanHuyen(CommonModel):
    __tablename__ = 'quanhuyen'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id', ondelete='SET NULL'), nullable=True)
    tinhthanh = relationship('TinhThanh')
    xaphuong = db.relationship("XaPhuong", order_by="XaPhuong.id")
    active = db.Column(SmallInteger(), default=0) 
    
class XaPhuong(CommonModel):
    __tablename__ = 'xaphuong'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id', ondelete='SET NULL'), nullable=True)
    quanhuyen = relationship('QuanHuyen')  
    thonxom = db.relationship("ThonXom", order_by="ThonXom.id", cascade="all, delete-orphan")
    active = db.Column(SmallInteger(), default=0) 
    
class ThonXom(CommonModel):
    __tablename__ = 'thonxom'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id', ondelete='SET NULL'), nullable=True)
    xaphuong = relationship('XaPhuong') 
    active = db.Column(SmallInteger(), default=0) 

class TuyenDonVi(CommonModel):
    __tablename__ = 'tuyendonvi'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    mota = db.Column(String(255))
    tenkhongdau = db.Column(String)
    active = db.Column(SmallInteger(), default=0) 
    
class DanToc(CommonModel):
    __tablename__ = 'dantoc'
    id = db.Column(String, primary_key=True, default=default_uuid)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    active = db.Column(SmallInteger(), default=0) 
    

    
Index('quocgia_uq_ma', QuocGia.ma, unique=True, postgresql_where=(and_(QuocGia.ma.isnot(None),QuocGia.ma !='')))
Index('tinhthanh_uq_ma', TinhThanh.ma, unique=True, postgresql_where=(and_(TinhThanh.ma.isnot(None),TinhThanh.ma !='')))
Index('quanhuyen_uq_ma', QuanHuyen.ma, unique=True, postgresql_where=(and_(QuanHuyen.ma.isnot(None),QuanHuyen.ma !='')))
Index('xaphuong_uq_ma', XaPhuong.ma, unique=True, postgresql_where=(and_(XaPhuong.ma.isnot(None),XaPhuong.ma !='')))
Index('thonxom_uq_ma', ThonXom.ma, unique=True, postgresql_where=(and_(ThonXom.ma.isnot(None),ThonXom.ma !='')))
Index('dantoc_uq_ma', DanToc.ma, unique=True, postgresql_where=(and_(DanToc.ma.isnot(None),DanToc.ma !='')))




    