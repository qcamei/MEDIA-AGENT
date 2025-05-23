from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_bcrypt import Bcrypt
db = SQLAlchemy()
ma = Marshmallow()
bcrypt = Bcrypt()

def init_db(app):
    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
