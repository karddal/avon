<<<<<<< HEAD
import os
=======
>>>>>>> dev
from functools import lru_cache

import aioboto3
import gitlab

<<<<<<< HEAD
TOKEN = os.getenv("GITLAB_API_TOKEN")
BASE_URL = os.getenv("GITLAB_BASE_URL")
ROOT_ID = os.getenv("GITLAB_ROOT_ID")
=======
from app.core.settings import settings

TOKEN = settings.gitlab_api_token
BASE_URL = settings.gitlab_base_url
ROOT_ID = settings.gitlab_root_id
>>>>>>> dev

@lru_cache()
def get_gitlab():
   return gitlab.Gitlab(private_token=TOKEN)

@lru_cache()
def get_aws_session():
   return aioboto3.Session()
#
# @contextlib.asynccontextmanager
# async def get_ecs():
#    session = aioboto3.Session().client("ecs"))
<<<<<<< HEAD
#    yield session
=======
#    yield session
>>>>>>> dev
