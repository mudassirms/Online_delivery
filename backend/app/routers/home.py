from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from app import database, models, schemas

router = APIRouter(prefix="/home", tags=["Home"])
products_router = APIRouter(prefix="/products", tags=["Products"])



@router.get("/banners", response_model=list[schemas.BannerOut])
def get_banners(request: Request):
    """Return promotional banners with full URLs."""
    base_url = str(request.base_url)
    return [
        {"id": 1, "image": f"{base_url}statics/banner1.jpeg"},
        {"id": 2, "image": f"{base_url}statics/banner2.jpg"},
        {"id": 3, "image": f"{base_url}statics/banner3.jpg"},
        {"id": 4, "image": f"{base_url}statics/banner4.jpeg"},
        {"id": 5, "image": f"{base_url}statics/banner5.jpg"},
        
    ]


from sqlalchemy import func

@products_router.get("/popular", response_model=list[schemas.ProductOut])
def get_popular_products(db: Session = Depends(database.get_db)):
    """
    Return REAL popular products:
    - Only from OPEN stores
    - Sorted by sales_count
    - Limited to top 10
    """

    products = (
        db.query(models.Product)
        .join(models.Store)  # join store table
        .filter(models.Store.is_closed_today == False)   # only open stores
        .order_by(models.Product.sales_count.desc())  # highest sales first
        .limit(10)
        .all()
    )

    return products

