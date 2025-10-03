from pydantic import BaseModel
from typing import List, Optional

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    class Config:
        orm_mode = True

class BannerOut(BaseModel):
    id: int
    image: str

# Store Schemas
# -----------------------
class StoreBase(BaseModel):
    name: str
    image: Optional[str] = None
    category_id: int

class StoreCreate(StoreBase):
    pass

class StoreUpdate(BaseModel):
    name: Optional[str] = None
    image: Optional[str] = None

class StoreOut(StoreBase):
    id: int

    class Config:
        orm_mode = True

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

class ProductOut(ProductBase):
    id: int

    class Config:
        orm_mode = True

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

    class Config:
        orm_mode = True

# cart and orders

class CartCreate(BaseModel):
    product_id: int
    quantity: int

class CartOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    class Config:
        orm_mode = True

class OrderCreate(BaseModel):
    address: str

class OrderOut(BaseModel):
    id: int
    total_price: float
    address: str
    status: str
    created_at: str
    class Config:
        orm_mode = True

class AddressBase(BaseModel):
    street: str
    city: str
    state: str
    country: str
    postal_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AddressCreate(AddressBase):
    user_id: int

class AddressOut(AddressBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True