from fastapi import APIRouter, File, UploadFile, HTTPException
from datetime import datetime
import os

router = APIRouter(prefix="/upload", tags=["Upload"])

# ✅ Ensure upload folder exists
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    """
    📸 Upload an image (works for both stores and products)
    Returns: { "url": "/uploads/<filename>" }
    """
    try:
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
        file_path = os.path.join(UPLOAD_DIR, filename)

        # Save file
        with open(file_path, "wb") as f:
            f.write(await file.read())

        # Return accessible URL
        file_url = f"/uploads/{filename}"
        print(f"✅ File saved: {file_url}")
        return {"url": file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
