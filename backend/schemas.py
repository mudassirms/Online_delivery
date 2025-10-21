from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# -----------------------
# User Schemas
# -----------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "user"


class UserLogin(BaseModel):
    email: EmailStr
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


class StoreCreate(StoreBase):
    pass


class StoreUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None
    contact_number: Optional[str] = None


class StoreOut(StoreBase):
    id: int
    owner_id: int  # show which user owns the store

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


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    image: Optional[str] = None

class ProductOut(BaseModel):
    id: int
    name: str
    price: float
    image: Optional[str]
    available: bool
    store_id: int

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
    product: ProductOut  # include product details

    class Config:
        orm_mode = True


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


class OrderOut(BaseModel):
    id: int
    total_price: float
    user: Optional[UserOut]
    status: str
    created_at: datetime
    address: AddressOut 
    address_id: int
    items: List[OrderItemOut]
    payment_method: str
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
