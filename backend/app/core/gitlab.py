from functools import lru_cache

import aioboto3
import gitlab

from app.core.settings import settings

TOKEN = settings.gitlab_api_token
BASE_URL = settings.gitlab_base_url
ROOT_ID = settings.gitlab_root_id

@lru_cache()
def get_gitlab():
    return gitlab.Gitlab(private_token=TOKEN)

@lru_cache()
def get_aws_session():
    return aioboto3.Session()
