from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, time

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

class VerifyOtp(BaseModel):
    email: str
    otp: str

class ResetPassword(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        orm_mode = True


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
