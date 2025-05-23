from models import Transaction, db
from datetime import datetime
from typing import Dict, Any


class TransactionService:
    def create_transaction(self, user_id: int, transaction_type: str, data: Dict[str, Any] = None) -> Transaction:
        """创建新事务记录"""
        transaction = Transaction(
            user_id=user_id,
            type=transaction_type,
            status="pending",
            progress=0,
            data=data,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

        db.session.add(transaction)
        db.session.commit()
        return transaction

    def update_transaction(self, transaction_id: str, status: str, progress: int = None,
                           data: Dict[str, Any] = None) -> Transaction:
        """更新事务状态和进度"""
        transaction = Transaction.query.get_or_404(transaction_id)
        transaction.status = status
        if progress is not None:
            transaction.progress = progress
        if data:
            transaction.data.update(data)
        transaction.updated_at = datetime.utcnow()

        db.session.commit()
        return transaction

    def get_transaction(self, transaction_id: str) -> Transaction:
        """获取单个事务"""
        return Transaction.query.get(transaction_id)

    def list_user_transactions(self, user_id: int, limit: int = 10) -> list[Transaction]:
        """获取用户的事务列表"""
        return Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).limit(limit).all()