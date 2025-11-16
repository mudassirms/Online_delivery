from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, selectinload
from typing import List
from app import models, schemas
from app.database import get_db
from app.auth import get_current_user  
from app.models import User
from typing import Dict
from datetime import datetime
from haversine import haversine, Unit
import pytz


india = pytz.timezone("Asia/Kolkata")


router = APIRouter(prefix="/catalog", tags=["Catalog"])

def calculate_delivery_distance(store, address):
    """Return distance in kilometers between store and user address."""
    if not store.latitude or not store.longitude or not address.latitude or not address.longitude:
        return None
    store_coords = (store.latitude, store.longitude)
    user_coords = (address.latitude, address.longitude)
    return haversine(store_coords, user_coords, unit=Unit.KILOMETERS)

def calculate_delivery_fee(distance_km: float):
    """Simple delivery fee model based on distance."""
    if distance_km is None:
        return 0
    if distance_km <= 2:
        return 10
    elif distance_km <= 5:
        return 20
    elif distance_km <= 10:
        return 30
    else:
        return 40

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
    if current_user.role == "store_owner" or current_user.role == "store_owner":
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
    if current_user.role == "store_owner": 
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
    """ Create a store and assign it to the logged-in store_owner"""
    if current_user.role != "store_owner" and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Only store_owners can create stores")
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
         latitude=store.latitude,        # ✅ NEW
        longitude=store.longitude,
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

    if db_store.owner_id != current_user.id and current_user.role != "store_owner" and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Not authorized to update this store")

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
    
    if store.latitude is not None:
        db_store.latitude = store.latitude
    if store.longitude is not None:
        db_store.longitude = store.longitude


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

    if db_store.owner_id != current_user.id and current_user.role != "store_owner" and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Not authorized to update this store")

    updatable_fields = {"name", "image", "contact_number", "open_time", "close_time", "is_open", "latitude", "longitude"}
    for key, value in data.items():
        if key in updatable_fields:
            setattr(db_store, key, value)

    db.commit()
    db.refresh(db_store)
    return db_store
    

