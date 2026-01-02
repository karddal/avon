import pytest
from app.core.security import create_access_token, get_current_user, authenticate_user, hash_password, PasswordIncorrectError
from app.models.user import User
from fastapi import Request, HTTPException
import pytest
from starlette.requests import Request

from app.core.security import create_access_token, get_current_user
from app.models.user import User


@pytest.mark.asyncio
async def test_create_access_token(session):
    user = User(
        first_name="Dempsey",
        last_name="Jack",
        email="jwd@university.ac.uk",
        hashed_password="irrelevant",
        is_lecturer=False,
    )
    session.add(user)
    session.commit()

    token = create_access_token({"sub": user.email})

    request = Request(
        {
            "type": "http",
            "headers": [
                (b"cookie", f"access_token={token}".encode()),
            ],
        }
    )

    result = await get_current_user(request, session)
    assert result.email == user.email




@pytest.mark.asyncio
async def test_auth_correct_password(session):
    user = User(
        first_name="Dempsey",
        last_name="Jack",
        email="jwd@university.ac.uk",
        hashed_password="hashed-Hashedpassword1234!",
        is_lecturer=False
    )
    session.add(user)
    session.commit()
    authenticate_user(user.email, "Hashedpassword1234!", session)

@pytest.mark.asyncio
async def test_auth_incorrect_password(session):
    user = User(
        first_name="Dempsey",
        last_name="Jack",
        email="jwd@university.ac.uk",
        hashed_password="$argon2id$v=19$m=65536,t=3,p=4$YmEXd8OiqssP687E6GPWuQ$oPUtLJ8fr+4OTANWYlOl0UsmNeAcE6kRaNpoHSElYAY",
        is_lecturer=False
    )
    session.add(user)
    session.commit()
    with pytest.raises(PasswordIncorrectError):
        authenticate_user(user.email, "afadsf!", session)


