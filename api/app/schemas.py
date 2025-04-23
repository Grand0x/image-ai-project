from pydantic import BaseModel

class ImageCreate(BaseModel):
    hash: str
    description: str
    tags: str

class ImageOut(ImageCreate):
    id: int

    class Config:
        orm_mode = True