# Product Sub-Category Routes
@router.post("/subcategories", response_model=schemas.ProductSubCategoryOut)
def create_subcategory(
    subcat: schemas.ProductSubCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ store_owner or Store Owner can create subcategory for a specific store"""
    store = db.query(models.Store).filter(models.Store.id == subcat.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if current_user.role != "store_owner" and store.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    new_subcat = models.ProductSubCategory(
        name=subcat.name,
        store_id=subcat.store_id
    )
    db.add(new_subcat)
    db.commit()
    db.refresh(new_subcat)
    return new_subcat


@router.get("/stores/{store_id}/subcategories", response_model=List[schemas.ProductSubCategoryOut])
def get_subcategories_by_store(
    store_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Fetch all subcategories for a store"""
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    return db.query(models.ProductSubCategory).filter(
        models.ProductSubCategory.store_id == store_id
    ).all()


@router.delete("/subcategories/{subcat_id}")
def delete_subcategory(
    subcat_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Delete subcategory only if no products use it"""

    subcat = db.query(models.ProductSubCategory).filter(
        models.ProductSubCategory.id == subcat_id
    ).first()

    if not subcat:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    store = db.query(models.Store).filter(models.Store.id == subcat.store_id).first()
    if current_user.role != "store_owner" and store.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    product_exists = db.query(models.Product).filter(
        models.Product.subcategory_id == subcat_id
    ).first()
    if product_exists:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete subcategory because products exist under it"
        )
    db.delete(subcat)
    db.commit()

    return {"message": "Subcategory deleted", "id": subcat_id}


@router.put("/subcategories/{subcat_id}", response_model=schemas.ProductSubCategoryOut)
def update_subcategory(
    subcat_id: int,
    data: schemas.ProductSubCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Update subcategory name"""
    subcat = db.query(models.ProductSubCategory).filter(
        models.ProductSubCategory.id == subcat_id
    ).first()

    if not subcat:
        raise HTTPException(status_code=404, detail="Subcategory not found")

    store = db.query(models.Store).filter(models.Store.id == subcat.store_id).first()

    if current_user.role != "store_owner" and store.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    subcat.name = data.name
    db.commit()
    db.refresh(subcat)
    return subcat


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
    if current_user.role == "store_owner" and store.owner_id != current_user.id:
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
    """✅ Only the store owner or store_owner can add products"""
    store = db.query(models.Store).filter(models.Store.id == product.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if store.owner_id != current_user.id and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Not authorized to add products to this store")
    db_product = db.query(models.Product).filter_by(name=product.name, store_id=product.store_id).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product already exists in this store")
    new_product = models.Product(
        name=product.name,
        price=product.price,
        image=product.image,
        store_id=product.store_id,
        subcategory_id=product.subcategory_id
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
    if store.owner_id != current_user.id and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    if product.name:
        db_product.name = product.name
    if product.price:
        db_product.price = product.price
    if product.image:
        db_product.image = product.image
    if product.subcategory_id is not None:   
        db_product.subcategory_id = product.subcategory_id

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
    if store.owner_id != current_user.id and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Not authorized to update this product")
    if "subcategory_id" in data:
        db_product.subcategory_id = data["subcategory_id"]
    for key, value in data.items():
        if hasattr(db_product, key):
            setattr(db_product, key, value)

    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Delete a product (only store_owner or store owner can delete)."""

    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    store = db.query(models.Store).filter(models.Store.id == product.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    if current_user.role != "store_owner" and store.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this product")

    order_item_exists = (
        db.query(models.OrderItem)
        .filter(models.OrderItem.product_id == product_id)
        .first()
    )
    if order_item_exists:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete product because it exists in past orders"
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully", "product_id": product_id}



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

def calculate_dynamic_delivery_fee(settings, distance_km, order_total_without_fee):
    base_fee = settings.base_fee or 0
    per_km_fee = settings.per_km_fee or 0
    min_fee = settings.min_fee or 0
    max_fee = settings.max_fee or float('inf')
    reduce_fee_below_50 = settings.reduce_fee_below_50 or 5
    reduce_fee_below_100 = settings.reduce_fee_below_100 or 10
    free_above = settings.free_above or float('inf')

    if distance_km is None:
        distance_km = 0

    # Base fee calculation
    fee = base_fee + (distance_km * per_km_fee)
    fee = max(min_fee, min(fee, max_fee))

    if order_total_without_fee < 50:
        fee = reduce_fee_below_50   
    elif order_total_without_fee < 100:
        fee = reduce_fee_below_100  
    elif order_total_without_fee >= free_above:
        fee = 0                     

    return round(fee, 2)


# Orders
@router.post("/orders", response_model=schemas.OrderOut)
def create_order(
    order_data: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create order + calculate delivery fee. Delivery fee is NOT part of store earnings."""

    # Fetch cart items
    cart_items = db.query(models.Cart).options(selectinload(models.Cart.product)).filter(
        models.Cart.user_id == current_user.id
    ).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    store_id = cart_items[0].product.store_id
    store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")

    address = db.query(models.Address).filter(models.Address.id == order_data.address_id).first()
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    distance_km = calculate_delivery_distance(store, address)
    order_total = sum(item.product.price * item.quantity for item in cart_items) 

    settings = db.query(models.AppDeliverySettings).first()
    if not settings:
        settings = models.AppDeliverySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    delivery_fee = calculate_dynamic_delivery_fee(
        settings=settings,
        distance_km=distance_km,
        order_total_without_fee=order_total
    )

    total_price = order_total + delivery_fee 

    # Create order
    order = models.Order(
        user_id=current_user.id,
        address_id=order_data.address_id,
        total_price=total_price,          
        store_earnings=order_total,        
        status="pending",
        store_id=store_id,
        store_name=store.name,
        payment_method=order_data.payment_method,
        contact_number=order_data.contact_number or current_user.phone,
        delivery_fee=delivery_fee,
        created_at=datetime.now(india)
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Add order items
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
    db.query(models.Cart).filter(models.Cart.user_id == current_user.id).delete()
    db.commit()

    return db.query(models.Order).options(
        selectinload(models.Order.items).selectinload(models.OrderItem.product),
        selectinload(models.Order.user),
        selectinload(models.Order.address)
    ).filter(models.Order.id == order.id).first()

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

    if current_user.role == "store_owner":
        store_ids = [store.id for store in db.query(models.Store).filter(models.Store.owner_id == current_user.id).all()]
        if not store_ids:
            return []
        query = query.filter(models.Order.store_id.in_(store_ids))
    else:
        query = query.filter(models.Order.user_id == current_user.id)

    orders = query.order_by(models.Order.created_at.desc()).all()


    for order in orders:
        if order.items:
            first_product = order.items[0].product.name
            order.order_title = f"{first_product} +{len(order.items) - 1} more" if len(order.items) > 1 else first_product
        else:
            order.order_title = "Order"

        if order.user:
            order.user.phone = order.contact_number or order.user.phone
        if not hasattr(order, "store_earnings") or order.store_earnings is None:
            order.store_earnings = sum(item.price * item.quantity for item in order.items)

    return orders

@router.patch("/orders/{order_id}", response_model=schemas.OrderOut)
def patch_order(
    order_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ store_owner can update order fields (like status) and notify the user."""
    order = db.query(models.Order).options(selectinload(models.Order.user)).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    store = db.query(models.Store).filter(models.Store.id == order.store_id).first()
    if store.owner_id != current_user.id and current_user.role != "store_owner":
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    for key, value in data.items():
        if hasattr(order, key):
            setattr(order, key, value)

    db.commit()
    db.refresh(order)

    if "status" in data:
        send_notification(
            db=db,
            user_id=order.user_id,
            title=f"Order #{order.id} {data['status'].capitalize()}",
            message=f"Your order status has been updated to '{data['status']}'."
        )

    return order

@router.delete("/orders/{order_id}")
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """✅ Delete an order (store_owner or Store Owner only)."""

    # Fetch the order
    order = (
        db.query(models.Order)
        .options(selectinload(models.Order.items))
        .filter(models.Order.id == order_id)
        .first()
    )
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    store = db.query(models.Store).filter(models.Store.id == order.store_id).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    if current_user.role != "store_owner" and store.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this order")
    for item in order.items:
        db.delete(item)
    db.delete(order)
    db.commit()

    return {"message": "Order deleted successfully", "order_id": order_id}

@router.post("/orders/{order_id}/cancel", response_model=schemas.OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    End-user can cancel their own order.
    Store owners cannot use this endpoint (use existing PATCH for them).
    """

    # Fetch the order
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Permission check: only the user who placed the order can cancel
    if current_user.role != "user" or order.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this order")

    # Only allow cancel if order is not already completed/cancelled
    if order.status in ["cancelled", "delivered", "completed"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel an order with status '{order.status}'")

    # Update order status
    order.status = "cancelled"
    db.commit()
    db.refresh(order)

    # ✅ Fetch store info and notify owner safely
    store = db.query(models.Store).filter(models.Store.id == order.store_id).first()
    user_id = store.owner_id if store else None

    if user_id:
        send_notification(
            db=db,
            user_id=user_id,
            title=f"Order #{order.id} Cancelled",
            message="The user has cancelled the order."
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


@router.put("/delivery-settings")
def update_delivery_settings(
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "store_owner":  # App owner
        raise HTTPException(status_code=403, detail="Only app owner can update delivery settings")

    settings = db.query(models.AppDeliverySettings).first()

    if not settings:
        settings = models.AppDeliverySettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)

    for key, value in data.items():
        if hasattr(settings, key):
            setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings
