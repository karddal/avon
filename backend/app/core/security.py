from passlib.context import CryptContext

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    #password -> hash
    return password_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    #verify weather the password is correct
    return password_context.verify(plain_password, hashed_password)