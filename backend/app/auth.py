from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from passlib.hash import argon2
from jose import jwt, JWTError
from datetime import datetime, timedelta

from app import models, schemas, database
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

# ----------------------
# Configurations
# ----------------------
SECRET_KEY = "towndropsecret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# secret key for frontend superadmin registration
SUPERADMIN_REGISTRATION_KEY = "superadmin_frontend_secret"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
VALID_ROLES = ["superadmin", "store_owner", "user"]

router = APIRouter(prefix="/auth", tags=["Auth"])

# ----------------------
# JWT Token Utilities
# ----------------------
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

# ----------------------
# Registration Endpoint
# ----------------------
@router.post("/register")
def register(
    user: schemas.UserCreate,
    superadmin_key: str = Header(None),  # optional header for superadmin
    db: Session = Depends(database.get_db)
):
    """Register a new user with name, email, password, phone, and role."""

    if user.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Role must be one of {VALID_ROLES}")

    # Allow superadmin only with secret key
    if user.role == "superadmin":
        if superadmin_key != SUPERADMIN_REGISTRATION_KEY:
            raise HTTPException(status_code=403, detail="Cannot register as superadmin directly")

    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = argon2.hash(user.password)

    new_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        phone=user.phone,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "msg": "User created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role,
            "phone": new_user.phone
        }
    }

# ----------------------
# Login / Token Endpoint
# ----------------------
@router.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not db_user or not argon2.verify(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": db_user.email, "role": db_user.role})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "name": db_user.name,
            "email": db_user.email,
            "role": db_user.role,
            "phone": db_user.phone
        }
    }

# ----------------------
# Current User
# ----------------------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@router.get("/me")
def read_current_user(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "phone": current_user.phone
    }

# ----------------------
# Role-Based Access Dependency
# ----------------------
def require_roles(*roles: str):
    def role_checker(current_user: models.User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Not authorized")
        return current_user
    return role_checker
