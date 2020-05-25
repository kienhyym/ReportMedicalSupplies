""" Module represents a User. """

from sqlalchemy import (
    func, Column, Table, String, Integer, SmallInteger,BigInteger,
    DateTime, Date, Boolean, Float,
    Index, ForeignKey,UniqueConstraint, event, __version__
)
from sqlalchemy import or_,and_

from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import attribute_mapped_collection


import uuid
from datetime import datetime

from gatco_restapi import ProcessingException
from application.database import db
from application.database.model import CommonModel, default_uuid
from sqlalchemy.dialects.postgresql import UUID, JSONB
from application.models.model_danhmuc import QuocGia, TinhThanh, QuanHuyen, XaPhuong, ThonXom


def default_uuid():
    return str(uuid.uuid4())




# Database define

roles_users = db.Table('roles_users',
                       db.Column('user_id', String(), db.ForeignKey('user.id')),
                       db.Column('role_id', String(), db.ForeignKey('role.id')))


class User(CommonModel):
    __tablename__ = 'user'
    id = db.Column(String, primary_key=True,default=default_uuid)
    name = db.Column(String())
    unsigned_name = db.Column(String())
    email = db.Column(String(255), unique=True)
    phone = db.Column(String(), unique=True)
    password = db.Column(String(255))
    accountName  = db.Column(String(255))
    salt = db.Column(String())

    active = db.Column(SmallInteger(), default=0) 
    #0- chua active, 1- active
    # confirmed_at = db.Column(DateTime())
    # type_confirm = db.Column(SmallInteger())
    #0 - email, 1- sms
    roles = relationship("Role", secondary=roles_users)
    
    organization_id = db.Column(String, ForeignKey('organization.id', onupdate='CASCADE', ondelete='SET NULL'), nullable=True)
    Organization = relationship('Organization')
    
    # Methods
    def __repr__(self):
        """ Show user object info. """
        return '<User: {}>'.format(self.id)


    def has_role(self, role):
        if isinstance(role, str):
            return role in (role.name for role in self.roles)
        else:
            return role in self.roles
        

class Role(CommonModel):
    __tablename__ = 'role'
    id = db.Column(String(), primary_key=True,default=default_uuid)
    name = db.Column(String(80), unique=True)
    description = db.Column(String(255))

class Organization(CommonModel):
    __tablename__ = 'organization'
    id = db.Column(String, primary_key=True,default=default_uuid)
    code = db.Column(String(255), nullable=True)
    name = db.Column(String(), nullable=False)
    unsigned_name = db.Column(String())
    phone = db.Column(String(63))
    address = db.Column(String())
    email = db.Column(String(255))
    description = db.Column(String())
    tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True)
    tinhthanh = relationship('TinhThanh', viewonly=True)
    quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True)
    quanhuyen = relationship('QuanHuyen')  
    xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True)
    xaphuong = relationship('XaPhuong')    
    level = db.Column(SmallInteger, nullable=False) # Trạm y tế, bệnh viện ...
    parent_name = db.Column(String(255))
    parent_id = db.Column(String, ForeignKey('organization.id'), nullable=True)
    users = relationship('User', viewonly=True)
    active = db.Column(SmallInteger(), default=0) 
    type_donvi = db.Column(String(255))
    children = relationship("Organization",
        # cascade deletions
        cascade="all, delete-orphan",
        # many to one + adjacency list - remote_side
        # is required to reference the 'id'
        # column in the join condition.
        backref=backref("captren", remote_side=id),
        # children will be represented as a dictionary
        # on the "id" attribute.
        collection_class=attribute_mapped_collection('id'),
    )

    def __repr__(self):
        return "Organization(id=%r, name=%r, parent_id=%r, level=%r)" % (
                    self.id,
                    self.name,
                    self.parent_id,
                    self.level
                )
    def __todict__(self):
        return {"id":self.id, "code": self.code,"name": self.name , "parent_id": self.parent_id, "level":self.level}

    def __toid__(self):
        return self.id

    def dump(self, _indent=0):
        obj = self.__todict__()
        #obj["tuyendonvi"] = to_dict(self.tuyendonvi)
        obj["nodes"] = [c.dump() for c in self.children.values()]
        return obj

    def get_children_ids(self, data):
        if type(data) is list:
            data.append(self.id)
            for r in self.children.values():
                r.get_children_ids(data)

    def getlistid(self):
        data = []
        self.get_children_ids(data)
        return data
    

class Notify(CommonModel):
    __tablename__ = 'notify'
    id = db.Column(String, primary_key=True, default=default_uuid)
    title = db.Column(String, index=True)
    content = db.Column(String)
    type = db.Column(String(20))  # text/image/video
    url = db.Column(String)
    iteminfo = db.Column(JSONB())
    notify_condition = db.Column(JSONB())
    
class NotifyUser(CommonModel):
    __tablename__ = 'notify_user'
    id = db.Column(String, primary_key=True, default=default_uuid)
    user_id = db.Column(String)
    notify_id = db.Column(String, ForeignKey('notify.id'), nullable=True)
    notify = db.relationship('Notify')
    notify_at = db.Column(BigInteger())
    read_at = db.Column(BigInteger())

Index('user_uq_phone', User.phone, unique=True, postgresql_where=(and_(User.phone.isnot(None),User.phone !='')))