from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, selectinload
from typing import List
from app.database import get_db
from app.auth import get_current_user
from app import models, schemas
from datetime import datetime
from haversine import haversine, Unit

router = APIRouter(prefix="/superadmin", tags=["SuperAdmin"])

# ----------------------------
# Dependency: superadmin only
# ----------------------------
def superadmin_only(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user


# ----------------------------
# HELPER FUNCTIONS
# ----------------------------
def calculate_delivery_distance(store, address):
    if not store.latitude or not store.longitude or not address.latitude or not address.longitude:
        return None
    return haversine(
        (store.latitude, store.longitude),
        (address.latitude, address.longitude),
        unit=Unit.KILOMETERS,
    )


def get_store_status(store):
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
    notification = models.Notification(user_id=user_id, title=title, message=message)
    db.add(notification)
    db.commit()


# ----------------------------
# DELIVERY SETTINGS
# ----------------------------
@router.get("/delivery-settings", response_model=schemas.AppDeliverySettings)
def get_delivery_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(superadmin_only),
):
    settings = db.query(models.AppDeliverySettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Delivery settings not found")
    return settings


@router.put("/delivery-settings", response_model=schemas.AppDeliverySettings)
def update_delivery_settings(
    updated_data: schemas.DeliverySettingsUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(superadmin_only),
):
    settings = db.query(models.AppDeliverySettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Delivery settings not found")

    # Only update fields provided by client
    update_data = updated_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(settings, key, value)

    db.commit()
    db.refresh(settings)
    return settings


def calculate_dynamic_delivery_fee(distance_km: float, order_total: float, db: Session) -> float:
    """Calculate dynamic delivery fee using AppDeliverySettings."""
    settings = db.query(models.AppDeliverySettings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Delivery settings not configured")

    # Base calculation
    fee = settings.base_fee + (distance_km * settings.per_km_fee)
    fee = max(settings.min_fee, min(fee, settings.max_fee))

    # Reduced fee for small orders
    if order_total < 50 and settings.reduce_fee_below_50 is not None:
        fee = min(fee, settings.reduce_fee_below_50)
    elif order_total < 100 and settings.reduce_fee_below_100 is not None:
        fee = min(fee, settings.reduce_fee_below_100)

    # Free above threshold
    if settings.free_above is not None and order_total >= settings.free_above:
        fee = 0

    return round(fee, 2)

@router.get("/stores-with-delivery", response_model=List[schemas.StoreOut])
def get_stores_with_delivery(
    user_lat: float,
    user_lng: float,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(superadmin_only),
):
    stores = db.query(models.Store).all()
    for store in stores:
        store.is_open, store.status_text = get_store_status(store)
        if store.latitude and store.longitude:
            distance = haversine(
                (store.latitude, store.longitude),
                (user_lat, user_lng),
                unit=Unit.KILOMETERS,
            )
            order_total = 100  # Default for demonstration
            store.delivery_fee = calculate_dynamic_delivery_fee(distance, order_total, db)
        else:
            store.delivery_fee = None
    return stores


# ----------------------------
# USERS
# ----------------------------
@router.get("/users-with-stores")
def get_users_with_stores(db: Session = Depends(get_db)):
    users = db.query(models.User).options(selectinload(models.User.stores)).all()
    return users

# ----------------------------
# CATEGORIES
# ----------------------------
@router.get("/categories", response_model=List[schemas.CategoryOut])
def get_all_categories(db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    return db.query(models.Category).all()


@router.post("/categories", response_model=schemas.CategoryOut)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    if db.query(models.Category).filter_by(name=category.name).first():
        raise HTTPException(status_code=400, detail="Category already exists")
    new_category = models.Category(name=category.name, image=category.image)
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@router.put("/categories/{category_id}", response_model=schemas.CategoryOut)
def update_category(category_id: int, category: schemas.CategoryUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
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


@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted", "id": category_id}


# STORES
@router.get("/stores", response_model=List[schemas.StoreOut])
def get_all_stores(db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    stores = db.query(models.Store).all()
    for store in stores:
        store.is_open, store.status_text = get_store_status(store)
    return stores


@router.post("/stores", response_model=schemas.StoreOut)
def create_store(store: schemas.StoreCreate, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    if db.query(models.Store).filter_by(name=store.name, category_id=store.category_id).first():
        raise HTTPException(status_code=400, detail="Store already exists in this category")
    new_store = models.Store(
        name=store.name,
        image=store.image,
        contact_number=store.contact_number,
        category_id=store.category_id,
        owner_id=store.owner_id,
        open_time=store.open_time,
        close_time=store.close_time,
        latitude=store.latitude,
        longitude=store.longitude,
    )
    db.add(new_store)
    db.commit()
    db.refresh(new_store)
    return new_store


@router.put("/stores/{store_id}", response_model=schemas.StoreOut)
def update_store(store_id: int, store: schemas.StoreUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    for field in ["name", "image", "contact_number", "open_time", "close_time", "latitude", "longitude", "is_open"]:
        if getattr(store, field, None) is not None:
            setattr(db_store, field, getattr(store, field))
    db.commit()
    db.refresh(db_store)
    return db_store


@router.delete("/stores/{store_id}")
def delete_store(store_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    db_store = db.query(models.Store).filter(models.Store.id == store_id).first()
    if not db_store:
        raise HTTPException(status_code=404, detail="Store not found")
    db.delete(db_store)
    db.commit()
    return {"message": "Store deleted", "id": store_id}


# ORDERS
@router.get("/orders", response_model=List[schemas.OrderOut])
def get_orders(db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    orders = db.query(models.Order).options(
        selectinload(models.Order.items).selectinload(models.OrderItem.product),
        selectinload(models.Order.user),
        selectinload(models.Order.address),
    ).all()

    for order in orders:
        if order.items:
            first_product = order.items[0].product.name
            order.order_title = f"{first_product} +{len(order.items) - 1} more" if len(order.items) > 1 else first_product
        else:
            order.order_title = "Order"
        if order.user:
            order.user.phone = order.contact_number or order.user.phone

    return orders


@router.patch("/orders/{order_id}", response_model=schemas.OrderOut)
def patch_order(order_id: int, data: dict = Body(...), db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    order = db.query(models.Order).options(selectinload(models.Order.user)).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    for key, value in data.items():
        if hasattr(order, key):
            setattr(order, key, value)

    db.commit()
    db.refresh(order)

    if "status" in data:
        send_notification(
            db,
            order.user_id,
            f"Order #{order.id} {data['status'].capitalize()}",
            f"Your order status updated to '{data['status']}'.",
        )

    return order


@router.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(superadmin_only)):
    order = db.query(models.Order).options(selectinload(models.Order.items)).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for item in order.items:
        db.delete(item)
    db.delete(order)
    db.commit()
    return {"message": "Order deleted successfully", "order_id": order_id}
