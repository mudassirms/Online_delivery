from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, selectinload
from typing import List
from backend import models, schemas
from backend.database import get_db
from backend.auth import get_current_user  
from backend.models import User
from typing import Dict
from datetime import datetime

router = APIRouter(prefix="/catalog", tags=["Catalog"])

def get_store_status(store):
    """Return (is_open, status_text) based on current time."""
    now = datetime.now().time()

    if store.is_closed_today:
        return False, "Closed Today"

    if not store.open_time or not store.close_time:
        return None, "Hours not set"

    if store.open_time <= now <= store.close_time:
        return True, "Open Now"
    elif now < store.open_time:
        open_str = store.open_time.strftime("%I:%M %p")
        return False, f"Opens at {open_str}"
    else:
        open_str = store.open_time.strftime("%I:%M %p")
        return False, f"Closed - Opens again at {open_str}"

def send_notification(db: Session, user_id: int, title: str, message: str):
    """Store notification in DB or trigger push message."""
    notification = models.Notification(
        user_id=user_id,
        title=title,
        message=message
    )
    db.add(notification)
    db.commit()

@router.get("/stats", response_model=Dict[str, int])
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return dashboard statistics based on user role."""

    total_orders = 0
    total_products = 0

    if current_user.role == "admin":
        store_ids = [
            store.id
            for store in db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()
        ]
        if store_ids:
            total_products = db.query(models.Product).filter(models.Product.store_id.in_(store_ids)).count()
            total_orders = db.query(models.Order).filter(models.Order.store_id.in_(store_ids)).count()
    else:
        total_orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).count()

    return {"totalOrders": total_orders, "totalProducts": total_products}


@router.get("/categories", response_model=List[schemas.CategoryOut])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "admin": 
        stores = db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()
        if stores:
            category_ids = list(set(store.category_id for store in stores))
            categories = db.query(models.Category).filter(models.Category.id.in_(category_ids)).all()
        else:
            categories = db.query(models.Category).all()
    else:
        categories = db.query(models.Category).all()

    return categories


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

@router.get("/categories/{category_id}/stores", response_model=List[schemas.StoreOut])
def get_stores_by_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    

    stores = category.stores
    for store in stores:
        store.is_open, store.status_text = get_store_status(store)

    return category.stores


@router.get("/categories/all", response_model=List[schemas.CategoryOut])
def get_all_categories(db: Session = Depends(get_db)):
    """Return all categories (for adding a store)"""
    return db.query(models.Category).all()



@router.get("/stores/my", response_model=List[schemas.StoreOut])
def get_my_stores(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Return only stores owned by the logged-in user"""
    stores = db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()
    for store in stores:
        store.is_open, store.status_text = get_store_status(store)
    return stores


@router.post("/stores", response_model=schemas.StoreOut)
def create_store(
    store: schemas.StoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """ Create a store and assign it to the logged-in admin"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create stores")
    db_store = db.query(models.Store).filter_by(name=store.name, category_id=store.category_id).first()
    
    if db_store:
        raise HTTPException(status_code=400, detail="Store already exists in this category")
    new_store = models.Store(
        name=store.name,
        image=store.image,
        contact_number=store.contact_number,
        category_id=store.category_id,
        owner_id=current_user.id,
        open_time=store.open_time,
        close_time=store.close_time,
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store


@router.put("/stores/{store_id}", response_model=schemas.StoreOut)
def update_store(
    store_id: int,
    store: schemas.StoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Update store details including open/close time and status."""
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    # Check permissions
    if db_store.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this store")

    # Update only provided fields
    if store.name is not None:
        db_store.name = store.name
    if store.image is not None:
        db_store.image = store.image
    if store.contact_number is not None:
        db_store.contact_number = store.contact_number
    if store.open_time is not None:
        db_store.open_time = store.open_time
    if store.close_time is not None:
        db_store.close_time = store.close_time
    if hasattr(store, "is_open") and store.is_open is not None:
        db_store.is_open = store.is_open

    db.commit()
    db.refresh(db_store)
    return db_store
@router.patch("/stores/{store_id}", response_model=schemas.StoreOut)
def patch_store(
    store_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Partially update store details (e.g., toggle open/closed)."""
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")

    # Authorization check
    if db_store.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this store")

    # Update dynamically only valid attributes
    updatable_fields = {"name", "image", "contact_number", "open_time", "close_time", "is_open"}
    for key, value in data.items():
        if key in updatable_fields:
            setattr(db_store, key, value)

    db.commit()
    db.refresh(db_store)
    return db_store



# Products
@router.get("/stores/{store_id}/products", response_model=List[schemas.ProductOut])
def get_products_by_store(
    store_id: int,
    q: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if current_user.role == "admin" and store.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this store")
    query = db.query(models.Product).filter(models.Product.store_id == store_id)

    if q:
        query = query.filter(models.Product.name.ilike(f"%{q}%"))

    products = query.all()
    for p in products:
        if p.available is None:
            p.available = False

    return products



@router.post("/products", response_model=schemas.ProductOut)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Only the store owner or admin can add products"""
    store = db.query(models.Store).filter(models.Store.id == product.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if store.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to add products to this store")

    db_product = db.query(models.Product).filter_by(name=product.name, store_id=product.store_id).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product already exists in this store")

    new_product = models.Product(
        name=product.name,
        price=product.price,
        image=product.image,
        store_id=product.store_id
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.put("/products/{product_id}", response_model=schemas.ProductOut)
def update_product(
    product_id: int,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    store = db.query(models.Store).filter(models.Store.id == db_product.store_id).first()
    if store.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    if product.name:
        db_product.name = product.name
    if product.price:
        db_product.price = product.price
    if product.image:
        db_product.image = product.image
    db.commit()
    db.refresh(db_product)
    return db_product

@router.patch("/products/{product_id}", response_model=schemas.ProductOut)
def patch_product(
    product_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    store = db.query(models.Store).filter(models.Store.id == db_product.store_id).first()
    if store.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    for key, value in data.items():
        if hasattr(db_product, key):
            setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product


# Cart
@router.post("/cart", response_model=schemas.CartOut)
def add_to_cart(
    cart_data: schemas.CartCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == cart_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    cart_item = db.query(models.Cart).filter_by(
        user_id=current_user.id, 
        product_id=cart_data.product_id
    ).first()
    if not product.store_id:
        raise HTTPException(status_code=400, detail="Product does not belong to a store")
    if cart_item:
        cart_item.quantity += cart_data.quantity
    else:
        cart_item = models.Cart(
            user_id=current_user.id,
            product_id=cart_data.product_id,
            quantity=cart_data.quantity
        )
        db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return db.query(models.Cart).options(selectinload(models.Cart.product)).filter(models.Cart.id == cart_item.id).first()


@router.get("/cart", response_model=List[schemas.CartOut])
def get_cart(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(models.Cart).options(selectinload(models.Cart.product)).filter(models.Cart.user_id == current_user.id).all()


@router.delete("/cart/{cart_id}")
def remove_from_cart(
    cart_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cart_item = db.query(models.Cart).filter(models.Cart.id == cart_id, models.Cart.user_id == current_user.id).first()
    if not cart_item:
        return {"message": "Item already removed or does not exist"}
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed"}


# Orders
@router.post("/orders", response_model=schemas.OrderOut)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    cart_items = (
        db.query(models.Cart)
        .options(selectinload(models.Cart.product))
        .filter(models.Cart.user_id == current_user.id)
        .all()
    )
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    total_price = sum(item.product.price * item.quantity for item in cart_items)
    store_id = cart_items[0].product.store_id
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    order = models.Order(
        user_id=current_user.id,
        address_id=order_data.address_id,
        total_price=total_price,
        status="pending",
        store_id=store_id,
        store_name=store.name,
        payment_method=order_data.payment_method,
        contact_number=order_data.contact_number or current_user.phone  # ✅ include phone
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for item in cart_items:
        order_item = models.OrderItem(
            order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.product.price
        )
        db.add(order_item)

    db.commit()
    db.query(models.Cart).filter(models.Cart.user_id == current_user.id).delete()
    db.commit()

    return (
        db.query(models.Order)
        .options(selectinload(models.Order.items).selectinload(models.OrderItem.product),
                 selectinload(models.Order.user),
                 selectinload(models.Order.address))
        .filter(models.Order.id == order.id)
        .first()
    )


# --- Get Orders ---
@router.get("/orders", response_model=List[schemas.OrderOut])
def get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Order).options(
        selectinload(models.Order.items).selectinload(models.OrderItem.product),
        selectinload(models.Order.user),
        selectinload(models.Order.address)
    )

    if current_user.role == "admin":
        store_ids = [store.id for store in db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()]
        if not store_ids:
            return []
        query = query.filter(models.Order.store_id.in_(store_ids))
    else:
        query = query.filter(models.Order.user_id == current_user.id)

    orders = query.all()

    # Dynamically add 'order_title' using product names
    for order in orders:
        if order.items:
            first_product = order.items[0].product.name
            order.order_title = f"{first_product} +{len(order.items) - 1} more" if len(order.items) > 1 else first_product
        else:
            order.order_title = "Order"

        # ✅ Ensure phone number is included in returned user object
        if order.user:
            order.user.phone = order.contact_number or order.user.phone

    return orders

@router.patch("/orders/{order_id}", response_model=schemas.OrderOut)
def patch_order(
    order_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Admin can update order fields (like status) and notify the user."""
    order = db.query(models.Order).options(selectinload(models.Order.user)).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if user has permission (admin or store owner)
    store = db.query(models.Store).filter(models.Store.id == order.store_id).first()
    if store.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    # Update fields dynamically
    for key, value in data.items():
        if hasattr(order, key):
            setattr(order, key, value)

    db.commit()
    db.refresh(order)

    # ✅ Send notification to user when status changes
    if "status" in data:
        send_notification(
            db=db,
            user_id=order.user_id,
            title=f"Order #{order.id} {data['status'].capitalize()}",
            message=f"Your order status has been updated to '{data['status']}'."
        )

    return order


# Addresses
@router.post("/addresses", response_model=schemas.AddressOut)
def add_address(
    address: schemas.AddressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_address = models.Address(
        user_id=current_user.id,
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


@router.get("/addresses", response_model=List[schemas.AddressOut])
def get_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(models.Address).filter(models.Address.user_id == current_user.id).all()
