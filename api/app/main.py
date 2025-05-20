from fastapi import FastAPI, File, UploadFile, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import shutil, hashlib, os
from app.utils import get_current_user

from app.database import SessionLocal, engine, Base
from app.models import ImageMetadata
from app.schemas import ImageCreate, ImageOut
from app.services import ia_client
from app.utils import save_image_temp

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Image AI API",
    description="API pour analyser, indexer et rechercher des images via IA.",
    version="1.0.0",
    swagger_ui_init_oauth={
        "usePkceWithAuthorizationCodeGrant": True
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/upload", response_model=ImageOut)
def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = file.file.read()
    image_hash = hashlib.sha256(content).hexdigest()

    # Check if image already exists
    existing = db.query(ImageMetadata).filter(ImageMetadata.hash == image_hash).first()
    if existing:
        return existing

    # Save image temporarily
    temp_path = save_image_temp(file.filename, content)

    # Call ML service
    try:
        description, tags = ia_client.process_image(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"IA processing failed: {str(e)}")
    finally:
        os.remove(temp_path)

    new_entry = ImageMetadata(hash=image_hash, description=description, tags=tags)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    return new_entry

@app.get("/search", response_model=list[ImageOut])
def search_images(q: str = Query(...), db: Session = Depends(get_db)):
    return db.query(ImageMetadata).filter(
        (ImageMetadata.description.ilike(f"%{q}%")) |
        (ImageMetadata.tags.ilike(f"%{q}%"))
    ).all()

@app.get("/images", response_model=list[ImageOut])
def list_images( db: Session = Depends(get_db)):
    return db.query(ImageMetadata).all()

@app.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return {"username": user.get("preferred_username"), "roles": user.get("realm_access", {}).get("roles", [])}