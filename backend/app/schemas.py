from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, time
from pydantic import BaseModel, EmailStr, Field, validator
import re


# -----------------------
# User Schemas
# -----------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"
    phone: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str

class RequestReset(BaseModel):
    email: str

class ResetPassword(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Password must contain letters and numbers")
        return v


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True

class RegisterUser(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    password: str = Field(..., min_length=6)
    role: str

    @validator("name")
    def validate_name(cls, v):
        if not v.replace(" ", "").isalpha():
            raise ValueError("Name must contain only letters")
        return v

    @validator("phone")
    def validate_phone(cls, v):
        if not re.fullmatch(r"[0-9]{10}", v):
            raise ValueError("Phone must be a 10-digit number")
        return v

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Password must contain letters and numbers")
        return v


# -----------------------
# Banner Schemas
# -----------------------

class BannerOut(BaseModel):
    id: int
    image: str

    class Config:
        orm_mode = True


# -----------------------
# Store Schemas
# -----------------------

class StoreBase(BaseModel):
    name: str
    image: Optional[str] = None
    category_id: int
    contact_number: Optional[str] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    contact_number: Optional[str] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    is_open: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class StoreOut(StoreBase):
    id: int
    owner_id: int
    is_open: Optional[bool] = None
    status_text: Optional[str] = None

    class Config:
        orm_mode = True


# -----------------------
# Product Subcategory Schemas (IMPORTANT: BEFORE ProductOut)
# -----------------------

class ProductSubCategoryBase(BaseModel):
    name: str
    store_id: int


class ProductSubCategoryCreate(ProductSubCategoryBase):
    pass


class ProductSubCategoryOut(ProductSubCategoryBase):
    id: int

    class Config:
        orm_mode = True


# -----------------------
# Product Schemas
# -----------------------

class ProductBase(BaseModel):
    name: str
    price: float
    image: Optional[str] = None
    store_id: int
    subcategory_id: Optional[int] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None
    subcategory_id: Optional[int] = None


class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    image: Optional[str]
    available: bool
    store_id: int
    subcategory_id: Optional[int] = None
    subcategory: Optional[ProductSubCategoryOut] = None

    class Config:
        orm_mode = True


# -----------------------
# Category Schemas
# -----------------------

class CategoryBase(BaseModel):
    name: str
    image: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None


class CategoryOut(CategoryBase):
    id: int
    stores: Optional[List[StoreOut]] = None

    class Config:
        orm_mode = True


# -----------------------
# Cart Schemas
# -----------------------

class CartCreate(BaseModel):
    product_id: int
    quantity: int


class CartOut(BaseModel):
    id: int
    quantity: int
    product: ProductOut

    class Config:
        orm_mode = True


# -----------------------
# Address Schemas
# -----------------------

class AddressBase(BaseModel):
    address_line: str
    city: str
    state: str
    pincode: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AddressCreate(AddressBase):
    pass


class AddressOut(AddressBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True


# -----------------------
# Order Schemas
# -----------------------

class OrderItemOut(BaseModel):
    id: int
    product: ProductOut
    quantity: int
    price: float

    class Config:
        orm_mode = True


class OrderCreate(BaseModel):
    address_id: int
    payment_method: Optional[str] = "cod"
    order_title: Optional[str] = None
    contact_number: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    total_price: float               
    store_earnings: Optional[float] = None  
    user: Optional[UserOut]
    status: str
    created_at: datetime
    address: AddressOut
    address_id: int
    store_name: Optional[str] = None
    contact_number: Optional[str]
    items: List[OrderItemOut]
    payment_method: str
    order_title: Optional[str] = None
    delivery_fee: Optional[float] = None

    class Config:
        orm_mode = True
    class Config:
        orm_mode = True


# -----------------------
# Delivery Settings
# -----------------------
class AppDeliverySettings(BaseModel):
    id: int
    base_fee: float
    per_km_fee: float
    min_fee: float
    max_fee: float
    reduce_fee_below_50: float
    reduce_fee_below_100: float
    free_above: float

    class Config:
        orm_mode = True
class DeliverySettingsUpdate(BaseModel):
    base_fee: Optional[float] = None
    per_km_fee: Optional[float] = None
    min_fee: Optional[float] = None
    max_fee: Optional[float] = None
    reduce_fee_below_50: Optional[float] = None
    reduce_fee_below_100: Optional[float] = None
    free_above: Optional[float] = None


class PhoneOtpRequest(BaseModel):
    phone: str = Field(...)

    @validator("phone")
    def validate_phone(cls, v):
        if not re.fullmatch(r"[0-9]{10}", v):
            raise ValueError("Invalid phone number")
        return v


class PhoneOtpVerify(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)


class VerifyOtp(BaseModel):
    email: EmailStr
    otp: str = Field(..., min_length=6, max_length=6)


class UnifiedLogin(BaseModel):
    identifier: str = Field(..., min_length=5)

