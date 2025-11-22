from fastapi import APIRouter, Depends, HTTPException, Header, Response, Cookie, BackgroundTasks
from sqlalchemy.orm import Session
from passlib.hash import argon2
from jose import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from app.utils.email_utils import send_verification_email
from app import models, schemas, database
import random

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


# ==========================================================
# REGISTER USER + EMAIL OTP SEND
# ==========================================================
@router.post("/register")
def register_user(
    data: schemas.RegisterUser,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):

    # Check role validity
    if data.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")

    # Check existing email
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create hashed password
    hashed = argon2.hash(data.password)

    # Generate OTP
    otp = str(random.randint(100000, 999999))

    user = models.User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        hashed_password=hashed,
        role=data.role,
        is_active=True,
        is_verified=False,
        otp=otp,
        otp_expiry=datetime.utcnow() + timedelta(minutes=10)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Send OTP email
    background_tasks.add_task(send_verification_email, user.email, user.name, otp)

    return {
        "message": "OTP sent to your email for verification",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }


# ==========================================================
# LOGIN - EMAIL/PASSWORD
# ==========================================================
@router.post("/token")
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db)
):

    db_user = db.query(models.User).filter(models.User.email == form_data.username).first()

    if not db_user or not argon2.verify(form_data.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    access_token = create_access_token({"sub": db_user.email, "role": db_user.role})
    refresh_token = create_refresh_token({"sub": db_user.email})

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
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


# ==========================================================
# REFRESH TOKEN
# ==========================================================
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



# ==========================================================
# EMAIL OTP VERIFICATION
# ==========================================================
@router.post("/verify-email-otp")
def verify_email_otp(data: schemas.VerifyOtp, db: Session = Depends(database.get_db)):

    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.otp or user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    user.is_verified = True
    user.otp = None
    user.otp_expiry = None
    db.commit()

    return {"message": "Email verified successfully"}


# ==========================================================
# PHONE OTP (TESTING MODE: RETURNS OTP)
# ==========================================================
@router.post("/phone/request-otp")
def phone_request_otp(data: schemas.PhoneOtpRequest, db: Session = Depends(database.get_db)):

    phone = data.phone.strip()

    if len(phone) < 10:
        raise HTTPException(status_code=400, detail="Invalid phone number")

    otp = str(random.randint(100000, 999999))

    user = db.query(models.User).filter(models.User.phone == phone).first()

    if not user:
        user = models.User(
            name="User",
            email=f"user_{phone}@auto.td",
            phone=phone,
            hashed_password=argon2.hash("default_temp"),
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    print("DEBUG OTP:", otp)

    return {
        "message": "OTP generated successfully",
        "otp": otp,
        "phone": phone
    }


# ==========================================================
# PHONE OTP VERIFY
# ==========================================================
@router.post("/phone/verify-otp")
def phone_verify_otp(data: schemas.PhoneOtpVerify, db: Session = Depends(database.get_db)):

    phone = data.phone.strip()
    user = db.query(models.User).filter(models.User.phone == phone).first()

    if not user:
        raise HTTPException(status_code=404, detail="Phone not registered")

    if user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    user.otp = None
    user.otp_expiry = None
    db.commit()

    access_token = create_access_token({"sub": user.email, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    }


# ==========================================================
# Unified Login
# ==========================================================
@router.post("/login")
def unified_login(data: schemas.UnifiedLogin, db: Session = Depends(database.get_db)):
    identifier = data.identifier.strip()

    if identifier.isdigit():
        return {"next": "phone-otp", "phone": identifier}

    return {"next": "email-login", "email": identifier}


# ==========================================================
# Password Reset
# ==========================================================
@router.post("/reset-password")
def reset_password(data: schemas.ResetPassword, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    hashed = argon2.hash(data.password)
    user.hashed_password = hashed

    user.otp = None
    user.otp_expiry = None

    db.commit()

    return {"message": "Password updated"}
