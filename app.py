import os
from pathlib import Path
from flask import Flask
from flask_cors import CORS
from .config import Config
from .routes.services.models import init_db
from .routes import init_route
from .routes.services import init_service

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(Config)
    path_obj = Path(os.path.dirname(__file__))
    linux_path = str(path_obj.as_posix())

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + linux_path + app.config.get('SQLALCHEMY_DATABASE_URI')
    print(app.config.get('SQLALCHEMY_DATABASE_URI'))
    init_db(app)
    init_service(app)
    init_route(app)

    CORS(app)

    return app

app = create_app()


if __name__ == '__main__':
    app.run(debug=True)