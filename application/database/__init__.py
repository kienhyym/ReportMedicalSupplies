from gatco_sqlalchemy import SQLAlchemy
# import ledis
# redisdb = ledis.Ledis(host='localhost', port=6380, db=0)
import redis
redisdb = redis.StrictRedis(host='localhost', port=6379, db=5)

db = SQLAlchemy()

def init_database(app):
    db.init_app(app)