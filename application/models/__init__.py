import uuid

from sqlalchemy.ext.declarative import declarative_base

from sqlalchemy import (
    Column, String, Integer,
    DateTime, Date, Boolean,
    event, func
)

Base = declarative_base()

def default_etag():
    return str(uuid.uuid1())

def model_oncreate_listener(mapper, connection, instance):
    instance._created_at = func.now()
    instance._updated_at = func.now()
    
def model_onupdate_listener(mapper, connection, instance):
    instance._created_at = instance._created_at
    instance._updated_at = func.now()
    if instance._deleted is True:
        instance._deleted_at = func.now()
        
def adjacency_model_oncreate_listener(mapper, connection, instance):
    #print "adjacency_model_oncreate_listener"
    
    pass
    
def adjacency_model_onupdate_listener(mapper, connection, instance):
    #print "adjacency_model_onupdate_listener"
    #phai biet cap tren cua model la gi?
    children = instance.children_ids()
    if( instance.parent_id in children):
        pass
        #raise ProcessingException(description=u'Parent node is not correct',code=401)


def adjacency_model_ondelete_listener(mapper, connection, instance):
    #print "adjacency_model_onupdate_listener"
    children = instance.children_ids()
    if len(children) > 1:
        pass
        #raise ProcessingException(description=u'Can not delete non empty adjacency model',code=401)

class CommonModel(Base):
    __abstract__ = True
    _created_at = Column(DateTime)
    _updated_at = Column(DateTime)
    _deleted = Column(Boolean, default=False)
    _deleted_at = Column(DateTime)
    _etag = Column(String(40), index=True, unique=True, default=default_etag)

event.listen(CommonModel, 'before_insert', model_oncreate_listener, propagate=True)
event.listen(CommonModel, 'before_update', model_onupdate_listener, propagate=True)


class CommonAdjacencyModel(CommonModel):
    __abstract__ = True
    def __todict__(self):
        return {"id":self.id}
    
    def dump(self, _indent=0):
        obj = self.__todict__()
        obj["children"] = [c.dump() for c in self.children.values()]
        return obj
    
    def _children_ids(self, data):
        if type(data) is list:
            data.append(self.id)
            for r in self.children.values():
                r._children_ids(data)
    
    def children_ids(self):
        data = []
        self._children_ids(data)
        return data
    
    
event.listen(CommonAdjacencyModel, 'before_insert', adjacency_model_oncreate_listener, propagate=True)
event.listen(CommonAdjacencyModel, 'before_update', adjacency_model_onupdate_listener, propagate=True)
event.listen(CommonAdjacencyModel, 'before_delete', adjacency_model_ondelete_listener, propagate=True)