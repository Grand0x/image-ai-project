import os
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Charger la clé API
HF_TOKEN = os.getenv("HUGGINGFACE_API_KEY")
if not HF_TOKEN:
    raise RuntimeError("HUGGINGFACE_API_KEY manquant")

# URL de l'Inference API pour le modèle gated
API_URL = "https://api-inference.huggingface.co/models/meta-llama/Llama-4-Maverick-17B-128E-Instruct"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

@app.post("/process")
async def process(file: UploadFile = File(...)):
    # 1) On écrit l'image en temporaire
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # 2) On envoie un POST multipart à HF Inference
        with open(tmp_path, "rb") as img:
            resp = requests.post(API_URL, headers=HEADERS, files={"file": img})
        if resp.status_code == 403:
            raise HTTPException(403, detail=(
                "Accès refusé : votre token n'a pas les droits sur ce modèle. "
                "Vérifiez que vous êtes autorisé sur https://huggingface.co/meta-llama/Llama-4-Maverick-17B-128E-Instruct"
            ))
        if not resp.ok:
            raise HTTPException(resp.status_code, detail=resp.text)

        data = resp.json()
        # 3) Récupère la description (champ généré selon le modèle)
        description = data.get("generated_text", "")
        # 4) Extraction basique de tags
        tags = [w.strip(".,") for w in description.lower().split() if len(w) > 3]

        return {"description": description, "tags": tags}

    except requests.RequestException as e:
        raise HTTPException(500, detail=str(e))
    finally:
        os.remove(tmp_path)