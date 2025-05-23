from flask import current_app

from backend.services.media_generator_service import MediaGeneratorService
from backend.services.transaction_service import TransactionService
from backend.services.storage_service import StorageService
from backend.services.githhub_service import GitHubService

def get_media_generator():
    return MediaGeneratorService(
        openai_api_key=current_app.config['OPENAI_API_KEY']
    )

def get_storage_service():
    return StorageService()

def get_transaction_service():
    return TransactionService()

def get_github_service():
    return GitHubService(
        client_id=current_app.config['GITHUB_CLIENT_ID'],
        client_secret=current_app.config['GITHUB_CLIENT_SECRET']
    )