import os
from functools import lru_cache

import aioboto3
import gitlab

TOKEN = os.getenv("GITLAB_API_TOKEN")
BASE_URL = os.getenv("GITLAB_BASE_URL")
ROOT_ID = os.getenv("GITLAB_ROOT_ID")

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
#    yield session