from gatco_sqlalchemy import SQLAlchemy
import redis
# from gatco_couchdb import CouchDB

# couchdb = CouchDB()
# mdb_migrate = Motor()

db = SQLAlchemy()
redisdb = redis.StrictRedis(host='localhost', port=6379, db=7)


def init_database(app):
    db.init_app(app)
    # mdb.init_app(app)
    # couchdb.init_app(app)
#     mdb_migrate.init_app(app, uri="mongodb://vpsuser:18nsa18dsua1as@103.74.120.75/mevabe")