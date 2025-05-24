from .media_generator_service import MediaGeneratorService
from .storage_service import StorageService
from .transaction_service import TransactionService

def init_service(app):
    app.media_generator_service = MediaGeneratorService(app.config)
    app.transaction_service = TransactionService()
    app.storage_service = StorageService(app.config)

def media_service(app):
    return app.media_generator_service

def storage_service(app):
    return app.storage_service

def transaction_service(app):
    return app.transaction_service


