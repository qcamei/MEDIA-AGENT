from flask import request, jsonify, current_app
from functools import wraps
import time


def rate_limit(f):
    # 存储用户请求记录
    request_history = {}

    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 获取用户IP或认证信息作为标识符
        if request.headers.get('Authorization'):
            # 已认证用户使用用户ID
            user_id = "authenticated_user"  # 实际应用中应从JWT获取用户ID
        else:
            # 未认证用户使用IP地址
            user_id = request.remote_addr

        # 获取当前时间和配置
        current_time = time.time()
        rate_limit = current_app.config['RATE_LIMIT']
        rate_window = current_app.config['RATE_WINDOW']

        # 初始化用户请求历史
        if user_id not in request_history:
            request_history[user_id] = []

        # 移除窗口外的请求记录
        request_history[user_id] = [t for t in request_history[user_id] if current_time - t <= rate_window]

        # 检查请求频率
        if len(request_history[user_id]) >= rate_limit:
            remaining_time = rate_window - (current_time - request_history[user_id][0])
            return jsonify({
                'error': 'Too many requests',
                'retry_after': remaining_time
            }), 429

        # 记录当前请求
        request_history[user_id].append(current_time)

        return f(*args, **kwargs)

    return decorated_function