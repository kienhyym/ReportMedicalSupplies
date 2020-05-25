from sqlalchemy import (
    Column, String, Integer,SmallInteger, BigInteger,DateTime, Date, Boolean, DECIMAL, Text, ForeignKey, UniqueConstraint, JSON
)
from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import attribute_mapped_collection

from sqlalchemy.orm import *
from sqlalchemy.dialects.postgresql import UUID, JSONB
from application.database import db
from application.database.model import CommonModel
import uuid

def default_uuid():
    return str(uuid.uuid4())
    
     
class FileInfo(CommonModel):
    __tablename__ = 'fileinfo'
    id = db.Column(String, primary_key=True)
    sha256 = db.Column(String, index=True, nullable=False)
    user_id = db.Column(String(), index=True, nullable=False) #user id
    name = db.Column(String, nullable=True)
    extname = db.Column(String, nullable=True)
    link = db.Column(String, nullable=True)
    description = db.Column(String, nullable=True)
    attrs = db.Column(JSONB())
    size = db.Column(BigInteger())
    kind = db.Column(String, nullable=True) #fileserver, or normal
    





    