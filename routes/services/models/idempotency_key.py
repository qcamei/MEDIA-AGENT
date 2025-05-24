# models/idempotency_key.py
from datetime import datetime
from .common import db  # 确保从独立文件导入 db

class IdempotencyKey(db.Model):
    id = db.Column(db.String(255), primary_key=True)
    request_method = db.Column(db.String(10), nullable=False)
    request_path = db.Column(db.Text, nullable=False)
    response_code = db.Column(db.Integer)
    response_body = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)