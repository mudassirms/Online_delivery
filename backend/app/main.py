from fastapi import FastAPI
from app import models
from app.auth import router as auth_router
from app.routers import catalog, orders, home
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
import time
from sqlalchemy import text

app = FastAPI(title="TownDrop API")

@app.on_event("startup")
def create_tables():
    import app.models  # noqa: F401

    max_retries = 2
    delay_seconds = 5
    for attempt in range(1, max_retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print("Database reachable, creating tables if they don't exist...")
            Base.metadata.create_all(bind=engine)
            print("Tables created/verified successfully.")
            break
        except Exception as e:
            print(f"Database not reachable (attempt {attempt}/{max_retries}): {e}")
            if attempt == max_retries:
                print("Max retries reached — tables were not created. Exiting startup table creation.")
            else:
                time.sleep(delay_seconds)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://72.60.218.22:8028","http://srv1065687.hstgr.cloud:8028"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/statics", StaticFiles(directory="app/statics"), name="statics")

@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}

@app.get("/favicon.ico")
async def favicon():
    # serve favicon from the mounted statics folder
    return FileResponse("app/statics/favicon.ico")

# Register routers
app.include_router(auth_router)
app.include_router(catalog.router)
app.include_router(home.router)
app.include_router(home.products_router)
# app.include_router(orders.router)
