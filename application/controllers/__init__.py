# Register Blueprints/Views.
# from application.extensions import jinja
# from .imageupload import imageupload
from application.models.models import *
from application.models.model_donvi import *
from application.models.model_danhmuc import *
from application.models.model_file import *


def init_controllers(app):

    import application.controllers.user.forgot_password
    import application.controllers.user.userview
    import application.controllers.upload
    import application.controllers.donvi_api
    import application.controllers.danhmuc_api
    import application.controllers.notify
    # import application.controllers.post_api
    # import application.controllers.medicine
    
    
    
    
#     app.blueprint(imageupload)

#     static_endpoint = app.config.get("STATIC_URL", None)
#     if (static_endpoint is not None) and not ((static_endpoint.startswith( 'http://' ) or (static_endpoint.startswith( 'https://' )))):
#         app.static(static_endpoint, './static')
    
