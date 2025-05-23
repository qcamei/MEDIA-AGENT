import jwt
from datetime import datetime, timedelta
from flask import current_app, request
from functools import wraps
from backend.models import User
from typing import Optional


def generate_token(user_id: int, expires_in: int = 3600) -> str:
    """生成JWT令牌"""
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(seconds=expires_in),
        "iat": datetime.utcnow()
    }
    return jwt.encode(
        payload,
        current_app.config["SECRET_KEY"],
        algorithm="HS256"
    )


def decode_token(token: str) -> Optional[dict]:
    """验证并解析JWT令牌"""
    try:
        return jwt.decode(
            token,
            current_app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """验证请求中的JWT令牌"""

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # 从Authorization头获取令牌
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return {"message": "Authentication token is missing"}, 401

        # 解析令牌
        data = decode_token(token)
        if not data:
            return {"message": "Invalid authentication token"}, 401

        # 获取用户
        user = User.query.get(data["user_id"])
        if not user:
            return {"message": "User not found"}, 404

        # 将用户添加到请求上下文中
        request.current_user = user

        return f(*args, **kwargs)

    return decorated


def hash_password(password: str) -> str:
    """哈希密码"""
    from backend.models import bcrypt  # 避免循环导入
    return bcrypt.generate_password_hash(password).decode("utf-8")


def verify_password(hashed_password: str, password: str) -> bool:
    """验证密码"""
    from backend.models import bcrypt  # 避免循环导入
    return bcrypt.check_password_hash(hashed_password, password)