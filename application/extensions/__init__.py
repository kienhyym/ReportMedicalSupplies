from .useragent import GatcoUserAgent
from gatco_auth import Auth
from gatco_restapi import APIManager
from gatco_acl.acl import ACL 
from .jinja import Jinja
from .jwt import JWT
from application.database import db

from gatco_acl.constants import FULL, ALL


auth = Auth()
apimanager = APIManager()
jinja = Jinja()
racl = ACL()
jwt = JWT()


def init_extensions(app):
    GatcoUserAgent.init_app(app)
    auth.init_app(app)
    #sqlalchemy or motor
    #with scoped_session() as session:
    apimanager.init_app(app, sqlalchemy_db=db)
    jinja.init_app(app,pkg_name='application')
    racl.init_app(app)
    jwt.init_app(app)
    
    @racl.user_loader
    def acl_user_loader(request):
        #user = auth.current_user(request)
        #print(user)
        #print("acl_user_loader", user)
        user = None
        return user
        
    @racl.authorization_method
    def acl_authorization_method(user, they):
        they.can(FULL, "Cart")
        they.cannot("UPDATE", 'Page')
        
        def if_author(page):
            return page.author == "ABC"

        they.can("EDIT", 'Page', if_author)
        they.can("DELETE", 'Page', lambda a: a.author == "CDE")
    
    