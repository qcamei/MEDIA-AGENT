from flask import current_app

from services.media_generator_service import MediaGeneratorService
from services.transaction_service import TransactionService
from services.storage_service import StorageService
from services.githhub_service import GitHubService
from app import config

def get_media_generator():
    return MediaGeneratorService(config)

def get_storage_service():
    return StorageService(config)

def get_transaction_service():
    return TransactionService()

def get_github_service():
    return GitHubService(
        client_id=config.get('GITHUB_CLIENT_ID'),
        client_secret=config.get('GITHUB_CLIENT_SECRET')
    )