from flask import Flask
from flask_cors import CORS
from .config import config
from .routes import api_bp
from .models import init_db
from .utils import rate_limit
from backend.services import MediaGeneratorService
from backend.services.storage_service import StorageService
from backend.services.transaction_service import TransactionService
import os
from flask import Blueprint
DLLS_DIR ="C:\\Program Files (x86)\\GtkSharp\\2.12\\bin\\"
# Python <= 3.7 | Python >= 3.10
os.environ["PATH"] = DLLS_DIR + ";" + os.environ["PATH"]
# Python >= 3.8 & Python <= 3.9
os.add_dll_directory(DLLS_DIR)

# 测试加载是否成功:
import ctypes.util
print(ctypes.util.find_library('libcario-2'))

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # 初始化扩展
    init_db(app)
    CORS(app)
    rate_limit(app)

    app.media_service = MediaGeneratorService(config)
    app.storage_service = StorageService(config)
    app.transaction_service = TransactionService()
    # 注册蓝图
    app.register_blueprint(api_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run()