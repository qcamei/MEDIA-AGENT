from datetime import datetime

from flask import Blueprint, request, jsonify, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.interaction import Interaction
from utils.idempotency import idempotency_check
from utils.rate_limit import rate_limit
from routes import api_bp
from app import app
from models import db
from models.conversation import Conversation
from models.interaction import Interaction


# routes/api.py
@api_bp.route('/')
def index():
    return render_template('index.html')  # 对应 templates/index.html
# routes/api.py
@api_bp.route('/test')
def test():
    return "Hello, World!"  # 访问 /test 应返回此消息
@api_bp.route('/conversations', methods=['GET'])
#@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.updated_at.desc()).all()
    return jsonify([c.to_dict() for c in conversations])


@api_bp.route('/conversations', methods=['POST'])
@jwt_required()
def create_conversation():
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title', '新对话')

    conversation = Conversation(user_id=user_id, title=title)
    db.session.add(conversation)
    db.session.commit()

    return jsonify(conversation.to_dict()), 201


@api_bp.route('/conversations/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_conversation(id):
    user_id = get_jwt_identity()
    conversation = Conversation.query.filter_by(id=id, user_id=user_id).first_or_404()

    db.session.delete(conversation)
    db.session.commit()

    return jsonify({'message': 'Conversation deleted'}), 200


@api_bp.route('/generate_media', methods=['POST'])
@jwt_required()
@rate_limit
@idempotency_check
def generate_media():
    user_id = get_jwt_identity()
    data = request.get_json()

    conversation_id = data.get('conversation_id')
    prompt = data.get('prompt')
    media_type = data.get('media_type', 'image')

    if not conversation_id or not prompt:
        return jsonify({'error': 'Missing required parameters'}), 400

    # 检查对话是否存在且属于当前用户
    conversation = Conversation.query.filter_by(id=conversation_id, user_id=user_id).first_or_404()

    # 创建交互记录
    interaction = Interaction(
        conversation_id=conversation_id,
        prompt=prompt,
        media_type=media_type
    )
    db.session.add(interaction)
    db.session.commit()

    # 开始分布式事务
    transaction_id = f"txn-{user_id}-{datetime.now().timestamp()}"
    app.transaction_service.start_transaction(transaction_id, user_id, 'generate', {
        'conversation_id': conversation_id,
        'interaction_id': interaction.id,
        'prompt': prompt,
        'media_type': media_type
    })

    try:
        # 生成媒体
        file_content = app.media_service.generate(prompt, media_type)

        # 存储文件
        file_path = app.storage_service.save_file(file_content, media_type, prompt)

        # 更新交互记录
        interaction.file_path = file_path
        interaction.status = 'completed'
        db.session.commit()

        # 确认事务
        app.transaction_service.confirm_transaction(transaction_id)

        return jsonify({
            'id': interaction.id,
            'prompt': prompt,
            'media_type': media_type,
            'file_path': file_path,
            'status': 'completed',
            'transaction_id': transaction_id
        }), 200

    except Exception as e:
        # 回滚事务
        app.transaction_service.cancel_transaction(transaction_id, str(e))

        # 更新交互状态
        interaction.status = 'failed'
        interaction.error_message = str(e)
        db.session.commit()

        return jsonify({'error': str(e)}), 500