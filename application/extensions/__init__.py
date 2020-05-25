from .useragent import GatcoUserAgent
from gatco_auth import Auth
from gatco_restapi import APIManager
from .jinja import Jinja
from application.database import db
import asyncio

auth = Auth()
apimanager = APIManager()
jinja = Jinja()


def init_extensions(app):
    GatcoUserAgent.init_app(app)
    auth.init_app(app)
    apimanager.init_app(app, sqlalchemy_db=db)
    jinja.init_app(app)