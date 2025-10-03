from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles
from backend import database, models, schemas

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


@products_router.get("/popular", response_model=list[schemas.ProductOut])
def get_popular_products(db: Session = Depends(database.get_db)):
    """Return top/popular products."""
    products = db.query(models.Product).limit(10).all()
    return products
