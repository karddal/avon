# this file introduces the global colour type with validation
from typing import Annotated

from pydantic import Field

# regex adapted from https://stackoverflow.com/a/1636354
# licensed under CC BY-SA 4.0
# by Joey

Colour = Annotated[str, Field(pattern=r"[0-9a-fA-F]{6}$")]
