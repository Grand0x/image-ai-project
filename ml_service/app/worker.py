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
    # 1. Lecture image
    img_bytes = await file.read()
    try:
        # 2. Construire le prompt
        prompt = (
            "Voici une image, je veux une description précise et fiable de cette image "
            "ainsi que des tags associés pour classification. Retourne un JSON de la forme : "
            '{"description": "...", "tags": [...]}'
        )
        # 3. Appel au modèle via chat.completions
        response = client.chat.completions.create(
            model=MODEL_ID,
            messages=[
                {
                    "role": "user",
                    "content": [
                        { "type": "image", "image": img_bytes },
                        { "type": "text",  "text": prompt   },
                    ]
                }
            ],
            max_tokens=512,
        )
        # 4. Extraction et parsing
        content = response.choices[0].message.content
        data = json.loads(content)
        return {"description": data["description"], "tags": data["tags"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
