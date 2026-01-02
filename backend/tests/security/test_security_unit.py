import pytest
from app.core.security import hash_password, verify_password, authenticate_user, PasswordIncorrectError
from app.models.user import User


def test_hash_and_verify_password():
    password = "Hashedpassword1234!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed) == True
    assert verify_password("wrong", hashed) == False


def test_auth_correct_password(session):
    password = "Hashedpassword1234!"
    user = User(
        first_name="Foo",
        last_name="Bar",
        email="foo@bar",
        hashed_password=hash_password(password),
        is_lecturer=False,
    )
    session.add(user)
    session.commit()

    result = authenticate_user(user.email, password, session)
    assert result.email == user.email


def test_auth_incorrect_password(session):
    password = "Hashedpassword1234!"
    user = User(
        first_name="Foo",
        last_name="Bar",
        email="foo@bar",
        hashed_password=hash_password(password),
        is_lecturer=False,
    )
    session.add(user)
    session.commit()

    with pytest.raises(PasswordIncorrectError):
        authenticate_user(user.email, "wrong", session)
