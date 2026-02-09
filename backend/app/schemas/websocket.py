from typing import Literal, Annotated, Union

from pydantic import BaseModel, AfterValidator, Field
from pydantic.type_adapter import TypeAdapter

ALLOWED_EVENTS = {"units_changed"}

def is_event_allowed(event: str) -> bool:
    return event in ALLOWED_EVENTS

Event = Annotated[str, AfterValidator(is_event_allowed)]

class Auth(BaseModel):
    type: Literal["auth"]
    token: str

class Subscribe(BaseModel):
    type: Literal["subscribe"]
    event: Event

class Unsubscribe(BaseModel):
    type: Literal["unsubscribe"]
    event: Event

ClientMessage = Annotated[
    Union[Auth, Subscribe, Unsubscribe],
    Field(discriminator= "type")
]

ws_msg_adapter = TypeAdapter(ClientMessage)