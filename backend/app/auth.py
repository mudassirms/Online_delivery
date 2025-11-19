from fastapi import APIRouter, Depends, HTTPException, Header, Response, Cookie
from sqlalchemy.orm import Session
from passlib.hash import argon2
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from app import models, schemas, database

# ----------------------
# Configurations
# ----------------------
SECRET_KEY = "towndropsecret"
REFRESH_SECRET_KEY = "towndrop_refresh_secret"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 30

SUPERADMIN_REGISTRATION_KEY = "superadmin_frontend_secret"
VALID_ROLES = ["superadmin", "store_owner", "user"]

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
router = APIRouter(prefix="/auth", tags=["Auth"])

# ----------------------
# Token generators
# ----------------------
def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    data.update({"exp": expire})
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    data.update({"exp": expire})
    return jwt.encode(data, REFRESH_SECRET_KEY, algorithm=ALGORITHM)


@router.post("/register")
def register_user(data: schemas.RegisterUser, db: Session = Depends(database.get_db)):

    # Check existing email
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create hashed password
    hashed = argon2.hash(data.password)

    user = models.User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        hashed_password=hashed,
        role="user",
        is_active=True,
        is_verified=True,    # or False if you want email verification
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
        }
    }


# ========================================================================
# =========================== LOGIN TOKEN ================================
# ========================================================================
@router.post("/token")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):

    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not db_user or not argon2.verify(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token({"sub": db_user.email, "role": db_user.role})
    refresh_token = create_refresh_token({"sub": db_user.email})

    # Set refresh token in HTTP-only cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # True on production HTTPS
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60
    )

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



# ========================================================================
# ====================== REFRESH ACCESS TOKEN ============================
# ========================================================================
@router.post("/refresh")
def refresh_access_token(
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(database.get_db)
):
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(refresh_token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # create new access token
    new_access = create_access_token({"sub": user.email, "role": user.role})

    return {"access_token": new_access, "token_type": "bearer"}


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(database.get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

@router.get("/me")
def get_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role,
        "phone": current_user.phone,
        "is_verified": current_user.is_verified,
        "is_active": current_user.is_active
    }



# Helper – mock email sender
def send_otp_email(email: str, otp: str):
    print(f"DEBUG OTP for {email}: {otp}")
    # TODO: integrate SMTP later
    return True


# -------------------------
# 1️⃣ Request Reset → send OTP
# -------------------------
@router.post("/request-password-reset")
def request_password_reset(data: schemas.RequestReset, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Email not found")

    import random
    otp = str(random.randint(100000, 999999))

    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    send_otp_email(user.email, otp)

    return {"message": "OTP sent to email"}



# -------------------------
# 2️⃣ Verify OTP
# -------------------------
@router.post("/verify-otp")
def verify_otp(data: schemas.VerifyOtp, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.otp or user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    return {"message": "OTP verified"}



# -------------------------
# 3️⃣ Reset Password
# -------------------------
@router.post("/reset-password")
def reset_password(data: schemas.ResetPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed = argon2.hash(data.password)
    user.hashed_password = hashed

    # clear OTP
    user.otp = None
    user.otp_expiry = None

    db.commit()

    return {"message": "Password updated"}
