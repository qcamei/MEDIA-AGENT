from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()


def init_db(app):
    db.init_app(app)
    ma.init_app(app)

    bcrypt.init_app(app)
    #db.create_all()
    engine = create_engine(app.config.get('SQLALCHEMY_DATABASE_URI'))
    Base.metadata.create_all(engine)

