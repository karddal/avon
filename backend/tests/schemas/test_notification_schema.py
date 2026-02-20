import pytest
from pydantic import ValidationError
from contextlib import nullcontext as does_not_raise

from app.schemas.notification import CreateNotification
from helpers.factories import create_unit


@pytest.fixture
def unit(session):
    unit_id = create_unit(session)
    return str(unit_id)

@pytest.mark.parametrize("title,expected", [
    ("", pytest.raises(ValidationError)),
    ("a", does_not_raise()),
    ("a" * 10, does_not_raise()),
    ("b" * 60, does_not_raise()),
    ("a" * 1000, pytest.raises(ValidationError)),
],
                         ids=["empty", "length 1", "length 10", "length 60", "length too high"])
def test_create_notification_with_title(title, expected, unit):
    with expected:
        CreateNotification(unit_id=unit, title=title, body="Test body")

@pytest.mark.parametrize("body,expected", [
    ("", pytest.raises(ValidationError)),
    ("a", does_not_raise()),
    ("a" * 10, does_not_raise()),
    ("b" * 1000, does_not_raise()),
    ("a" * 2000, pytest.raises(ValidationError)),
],
                         ids=["empty", "length 1", "length 10", "length 1000", "length too high"])
def test_create_notification_with_body(body, expected, unit):
    with expected:
        CreateNotification(unit_id=unit, title="Test", body=body)