import os
from functools import lru_cache

import gitlab


TOKEN = os.getenv("GITLAB_API_TOKEN")
BASE_URL = os.getenv("GITLAB_BASE_URL")
ROOT_ID = os.getenv("GITLAB_ROOT_ID")

@lru_cache()
def get_gitlab():
   return gitlab.Gitlab(private_token=TOKEN)
