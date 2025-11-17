from fastapi import FastAPI
from app import models
from app.auth import router as auth_router
from app.routers import catalog, orders, home, upload, superadmin
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from sqlalchemy import text
import time
import os

app = FastAPI(title="TownDrop API")

#  Ensure uploads folder exists at startup
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.on_event("startup")
def create_tables():
    """Create database tables if not exist, with retry logic"""
    import app.models  # noqa: F401

    max_retries = 2
    delay_seconds = 5
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("✅ Database reachable — creating tables if needed...")
            Base.metadata.create_all(bind=engine)
            print("✅ Tables verified successfully.")
            break
        except Exception as e:
            print(f"⚠️ Database not reachable (attempt {attempt}/{max_retries}): {e}")
            if attempt == max_retries:
                print("❌ Max retries reached — tables were not created.")
            else:
                time.sleep(delay_seconds)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://34.61.29.10","https://admin.towndrop.in","https://super-admin.towndrop.in"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#  Static Mounts
app.mount("/statics", StaticFiles(directory="app/statics"), name="statics")
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/")
def read_root():
    return {"message": "Welcome to the TownDrop API!"}


@app.get("/favicon.ico")
async def favicon():
    """Serve favicon from static directory"""
    return FileResponse("app/statics/favicon.ico")


#  Include all routers
app.include_router(auth_router)
app.include_router(catalog.router)
app.include_router(home.router)
app.include_router(home.products_router)
# app.include_router(orders.router)  # enable if needed
app.include_router(upload.router)
app.include_router(superadmin.router)

