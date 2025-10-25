from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "towndropsecret"
ALGORITHM = "HS256"

def create_verification_token(user_id: int):
    expire = datetime.utcnow() + timedelta(hours=24)
    data = {"user_id": user_id, "exp": expire}
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def decode_verification_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("user_id")
    except Exception:
        return None
