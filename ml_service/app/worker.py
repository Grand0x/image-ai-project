import base64
import re
import os, json, tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
from PIL import Image

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HF_TOKEN   = os.getenv("HUGGINGFACE_API_KEY")
MODEL_ID   = os.getenv("HF_MODEL_ID", "google/gemma-3-27b-it")  # ou meta-llama/…
if not HF_TOKEN:
    raise EnvironmentError("HUGGINGFACE_API_KEY manquant")

client = InferenceClient(api_key=HF_TOKEN)

@app.post("/process")
async def process(file: UploadFile = File(...)):
    try:
        # On ne lit plus le fichier en bytes ici, on le garde comme UploadFile
        prompt = (
            "Voici une image. Veuillez fournir une description précise et fiable de cette image, au format JSON suivant : "'{"description": "...", "tags": [...]}.'""
        )

        # Lire le contenu binaire de l'image
        content = await file.read()
        # Encoder en base64 et construire un data URI
        b64 = base64.b64encode(content).decode("utf-8")
        data_uri = f"data:{file.content_type};base64,{b64}"

        # On décrit le message en référant le fichier par sa clé "file"
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "image_url","image_url": {"url": data_uri},},
                    {"type": "text", "text": prompt}
                ]
            }
        ]

        # Appel de l’inférence
        result = client.chat.completions.create(
            model=MODEL_ID,
            messages=messages,
            max_tokens=512,
            temperature=0.0
        )

        # Récupération brute du contenu généré
        raw = result.choices[0].message.content

        # 1. Extraction du JSON fenced (entre ```json et ```)
        m = re.search(r"```json\s*(\{.*?\})\s*```", raw, re.DOTALL)
        if m:
            payload = m.group(1)
        else:
            # si pas de fencing, on prend tout le contenu
            payload = raw.strip()

        # 2. Tentative de parsing JSON
        try:
            data = json.loads(payload)
        except json.JSONDecodeError as e:
            # pour debug, on remonte l’erreur et la réponse brute
            raise HTTPException(
                status_code=502,
                detail=f"JSON mal formé depuis le modèle: {e}\nContenu brut:\n{raw}"
            )

        # 3. Validation minimale des clés
        if not isinstance(data, dict) or "description" not in data or "tags" not in data:
            raise HTTPException(
                status_code=502,
                detail=f"Réponse JSON inattendue: {data}"
            )

        # 4. Retour propre vers le client
        return {"description": data["description"], "tags": data["tags"]}

    except Exception as e:
        # renvoyer l’erreur pour debug
        raise HTTPException(status_code=500, detail=str(e))
