""" Module represents a User. """

from sqlalchemy import (
    func, Column, Table, String, Integer, SmallInteger, BigInteger,
    DateTime, Date, Boolean, Float, JSON, Index,
    UniqueConstraint, ForeignKey, event, __version__
)
import uuid
from sqlalchemy import or_,and_

from sqlalchemy.orm import relationship, backref
from sqlalchemy.orm.collections import attribute_mapped_collection

from application.database import db
from application.database.model import CommonModel
from sqlalchemy.dialects.postgresql import UUID

def default_uuid():
    return str(uuid.uuid4())
roles_users = db.Table('roles_users',
                       db.Column('user_id', String, db.ForeignKey('user.id', ondelete='cascade'), primary_key=True),
                       db.Column('role_id', String(), db.ForeignKey('role.id', onupdate='cascade'), primary_key=True))


class Role(CommonModel):
    __tablename__ = 'role'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String())

class User(CommonModel):
    __tablename__ = 'user'
    id = db.Column(String, primary_key=True)
    fullname = db.Column(String, nullable=True)
    phone_number = db.Column(String(20), index=True, nullable=True)#+084099823928
    phone_country_prefix = db.Column(String(10), index=True, nullable=True)#+84
    phone_national_number = db.Column(String(15), index=True, nullable=True)#0987654321
    id_card = db.Column(String(50), nullable=True)#macongdan
    email = db.Column(String, nullable=True)
    password = db.Column(String, nullable=True)
    salt = db.Column(String, nullable=True)
    active = db.Column(Boolean(), default=True)
    
    macanboyte = db.Column(String, index=True)
    ngaysinh = db.Column(BigInteger())
    gioitinh = db.Column(String, nullable=True)
    dantoc_id = db.Column(String(255), ForeignKey('dantoc.id'), nullable=True)
    dantoc = relationship('DanToc')
    matrinhdochuyenmon = db.Column(String, nullable=True)
    tentrinhdochuyenmon = db.Column(String, nullable=True)
    machucvu = db.Column(String, nullable=True)
    tenchucvu = db.Column(String, nullable=True)
    diachi = db.Column(String, nullable=True)
    xaphuong_id = db.Column(String(255), ForeignKey('xaphuong.id'), nullable=True)
    xaphuong = relationship('XaPhuong') 
    quanhuyen_id = db.Column(String(255), ForeignKey('quanhuyen.id'), nullable=True)
    quanhuyen = relationship('QuanHuyen')  
    tinhthanh_id = db.Column(String(255), ForeignKey('tinhthanh.id'), nullable=True)
    tinhthanh = relationship('TinhThanh', viewonly=True)
    quocgia_id = db.Column(String(255), ForeignKey('quocgia.id'), nullable=True)
    quocgia = relationship('QuocGia')
    noicongtac = db.Column(String, nullable=True)
    sochungchi = db.Column(String, nullable=True)
    thoihanchungchi = db.Column(BigInteger(), nullable=True)
    ghichu = db.Column(String, nullable=True)
    madonvi_bmte = db.Column(String, index=True,nullable=True)
    donvi_id = db.Column(String(), ForeignKey('donvi.id'), nullable=True)
    donvi = relationship('DonVi')
    roles = db.relationship('Role', secondary=roles_users, cascade="save-update")
    tenkhongdau = db.Column(String)
    def has_role(self, role):
        if isinstance(role, str):
            return role in (role.name for role in self.roles)
        else:
            return role in self.roles
    
