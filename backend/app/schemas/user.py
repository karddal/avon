from typing import Annotated

import re
from pydantic import BaseModel, EmailStr, AfterValidator, field_validator
from pydantic_core.core_schema import ValidationInfo


def name_is_correct_length(name: str) -> str:
    if 1<=len(name)<=100:
        return name
    else:
        raise ValueError("Name must be between 1 and 15 characters")

def is_valid_password(password: str) -> str:
    if len(password)<8 or len(password) > 30:
        raise ValueError("Password must be between 8 and 30 characters")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one digit")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character")
    return password

Name = Annotated[str, AfterValidator(name_is_correct_length)]
Password = Annotated[str, AfterValidator(is_valid_password)]

class UserCreate(BaseModel):
    first_name: Name
    last_name: Name
    email: EmailStr
    password: Password
    password_repeat: str

    @field_validator('password_repeat', mode='after')
    @classmethod
    def check_passwords_match(cls, value: str, info: ValidationInfo) -> str:
        try:
            if value != info.data['password']:
                raise ValueError('Passwords do not match')
            return value
        except KeyError:
            raise ValueError("Password must not be empty")


