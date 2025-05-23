from flask import Flask
from flask_cors import CORS
from .config import config
from .routes import api_bp
from .models import init_db
import os
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
    # 注册蓝图
    app.register_blueprint(api_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run()