#     __table_args__ = (UniqueConstraint('phone_country_prefix','phone_national_number', name='uq_user_phone_country_prefix_phone_national_number'),)
Index('user_uq_phone_number', User.phone_number, unique=True, postgresql_where=(and_(User.phone_number.isnot(None),User.phone_number!='')))
Index('user_uq_id_card', User.id_card, unique=True, postgresql_where=(and_(User.id_card.isnot(None),User.id_card!='')))
Index('user_uq_email', User.email, unique=True, postgresql_where=(and_(User.email.isnot(None),User.email!='')))
 
 
class DonViDangKi(CommonModel):
    __tablename__ = 'dangkidonvi'
    id = db.Column(String(), primary_key=True, default=default_uuid)
    fullname = db.Column(db.String(255))
    email = db.Column(db.String(255))
    password = db.Column(db.String(255))
    cfpassword = db.Column(db.String(255))
    phone = db.Column(db.String(255))
    macongdan = db.Column(String(200))
    ########
    donvi_sodienthoai = db.Column(db.String())
    ma = db.Column(String(255), nullable=True)
    donvi_email = db.Column(String(255))
    donvi_diachi = db.Column(db.String())
    donvi_ten = db.Column(db.String())
    donvi_tuyendonvi_id = db.Column(String(), db.ForeignKey('tuyendonvi.id', onupdate="SET NULL"), nullable=True)
    donvi_tuyendonvi = db.relationship('TuyenDonVi')
    xaphuong_id = db.Column(String(), ForeignKey('xaphuong.id'), nullable=True)
    xaphuong = db.relationship('XaPhuong') 
    quanhuyen_id = db.Column(String(), ForeignKey('quanhuyen.id'), nullable=True)
    quanhuyen = db.relationship('QuanHuyen')  
    tinhthanh_id = db.Column(String(), ForeignKey('tinhthanh.id'), nullable=True)
    tinhthanh = db.relationship('TinhThanh', viewonly=True)
    quocgia_id = db.Column(String(), ForeignKey('quocgia.id'), nullable=True)
    quocgia = db.relationship('QuocGia')
    captren_id = db.Column(String(), db.ForeignKey('donvi.id', onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    captren = db.relationship('DonVi', foreign_keys=[captren_id], viewonly=True)
    trangthai = db.Column(db.SmallInteger ,default=2)
    active = db.Column(Boolean(), default=False)
    ghichu = db.Column(String())
    tenkhongdau = db.Column(String)



class DonVi(CommonModel):
    __tablename__ = 'donvi'
    # id = db.Column(String(), primary_key=True, default=default_uuid)
    id = db.Column(String(), primary_key=True)
    ma = db.Column(String(255), nullable=True)
    ten = db.Column(String(255), nullable=False)
    sodienthoai = db.Column(String(63))
    diachi = db.Column(String(255))
    email = db.Column(String(255))
    ghichu = db.Column(String(255))
    xaphuong_id = db.Column(String(255), ForeignKey('xaphuong.id'), nullable=True)
    xaphuong = relationship('XaPhuong') 
    quanhuyen_id = db.Column(String(255), ForeignKey('quanhuyen.id'), nullable=True)
    quanhuyen = relationship('QuanHuyen')  
    tinhthanh_id = db.Column(String(255), ForeignKey('tinhthanh.id'), nullable=True)
    tinhthanh = relationship('TinhThanh', viewonly=True)
    quocgia_id = db.Column(String(255), ForeignKey('quocgia.id'), nullable=True)
    quocgia = relationship('QuocGia')
    tuyendonvi_id = db.Column(String(255), ForeignKey('tuyendonvi.id'), nullable=True)
    tuyendonvi = relationship('TuyenDonVi')
    coquanchuquan = db.Column(String)
    appkey = db.Column(String)
    captren_id = db.Column(String(), ForeignKey('donvi.id'), nullable=True)
    tenkhongdau = db.Column(String)
    active = db.Column(Boolean(), default=False)
    madonvi_bmte = db.Column(String, index=True,nullable=True)
    users = relationship('User', viewonly=True)
    children = relationship("DonVi",
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
        return "DonVi(id=%r, ten=%r, captren_id=%r, tuyendonvi_id=%r)" % (
                    self.id,
                    self.ten,
                    self.captren_id,
                    self.tuyendonvi_id
                )
    def __todict__(self):
        return {"id":str(self.id), "ma": self.ma,"text": self.ten,"ten": self.ten, "captren_id": str(self.captren_id), "tuyendonvi_id":str(self.tuyendonvi_id)}

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
    
class QuocGia(CommonModel):
    __tablename__ = 'quocgia'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)

class TinhThanh(CommonModel):
    __tablename__ = 'tinhthanh'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    quocgia_id = db.Column(String(255), ForeignKey('quocgia.id', ondelete='SET NULL'), nullable=True)
    quocgia = relationship('QuocGia')
    quanhuyen = db.relationship("QuanHuyen", order_by="QuanHuyen.id", cascade="all, delete-orphan")
    tenkhongdau = db.Column(String)

class QuanHuyen(CommonModel):
    __tablename__ = 'quanhuyen'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tinhthanh_id = db.Column(String(255), ForeignKey('tinhthanh.id', ondelete='SET NULL'), nullable=True)
    tinhthanh = relationship('TinhThanh')
    xaphuong = db.relationship("XaPhuong", order_by="XaPhuong.id")
    tenkhongdau = db.Column(String)
    
class XaPhuong(CommonModel):
    __tablename__ = 'xaphuong'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    quanhuyen_id = db.Column(String(255), ForeignKey('quanhuyen.id', ondelete='SET NULL'), nullable=True)
    quanhuyen = relationship('QuanHuyen')  
    thonxom = db.relationship("ThonXom", order_by="ThonXom.id", cascade="all, delete-orphan")
    
class ThonXom(CommonModel):
    __tablename__ = 'thonxom'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
    xaphuong_id = db.Column(String(255), ForeignKey('xaphuong.id', ondelete='SET NULL'), nullable=True)
    xaphuong = relationship('XaPhuong') 
    
    
class TuyenDonVi(CommonModel):
    __tablename__ = 'tuyendonvi'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    mota = db.Column(String(255))
    tenkhongdau = db.Column(String)
    
class DanToc(CommonModel):
    __tablename__ = 'dantoc'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)
 
class TrinhDoHocVan(CommonModel):
    __tablename__ = 'trinhdohocvan'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    tenkhongdau = db.Column(String)

class NgheNghiep(CommonModel):
    __tablename__ = 'nghenghiep'
    id = db.Column(String(255), primary_key=True)
    ma = db.Column(String(255), index=True)
    ten = db.Column(String(255))
    mota = db.Column(String(255))
    tenkhongdau = db.Column(String)
    
Index('quocgia_uq_ma', QuocGia.ma, unique=True, postgresql_where=(and_(QuocGia.ma.isnot(None),QuocGia.ma !='')))
Index('tinhthanh_uq_ma', TinhThanh.ma, unique=True, postgresql_where=(and_(TinhThanh.ma.isnot(None),TinhThanh.ma !='')))
Index('quanhuyen_uq_ma', QuanHuyen.ma, unique=True, postgresql_where=(and_(QuanHuyen.ma.isnot(None),QuanHuyen.ma !='')))
Index('xaphuong_uq_ma', XaPhuong.ma, unique=True, postgresql_where=(and_(XaPhuong.ma.isnot(None),XaPhuong.ma !='')))
