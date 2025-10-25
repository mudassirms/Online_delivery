from argon2 import PasswordHasher
from fastapi import HTTPException

ph = PasswordHasher()

def hash_password(password: str) -> str:
    try:
        return ph.hash(password)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error hashing password: {e}")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return ph.verify(hashed_password, plain_password)
    except Exception:
        return False
