import requests
from flask import current_app, url_for
from models import User


class GitHubService:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://api.github.com"
        self.auth_url = "https://github.com/login/oauth/authorize"
        self.token_url = "https://github.com/login/oauth/access_token"

    def get_authorization_url(self, redirect_uri: str = None) -> str:
        """获取GitHub授权URL"""
        redirect_uri = redirect_uri or url_for("auth.github_callback", _external=True)
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "scope": "repo user",
            "state": current_app.config["SECRET_KEY"]  # 使用SECRET_KEY作为state
        }
        return f"{self.auth_url}?{'&'.join([f'{k}={v}' for k, v in params.items()])}"

    def exchange_code_for_token(self, code: str, redirect_uri: str = None) -> str:
        """使用授权码交换访问令牌"""
        redirect_uri = redirect_uri or url_for("auth.github_callback", _external=True)
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "redirect_uri": redirect_uri
        }

        response = requests.post(
            self.token_url,
            json=data,
            headers={"Accept": "application/json"}
        )

        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            raise Exception(f"GitHub token exchange failed: {response.text}")

    def create_repository(self, access_token: str, name: str, description: str = "") -> dict:
        """创建GitHub仓库"""
        url = f"{self.base_url}/user/repos"
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        data = {
            "name": name,
            "description": description,
            "private": True
        }

        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception(f"Failed to create repository: {response.text}")

    def upload_file(self, access_token: str, repo_owner: str, repo_name: str, file_path: str, content: bytes,
                    message: str = "Initial commit") -> dict:
        """上传文件到GitHub仓库"""
        url = f"{self.base_url}/repos/{repo_owner}/{repo_name}/contents/{file_path}"
        headers = {
            "Authorization": f"token {access_token}",
            "Accept": "application/vnd.github.v3+json"
        }
        data = {
            "message": message,
            "content": content.encode("utf-8").hex()  # 转换为Base64编码
        }

        response = requests.put(url, json=data, headers=headers)
        if response.status_code in (200, 201):
            return response.json()
        else:
            raise Exception(f"Failed to upload file: {response.text}")