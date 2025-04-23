from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import shutil, os, tempfile

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charge pipeline Hugging Face (par exemple image-to-text)
image_to_text = pipeline("image-to-text", model="Salesforce/blip-image-captioning-base")

@app.post("/process")
def process(file: UploadFile = File(...)):
    try:
        suffix = os.path.splitext(file.filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Génère une description
        result = image_to_text(tmp_path)
        description = result[0]['generated_text']

        # Extrait les tags naïvement (à améliorer plus tard)
        tags = [w.strip(".,") for w in description.lower().split() if len(w) > 3]
        return {"description": description, "tags": tags}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)