import os
from .server import app


def run_app(host="127.0.0.1", port=10008, debug=False, mode='production'):
    """ Function for bootstrapping gatco app. """
    
    if mode == 'development':
        print('Run develop')
        from .config.development import Config
        app.config.from_object(Config)
        
        static_endpoint = app.config.get("STATIC_URL", None)
        if (static_endpoint is not None) and not ((static_endpoint.startswith( 'http://' ) or (static_endpoint.startswith( 'https://' )))):
            app.static(static_endpoint, './static')
    elif mode == 'production':
        print('Run product')
        from .config.production import Config
        app.config.from_object(Config)

        static_endpoint = app.config.get("STATIC_URL", None)
        if (static_endpoint is not None) and not ((static_endpoint.startswith( 'http://' ) or (static_endpoint.startswith( 'https://' )))):
            app.static(static_endpoint, './static')
    elif mode == 'stagging':
        print('Run stagging')
        from .config.stagging import Config
        app.config.from_object(Config)
    else:
        print("require mode production or development")
        
    # from application.database import init_database
    # from application.extensions import init_extensions
    # from application.controllers import init_controllers

    # init_database(app)
    # init_extensions(app)
    # init_controllers(app)

    app.run(host=host, port=port, debug=debug, workers=os.cpu_count())
