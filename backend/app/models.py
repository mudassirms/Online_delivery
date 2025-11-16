from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, func, Boolean, Time, Enum
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime
from sqlalchemy import DateTime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)

    # ✅ Updated Role with proper Enum
    role = Column(
        Enum("superadmin", "store_owner", "user", name="user_roles"),
        default="user",
        nullable=False
    )

    phone = Column(String(20), nullable=True)

    # ✅ Status flags
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)  # ✅ NEW FIELD

    verification_token = Column(String(255), nullable=True)
    stores = relationship("Store", back_populates="owner", cascade="all, delete-orphan")


    # ✅ Relationships
    addresses = relationship("Address", back_populates="user")
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("Cart", back_populates="user")
    logins = relationship("LoginHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete")

class LoginHistory(Base):
    __tablename__ = "login_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    login_time = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)

    user = relationship("User", back_populates="logins")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    image = Column(String(255), nullable=True)
    stores = relationship("Store", back_populates="category")

class Store(Base):
    __tablename__ = "stores"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    image = Column(String(255), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    contact_number = Column(String(15), nullable=True)

    open_time = Column(Time, nullable=True)
    close_time = Column(Time, nullable=True)
    is_closed_today = Column(Boolean, default=False)

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    

    category = relationship("Category", back_populates="stores")
    products = relationship("Product", back_populates="store")
    
    owner = relationship("User", back_populates="stores")
    


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True, nullable=False)
    price = Column(Float, nullable=False)
    image = Column(String(255), nullable=True)

    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    store = relationship("Store", back_populates="products")

    subcategory_id = Column(Integer, ForeignKey("product_subcategories.id"), nullable=True)
    subcategory = relationship("ProductSubCategory", back_populates="products")

    available = Column(Boolean, default=True)

class ProductSubCategory(Base):
    __tablename__ = "product_subcategories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)

    store = relationship("Store")
    products = relationship("Product", back_populates="subcategory")



class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"))
    address_id = Column(Integer, ForeignKey("addresses.id"), nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String(50), default="Pending")
    store_name = Column(String(100), nullable=True )
    payment_method = Column(String(50), default="COD")
    order_title = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=False)

    delivery_fee = Column(Float, default=0.0)
    store_earnings = Column(Float, default=0.0)

    contact_number = Column(String(20), nullable=True)

    user = relationship("User", back_populates="orders")
    address = relationship("Address")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class Cart(Base):
    __tablename__ = "cart"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

class AppDeliverySettings(Base):
    __tablename__ = "app_delivery_settings"

    id = Column(Integer, primary_key=True, index=True)
    base_fee = Column(Float, default=10)
    per_km_fee = Column(Float, default=5)
    min_fee = Column(Float, default=6)
    max_fee = Column(Float, default=40)
    reduce_fee_below_50 = Column(Float, default=5)
    reduce_fee_below_100 = Column(Float, default=16)
    free_above = Column(Float, default=750)


class Address(Base):
    __tablename__ = "addresses"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    address_line = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(10), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    user = relationship("User", back_populates="addresses")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(300))
    message = Column(String(1000))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

