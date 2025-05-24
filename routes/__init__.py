from .api import api
from .auth import auth

def init_route(app):
    for blueprint in [api, auth]:
        app.register_blueprint(blueprint)

