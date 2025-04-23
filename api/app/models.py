from sqlalchemy import Column, String, Integer, Text
from app.database import Base

class ImageMetadata(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    hash = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(Text, nullable=False)