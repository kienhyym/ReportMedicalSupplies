# Register Blueprints/Views.
from application.extensions import jinja
def init_views(app):
    import application.controllers.api
    import application.controllers.search
    import application.controllers.admin
    @app.route('/')
    def index(request):
        return jinja.render('index.html',request)
    
