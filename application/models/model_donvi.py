# from sqlalchemy import (
#     Column, String, Integer,SmallInteger, DateTime, Date, Boolean, DECIMAL, Text, ForeignKey, UniqueConstraint, JSON
# )
# from sqlalchemy.orm import relationship, backref
# from sqlalchemy.orm.collections import attribute_mapped_collection

# from sqlalchemy.orm import *
# from sqlalchemy.dialects.postgresql import UUID
# from application.database import db
# from application.database.model import CommonModel
# import uuid

# def default_uuid():
#     return str(uuid.uuid4())
    
    
# class DonVi(CommonModel):
#     __tablename__ = 'donvi'
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     ma = db.Column(String(255), nullable=True)
#     ten = db.Column(String(255), nullable=False)
#     sodienthoai = db.Column(String(63))
#     diachi = db.Column(String(255))
#     email = db.Column(String(255))
#     ghichu = db.Column(String(255))
#     xaphuong_id = db.Column(String, ForeignKey('xaphuong.id'), nullable=True)
#     xaphuong = relationship('XaPhuong') 
#     quanhuyen_id = db.Column(String, ForeignKey('quanhuyen.id'), nullable=True)
#     quanhuyen = relationship('QuanHuyen')  
#     tinhthanh_id = db.Column(String, ForeignKey('tinhthanh.id'), nullable=True)
#     tinhthanh = relationship('TinhThanh', viewonly=True)
#     quocgia_id = db.Column(String, ForeignKey('quocgia.id'), nullable=True)
#     quocgia = relationship('QuocGia')
#     tuyendonvi_id = db.Column(String, ForeignKey('tuyendonvi.id'), nullable=True)
#     tuyendonvi = relationship('TuyenDonVi')
#     coquanchuquan = db.Column(String(255))
#     parent_id = db.Column(String, ForeignKey('donvi.id'), nullable=True)
#     active = db.Column(Boolean(), default=False)
#     users = relationship('UserDonvi', viewonly=True)
#     children = relationship("DonVi",
#         # cascade deletions
#         cascade="all, delete-orphan",
#         # many to one + adjacency list - remote_side
#         # is required to reference the 'id'
#         # column in the join condition.
#         backref=backref("captren", remote_side=id),
#         # children will be represented as a dictionary
#         # on the "id" attribute.
#         collection_class=attribute_mapped_collection('id'),
#     )

#     def __repr__(self):
#         return "DonVi(id=%r, ten=%r, parent_id=%r, tuyendonvi_id=%r)" % (
#                     self.id,
#                     self.ten,
#                     self.parent_id,
#                     self.tuyendonvi_id
#                 )
#     def __todict__(self):
#         return {"id":str(self.id), "ma": self.ma,"text": self.ten,"ten": self.ten, "parent_id": str(self.parent_id), "tuyendonvi_id":str(self.tuyendonvi_id)}

#     def __toid__(self):
#         return self.id

#     def dump(self, _indent=0):
#         obj = self.__todict__()
#         obj["nodes"] = [c.dump() for c in self.children.values()]
#         return obj

#     def get_children_ids(self, data):
#         if type(data) is list:
#             data.append(self.id)
#             for r in self.children.values():
#                 r.get_children_ids(data)

#     def getlistid(self):
#         data = []
#         self.get_children_ids(data)
#         return data

# class UserDonvi(CommonModel):
#     __tablename__ = 'user_donvi'
#     id = db.Column(String, primary_key=True, default=default_uuid)
#     uid = db.Column(String(200), index=True, nullable=False)
#     ten = db.Column(String(255), nullable=False)
#     mayte = db.Column(String(200), nullable=True)
#     donvi_id = db.Column(String, ForeignKey('donvi.id'), index=True, nullable=False)
#     donvi = relationship('DonVi')
#     __table_args__ = (UniqueConstraint('uid','donvi_id', name='uq_user_donvi_uid_donvi_id'),)


    