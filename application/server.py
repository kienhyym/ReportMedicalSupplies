""" App entry point. """

from gatco import Gatco
from gatco.sessions import CookieSessionInterface
from sanic_cors import CORS, cross_origin
# from .config import Config

from .config.production import Config

import firebase_admin
from firebase_admin import credentials




app = Gatco(name=__name__)
app.session_interface = CookieSessionInterface()
CORS(app, automatic_options=True)
app.config.from_object(Config)


from application.database import init_database
from application.extensions import init_extensions
from application.controllers import init_controllers

init_database(app)
init_extensions(app)
init_controllers(app)


# cred = credentials.Certificate("./application/config/drlinks-60439-7dd5cd02649d.json")
# firebase_admin.initialize_app(cred)
# default_app = firebase_admin.initialize_app()
