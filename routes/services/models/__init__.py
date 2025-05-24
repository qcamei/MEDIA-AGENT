import os
from pathlib import Path

from .conversation import Conversation
from .idempotency_key import IdempotencyKey
from .interaction import Interaction
from .transaction import Transaction
from .user import User
from .common import *

def init_db(app):


    db.init_app(app)
    ma.init_app(app)
    bcrypt.init_app(app)
    with app.app_context():
        db.create_all()


