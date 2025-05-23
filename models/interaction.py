from datetime import datetime
from backend.models import db


class Interaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversation.id'), nullable=False)
    prompt = db.Column(db.Text, nullable=False)
    media_type = db.Column(db.String(50), nullable=False)
    file_path = db.Column(db.String(200))
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'prompt': self.prompt,
            'media_type': self.media_type,
            'file_path': self.file_path,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }