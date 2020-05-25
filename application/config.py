class Config(object):
    DEBUG = True
#     SQLALCHEMY_URL = 'sqlite:///database.db'
#     DEBUG = False
    STATIC_URL = '/static'

    SQLALCHEMY_DATABASE_URI = 'postgresql://baocaovattuyteuser:1s23sdfswczskiendn6@127.0.0.1:5432/baocaovattuyte'
    AUTH_LOGIN_ENDPOINT = 'login'
    AUTH_PASSWORD_HASH = 'bcrypt'
    AUTH_PASSWORD_SALT = 'add_salt'
    SESSION_COOKIE_SALT = 'salt_key'
    SECRET_KEY = 'acndefhskrmsdfgs'
    
    SOMEVABE_URL = 'https://somevabe.com'
    
    SESSION_EXPIRE_TIME = 86400
    USER_FORGOT_PASSWORD_EXPIRATION_DELTA = 86400
    FS_ROOT= "/usr/share/nginx/html/uploadimages/"


    URL_APPLE_STORE = 'https://itunes.apple.com/us/app/somevabe/id1258218759'
    URL_GOOGLE_STORE = 'https://play.google.com/store/apps/details?id=com.somevabe.apps'#'https://play.google.com/store/apps/details?id=com.somevabe.mobile'
    APPLE_VERSION = 2.9
    GOOGLE_VERSION = 3.4
