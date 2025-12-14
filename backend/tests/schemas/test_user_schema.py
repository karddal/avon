# import pytest
# from pydantic import ValidationError

# from app.schemas.user import UserCreate


# # -------------- First Name --------------
# # Validation Rules:
# # - length >= 1
# # - length <= 15

# def test_empty_first_name_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="", last_name="Bar", email="foo@bar.com", password="Lafjlk32984*", password_repeat="lafjlk32984*")

# def test_length_first_name_more_than_fifteen_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="FooFooFooFooFooF", last_name="Bar", email="foo@bar.com", password="Lafjlk32984*", password_repeat="lafjlk32984*")

# # -------------- Last Name --------------
# # Validation Rules:
# # - length >= 1
# # - length <= 15

# def test_empty_last_name_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="", email="foo@bar.com", password="Lafjlk32984*", password_repeat="Lafjlk32984*")

# def test_length_last_name_more_than_fifteen_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="BarBarBarBarBarB", email="foo@bar.com", password="Lafjlk32984*", password_repeat="lafjlk32984*")

# # -------------- Email --------------
# # Validation Rules:
# # - be an email

# def test_empty_email_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="", password="Lafjlk32984*", password_repeat="Lafjlk32984*")

# def test_no_email_at_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foobar.com", password="Lafjlk32984*", password_repeat="Lafjlk32984*")

# def test_no_email_domain_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@", password="Lafjlk32984*", password_repeat="Lafjlk32984*")

# def test_no_email_tld_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar", password="Lafjlk32984*", password_repeat="Lafjlk32984*")

# # -------------- Password --------------
# # Validation Rules:
# # - length >= 8
# # - length <= 30
# # - at least 1 uppercase letter
# # - at least 1 lowercase letter
# # - at least 1 symbol
# # - at least 1 number

# def test_invalid_matching_passwords_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="invalidpassword1", password_repeat="invalidpassword1")

# def test_not_matching_passwords_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="Lafjlk32984*", password_repeat="ClearlyWrong32984*")

# def test_empty_password_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="", password_repeat="Lafjlk32984*")

# def test_empty_password_repeat_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="Lafjlk32984*", password_repeat="")

# def test_password_length_less_than_eight_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="Laflk3*", password_repeat="Laflk3*")

# def test_password_length_more_than_thirty_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="Lafjlk32984*iosgjiuytsouiytqjui", password_repeat="Lafjlk32984*iosgjiuytsouiytqjui")

# def test_password_no_lowercase_letter_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="LAFJLK32984*", password_repeat="LAFJLK32984*")

# def test_password_no_uppercase_letter_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="lafjlk32984*", password_repeat="lafjlk32984*")

# def test_password_no_symbol_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="Lafjlk32984", password_repeat="Lafjlk32984")

# def test_password_no_number_raises_error():
#     with pytest.raises(ValidationError):
#         UserCreate(first_name="Foo", last_name="Bar",email="foo@bar.com", password="Lafjlk*", password_repeat="Lafjlk*")