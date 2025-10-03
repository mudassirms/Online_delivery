from fastapi import FastAPI
from backend import models
from backend.auth import router as auth_router
from backend.routers import catalog, orders, home
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="TownDrop API")

app.mount("/statics", StaticFiles(directory="backend/statics"), name="statics")

@app.get("/")
def read_root():
    return {"message": "Welcome to the API!"}

@app.get("/favicon.ico")
async def favicon():
    return FileResponse("static/favicon.ico")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(catalog.router)
app.include_router(home.router)
app.include_router(home.products_router)
# app.include_router(orders.router)
