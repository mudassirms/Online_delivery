# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from backend import models, schemas, database

# router = APIRouter(prefix="/orders", tags=["Orders"])

# @router.post("/", response_model=schemas.OrderOut)
# def create_order(order: schemas.OrderCreate, db: Session = Depends(database.get_db)):
#     db_order = models.Order(items=order.items, user_id=1)  # Dummy user
#     db.add(db_order)
#     db.commit()
#     db.refresh(db_order)
#     return db_order

# @router.get("/", response_model=list[schemas.OrderOut])
# def list_orders(db: Session = Depends(database.get_db)):
#     return db.query(models.Order).all()
