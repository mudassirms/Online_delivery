# catalog.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend import models, schemas
from backend.database import get_db

router = APIRouter(prefix="/catalog", tags=["Catalog"])


# Categories

@router.get("/categories", response_model=list[schemas.CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.post("/categories", response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter_by(name=category.name).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")
    new_category = models.Category(name=category.name, image=category.image)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.put("/categories/{category_id}", response_model=schemas.CategoryOut)
def update_category(category_id: int, category: schemas.CategoryUpdate, db: Session = Depends(get_db)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    if category.name:
        db_category.name = category.name
    if category.image:
        db_category.image = category.image
    db.commit()
    db.refresh(db_category)
    return db_category


# Stores

@router.get("/categories/{category_id}/stores", response_model=list[schemas.StoreOut])
def get_stores_by_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category.stores

@router.post("/stores", response_model=schemas.StoreOut)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db)):
    db_store = db.query(models.Store).filter_by(name=store.name, category_id=store.category_id).first()
    if db_store:
        raise HTTPException(status_code=400, detail="Store already exists in this category")
    new_store = models.Store(name=store.name, image=store.image, category_id=store.category_id)
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store

@router.put("/stores/{store_id}", response_model=schemas.StoreOut)
def update_store(store_id: int, store: schemas.StoreUpdate, db: Session = Depends(get_db)):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    if store.name:
        db_store.name = store.name
    if store.image:
        db_store.image = store.image
    db.commit()
    db.refresh(db_store)
    return db_store


# Products

@router.get("/stores/{store_id}/products", response_model=list[schemas.ProductOut])
def get_products_by_store(store_id: int, q: str = None, db: Session = Depends(get_db)):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    products = store.products
    if q:
        products = [p for p in products if q.lower() in p.name.lower()]
    return products

@router.post("/products", response_model=schemas.ProductOut)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter_by(name=product.name, store_id=product.store_id).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product already exists in this store")
    new_product = models.Product(
        name=product.name, price=product.price, image=product.image, store_id=product.store_id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, product: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.name:
        db_product.name = product.name
    if product.price:
        db_product.price = product.price
    if product.image:
        db_product.image = product.image
    db.commit()
    db.refresh(db_product)
    return db_product


# Cart

@router.post("/cart", response_model=schemas.CartOut)
def add_to_cart(cart_data: schemas.CartCreate, user_id: int = 1, db: Session = Depends(get_db)):
    product = db.query(models.Product).filter(models.Product.id == cart_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart_item = models.Cart(user_id=user_id, product_id=cart_data.product_id, quantity=cart_data.quantity)
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.get("/cart", response_model=list[schemas.CartOut])
def get_cart(user_id: int = 1, db: Session = Depends(get_db)):
    return db.query(models.Cart).filter(models.Cart.user_id == user_id).all()

@router.delete("/cart/{cart_id}")
def remove_from_cart(cart_id: int, db: Session = Depends(get_db)):
    cart_item = db.query(models.Cart).filter(models.Cart.id == cart_id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed"}


# orders / Orders

@router.post("/orders", response_model=schemas.OrderOut)
def orders(order_data: schemas.OrderCreate, user_id: int = 1, db: Session = Depends(get_db)):
    cart_items = db.query(models.Cart).filter(models.Cart.user_id == user_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = sum(item.product.price * item.quantity for item in cart_items)
    order = models.Order(user_id=user_id, address_id=order_data.address_id, total_price=total_price)
    db.add(order)
    db.commit()
    db.refresh(order)

    # Create order items
    for item in cart_items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.product.price
        )
        db.add(order_item)
    db.commit()

    # Clear cart
    for item in cart_items:
        db.delete(item)
    db.commit()

    return order


# Addresses

@router.post("/addresses", response_model=schemas.AddressOut)
def add_address(address: schemas.AddressCreate, user_id: int = 1, db: Session = Depends(get_db)):
    new_address = models.Address(
        user_id=user_id,
        address_line=address.address_line,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        latitude=address.latitude,
        longitude=address.longitude
    )
    db.add(new_address)
    db.commit()
    db.refresh(new_address)
    return new_address

@router.get("/addresses", response_model=list[schemas.AddressOut])
def get_addresses(user_id: int = 1, db: Session = Depends(get_db)):
    return db.query(models.Address).filter(models.Address.user_id == user_id).all()
