# backend/seed.py
import os
import sys

# Ensure the parent directory (backend/) is on sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models import Category, Base
from app.database import engine, SessionLocal


def seed():
    """Seed the database with initial categories."""
    db = SessionLocal()
    categories = [
        "Accessories",
        "Stationary",
        "Meat",
        "Food",
        "Snacks",
        "Bakery Products",
        "Vegetables"
    ]

    for cat in categories:
        # Only add if it doesn't exist
        if not db.query(Category).filter_by(name=cat).first():
            c = Category(name=cat)
            db.add(c)

    db.commit()
    db.close()
    print("✅ Categories seeded successfully!")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    seed()
