from flask import request, jsonify
from functools import wraps

from .models import IdempotencyKey, db


def idempotency_check(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        idempotency_key = request.headers.get('X-Idempotency-Key')

        if not idempotency_key:
            return jsonify({'error': 'Idempotency key is required'}), 400

        # 检查幂等性键是否已存在
        existing_key = IdempotencyKey.query.filter_by(key=idempotency_key).first()

        if existing_key:
            # 如果请求已处理，返回之前的结果
            if existing_key.response_data:
                return jsonify(existing_key.response_data), existing_key.status_code
            else:
                # 请求正在处理中
                return jsonify({'error': 'Request is already being processed'}), 409

        # 创建新的幂等性键记录
        new_key = IdempotencyKey(
            key=idempotency_key,
            request_data=request.get_json(),
            status='pending'
        )
        db.session.add(new_key)
        db.session.commit()

        try:
            # 处理请求
            response = f(*args, **kwargs)

            # 保存响应
            new_key.status = 'completed'
            new_key.response_data = response.get_json()
            new_key.status_code = response.status_code
            db.session.commit()

            return response

        except Exception as e:
            # 处理异常
            new_key.status = 'failed'
            new_key.error_message = str(e)
            db.session.commit()

            raise

    return decorated_function