from flask import Flask
from flask_cors import CORS
from config import Config
from routes import api_bp
from models import init_db

import os

# 在 app.py 中添加创建目录的逻辑
DATABASE_DIR = 'migrations'
if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)
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

    app.config.from_object(Config)


    # 初始化扩展
    with app.app_context():
        init_db(app)
    CORS(app)
    # 注册蓝图
    app.register_blueprint(api_bp)

    return app


app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)