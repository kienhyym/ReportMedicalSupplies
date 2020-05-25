class Config(object):
    DEBUG = True
    STATIC_URL = '/static'
    SQLALCHEMY_DATABASE_URI = 'baocaovattuyteuser:bdsafwrra213ads@127.0.0.1:5432/baocaovattuyte'


    AUTH_LOGIN_ENDPOINT = 'login'
    AUTH_PASSWORD_HASH = 'bcrypt'
    AUTH_PASSWORD_SALT = 'add_salt'
    SESSION_COOKIE_SALT = 'salt_key'
    SECRET_KEY = 'acndefhskrmsdfgs'
    
    SESSION_EXPIRED = 86400 #seconds
    REQUEST_TIMEOUT = 3600
    RESPONSE_TIMEOUT = 3600
    
    DOMAIN_URL = 'https://drlinks.yte360.com'
    
    FS_ROOT= "/Users/namdv/workspace/healthchain/healthchain-api/repo/static/files/uploads/"
    FS_ROOT_FILE= "/Users/namdv/workspace/healthchain/healthchain-api/repo/static/files/uploads/"
    IMAGE_SERVICE_URL = 'https://drlinks.yte360.com/static/images/uploads'
    FILE_SERVICE_URL = '/files/uploads'#lay static_url + FILE_SERVICE_URL + file=file_url

    

    MAIL_SERVER_HOST = 'smtp.gmail.com'
    MAIL_SERVER_PORT = 587
    # MAIL_SERVER_USER = 'cskh@nch.org.vn'
    # MAIL_SERVER_PASSWORD = 'Ybadientunhitw'
    MAIL_SERVER_USER = 'cskh@yte360.com'
    MAIL_SERVER_PASSWORD = '123456?aD'
    MAIL_SERVER_USE_TLS = False
    MAIL_SERVER_USE_SSL = True

    FIREBASE_SERVER_KEY = "AIzaSyCQoboEqq9D62t4QYL6ycT_QP9fHwhXcr0"
